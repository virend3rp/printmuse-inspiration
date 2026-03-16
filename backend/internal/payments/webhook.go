package payments

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
)

type razorpayWebhookPayload struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID      string `json:"id"`
				OrderID string `json:"order_id"`
				Amount  int32  `json:"amount"`
				Status  string `json:"status"`
			} `json:"entity"`
		} `json:"payment"`
	} `json:"payload"`
}

func HandleWebhook(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		signature := r.Header.Get("X-Razorpay-Signature")
		secret := os.Getenv("RAZORPAY_WEBHOOK_SECRET")

		if !verifySignature(body, signature, secret) {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}

		var payload razorpayWebhookPayload
		if err := json.Unmarshal(body, &payload); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		// We only care about successful captures (test mode sends authorized, live sends captured)
		if payload.Event != "payment.captured" && payload.Event != "payment.authorized" {
			w.WriteHeader(http.StatusOK)
			return
		}

		q := sqlcdb.New(db)

		// Fetch payment by Razorpay order ID
		payment, err := q.GetPaymentByRazorpayOrderID(
			r.Context(),
			sql.NullString{
				String: payload.Payload.Payment.Entity.OrderID,
				Valid:  true,
			},
		)
		if err != nil {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		// 🔒 Idempotency guard — if already paid, ignore duplicate webhook
		if payment.Status == sqlcdb.PaymentStatusPaid {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Update payment record
		_, err = q.UpdatePaymentStatus(r.Context(), sqlcdb.UpdatePaymentStatusParams{
			ID: payment.ID,
			Status: sqlcdb.PaymentStatusPaid,
			RazorpayPaymentID: sql.NullString{
				String: payload.Payload.Payment.Entity.ID,
				Valid:  true,
			},
			Reference: sql.NullString{
				String: payload.Payload.Payment.Entity.ID,
				Valid:  true,
			},
		})
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		if _, err := q.UpdateOrderStatus(r.Context(), sqlcdb.UpdateOrderStatusParams{
			ID:     payment.OrderID,
			Status: sqlcdb.OrderStatusPaid,
		}); err != nil {
			log.Printf("webhook: UpdateOrderStatus failed for order %s: %v", payment.OrderID, err)
		}
		w.WriteHeader(http.StatusOK)
	}
}

func verifySignature(body []byte, signature, secret string) bool {
	if signature == "" || secret == "" {
		return false
	}

	h := hmac.New(sha256.New, []byte(secret))
	h.Write(body)
	expected := hex.EncodeToString(h.Sum(nil))

	return hmac.Equal([]byte(expected), []byte(signature))
}