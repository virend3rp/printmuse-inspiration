package cart

import (
	"database/sql"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type addItemRequest struct {
	VariantID string `json:"variant_id"`
	Qty       int32  `json:"qty"`
}

func AddItem(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		userIDStr := utils.GetUserID(r)
		if userIDStr == "" {
			utils.Unauthorized(w)
			return
		}

		var req addItemRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		if req.Qty <= 0 {
			utils.BadRequest(w, "quantity must be greater than 0")
			return
		}

		userID := uuid.MustParse(userIDStr)
		variantID := uuid.MustParse(req.VariantID)

		cart, err := q.GetOrCreateCart(r.Context(), userID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		_, err = q.AddCartItem(r.Context(), sqlcdb.AddCartItemParams{
			CartID:    cart.ID,
			VariantID: variantID,
			Qty:       req.Qty,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, map[string]string{"message": "item added"})
	}
}

func GetCart(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		userIDStr := utils.GetUserID(r)
		if userIDStr == "" {
			utils.Unauthorized(w)
			return
		}

		userID := uuid.MustParse(userIDStr)

		cart, err := q.GetOrCreateCart(r.Context(), userID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		items, err := q.GetCartWithItems(r.Context(), cart.ID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, items)
	}
}

func RemoveItem(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		userIDStr := utils.GetUserID(r)
		if userIDStr == "" {
			utils.Unauthorized(w)
			return
		}

		itemIDStr := chi.URLParam(r, "itemId")
		if itemIDStr == "" {
			utils.BadRequest(w, "missing item id")
			return
		}

		userID := uuid.MustParse(userIDStr)
		itemID := uuid.MustParse(itemIDStr)

		cart, err := q.GetOrCreateCart(r.Context(), userID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		err = q.RemoveCartItem(r.Context(), sqlcdb.RemoveCartItemParams{
			ID:     itemID,
			CartID: cart.ID,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, map[string]string{"message": "item removed"})
	}
}