package finstream.data.events;

import finstream.data.Enums;
import finstream.data.entity.Stocks;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

import static finstream.data.ComUtils.*;

public final class EventPayloadGenerator {

    private EventPayloadGenerator() {}

    private static final Random random = new Random();

    private static final String[] NEWS_HEADLINES = {
            "Earnings Beat Expectations", "New Product Launch Announced", "Market Volatility Continues",
            "CEO Steps Down", "Merger Talks Underway", "Regulatory Approval Received"
    };

    private static final String[] NEWS_SOURCES = {"Reuters", "Bloomberg", "CNBC", "MarketWatch", "WSJ"};
    private static final String[] TRADE_CONDITIONS = {"REGULAR", "OPENING", "CLOSING", "HALT"};

    public static Payload.Event generatePayload(final Enums.EventType eventType, final Stocks stock) {
        return switch (eventType) {
            case TRADE -> generateTrade(stock);
            case QUOTE -> generateQuote(stock);
            case ORDER_BOOK -> generateOrderBook(stock);
            case BAR -> generateBar(stock);
            case MARKET_STATUS -> generateMarketStatus();
            case PRICE_MOVEMENT -> generatePriceMovement(stock);
            case CORPORATE_ACTION -> generateCorporateAction(stock);
            case NEWS -> generateNews(stock);
            case VOLUME_SPIKE -> generateVolumeSpike();
            case OPTIONS_ACTIVITY -> generateOptionsActivity(stock);
            case TECHNICAL_INDICATOR -> generateTechnicalIndicator();
            case ORDER_UPDATE -> generateOrderUpdate(stock);
            case POSITION_UPDATE -> generatePositionUpdate(stock);
            case ACCOUNT_UPDATE -> generateAccountUpdate();
        };
    }

    private static Payload.TradePay generateTrade(final Stocks stock) {
        BigDecimal price = randomPrice(stock.getCurrentPrice());
        Long volume = randomLong(100, 10000);

        return new Payload.TradePay(
                UUID.randomUUID().toString(),
                price,
                volume,
                TRADE_SIDES[random.nextInt(TRADE_SIDES.length)],
                OffsetDateTime.now(),
                List.of(TRADE_CONDITIONS[random.nextInt(TRADE_CONDITIONS.length)]),
                "COUNTERPARTY_" + random.nextInt(100),
                new Payload.TradePay.Fees(
                        randomDecimal(1, 10),
                        randomDecimal(0.1, 1),
                        randomDecimal(0.1, 1)
                )
        );
    }

