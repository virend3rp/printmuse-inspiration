-- +goose Up
CREATE UNIQUE INDEX IF NOT EXISTS one_pending_order_per_user
ON orders(user_id)
WHERE status = 'pending';

-- +goose Down
DROP INDEX IF EXISTS one_pending_order_per_user;