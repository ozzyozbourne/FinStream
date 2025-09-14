--changeset finstream:005-insert-technology-stocks comment:Insert Technology sector stocks with default values
INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('AAPL', 'Apple Inc.', 'Technology', 175.50, 175.50, 0.020, 2800000000000, 15943600000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('GOOGL', 'Alphabet Inc.', 'Technology', 2450.75, 2450.75, 0.020, 1800000000000, 735000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('MSFT', 'Microsoft Corporation', 'Technology', 325.20, 325.20, 0.020, 2400000000000, 7380000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('META', 'Meta Platforms Inc.', 'Technology', 280.90, 280.90, 0.030, 750000000000, 2670000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('NVDA', 'NVIDIA Corporation', 'Technology', 420.15, 420.15, 0.030, 1000000000000, 2470000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('ADBE', 'Adobe Inc.', 'Technology', 485.90, 485.90, 0.025, 230000000000, 473000000, 'NASDAQ');

--changeset finstream:006-insert-consumer-stocks comment:Insert Consumer sector stocks
INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 3100.00, 3100.00, 0.025, 1600000000000, 516000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('TSLA', 'Tesla Inc.', 'Consumer Discretionary', 850.25, 850.25, 0.030, 850000000000, 1000000000, 'NASDAQ');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('HD', 'Home Depot Inc.', 'Consumer Discretionary', 315.75, 315.75, 0.020, 330000000000, 1045000000, 'NYSE');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('DIS', 'Walt Disney Co.', 'Communication Services', 95.40, 95.40, 0.025, 175000000000, 1830000000, 'NYSE');

--changeset finstream:007-insert-financial-healthcare-stocks comment:Insert Financial and Healthcare sector stocks
INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('JPM', 'JPMorgan Chase & Co.', 'Financial Services', 145.80, 145.80, 0.015, 430000000000, 2950000000, 'NYSE');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('V', 'Visa Inc.', 'Financial Services', 230.60, 230.60, 0.015, 500000000000, 2170000000, 'NYSE');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('BAC', 'Bank of America Corp.', 'Financial Services', 32.85, 32.85, 0.015, 270000000000, 8220000000, 'NYSE');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('JNJ', 'Johnson & Johnson', 'Healthcare', 165.45, 165.45, 0.010, 435000000000, 2630000000, 'NYSE');

INSERT INTO stocks (symbol, name, sector, starting_price, current_price, volatility, market_cap, shares_outstanding, exchange)
VALUES ('PG', 'Procter & Gamble Co.', 'Consumer Staples', 155.25, 155.25, 0.010, 370000000000, 2380000000, 'NYSE');

--changeset finstream:008-insert-market-session-today comment:Insert today's market session
INSERT INTO market_sessions (session_date, market_open, is_trading_day, session_type)
VALUES (CURRENT_DATE, CURRENT_TIMESTAMP, true, 'REGULAR');