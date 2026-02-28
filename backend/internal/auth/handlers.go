package auth

import (
	"database/sql"
	"net/http"
	"time"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	AccessToken string  `json:"access_token"`
	User        userDTO `json:"user"`
}

type userDTO struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Role  string `json:"role"`
}

func Register(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req registerRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		if !utils.ValidateEmail(req.Email) {
			utils.BadRequest(w, "invalid email address")
			return
		}

		if !utils.ValidatePassword(req.Password) {
			utils.BadRequest(w, "password must be at least 8 characters")
			return
		}

		hash, err := utils.HashPassword(req.Password)
		if err != nil {
			utils.InternalError(w)
			return
		}

		user, err := q.CreateUser(r.Context(), sqlcdb.CreateUserParams{
			Email:        req.Email,
			PasswordHash: hash,
			Role:         "customer",
		})
		if err != nil {
			utils.Error(w, http.StatusConflict, "email already registered")
			return
		}

		accessToken, refreshToken, err := generateTokenPair(
			r.Context(), q, user.ID.String(), user.Role,
		)
		if err != nil {
			utils.InternalError(w)
			return
		}

		setRefreshCookie(w, refreshToken)

		utils.Created(w, authResponse{
			AccessToken: accessToken,
			User: userDTO{
				ID:    user.ID.String(),
				Email: user.Email,
				Role:  user.Role,
			},
		})
	}
}

func Login(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		var req loginRequest
		if err := utils.DecodeJSON(r, &req); err != nil {
			utils.BadRequest(w, err.Error())
			return
		}

		user, err := q.GetUserByEmail(r.Context(), req.Email)
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		if !utils.CheckPassword(req.Password, user.PasswordHash) {
			utils.Unauthorized(w)
			return
		}

		accessToken, refreshToken, err := generateTokenPair(
			r.Context(), q, user.ID.String(), user.Role,
		)
		if err != nil {
			utils.InternalError(w)
			return
		}

		setRefreshCookie(w, refreshToken)

		utils.OK(w, authResponse{
			AccessToken: accessToken,
			User: userDTO{
				ID:    user.ID.String(),
				Email: user.Email,
				Role:  user.Role,
			},
		})
	}
}

func Refresh(db *sql.DB) http.HandlerFunc {
	q := sqlcdb.New(db)

	return func(w http.ResponseWriter, r *http.Request) {

		cookie, err := r.Cookie("refresh_token")
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		// 1️⃣ Validate JWT signature + expiry
		claims, err := utils.ParseRefreshToken(cookie.Value)
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		// 2️⃣ Hash token for DB lookup
		tokenHash := hashToken(cookie.Value)

		stored, err := q.GetRefreshToken(r.Context(), tokenHash)
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		// 3️⃣ Check DB expiry
		if stored.ExpiresAt.Before(time.Now()) {
			utils.Unauthorized(w)
			return
		}

		// 4️⃣ Ensure token belongs to same user
		if claims.UserID != stored.UserID.String() {
			utils.Unauthorized(w)
			return
		}

		user, err := q.GetUserByID(r.Context(), stored.UserID)
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		// 5️⃣ Rotate token (delete old)
		_ = q.DeleteRefreshToken(r.Context(), tokenHash)

		// 6️⃣ Issue new pair
		accessToken, newRefreshToken, err := generateTokenPair(
			r.Context(), q, user.ID.String(), user.Role,
		)
		if err != nil {
			utils.InternalError(w)
			return
		}

		setRefreshCookie(w, newRefreshToken)

		utils.OK(w, map[string]string{
			"access_token": accessToken,
		})
	}
}