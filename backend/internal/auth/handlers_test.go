package auth

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	sqlmock "github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func setupEnv(t *testing.T) {
	t.Helper()
	t.Setenv("JWT_SECRET", "test-secret-key")
	t.Setenv("JWT_REFRESH_SECRET", "test-refresh-secret-key")
}

func newDB(t *testing.T) (*sql.DB, sqlmock.Sqlmock) {
	t.Helper()
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("failed to create sqlmock: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return db, mock
}

func quickHash(t *testing.T, password string) string {
	t.Helper()
	h, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("bcrypt: %v", err)
	}
	return string(h)
}

func decodeBody(t *testing.T, rec *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.NewDecoder(rec.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode body: %v", err)
	}
	return out
}

// ─── Register ────────────────────────────────────────────────────────────────

func TestRegister_InvalidEmail(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	body := bytes.NewBufferString(`{"email":"notanemail","password":"securepass"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	rec := httptest.NewRecorder()

	Register(db)(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rec.Code)
	}
}

func TestRegister_ShortPassword(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	body := bytes.NewBufferString(`{"email":"user@example.com","password":"short"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	rec := httptest.NewRecorder()

	Register(db)(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rec.Code)
	}
}

func TestRegister_BadJSON(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	body := bytes.NewBufferString(`not json`)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	rec := httptest.NewRecorder()

	Register(db)(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rec.Code)
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	setupEnv(t)
	db, mock := newDB(t)

	mock.ExpectQuery(`INSERT INTO users`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "customer").
		WillReturnError(sql.ErrNoRows) // simulate unique constraint violation

	body := bytes.NewBufferString(`{"email":"dup@example.com","password":"securepass"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	rec := httptest.NewRecorder()

	Register(db)(rec, req)

	if rec.Code != http.StatusConflict {
		t.Errorf("got %d, want 409", rec.Code)
	}
}

func TestRegister_Success(t *testing.T) {
	setupEnv(t)
	db, mock := newDB(t)

	userID := uuid.New()
	now := time.Now()

	mock.ExpectQuery(`INSERT INTO users`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), "customer").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "email", "password_hash", "role", "created_at", "updated_at",
		}).AddRow(userID, "new@example.com", "hashedpw", "customer", now, now))

	mock.ExpectQuery(`INSERT INTO refresh_tokens`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "token_hash", "expires_at", "created_at",
		}).AddRow(uuid.New(), userID, "tok_hash", now.Add(7*24*time.Hour), now))

	body := bytes.NewBufferString(`{"email":"new@example.com","password":"securepass"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/register", body)
	rec := httptest.NewRecorder()

	Register(db)(rec, req)

	if rec.Code != http.StatusCreated {
		t.Errorf("got %d, want 201", rec.Code)
	}

	out := decodeBody(t, rec)
	data, ok := out["data"].(map[string]any)
	if !ok {
		t.Fatal("expected data object in response")
	}
	if _, ok := data["access_token"]; !ok {
		t.Error("expected access_token in response data")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet DB expectations: %v", err)
	}
}

// ─── Login ───────────────────────────────────────────────────────────────────

func TestLogin_BadJSON(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	body := bytes.NewBufferString(`{bad json}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	rec := httptest.NewRecorder()

	Login(db)(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rec.Code)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	setupEnv(t)
	db, mock := newDB(t)

	mock.ExpectQuery(`SELECT id, email, password_hash, role`).
		WithArgs("ghost@example.com").
		WillReturnError(sql.ErrNoRows)

	body := bytes.NewBufferString(`{"email":"ghost@example.com","password":"anypassword"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	rec := httptest.NewRecorder()

	Login(db)(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	setupEnv(t)
	db, mock := newDB(t)

	hash := quickHash(t, "correctpassword")
	userID := uuid.New()
	now := time.Now()

	mock.ExpectQuery(`SELECT id, email, password_hash, role`).
		WithArgs("user@example.com").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "email", "password_hash", "role", "created_at", "updated_at",
		}).AddRow(userID, "user@example.com", hash, "customer", now, now))

	body := bytes.NewBufferString(`{"email":"user@example.com","password":"wrongpassword"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	rec := httptest.NewRecorder()

	Login(db)(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestLogin_Success(t *testing.T) {
	setupEnv(t)
	db, mock := newDB(t)

	password := "correctpassword"
	hash := quickHash(t, password)
	userID := uuid.New()
	now := time.Now()

	mock.ExpectQuery(`SELECT id, email, password_hash, role`).
		WithArgs("user@example.com").
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "email", "password_hash", "role", "created_at", "updated_at",
		}).AddRow(userID, "user@example.com", hash, "customer", now, now))

	mock.ExpectQuery(`INSERT INTO refresh_tokens`).
		WithArgs(sqlmock.AnyArg(), sqlmock.AnyArg(), sqlmock.AnyArg()).
		WillReturnRows(sqlmock.NewRows([]string{
			"id", "user_id", "token_hash", "expires_at", "created_at",
		}).AddRow(uuid.New(), userID, "tok_hash", now.Add(7*24*time.Hour), now))

	body := bytes.NewBufferString(`{"email":"user@example.com","password":"correctpassword"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", body)
	rec := httptest.NewRecorder()

	Login(db)(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}

	out := decodeBody(t, rec)
	data, ok := out["data"].(map[string]any)
	if !ok {
		t.Fatal("expected data object in response")
	}
	if _, ok := data["access_token"]; !ok {
		t.Error("expected access_token in response data")
	}

	// Verify refresh token cookie is set
	cookies := rec.Result().Cookies()
	found := false
	for _, c := range cookies {
		if c.Name == "refresh_token" {
			found = true
			break
		}
	}
	if !found {
		t.Error("expected refresh_token cookie to be set")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet DB expectations: %v", err)
	}
}

// ─── Refresh ─────────────────────────────────────────────────────────────────

func TestRefresh_NoCookie(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
	rec := httptest.NewRecorder()

	Refresh(db)(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestRefresh_InvalidJWT(t *testing.T) {
	setupEnv(t)
	db, _ := newDB(t)

	req := httptest.NewRequest(http.MethodPost, "/auth/refresh", nil)
	req.AddCookie(&http.Cookie{Name: "refresh_token", Value: "not.a.valid.jwt"})
	rec := httptest.NewRecorder()

	Refresh(db)(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}
