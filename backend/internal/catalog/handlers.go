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
	return func(w http.ResponseWriter, r *http.Request) {

		q := sqlcdb.New(db)

		limitStr := r.URL.Query().Get("limit")
		offsetStr := r.URL.Query().Get("offset")

		limit := int32(10)
		offset := int32(0)

		if limitStr != "" {
			if v, err := strconv.Atoi(limitStr); err == nil {
				limit = int32(v)
			}
		}

		if offsetStr != "" {
			if v, err := strconv.Atoi(offsetStr); err == nil {
				offset = int32(v)
			}
		}

		products, err := q.ListProducts(r.Context(), sqlcdb.ListProductsParams{
			Limit:  limit,
			Offset: offset,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		type ProductResponse struct {
			ID          string                 `json:"id"`
			Name        string                 `json:"name"`
			Slug        string                 `json:"slug"`
			Description string                 `json:"description"`
			Images      []string               `json:"images"`
			Variants    []sqlcdb.Variant       `json:"variants"`
		}

		var response []ProductResponse

		for _, p := range products {
			variants, _ := q.ListVariantsByProduct(r.Context(), p.ID)

			response = append(response, ProductResponse{
				ID:          p.ID.String(),
				Name:        p.Name,
				Slug:        p.Slug,
				Description: p.Description,
				Images:      p.Images,
				Variants:    variants,
			})
		}

		utils.OK(w, response)
	}
}

func GetProduct(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		q := sqlcdb.New(db)

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

		variants, _ := q.ListVariantsByProduct(r.Context(), product.ID)

		type ProductResponse struct {
			ID          string           `json:"id"`
			Name        string           `json:"name"`
			Slug        string           `json:"slug"`
			Description string           `json:"description"`
			Images      []string         `json:"images"`
			Variants    []sqlcdb.Variant `json:"variants"`
		}

		response := ProductResponse{
			ID:          product.ID.String(),
			Name:        product.Name,
			Slug:        product.Slug,
			Description: product.Description,
			Images:      product.Images,
			Variants:    variants,
		}

		utils.OK(w, response)
	}
}