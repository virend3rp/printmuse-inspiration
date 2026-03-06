-- name: CreateOrder :one
INSERT INTO orders (user_id, status, total, expires_at, shipping_address)
VALUES (@user_id, 'pending', @total, NOW() + INTERVAL '15 minutes', @shipping_address)
RETURNING *;

-- name: CreateOrderItem :one
INSERT INTO order_items (order_id, variant_id, qty, price)
VALUES (@order_id, @variant_id, @qty, @price)
RETURNING *;

-- name: GetOrderByID :one
SELECT o.*, COALESCE(
    json_agg(oi ORDER BY oi.created_at)
    FILTER (WHERE oi.id IS NOT NULL),
    '[]'
) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = @id
GROUP BY o.id;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = @status,
    updated_at = NOW()
WHERE id = @id
AND (
    (status = 'pending'   AND @status IN ('paid', 'expired', 'cancelled'))
    OR (status = 'paid'   AND @status IN ('shipped', 'cancelled'))
    OR (status = 'shipped' AND @status IN ('delivered', 'cancelled'))
)
RETURNING *;
-- name: ListExpiredPendingOrders :many
SELECT * FROM orders
WHERE status = 'pending'
AND expires_at < NOW();

-- name: ListOrdersAdmin :many
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;

-- name: ListOrderItemsByOrderID :many
SELECT *
FROM order_items
WHERE order_id = @order_id;

-- name: GetPendingOrderByUserID :one
SELECT *
FROM orders
WHERE user_id = @user_id
AND status = 'pending'
LIMIT 1;

-- name: ListOrdersByUserID :many
SELECT id, user_id, status, total, shipping_address, expires_at, created_at, updated_at
FROM orders
WHERE user_id = @user_id
ORDER BY created_at DESC;