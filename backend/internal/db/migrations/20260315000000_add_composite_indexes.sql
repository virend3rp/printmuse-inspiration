-- +goose Up

-- Orders: composite index for user order listing filtered by status
-- Supports: SELECT * FROM orders WHERE user_id = $1 AND status = $2
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Orders: composite index for user order listing sorted by creation time
-- Supports: SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- Order items: index on order_id for fast JOIN on order detail queries
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Payments: index on razorpay_order_id for fast webhook lookups
CREATE INDEX idx_payments_razorpay_order ON payments(razorpay_order_id);

-- Variants: partial index for in-stock variants per product (catalog queries)
-- Supports: SELECT * FROM variants WHERE product_id = $1 AND stock > 0
CREATE INDEX idx_variants_product_in_stock ON variants(product_id) WHERE stock > 0;

-- +goose Down
DROP INDEX IF EXISTS idx_orders_user_status;
DROP INDEX IF EXISTS idx_orders_user_created;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_payments_razorpay_order;
DROP INDEX IF EXISTS idx_variants_product_in_stock;
