CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    keycloak_user_id VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subscribed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'Stores user information and subscription status from Keycloak';
COMMENT ON COLUMN users.id IS 'Auto-generated primary key';
COMMENT ON COLUMN users.keycloak_user_id IS 'Unique identifier from Keycloak (subject claim from JWT)';
COMMENT ON COLUMN users.username IS 'Username from Keycloak (preferred_username claim)';
COMMENT ON COLUMN users.email IS 'User email address from Keycloak';
COMMENT ON COLUMN users.subscribed IS 'Whether the user has an active subscription';
COMMENT ON COLUMN users.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN users.updated_at IS 'Timestamp when the record was last updated';

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
