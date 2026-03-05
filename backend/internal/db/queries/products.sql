-- =========================================
-- PRODUCTS + VARIANTS (PUBLIC)
-- =========================================

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


-- name: ListProductsByCategory :many
SELECT p.*, COALESCE(
    json_agg(v ORDER BY v.created_at)
    FILTER (WHERE v.id IS NOT NULL),
    '[]'
) AS variants
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.active = true
  AND p.category = @category
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
WHERE p.slug = @slug
  AND p.active = true
GROUP BY p.id;


-- STRICT VERSION (RECOMMENDED)
-- name: GetProductByCategoryAndSlug :one
SELECT p.*, COALESCE(
    json_agg(v ORDER BY v.created_at)
    FILTER (WHERE v.id IS NOT NULL),
    '[]'
) AS variants
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.slug = @slug
  AND p.category = @category
  AND p.active = true
GROUP BY p.id;


-- =========================================
-- PRODUCTS (ADMIN)
-- =========================================

-- name: ListProductsAdmin :many
SELECT *
FROM products
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;


-- name: CreateProduct :one
INSERT INTO products (
  name,
  slug,
  description,
  category,
  images
)
VALUES (
  @name,
  @slug,
  @description,
  @category,
  @images
)
RETURNING *;


-- name: UpdateProduct :one
UPDATE products
SET name = @name,
    description = @description,
    images = @images,
    category = @category,
    active = @active,
    updated_at = NOW()
WHERE id = @id
RETURNING *;


-- =========================================
-- VARIANTS
-- =========================================

-- name: CreateVariant :one
INSERT INTO variants (
  product_id,
  sku,
  name,
  price,
  stock
)
VALUES (
  @product_id,
  @sku,
  @name,
  @price,
  @stock
)
RETURNING *;


-- name: UpdateVariant :one
UPDATE variants
SET name = @name,
    price = @price,
    stock = @stock,
    updated_at = NOW()
WHERE id = @id
RETURNING *;


-- name: GetVariantByID :one
SELECT *
FROM variants
WHERE id = @id;


-- name: ListVariantsByProduct :many
SELECT id, product_id, sku, name, price, stock, created_at, updated_at
FROM variants
WHERE product_id = $1
ORDER BY created_at;


-- =========================================
-- STOCK MANAGEMENT
-- =========================================

-- name: LockVariantStock :one
UPDATE variants
SET stock = stock - @qty
WHERE id = @id
  AND stock >= @qty
RETURNING *;


-- name: ReleaseVariantStock :exec
UPDATE variants
SET stock = stock + @qty
WHERE id = @id;

-- name: DeactivateProduct :one
UPDATE products
SET active = false,
    updated_at = NOW()
WHERE id = @id
RETURNING *;

-- name: GetProductByID :one
SELECT *
FROM products
WHERE id = @id;

-- name: GetProductWithVariantsByID :one
SELECT p.*, COALESCE(
    json_agg(v ORDER BY v.created_at)
    FILTER (WHERE v.id IS NOT NULL),
    '[]'
) AS variants
FROM products p
LEFT JOIN variants v ON v.product_id = p.id
WHERE p.id = @id
GROUP BY p.id;