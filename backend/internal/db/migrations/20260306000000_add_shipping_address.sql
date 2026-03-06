-- +goose Up
ALTER TABLE orders ADD COLUMN shipping_address TEXT;

-- +goose Down
ALTER TABLE orders DROP COLUMN shipping_address;
