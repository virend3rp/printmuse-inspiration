package payments

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"net/http/httptest"
	"testing"
)

func signBody(body []byte, secret string) string {
	h := hmac.New(sha256.New, []byte(secret))
	h.Write(body)
	return hex.EncodeToString(h.Sum(nil))
}

// --- verifySignature unit tests ---

func TestVerifySignature_Valid(t *testing.T) {
	secret := "webhook-secret"
	body := []byte(`{"event":"payment.captured"}`)
	sig := signBody(body, secret)

	if !verifySignature(body, sig, secret) {
		t.Error("expected valid signature to return true")
	}
}

func TestVerifySignature_InvalidSignature(t *testing.T) {
	body := []byte(`{"event":"payment.captured"}`)
	if verifySignature(body, "badhex", "secret") {
		t.Error("expected invalid signature to return false")
	}
}

func TestVerifySignature_WrongSecret(t *testing.T) {
	body := []byte(`{"event":"test"}`)
	sig := signBody(body, "correct-secret")

	if verifySignature(body, sig, "wrong-secret") {
		t.Error("expected signature with wrong secret to return false")
	}
}

func TestVerifySignature_EmptySecret(t *testing.T) {
	body := []byte(`{"event":"test"}`)
	if verifySignature(body, "anysig", "") {
		t.Error("expected empty secret to return false")
	}
}

func TestVerifySignature_EmptySignature(t *testing.T) {
	body := []byte(`{"event":"test"}`)
	if verifySignature(body, "", "secret") {
		t.Error("expected empty signature to return false")
	}
}

func TestVerifySignature_BodyTampered(t *testing.T) {
	secret := "s3cr3t"
	original := []byte(`{"amount":100}`)
	sig := signBody(original, secret)
	tampered := []byte(`{"amount":999}`)

	if verifySignature(tampered, sig, secret) {
		t.Error("expected tampered body to fail signature check")
	}
}

// --- HandleWebhook handler tests (no DB needed for these paths) ---

func TestHandleWebhook_InvalidSignature_Returns401(t *testing.T) {
	t.Setenv("RAZORPAY_WEBHOOK_SECRET", "webhook-secret")

	body := []byte(`{"event":"payment.captured","payload":{}}`)
	req := httptest.NewRequest(http.MethodPost, "/webhooks/razorpay", bytes.NewReader(body))
	req.Header.Set("X-Razorpay-Signature", "invalidsignature")
	rec := httptest.NewRecorder()

	// Pass nil DB — the handler returns 401 before touching the DB
	HandleWebhook(nil).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}

func TestHandleWebhook_NonCaptureEvent_Returns200(t *testing.T) {
	secret := "webhook-secret"
	t.Setenv("RAZORPAY_WEBHOOK_SECRET", secret)

	body := []byte(`{"event":"payment.failed","payload":{"payment":{"entity":{"id":"pay_1","order_id":"order_1","amount":1000,"status":"failed"}}}}`)
	sig := signBody(body, secret)

	req := httptest.NewRequest(http.MethodPost, "/webhooks/razorpay", bytes.NewReader(body))
	req.Header.Set("X-Razorpay-Signature", sig)
	rec := httptest.NewRecorder()

	// nil DB is safe here — handler returns 200 before any DB call for non-capture events
	HandleWebhook(nil).ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("got %d, want 200", rec.Code)
	}
}

func TestHandleWebhook_MalformedBody_Returns401(t *testing.T) {
	secret := "webhook-secret"
	t.Setenv("RAZORPAY_WEBHOOK_SECRET", secret)

	body := []byte(`not json at all`)
	// Even with a valid sig, malformed JSON should not crash — but signature
	// won't match "not json" with any real sig so we expect 401 first.
	req := httptest.NewRequest(http.MethodPost, "/webhooks/razorpay", bytes.NewReader(body))
	req.Header.Set("X-Razorpay-Signature", "badsig")
	rec := httptest.NewRecorder()

	HandleWebhook(nil).ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("got %d, want 401", rec.Code)
	}
}
