-- name: ListProducts :many
SELECT p.*, COALESCE(
    json_agg(v ORDER BY v.created_at)
    FILTER (WHERE v.id IS NOT NULL),
    '[]'
) AS variants
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.active = true
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT $1 OFFSET $2;

-- name: GetProductBySlug :one
SELECT p.*, COALESCE(
    json_agg(v ORDER BY v.created_at)
    FILTER (WHERE v.id IS NOT NULL),
    '[]'
) AS variants
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.slug = $1 AND p.active = true
GROUP BY p.id;

-- name: CreateProduct :one
INSERT INTO products (name, slug, description, images)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateProduct :one
UPDATE products
SET name = $2,
    description = $3,
    images = $4,
    active = $5,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: CreateVariant :one
INSERT INTO variants (product_id, sku, name, price, stock)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetVariantByID :one
SELECT * FROM variants WHERE id = $1;

-- name: LockVariantStock :one
UPDATE variants
SET stock = stock - $2
WHERE id = $1 AND stock >= $2
RETURNING *;

-- name: ReleaseVariantStock :exec
UPDATE variants
SET stock = stock + $2
WHERE id = $1;