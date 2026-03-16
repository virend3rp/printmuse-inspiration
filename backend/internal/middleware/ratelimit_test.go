package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRateLimiter_AllowsRequestsUnderLimit(t *testing.T) {
	handler := RateLimiter(100, 5)(http.HandlerFunc(okHandler))

	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = "192.0.2.1:1234"
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("request %d: got %d, want 200", i+1, rec.Code)
		}
	}
}

func TestRateLimiter_BlocksWhenBurstExceeded(t *testing.T) {
	// 1 request per second, burst of 2
	handler := RateLimiter(1, 2)(http.HandlerFunc(okHandler))

	ip := "10.0.0.99:9999"
	allowed := 0
	blocked := 0

	for i := 0; i < 10; i++ {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = ip
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code == http.StatusOK {
			allowed++
		} else if rec.Code == http.StatusTooManyRequests {
			blocked++
		}
	}

	if allowed == 0 {
		t.Error("expected at least some requests to be allowed")
	}
	if blocked == 0 {
		t.Error("expected at least some requests to be rate-limited")
	}
}

func TestRateLimiter_DifferentIPsHaveSeparateLimits(t *testing.T) {
	// Very tight limit: 1 rps, burst 1
	handler := RateLimiter(1, 1)(http.HandlerFunc(okHandler))

	makeReq := func(ip string) int {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = ip
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		return rec.Code
	}

	// First request from each unique IP should be allowed
	if code := makeReq("10.0.0.1:1"); code != http.StatusOK {
		t.Errorf("first request from IP1 got %d, want 200", code)
	}
	if code := makeReq("10.0.0.2:1"); code != http.StatusOK {
		t.Errorf("first request from IP2 got %d, want 200", code)
	}

	// Second immediate request from same IP should be blocked
	if code := makeReq("10.0.0.1:1"); code != http.StatusTooManyRequests {
		t.Errorf("second request from IP1 got %d, want 429", code)
	}
	// IP2's second request is also blocked independently
	if code := makeReq("10.0.0.2:1"); code != http.StatusTooManyRequests {
		t.Errorf("second request from IP2 got %d, want 429", code)
	}
}
