-- +goose Up
CREATE TYPE payment_status AS ENUM (
    'created',
    'attempted',
    'paid',
    'failed',
    'refunded'
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    status payment_status NOT NULL DEFAULT 'created',
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS payments;
DROP TYPE IF EXISTS payment_status;