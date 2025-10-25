CREATE INDEX IF NOT EXISTS idx_users_email
ON users(email);

CREATE INDEX IF NOT EXISTS idx_users_subscribed_created_at
ON users(subscribed, created_at DESC);
