package utils

import (
	"context"
	"net/http"
)

type contextKey string

const (
	ContextKeyUserID contextKey = "user_id"
	ContextKeyRole   contextKey = "role"
)

func SetUserContext(r *http.Request, userID, role string) *http.Request {
	ctx := context.WithValue(r.Context(), ContextKeyUserID, userID)
	ctx = context.WithValue(ctx, ContextKeyRole, role)
	return r.WithContext(ctx)
}

func GetUserID(r *http.Request) string {
	id, _ := r.Context().Value(ContextKeyUserID).(string)
	return id
}

func GetUserRole(r *http.Request) string {
	role, _ := r.Context().Value(ContextKeyRole).(string)
	return role
}