    private static Payload.QuotePay generateQuote(Stocks stock) {
        BigDecimal midPrice = stock.getCurrentPrice();
        BigDecimal spread = randomDecimal(0.01, 0.10);
        BigDecimal bidPrice = midPrice.subtract(spread.divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP));
        BigDecimal askPrice = midPrice.add(spread.divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP));

        return new Payload.QuotePay(
                bidPrice,
                randomLong(100, 5000),
                askPrice,
                randomLong(100, 5000),
                OffsetDateTime.now(),
                "MM_" + random.nextInt(50),
                spread,
                midPrice
        );
    }

    private static Payload.OrderBook generateOrderBook(final Stocks stock) {
        List<Payload.OrderBook.PriceLevel> bids = generatePriceLevels(stock.getCurrentPrice(), false);
        List<Payload.OrderBook.PriceLevel> asks = generatePriceLevels(stock.getCurrentPrice(), true);

        return new Payload.OrderBook(
                bids,
                asks,
                bids.stream().mapToLong(Payload.OrderBook.PriceLevel::size).sum(),
                asks.stream().mapToLong(Payload.OrderBook.PriceLevel::size).sum(),
                Math.min(bids.size(), asks.size())
        );
    }

    private static List<Payload.OrderBook.PriceLevel> generatePriceLevels(final BigDecimal basePrice, final boolean isAsk) {
        List<Payload.OrderBook.PriceLevel> levels = new ArrayList<>();
        BigDecimal price = basePrice;

        for (int i = 0; i < 5; i++) {
            price = isAsk ? price.add(randomDecimal(0.01, 0.05)) : price.subtract(randomDecimal(0.01, 0.05));
            levels.add(new Payload.OrderBook.PriceLevel(
                    price,
                    randomLong(100, 2000),
                    random.nextInt(10) + 1
            ));
        }
        return levels;
    }

    private static Payload.BarPay generateBar(final Stocks stock) {
        BigDecimal open = stock.getCurrentPrice();
        BigDecimal close = randomPrice(open);
        BigDecimal high = open.max(close).add(randomDecimal(0, 2));
        BigDecimal low = open.min(close).subtract(randomDecimal(0, 2));

        return new Payload.BarPay(
                BAR_TIMEFRAMES[random.nextInt(BAR_TIMEFRAMES.length)],
                OffsetDateTime.now().minusMinutes(5),
                OffsetDateTime.now(),
                open,
                high,
                low,
                close,
                randomLong(10000, 100000),
                (open.add(close)).divide(BigDecimal.valueOf(2), 4, RoundingMode.HALF_UP),
                random.nextInt(500) + 100,
                true
        );
    }

    private static Payload.MarketStatus generateMarketStatus() {
        Enums.MarketStatus current = MARKET_STATUSES[random.nextInt(MARKET_STATUSES.length)];
        Enums.MarketStatus previous = MARKET_STATUSES[random.nextInt(MARKET_STATUSES.length)];

        return new Payload.MarketStatus(
                current,
                previous,
                OffsetDateTime.now(),
                "Scheduled transition",
                OffsetDateTime.now().plusHours(1),
                SESSION_TYPES[random.nextInt(SESSION_TYPES.length)].name(),
                current == Enums.MarketStatus.HALTED ? "Volatility halt" : null
        );
    }

    private static Payload.PriceMovement generatePriceMovement(final Stocks stock) {
        BigDecimal currentPrice = stock.getCurrentPrice();
        BigDecimal previousPrice = randomPrice(currentPrice);
        BigDecimal priceChange = currentPrice.subtract(previousPrice);
        BigDecimal priceChangePercent = priceChange.divide(previousPrice, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        return new Payload.PriceMovement(
                previousPrice,
                currentPrice,
                priceChange,
                priceChangePercent,
                randomPrice(currentPrice),
                currentPrice.add(randomDecimal(0, 5)),
                currentPrice.subtract(randomDecimal(0, 5)),
                "Market order",
                random.nextBoolean()
        );
    }

    private static Payload.CorporateAction generateCorporateAction(final Stocks stock) {
        return new Payload.CorporateAction(
                CORPORATE_ACTION_TYPES[random.nextInt(CURRENCIES.length)],
                randomDecimal(0.5, 5.0),
                stock.getCurrency().name(),
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(14),
                DIVIDEND_TYPES[random.nextInt(DIVIDEND_TYPES.length)],
                DIVIDEND_FREQUENCIES[random.nextInt(DIVIDEND_FREQUENCIES.length)]
        );
    }

    private static Payload.News generateNews(final Stocks stock) {
        return new Payload.News(
                NEWS_HEADLINES[random.nextInt(NEWS_HEADLINES.length)],
                NEWS_SOURCES[random.nextInt(NEWS_SOURCES.length)],
                NEWS_SENTIMENTS[random.nextInt(NEWS_SENTIMENTS.length)],
                randomDecimal(0.1, 1.0),
                OffsetDateTime.now(),
                NEWS_IMPACT_LEVELS[random.nextInt(NEWS_IMPACT_LEVELS.length)],
                List.of(stock.getSector().name()),
                List.of(stock.getSymbol())
        );
    }

    private static Payload.VolumeSpike generateVolumeSpike() {
        Long currentVolume = randomLong(50000, 200000);
        Long averageVolume = randomLong(20000, 100000);

        return new Payload.VolumeSpike(
                currentVolume,
                averageVolume,
                BigDecimal.valueOf(currentVolume).divide(BigDecimal.valueOf(averageVolume), 2, RoundingMode.HALF_UP),
                VOLUME_SPIKE_PERIODS[random.nextInt(VOLUME_SPIKE_PERIODS.length)],
                OffsetDateTime.now().minusMinutes(30),
                List.of("Earnings announcement", "News event"),
                random.nextBoolean()
        );
    }

    private static Payload.OptionsActivity generateOptionsActivity(final Stocks stock) {
        return new Payload.OptionsActivity(
                OPTION_TYPES[random.nextInt(OPTION_TYPES.length)],
                stock.getCurrentPrice().add(randomDecimal(-10, 10)),
                LocalDate.now().plusMonths(1),
                randomLong(100, 5000),
                randomLong(1000, 50000),
                randomDecimal(0.15, 0.60),
                randomDecimal(-1, 1),
                randomDecimal(0, 0.1),
                randomDecimal(-0.1, 0),
                random.nextBoolean()
        );
    }

    private static Payload.TechnicalIndicator generateTechnicalIndicator() {
        BigDecimal value = randomDecimal(20, 80);

        return new Payload.TechnicalIndicator(
                TECHNICAL_INDICATOR_TYPES[random.nextInt(TECHNICAL_INDICATOR_TYPES.length)],
                value,
                TECHNICAL_SIGNALS[random.nextInt(TECHNICAL_SIGNALS.length)],
                TECHNICAL_TIMEFRAMES[random.nextInt(TECHNICAL_TIMEFRAMES.length)],
                value.add(randomDecimal(-5, 5)),
                TECHNICAL_TRENDS[random.nextInt(TECHNICAL_TRENDS.length)],
                new Payload.TechnicalIndicator.AdditionalIndicators(
                        randomDecimal(-2, 2),
                        randomDecimal(100, 200),
                        randomDecimal(150, 250),
                        randomDecimal(110, 130),
                        randomDecimal(90, 110)
                )
        );
    }

    private static Payload.OrderUpdate generateOrderUpdate(Stocks stock) {
        Long quantity = randomLong(100, 1000);
        Long filledQuantity = randomLong(0, quantity);

        return new Payload.OrderUpdate(
                UUID.randomUUID().toString(),
                "CLIENT_" + random.nextInt(10000),
                ORDER_STATUSES[random.nextInt(ORDER_STATUSES.length)],
                stock.getSymbol(),
                TRADE_SIDES[random.nextInt(TRADE_SIDES.length)],
                ORDER_TYPES[random.nextInt(ORDER_TYPES.length)],
                quantity,
                quantity - filledQuantity,
                randomPrice(stock.getCurrentPrice()),
                randomPrice(stock.getCurrentPrice()),
                filledQuantity,
                randomPrice(stock.getCurrentPrice()),
                TIME_IN_FORCE_VALUES[random.nextInt(TIME_IN_FORCE_VALUES.length)],
                OffsetDateTime.now().minusMinutes(5),
                OffsetDateTime.now(),
                random.nextBoolean() ? "Insufficient funds" : null,
                generateFills(filledQuantity, stock.getCurrentPrice())
        );
    }

    private static List<Payload.OrderUpdate.Fill> generateFills(final Long totalFilled, final BigDecimal basePrice) {
        if (totalFilled == 0) return List.of();

        List<Payload.OrderUpdate.Fill> fills = new ArrayList<>();
        long remaining = totalFilled;

        while (remaining > 0) {
            long fillQty = Math.min(remaining, randomLong(10, 100));
            fills.add(new Payload.OrderUpdate.Fill(
                    UUID.randomUUID().toString(),
                    randomPrice(basePrice),
                    fillQty,
                    OffsetDateTime.now()
            ));
            remaining -= fillQty;
        }
        return fills;
    }

    private static Payload.PositionUpdate generatePositionUpdate(Stocks stock) {
        Long quantity = randomLong(100, 1000);
        BigDecimal avgEntryPrice = randomPrice(stock.getCurrentPrice());
        BigDecimal currentPrice = stock.getCurrentPrice();
        BigDecimal marketValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal costBasis = avgEntryPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal unrealizedPnl = marketValue.subtract(costBasis);

        return new Payload.PositionUpdate(
                stock.getSymbol(),
                POSITION_SIDES[random.nextInt(POSITION_SIDES.length)],
                quantity,
                marketValue,
                costBasis,
                unrealizedPnl,
                randomDecimal(-1000, 1000),
                avgEntryPrice,
                currentPrice,
                OffsetDateTime.now(),
                POSITION_UPDATE_REASONS[random.nextInt(POSITION_UPDATE_REASONS.length)]
        );
    }

    private static Payload.AccountUpdate generateAccountUpdate() {
        return new Payload.AccountUpdate(
                "ACCOUNT_" + random.nextInt(10000),
                randomDecimal(10000, 100000),
                randomDecimal(5000, 50000),
                randomDecimal(50000, 500000),
                randomDecimal(40000, 400000),
                randomDecimal(20000, 200000),
                randomDecimal(0, 10000),
                randomDecimal(20000, 200000),
                random.nextInt(10),
                random.nextBoolean(),
                OffsetDateTime.now(),
                ACCOUNT_UPDATE_REASONS[random.nextInt(ACCOUNT_UPDATE_REASONS.length)],
                new Payload.AccountUpdate.AccountBalances(
                        randomDecimal(10000, 50000),
                        randomDecimal(0, 5000),
                        randomDecimal(5000, 25000),
                        randomDecimal(0, 1000)
                )
        );
    }

    private static BigDecimal randomPrice(final BigDecimal basePrice) {
        double variance = 0.05; // 5% variance
        double factor = 1 + (random.nextGaussian() * variance);
        return basePrice.multiply(BigDecimal.valueOf(factor)).setScale(4, RoundingMode.HALF_UP);
    }

    private static BigDecimal randomDecimal(final double min, final double max) {
        return BigDecimal.valueOf(min + (max - min) * random.nextDouble()).setScale(4, RoundingMode.HALF_UP);
    }

    private static Long randomLong(final long min, final long max) {
        return min + (long) (random.nextDouble() * (max - min));
    }

}
