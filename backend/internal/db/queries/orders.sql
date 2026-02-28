-- name: CreateOrder :one
INSERT INTO orders (user_id, status, total, expires_at)
VALUES (@user_id, 'pending', @total, NOW() + INTERVAL '15 minutes')
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
RETURNING *;

-- name: ListExpiredPendingOrders :many
SELECT * FROM orders
WHERE status = 'pending'
AND expires_at < NOW();

-- name: ListOrdersAdmin :many
SELECT * FROM orders
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;