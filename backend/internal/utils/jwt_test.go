package utils

import (
	"os"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func setupJWTEnv(t *testing.T) {
	t.Helper()
	t.Setenv("JWT_SECRET", "test-access-secret-key")
	t.Setenv("JWT_REFRESH_SECRET", "test-refresh-secret-key")
}

func TestGenerateAndParseAccessToken(t *testing.T) {
	setupJWTEnv(t)

	userID := "550e8400-e29b-41d4-a716-446655440000"
	role := "customer"

	token, err := GenerateAccessToken(userID, role)
	if err != nil {
		t.Fatalf("unexpected error generating access token: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token")
	}

	claims, err := ParseAccessToken(token)
	if err != nil {
		t.Fatalf("unexpected error parsing access token: %v", err)
	}
	if claims.UserID != userID {
		t.Errorf("got UserID %q, want %q", claims.UserID, userID)
	}
	if claims.Role != role {
		t.Errorf("got Role %q, want %q", claims.Role, role)
	}
}

func TestGenerateAndParseRefreshToken(t *testing.T) {
	setupJWTEnv(t)

	userID := "550e8400-e29b-41d4-a716-446655440000"

	token, err := GenerateRefreshToken(userID)
	if err != nil {
		t.Fatalf("unexpected error generating refresh token: %v", err)
	}

	claims, err := ParseRefreshToken(token)
	if err != nil {
		t.Fatalf("unexpected error parsing refresh token: %v", err)
	}
	if claims.UserID != userID {
		t.Errorf("got UserID %q, want %q", claims.UserID, userID)
	}
}

func TestParseAccessToken_WrongSecret(t *testing.T) {
	t.Setenv("JWT_SECRET", "original-secret")

	token, err := GenerateAccessToken("user-123", "customer")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Change secret so parsing fails
	os.Setenv("JWT_SECRET", "wrong-secret")

	_, err = ParseAccessToken(token)
	if err == nil {
		t.Fatal("expected error when parsing with wrong secret, got nil")
	}
}

func TestParseAccessToken_Tampered(t *testing.T) {
	setupJWTEnv(t)

	token, _ := GenerateAccessToken("user-123", "customer")
	tampered := token + "x"

	_, err := ParseAccessToken(tampered)
	if err == nil {
		t.Fatal("expected error for tampered token, got nil")
	}
}

func TestParseAccessToken_Expired(t *testing.T) {
	secret := "test-secret"
	t.Setenv("JWT_SECRET", secret)

	claims := AccessClaims{
		UserID: "user-123",
		Role:   "customer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Minute)),
		},
	}
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := tok.SignedString([]byte(secret))

	_, err := ParseAccessToken(tokenStr)
	if err == nil {
		t.Fatal("expected error for expired token, got nil")
	}
}

func TestParseRefreshToken_WrongSecret(t *testing.T) {
	t.Setenv("JWT_REFRESH_SECRET", "original-refresh-secret")

	token, _ := GenerateRefreshToken("user-123")

	os.Setenv("JWT_REFRESH_SECRET", "wrong-refresh-secret")

	_, err := ParseRefreshToken(token)
	if err == nil {
		t.Fatal("expected error when parsing refresh token with wrong secret, got nil")
	}
}

func TestAccessToken_AdminRole(t *testing.T) {
	setupJWTEnv(t)

	token, _ := GenerateAccessToken("admin-id", "admin")
	claims, err := ParseAccessToken(token)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if claims.Role != "admin" {
		t.Errorf("got role %q, want %q", claims.Role, "admin")
	}
}
