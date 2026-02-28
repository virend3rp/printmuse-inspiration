package catalog

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func ListProducts(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		limitStr := r.URL.Query().Get("limit")
		offsetStr := r.URL.Query().Get("offset")

		limit := int32(20)
		offset := int32(0)

		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = int32(l)
		}

		if o, err := strconv.Atoi(offsetStr); err == nil {
			offset = int32(o)
		}

		products, err := q.ListProducts(r.Context(), sqlcdb.ListProductsParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, products)
	}
}

func GetProduct(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		slug := chi.URLParam(r, "slug")
		if slug == "" {
			utils.NotFound(w)
			return
		}

		product, err := q.GetProductBySlug(r.Context(), slug)
		if err != nil {
			utils.NotFound(w)
			return
		}

		utils.OK(w, product)
	}
}