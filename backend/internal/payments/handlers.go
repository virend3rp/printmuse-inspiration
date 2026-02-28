package payments

import (
	"database/sql"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/razorpay/razorpay-go"

	sqlcdb "github.com/virend3rp/ecommerce/backend/internal/db/sqlc"
	"github.com/virend3rp/ecommerce/backend/internal/utils"
)

type razorpayOrderResponse struct {
	RazorpayOrderID string `json:"razorpay_order_id"`
	Amount          int32  `json:"amount"`
	Currency        string `json:"currency"`
}

func CreatePayment(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userIDStr := utils.GetUserID(r)
		if userIDStr == "" {
			utils.Unauthorized(w)
			return
		}

		orderIDStr := chi.URLParam(r, "orderId")
		orderID := uuid.MustParse(orderIDStr)

		q := sqlcdb.New(db)

		order, err := q.GetOrderByID(r.Context(), orderID)
		if err != nil {
			utils.NotFound(w)
			return
		}

		if order.UserID.String() != userIDStr {
			utils.Forbidden(w)
			return
		}

		if order.Status != "pending" {
			utils.BadRequest(w, "order not payable")
			return
		}

		client := razorpay.NewClient(
			os.Getenv("RAZORPAY_KEY_ID"),
			os.Getenv("RAZORPAY_KEY_SECRET"),
		)

		data := map[string]interface{}{
			"amount":   order.Total * 100,
			"currency": "INR",
			"receipt":  order.ID.String(),
		}

		body, err := client.Order.Create(data, nil)
		if err != nil {
			utils.InternalError(w)
			return
		}

		razorpayOrderID := body["id"].(string)

		_, err = q.CreatePayment(r.Context(), sqlcdb.CreatePaymentParams{
			OrderID: order.ID,
			RazorpayOrderID: sql.NullString{
				String: razorpayOrderID,
				Valid:  true,
			},
			Amount:   order.Total,
			Currency: "INR",
		})
		if err != nil {
			utils.InternalError(w)
			return
		}

		utils.OK(w, razorpayOrderResponse{
			RazorpayOrderID: razorpayOrderID,
			Amount:          order.Total,
			Currency:        "INR",
		})
	}
}