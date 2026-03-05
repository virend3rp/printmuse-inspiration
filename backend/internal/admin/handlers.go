package admin

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type createProductRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Images      []string `json:"images"`
}

type updateProductRequest struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Images      []string `json:"images"`
	Active      bool     `json:"active"`
}

type createVariantRequest struct {
	ProductID string `json:"product_id"`
	SKU       string `json:"sku"`
	Name      string `json:"name"`
	Price     int32  `json:"price"`
	Stock     int32  `json:"stock"`
}

type updateVariantRequest struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Price int32  `json:"price"`
	Stock int32  `json:"stock"`
}

type updateOrderStatusRequest struct {
	OrderID string `json:"order_id"`
	Status  string `json:"status"`
}

func CreateProduct(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req createProductRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		if req.Name == "" || req.Category == "" {
			utils.BadRequest(w, "name and category are required")
			return
		}

		slug := utils.Slugify(req.Name)

		product, err := q.CreateProduct(r.Context(), sqlcdb.CreateProductParams{
			Name:        req.Name,
			Slug:        slug,
			Description: req.Description,
			Category:    req.Category,
			Images:      req.Images,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.Created(w, product)
	}
}

func GetProductByID(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		idStr := chi.URLParam(r, "id")

		id, err := uuid.Parse(idStr)
		if err != nil {
			utils.BadRequest(w, "invalid product id")
			return
		}

		product, err := q.GetProductWithVariantsByID(r.Context(), id)
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, product)
	}
}

func UpdateProduct(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req updateProductRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		productID, err := uuid.Parse(req.ID)
		if err != nil {
			utils.BadRequest(w, "invalid product id")
			return
		}

		product, err := q.UpdateProduct(r.Context(), sqlcdb.UpdateProductParams{
			ID:          productID,
			Name:        req.Name,
			Description: req.Description,
			Category:    req.Category,
			Images:      req.Images,
			Active:      req.Active,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, product)
	}
}

func DeactivateProduct(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		productIDStr := chi.URLParam(r, "id")

		productID, err := uuid.Parse(productIDStr)
		if err != nil {
			utils.BadRequest(w, "invalid product id")
			return
		}

		product, err := q.DeactivateProduct(r.Context(), productID)
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, product)
	}
}

func ListProducts(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		limit := int32(50)
		offset := int32(0)

		if l := r.URL.Query().Get("limit"); l != "" {
			if parsed, err := strconv.Atoi(l); err == nil {
				limit = int32(parsed)
			}
		}

		if limit > 100 {
			limit = 100
		}

		if o := r.URL.Query().Get("offset"); o != "" {
			if parsed, err := strconv.Atoi(o); err == nil {
				offset = int32(parsed)
			}
		}

		products, err := q.ListProductsAdmin(r.Context(), sqlcdb.ListProductsAdminParams{
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

func CreateVariant(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req createVariantRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		productID, err := uuid.Parse(req.ProductID)
		if err != nil {
			utils.BadRequest(w, "invalid product id")
			return
		}

		// verify product exists
		_, err = q.GetProductWithVariantsByID(r.Context(), productID)
		if err != nil {
			utils.BadRequest(w, "product not found")
			return
		}

		variant, err := q.CreateVariant(r.Context(), sqlcdb.CreateVariantParams{
			ProductID: productID,
			Sku:       req.SKU,
			Name:      req.Name,
			Price:     req.Price,
			Stock:     req.Stock,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.Created(w, variant)
	}
}

func UpdateVariant(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req updateVariantRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		variantID, err := uuid.Parse(req.ID)
		if err != nil {
			utils.BadRequest(w, "invalid variant id")
			return
		}

		variant, err := q.UpdateVariant(r.Context(), sqlcdb.UpdateVariantParams{
			ID:    variantID,
			Name:  req.Name,
			Price: req.Price,
			Stock: req.Stock,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, variant)
	}
}

func ListOrders(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		orders, err := q.ListOrdersAdmin(r.Context(), sqlcdb.ListOrdersAdminParams{
			Limit:  50,
			Offset: 0,
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, orders)
	}
}

func UpdateOrderStatus(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req updateOrderStatusRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		orderID, err := uuid.Parse(req.OrderID)
		if err != nil {
			utils.BadRequest(w, "invalid order id")
			return
		}

		switch req.Status {
		case "paid", "shipped", "delivered", "cancelled":
		default:
			utils.BadRequest(w, "invalid status")
			return
		}

		order, err := q.UpdateOrderStatus(r.Context(), sqlcdb.UpdateOrderStatusParams{
			ID:     orderID,
			Status: sqlcdb.OrderStatus(req.Status),
		})
		if err != nil {
			utils.BadRequest(w, "invalid status transition")
			return
		}

		utils.OK(w, order)
	}
}