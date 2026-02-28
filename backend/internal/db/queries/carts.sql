-- name: GetOrCreateCart :one
INSERT INTO carts (user_id)
VALUES ($1)
ON CONFLICT (user_id)
DO UPDATE SET updated_at = NOW()
RETURNING *;

-- name: AddCartItem :one
INSERT INTO cart_items (cart_id, variant_id, qty)
VALUES ($1, $2, $3)
ON CONFLICT (cart_id, variant_id)
DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty
RETURNING *;

-- name: GetCartWithItems :many
SELECT
    ci.id,
    ci.qty,
    v.id AS variant_id,
    v.name AS variant_name,
    v.price,
    v.stock,
    v.sku,
    p.id AS product_id,
    p.name AS product_name,
    p.slug AS product_slug,
    p.images
FROM cart_items ci
JOIN variants v ON v.id = ci.variant_id
JOIN products p ON p.id = v.product_id
WHERE ci.cart_id = $1;

-- name: RemoveCartItem :exec
DELETE FROM cart_items WHERE id = $1 AND cart_id = $2;

-- name: ClearCart :exec
DELETE FROM cart_items WHERE cart_id = $1;