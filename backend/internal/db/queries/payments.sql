-- name: CreatePayment :one
INSERT INTO payments (order_id, razorpay_order_id, amount, currency)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetPaymentByRazorpayOrderID :one
SELECT * FROM payments
WHERE razorpay_order_id = $1
LIMIT 1;

-- name: UpdatePaymentStatus :one
UPDATE payments
SET status = $2,
    razorpay_payment_id = $3,
    reference = $4,
    updated_at = NOW()
WHERE id = $1
RETURNING *;