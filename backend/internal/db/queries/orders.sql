-- name: CreateOrder :one
INSERT INTO orders (user_id, status, total, expires_at)
VALUES ($1, 'pending', $2, NOW() + INTERVAL '15 minutes')
RETURNING *;

-- name: CreateOrderItem :one
INSERT INTO order_items (order_id, variant_id, qty, price)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetOrderByID :one
SELECT o.*, COALESCE(
    json_agg(oi ORDER BY oi.created_at)
    FILTER (WHERE oi.id IS NOT NULL),
    '[]'
) AS items
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $1
GROUP BY o.id;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = $2,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListExpiredPendingOrders :many
SELECT * FROM orders
WHERE status = 'pending'
AND expires_at < NOW();

-- name: ListOrdersAdmin :many
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;