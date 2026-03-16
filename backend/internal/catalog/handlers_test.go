package catalog

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

func newDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db, mock
}

// routedRequest builds a chi-routed request so URLParam works correctly.
func routedRequest(method, path string, params map[string]string) *http.Request {
	req := httptest.NewRequest(method, path, nil)
	rctx := chi.NewRouteContext()
	for k, v := range params {
		rctx.URLParams.Add(k, v)
	}
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	return req
}

// ─── ListProducts ─────────────────────────────────────────────────────────────

func TestListProducts_EmptyResult(t *testing.T) {
	db, mock := newDB(t)

	mock.ExpectQuery(`SELECT`).
		WithArgs(int32(10), int32(0)).
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "name", "slug", "description", "images",
			"active", "created_at", "updated_at", "category", "variants",
		}))

	req := httptest.NewRequest(http.MethodGet, "/products", nil)
	rec := httptest.NewRecorder()

	ListProducts(db)(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}
}

func TestListProducts_DBError(t *testing.T) {
	db, mock := newDB(t)

	mock.ExpectQuery(`SELECT`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnError(sql.ErrConnDone)

	req := httptest.NewRequest(http.MethodGet, "/products", nil)
	rec := httptest.NewRecorder()

	ListProducts(db)(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("got %d, want 500", rec.Code)
	}
}

func TestListProducts_WithCategoryFilter_DBError(t *testing.T) {
	db, mock := newDB(t)

	mock.ExpectQuery(`SELECT`).
		WithArgs("keychains", sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnError(sql.ErrConnDone)

	req := httptest.NewRequest(http.MethodGet, "/products?category=keychains", nil)
	rec := httptest.NewRecorder()

	ListProducts(db)(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Errorf("got %d, want 500", rec.Code)
	}
}

func TestListProducts_WithResults(t *testing.T) {
	db, mock := newDB(t)

	productID := uuid.New()
	now := time.Now()

	productRows := sqlmock.NewRows([]string{
		"id", "name", "slug", "description", "images",
		"active", "created_at", "updated_at", "category", "variants",
	}).AddRow(
		productID, "Test Keychain", "test-keychain", "A test product",
		pq.Array([]string{"img1.jpg"}),
		true, now, now, "keychains", `[]`,
	)

	mock.ExpectQuery(`SELECT`).
		WithArgs(int32(10), int32(0)).
		WillReturnRows(productRows)

	variantRows := sqlmock.NewRows([]string{
		"id", "product_id", "sku", "name", "price", "stock", "created_at", "updated_at",
	}).AddRow(uuid.New(), productID, "SKU-001", "Standard", int32(1499), int32(10), now, now)

	mock.ExpectQuery(`SELECT`).
		WithArgs(productID).
		WillReturnRows(variantRows)

	req := httptest.NewRequest(http.MethodGet, "/products", nil)
	rec := httptest.NewRecorder()

	ListProducts(db)(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}

	var resp map[string]any
	json.NewDecoder(rec.Body).Decode(&resp)
	data, ok := resp["data"].([]any)
	if !ok || len(data) != 1 {
		t.Errorf("expected 1 product in data, got %v", resp["data"])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet DB expectations: %v", err)
	}
}

// ─── GetProduct ───────────────────────────────────────────────────────────────

func TestGetProduct_NotFound(t *testing.T) {
	db, mock := newDB(t)

	mock.ExpectQuery(`SELECT`).
		WithArgs("missing-slug", "keychains").
		WillReturnError(sql.ErrNoRows)

	req := routedRequest(http.MethodGet, "/products/keychains/missing-slug", map[string]string{
		"category": "keychains",
		"slug":     "missing-slug",
	})
	rec := httptest.NewRecorder()

	GetProduct(db)(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Errorf("got %d, want 404", rec.Code)
	}
}

func TestGetProduct_Success(t *testing.T) {
	db, mock := newDB(t)

	productID := uuid.New()
	now := time.Now()

	mock.ExpectQuery(`SELECT`).
		WithArgs("dragon-keychain", "keychains").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "name", "slug", "description", "images",
			"active", "created_at", "updated_at", "category", "variants",
		}).AddRow(
			productID, "Dragon Keychain", "dragon-keychain", "Cool dragon",
			pq.Array([]string{"dragon.jpg"}),
			true, now, now, "keychains", `[]`,
		))

	mock.ExpectQuery(`SELECT`).
		WithArgs(productID).
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "product_id", "sku", "name", "price", "stock", "created_at", "updated_at",
		}).AddRow(uuid.New(), productID, "SKU-DRG", "Standard", int32(1499), int32(5), now, now))

	req := routedRequest(http.MethodGet, "/products/keychains/dragon-keychain", map[string]string{
		"category": "keychains",
		"slug":     "dragon-keychain",
	})
	rec := httptest.NewRecorder()

	GetProduct(db)(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}

	var resp map[string]any
	json.NewDecoder(rec.Body).Decode(&resp)
	data, ok := resp["data"].(map[string]any)
	if !ok {
		t.Fatal("expected data object in response")
	}
	if data["slug"] != "dragon-keychain" {
		t.Errorf("got slug %v, want dragon-keychain", data["slug"])
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet DB expectations: %v", err)
	}
}
