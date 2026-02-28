package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"time"

	"github.com/google/uuid"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func generateTokenPair(
	ctx context.Context,
	q *sqlcdb.Queries,
	userID string,
	role string,
) (string, string, error) {

	accessToken, err := utils.GenerateAccessToken(userID, role)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := utils.GenerateRefreshToken(userID)
	if err != nil {
		return "", "", err
	}

	tokenHash := hashToken(refreshToken)

	_, err = q.CreateRefreshToken(ctx, sqlcdb.CreateRefreshTokenParams{
		UserID:    uuid.MustParse(userID),
		TokenHash: tokenHash,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
	})
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

func hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}

func setRefreshCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // set true in production
		SameSite: http.SameSiteStrictMode,
		Expires:  time.Now().Add(7 * 24 * time.Hour),
	})
}