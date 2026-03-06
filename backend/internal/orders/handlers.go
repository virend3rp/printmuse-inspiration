package orders

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type listOrderItem struct {
	ID              uuid.UUID          `json:"id"`
	UserID          uuid.UUID          `json:"user_id"`
	Status          sqlcdb.OrderStatus `json:"status"`
	Total           int32              `json:"total"`
	ShippingAddress *string            `json:"shipping_address"`
	ExpiresAt       *time.Time         `json:"expires_at"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

func ListOrders(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		userID, ok := utils.ParseUserID(r)
		if !ok {
			utils.Unauthorized(w)
			return
		}

		rows, err := q.ListOrdersByUserID(r.Context(), userID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		list := make([]listOrderItem, len(rows))
		for i, row := range rows {
			item := listOrderItem{
				ID:        row.ID,
				UserID:    row.UserID,
				Status:    row.Status,
				Total:     row.Total,
				CreatedAt: row.CreatedAt,
				UpdatedAt: row.UpdatedAt,
			}
			if row.ShippingAddress.Valid {
				item.ShippingAddress = &row.ShippingAddress.String
			}
			if row.ExpiresAt.Valid {
				item.ExpiresAt = &row.ExpiresAt.Time
			}
			list[i] = item
		}

		utils.OK(w, list)
	}
}

type createOrderRequest struct {
	ShippingAddress string `json:"shipping_address"`
}

func CreateOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID, ok := utils.ParseUserID(r)
		if !ok {
			utils.Unauthorized(w)
			return
		}

		var req createOrderRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		if req.ShippingAddress == "" {
			utils.BadRequest(w, "shipping address is required")
			return
		}

		// 🔒 If a pending order already exists (e.g. Razorpay was dismissed),
		// return it so the frontend can proceed to payment without re-creating.
		q := sqlcdb.New(db)
		if existing, err := q.GetPendingOrderByUserID(r.Context(), userID); err == nil {
			utils.OK(w, existing)
			return
		}

		// Start transaction
		tx, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			utils.InternalError(w)
			return
		}
		defer tx.Rollback()

		qtx := sqlcdb.New(tx)

		cart, err := qtx.GetOrCreateCart(r.Context(), userID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		items, err := qtx.GetCartWithItems(r.Context(), cart.ID)
		if err != nil || len(items) == 0 {
			utils.BadRequest(w, "cart is empty")
			return
		}

		var total int32

		// 1️⃣ Lock stock
		for _, item := range items {

			_, err := qtx.LockVariantStock(r.Context(), sqlcdb.LockVariantStockParams{
				ID:  item.VariantID,
				Qty: item.Qty,
			})
			if err != nil {
				utils.BadRequest(w, "insufficient stock")
				return
			}

			total += item.Price * item.Qty
		}

		// 2️⃣ Create order
		order, err := qtx.CreateOrder(r.Context(), sqlcdb.CreateOrderParams{
			UserID:          userID,
			Total:           total,
			ShippingAddress: sql.NullString{String: req.ShippingAddress, Valid: true},
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		// 3️⃣ Create order items
		for _, item := range items {
			_, err := qtx.CreateOrderItem(r.Context(), sqlcdb.CreateOrderItemParams{
				OrderID:  order.ID,
				VariantID: item.VariantID,
				Qty:      item.Qty,
				Price:    item.Price,
			})
			if err != nil {
				utils.InternalError(w)
				return
			}
		}

		// 4️⃣ Clear cart
		if err := qtx.ClearCart(r.Context(), cart.ID); err != nil {
			utils.InternalError(w)
			return
		}

		if err := tx.Commit(); err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, order)
	}
}

func GetOrder(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		userID, ok := utils.ParseUserID(r)
		if !ok {
			utils.Unauthorized(w)
			return
		}

		orderIDStr := chi.URLParam(r, "id")
		orderID, err := uuid.Parse(orderIDStr)
		if err != nil {
			utils.NotFound(w)
			return
		}

		order, err := q.GetOrderByID(r.Context(), orderID)
		if err != nil {
			utils.NotFound(w)
			return
		}

		if order.UserID != userID {
			utils.Forbidden(w)
			return
		}

		// pq returns json_agg as []byte; wrap in json.RawMessage so it
		// serialises as a JSON array rather than being base64-encoded.
		// sql.Null* types are unwrapped to plain pointers so the frontend
		// receives a plain string / timestamp instead of {String,Valid}.
		type orderResponse struct {
			ID              uuid.UUID          `json:"id"`
			UserID          uuid.UUID          `json:"user_id"`
			Status          sqlcdb.OrderStatus `json:"status"`
			Total           int32              `json:"total"`
			ExpiresAt       *time.Time         `json:"expires_at"`
			CreatedAt       time.Time          `json:"created_at"`
			UpdatedAt       time.Time          `json:"updated_at"`
			ShippingAddress *string            `json:"shipping_address"`
			Items           json.RawMessage    `json:"items"`
		}

		var rawItems json.RawMessage
		switch v := order.Items.(type) {
		case []byte:
			rawItems = json.RawMessage(v)
		case string:
			rawItems = json.RawMessage(v)
		default:
			rawItems = json.RawMessage("[]")
		}

		var expiresAt *time.Time
		if order.ExpiresAt.Valid {
			expiresAt = &order.ExpiresAt.Time
		}
		var shippingAddr *string
		if order.ShippingAddress.Valid {
			shippingAddr = &order.ShippingAddress.String
		}

		utils.OK(w, orderResponse{
			ID:              order.ID,
			UserID:          order.UserID,
			Status:          order.Status,
			Total:           order.Total,
			ExpiresAt:       expiresAt,
			CreatedAt:       order.CreatedAt,
			UpdatedAt:       order.UpdatedAt,
			ShippingAddress: shippingAddr,
			Items:           rawItems,
		})
	}
}