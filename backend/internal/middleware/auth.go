package middleware

import (
	"net/http"
	"strings"

	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

func Authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		tokenStr := ""
		header := r.Header.Get("Authorization")

		if strings.HasPrefix(header, "Bearer ") {
			tokenStr = strings.TrimPrefix(header, "Bearer ")
		}

		if tokenStr == "" {
			utils.Unauthorized(w)
			return
		}

		claims, err := utils.ParseAccessToken(tokenStr)
		if err != nil {
			utils.Unauthorized(w)
			return
		}

		r = utils.SetUserContext(r, claims.UserID, claims.Role)
		next.ServeHTTP(w, r)
	})
}

func RequireRole(role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			userRole := utils.GetUserRole(r)
			if userRole != role {
				utils.Forbidden(w)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}