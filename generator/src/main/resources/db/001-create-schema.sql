  -- comment: Create stocks table for master stock data
    CREATE TABLE stocks (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    sector VARCHAR(100) NOT NULL,
    starting_price DECIMAL(12,4) NOT NULL,
    current_price DECIMAL(12,4),
    volatility DECIMAL(6,4) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    market_cap BIGINT,
    shares_outstanding BIGINT,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    exchange VARCHAR(10) NOT NULL DEFAULT 'NASDAQ',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

  -- comment: Create market_events table for event sourcing
    CREATE TABLE market_events (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    event_id VARCHAR(255) NOT NULL UNIQUE,
    symbol VARCHAR(10) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    sequence_number BIGINT NOT NULL,
    event_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

  -- comment: Create event_sequences table for tracking sequence numbers
    CREATE TABLE event_sequences (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    symbol VARCHAR(10) NOT NULL UNIQUE,
    last_sequence_number BIGINT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

  -- comment: Create market_sessions table for tracking market open/close
    CREATE TABLE market_sessions (
    id BIGSERIAL PRIMARY KEY NOT NULL,
    session_date DATE NOT NULL UNIQUE,
    market_open TIMESTAMPTZ,
    market_close TIMESTAMPTZ,
    is_trading_day BOOLEAN NOT NULL DEFAULT true,
    session_type VARCHAR(20) NOT NULL DEFAULT 'REGULAR',
    total_volume BIGINT NOT NULL DEFAULT 0,
    total_trades INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
