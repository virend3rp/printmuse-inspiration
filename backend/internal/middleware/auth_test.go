package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func setupAuthEnv(t *testing.T) {
	t.Helper()
	t.Setenv("JWT_SECRET", "test-auth-middleware-secret")
}

func okHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func TestAuthenticate_NoToken(t *testing.T) {
	setupAuthEnv(t)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	Authenticate(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestAuthenticate_MalformedHeader(t *testing.T) {
	setupAuthEnv(t)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "NotBearer sometoken")
	rec := httptest.NewRecorder()

	Authenticate(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestAuthenticate_InvalidToken(t *testing.T) {
	setupAuthEnv(t)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer not.a.valid.token")
	rec := httptest.NewRecorder()

	Authenticate(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestAuthenticate_ValidToken_PassesThrough(t *testing.T) {
	setupAuthEnv(t)

	userID := "550e8400-e29b-41d4-a716-446655440000"
	token, err := utils.GenerateAccessToken(userID, "customer")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	var capturedUserID string
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUserID = utils.GetUserID(r)
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rec := httptest.NewRecorder()

	Authenticate(handler).ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}
	if capturedUserID != userID {
		t.Errorf("got user ID %q, want %q", capturedUserID, userID)
	}
}

func TestRequireRole_WrongRole(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req = utils.SetUserContext(req, "user-id", "customer")
	rec := httptest.NewRecorder()

	RequireRole("admin")(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Errorf("got %d, want 403", rec.Code)
	}
}

func TestRequireRole_CorrectRole(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req = utils.SetUserContext(req, "user-id", "admin")
	rec := httptest.NewRecorder()

	RequireRole("admin")(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}
}

func TestRequireRole_NoContext(t *testing.T) {
	// No user context set at all — role is empty string
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	RequireRole("admin")(http.HandlerFunc(okHandler)).ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Errorf("got %d, want 403", rec.Code)
	}
}
