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
WHERE p.slug = @slug AND p.active = true
GROUP BY p.id;

-- name: CreateProduct :one
INSERT INTO products (name, slug, description, images)
VALUES (@name, @slug, @description, @images)
RETURNING *;

-- name: UpdateProduct :one
UPDATE products
SET name = @name,
    description = @description,
    images = @images,
    active = @active,
    updated_at = NOW()
WHERE id = @id
RETURNING *;

-- name: CreateVariant :one
INSERT INTO variants (product_id, sku, name, price, stock)
VALUES (@product_id, @sku, @name, @price, @stock)
RETURNING *;

-- name: GetVariantByID :one
SELECT * FROM variants
WHERE id = @id;

-- name: LockVariantStock :one
UPDATE variants
SET stock = stock - @qty
WHERE id = @id AND stock >= @qty
RETURNING *;

-- name: ReleaseVariantStock :exec
UPDATE variants
SET stock = stock + @qty
WHERE id = @id;

-- name: ListProductsAdmin :many
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;


-- name: UpdateVariant :one
UPDATE variants
SET name = @name,
    price = @price,
    stock = @stock,
    updated_at = NOW()
WHERE id = @id
RETURNING *;

-- name: ListVariantsByProduct :many
SELECT id, product_id, sku, name, price, stock, created_at, updated_at
FROM variants
WHERE product_id = $1
ORDER BY created_at;