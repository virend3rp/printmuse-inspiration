package utils

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func decode(t *testing.T, rec *httptest.ResponseRecorder) Response {
	t.Helper()
	var resp Response
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	return resp
}

func TestJSON_SetsContentTypeAndStatus(t *testing.T) {
	rec := httptest.NewRecorder()
	JSON(rec, http.StatusTeapot, map[string]string{"key": "value"})

	if rec.Code != http.StatusTeapot {
		t.Errorf("got status %d, want %d", rec.Code, http.StatusTeapot)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json" {
		t.Errorf("got Content-Type %q, want application/json", ct)
	}
}

func TestSuccess_WrapsInDataField(t *testing.T) {
	rec := httptest.NewRecorder()
	Success(rec, http.StatusOK, map[string]string{"foo": "bar"})

	resp := decode(t, rec)
	if resp.Error != "" {
		t.Errorf("expected empty error field, got %q", resp.Error)
	}
}

func TestError_SetsErrorField(t *testing.T) {
	rec := httptest.NewRecorder()
	Error(rec, http.StatusBadRequest, "something went wrong")

	resp := decode(t, rec)
	if resp.Error != "something went wrong" {
		t.Errorf("got error %q, want %q", resp.Error, "something went wrong")
	}
}

func TestOK_Returns200(t *testing.T) {
	rec := httptest.NewRecorder()
	OK(rec, "payload")
	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}
}

func TestCreated_Returns201(t *testing.T) {
	rec := httptest.NewRecorder()
	Created(rec, "new resource")
	if rec.Code != http.StatusCreated {
		t.Errorf("got %d, want 201", rec.Code)
	}
}

func TestBadRequest_Returns400(t *testing.T) {
	rec := httptest.NewRecorder()
	BadRequest(rec, "bad input")
	if rec.Code != http.StatusBadRequest {
		t.Errorf("got %d, want 400", rec.Code)
	}
	resp := decode(t, rec)
	if resp.Error != "bad input" {
		t.Errorf("got error %q, want %q", resp.Error, "bad input")
	}
}

func TestUnauthorized_Returns401(t *testing.T) {
	rec := httptest.NewRecorder()
	Unauthorized(rec)
	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
	resp := decode(t, rec)
	if resp.Error != "unauthorized" {
		t.Errorf("got error %q, want %q", resp.Error, "unauthorized")
	}
}

func TestForbidden_Returns403(t *testing.T) {
	rec := httptest.NewRecorder()
	Forbidden(rec)
	if rec.Code != http.StatusForbidden {
		t.Errorf("got %d, want 403", rec.Code)
	}
}

func TestNotFound_Returns404(t *testing.T) {
	rec := httptest.NewRecorder()
	NotFound(rec)
	if rec.Code != http.StatusNotFound {
		t.Errorf("got %d, want 404", rec.Code)
	}
}

func TestInternalError_Returns500(t *testing.T) {
	rec := httptest.NewRecorder()
	InternalError(rec)
	if rec.Code != http.StatusInternalServerError {
		t.Errorf("got %d, want 500", rec.Code)
	}
}
