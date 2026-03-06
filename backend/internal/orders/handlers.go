package orders

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func CreateOrder(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID, ok := utils.ParseUserID(r)
		if !ok {
			utils.Unauthorized(w)
			return
		}

		// 🔒 Check existing pending order (outside transaction)
		q := sqlcdb.New(db)
		if _, err := q.GetPendingOrderByUserID(r.Context(), userID); err == nil {
			utils.BadRequest(w, "you already have a pending order")
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
			UserID: userID,
			Total:  total,
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
		orderID := uuid.MustParse(orderIDStr)

		order, err := q.GetOrderByID(r.Context(), orderID)
		if err != nil {
			utils.NotFound(w)
			return
		}

		if order.UserID != userID {
			utils.Forbidden(w)
			return
		}

		utils.OK(w, order)
	}
}