-- +goose Up
ALTER TABLE products
ADD COLUMN category TEXT NOT NULL DEFAULT 'utility';

ALTER TABLE products
ADD CONSTRAINT products_category_check
CHECK (category IN ('keychains','figurines','utility','custom'));

-- +goose Down
ALTER TABLE products
DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products
DROP COLUMN IF EXISTS category;