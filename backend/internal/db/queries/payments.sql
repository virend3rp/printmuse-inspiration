-- name: CreatePayment :one
INSERT INTO payments (order_id, razorpay_order_id, amount, currency)
VALUES (@order_id, @razorpay_order_id, @amount, @currency)
RETURNING *;

-- name: GetPaymentByRazorpayOrderID :one
SELECT * FROM payments
WHERE razorpay_order_id = @razorpay_order_id
LIMIT 1;

-- name: UpdatePaymentStatus :one
UPDATE payments
SET status = @status,
    razorpay_payment_id = @razorpay_payment_id,
    reference = @reference,
    updated_at = NOW()
WHERE id = @id
RETURNING *;