package catalog

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type productResponse struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Slug        string           `json:"slug"`
	Category    string           `json:"category"`
	Description string           `json:"description"`
	Images      []string         `json:"images"`
	Variants    []sqlcdb.Variant `json:"variants"`
}

func ListProducts(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		q := sqlcdb.New(db)

		limitStr := r.URL.Query().Get("limit")
		offsetStr := r.URL.Query().Get("offset")
		category := r.URL.Query().Get("category")

		limit := int32(10)
		offset := int32(0)

		if v, err := strconv.Atoi(limitStr); err == nil && limitStr != "" {
			limit = int32(v)
		}

		if v, err := strconv.Atoi(offsetStr); err == nil && offsetStr != "" {
			offset = int32(v)
		}

		var response []productResponse

		// CATEGORY FILTERED
		if category != "" {
			products, err := q.ListProductsByCategory(
				r.Context(),
				sqlcdb.ListProductsByCategoryParams{
					Category: category,
					Limit:    limit,
					Offset:   offset,
				},
			)
			if err != nil {
				utils.InternalError(w)
				return
			}

			for _, p := range products {
				variants, _ := q.ListVariantsByProduct(r.Context(), p.ID)

				response = append(response, productResponse{
					ID:          p.ID.String(),
					Name:        p.Name,
					Slug:        p.Slug,
					Category:    p.Category,
					Description: p.Description,
					Images:      p.Images,
					Variants:    variants,
				})
			}

		} else {
			// ALL PRODUCTS
			products, err := q.ListProducts(
				r.Context(),
				sqlcdb.ListProductsParams{
					Limit:  limit,
					Offset: offset,
				},
			)
			if err != nil {
				utils.InternalError(w)
				return
			}

			for _, p := range products {
				variants, _ := q.ListVariantsByProduct(r.Context(), p.ID)

				response = append(response, productResponse{
					ID:          p.ID.String(),
					Name:        p.Name,
					Slug:        p.Slug,
					Category:    p.Category,
					Description: p.Description,
					Images:      p.Images,
					Variants:    variants,
				})
			}
		}

		utils.OK(w, response)
	}
}

func GetProduct(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		q := sqlcdb.New(db)

		category := chi.URLParam(r, "category")
		slug := chi.URLParam(r, "slug")

		if slug == "" || category == "" {
			utils.NotFound(w)
			return
		}

		product, err := q.GetProductByCategoryAndSlug(
			r.Context(),
			sqlcdb.GetProductByCategoryAndSlugParams{
				Category: category,
				Slug:     slug,
			},
		)
		if err != nil {
			utils.NotFound(w)
			return
		}

		variants, _ := q.ListVariantsByProduct(r.Context(), product.ID)

		response := productResponse{
			ID:          product.ID.String(),
			Name:        product.Name,
			Slug:        product.Slug,
			Category:    product.Category,
			Description: product.Description,
			Images:      product.Images,
			Variants:    variants,
		}

		utils.OK(w, response)
	}
}