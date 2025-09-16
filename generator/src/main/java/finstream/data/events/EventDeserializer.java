package finstream.data.events;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import finstream.data.Enums;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public final class EventDeserializer extends JsonDeserializer<Payload.Event> {

    @Override
    public Payload.Event deserialize(JsonParser parser, DeserializationContext ctx) throws IOException {

        // Fast path: read event type first to determine deserializer
        String eventType = null;

        // Use streaming API for maximum performance
        while (parser.nextToken() != JsonToken.END_OBJECT) {
            String fieldName = parser.currentName();
            parser.nextToken();

            if ("eventType".equals(fieldName)) {
                eventType = parser.getText();
                break;
            }
        }

        if (eventType == null) { throw new IOException("Missing eventType field"); }

        // Direct dispatch based on event type - O(1) with switch on string
        return switch (eventType) {
            case "TRADE" -> deserializeTrade(parser);
            case "QUOTE" -> deserializeQuote(parser);
            case "ORDER_BOOK" -> deserializeOrderBook(parser);
            case "BAR" -> deserializeBar(parser);
            case "MARKET_STATUS" -> deserializeMarketStatus(parser);
            case "PRICE_MOVEMENT" -> deserializePriceMovement(parser);
            case "CORPORATE_ACTION" -> deserializeCorporateAction(parser);
            case "NEWS" -> deserializeNews(parser);
            case "VOLUME_SPIKE" -> deserializeVolumeSpike(parser);
            case "OPTIONS_ACTIVITY" -> deserializeOptionsActivity(parser);
            case "TECHNICAL_INDICATOR" -> deserializeTechnicalIndicator(parser);
            case "ORDER_UPDATE" -> deserializeOrderUpdate(parser);
            case "POSITION_UPDATE" -> deserializePositionUpdate(parser);
            case "ACCOUNT_UPDATE" -> deserializeAccountUpdate(parser);
            default -> throw new IOException("Unknown event type: " + eventType);
        };
    }

    private Payload.TradePay deserializeTrade(JsonParser p) throws IOException {
        String tradeId = null;
        BigDecimal price = null;
        Long volume = null;
        Enums.TradeSide side = null;
        OffsetDateTime executionTime = null;
        List<String> tradeConditions = null;
        String counterparty = null;
        Payload.TradePay.Fees fees = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "tradeId" -> tradeId = p.getText();
                case "price" -> price = new BigDecimal(p.getText());
                case "volume" -> volume = p.getLongValue();
                case "side" -> side = Enums.TradeSide.valueOf(p.getText());
                case "executionTime" -> executionTime = parseDateTime(p.getText());
                case "tradeConditions" -> tradeConditions = readStringList(p);
                case "counterparty" -> counterparty = p.getText();
                case "fees" -> fees = readFees(p);
            }
        }
        return new Payload.TradePay(tradeId, price, volume, side, executionTime, tradeConditions, counterparty, fees);
    }

    private Payload.QuotePay deserializeQuote(JsonParser p) throws IOException {
        BigDecimal bidPrice = null, askPrice = null, spread = null, midPrice = null;
        Long bidSize = null, askSize = null;
        OffsetDateTime quoteTime = null;
        String marketMaker = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "bidPrice" -> bidPrice = new BigDecimal(p.getText());
                case "bidSize" -> bidSize = p.getLongValue();
                case "askPrice" -> askPrice = new BigDecimal(p.getText());
                case "askSize" -> askSize = p.getLongValue();
                case "quoteTime" -> quoteTime = parseDateTime(p.getText());
                case "marketMaker" -> marketMaker = p.getText();
                case "spread" -> spread = new BigDecimal(p.getText());
                case "midPrice" -> midPrice = new BigDecimal(p.getText());
            }
        }
        return new Payload.QuotePay(bidPrice, bidSize, askPrice, askSize, quoteTime, marketMaker, spread, midPrice);
    }

    private Payload.OrderBook deserializeOrderBook(JsonParser p) throws IOException {
        List<Payload.OrderBook.PriceLevel> bids = null, asks = null;
        Long totalBidVolume = null, totalAskVolume = null;
        Integer bookDepth = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "bids" -> bids = readPriceLevels(p);
                case "asks" -> asks = readPriceLevels(p);
                case "totalBidVolume" -> totalBidVolume = p.getLongValue();
                case "totalAskVolume" -> totalAskVolume = p.getLongValue();
                case "bookDepth" -> bookDepth = p.getIntValue();
            }
        }
        return new Payload.OrderBook(bids, asks, totalBidVolume, totalAskVolume, bookDepth);
    }

    private Payload.BarPay deserializeBar(JsonParser p) throws IOException {
        Enums.BarTimeframe timeframe = null;
        OffsetDateTime startTime = null, endTime = null;
        BigDecimal open = null, high = null, low = null, close = null, vwap = null;
        Long volume = null;
        Integer tradeCount = null;
        Boolean isComplete = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "timeframe" -> timeframe = Enums.BarTimeframe.fromCode(p.getText());
                case "startTime" -> startTime = parseDateTime(p.getText());
                case "endTime" -> endTime = parseDateTime(p.getText());
                case "open" -> open = new BigDecimal(p.getText());
                case "high" -> high = new BigDecimal(p.getText());
                case "low" -> low = new BigDecimal(p.getText());
                case "close" -> close = new BigDecimal(p.getText());
                case "volume" -> volume = p.getLongValue();
                case "vwap" -> vwap = new BigDecimal(p.getText());
                case "tradeCount" -> tradeCount = p.getIntValue();
                case "isComplete" -> isComplete = p.getBooleanValue();
            }
        }
        return new Payload.BarPay(timeframe, startTime, endTime, open, high, low, close, volume, vwap, tradeCount, isComplete);
    }

    private Payload.MarketStatus deserializeMarketStatus(JsonParser p) throws IOException {
        Enums.MarketStatus status = null, previousStatus = null;
        OffsetDateTime statusChangeTime = null, nextStatusTime = null;
        String reason = null, tradingSession = null, haltReason = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "status" -> status = Enums.MarketStatus.valueOf(p.getText());
                case "previousStatus" -> previousStatus = Enums.MarketStatus.valueOf(p.getText());
                case "statusChangeTime" -> statusChangeTime = parseDateTime(p.getText());
                case "reason" -> reason = p.getText();
                case "nextStatusTime" -> nextStatusTime = parseDateTime(p.getText());
                case "tradingSession" -> tradingSession = p.getText();
                case "haltReason" -> haltReason = p.getText();
            }
        }
        return new Payload.MarketStatus(status, previousStatus, statusChangeTime, reason, nextStatusTime, tradingSession, haltReason);
    }

    private Payload.PriceMovement deserializePriceMovement(JsonParser p) throws IOException {
        BigDecimal previousPrice = null, currentPrice = null, priceChange = null, priceChangePercent = null, volumeWeightedPrice = null, dayHigh = null, dayLow = null;
        String movementTrigger = null;
        Boolean volatilitySpike = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "previousPrice" -> previousPrice = new BigDecimal(p.getText());
                case "currentPrice" -> currentPrice = new BigDecimal(p.getText());
                case "priceChange" -> priceChange = new BigDecimal(p.getText());
                case "priceChangePercent" -> priceChangePercent = new BigDecimal(p.getText());
                case "volumeWeightedPrice" -> volumeWeightedPrice = new BigDecimal(p.getText());
                case "dayHigh" -> dayHigh = new BigDecimal(p.getText());
                case "dayLow" -> dayLow = new BigDecimal(p.getText());
                case "movementTrigger" -> movementTrigger = p.getText();
                case "volatilitySpike" -> volatilitySpike = p.getBooleanValue();
            }
        }
        return new Payload.PriceMovement(previousPrice, currentPrice, priceChange, priceChangePercent, volumeWeightedPrice, dayHigh, dayLow, movementTrigger, volatilitySpike);
    }

    private Payload.CorporateAction deserializeCorporateAction(JsonParser p) throws IOException {
        Enums.CorporateActionType actionType = null;
        BigDecimal dividendAmount = null;
        String currency = null;
        LocalDate exDividendDate = null, recordDate = null, paymentDate = null;
        Enums.DividendType dividendType = null;
        Enums.DividendFrequency frequency = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "actionType" -> actionType = Enums.CorporateActionType.valueOf(p.getText());
                case "dividendAmount" -> dividendAmount = new BigDecimal(p.getText());
                case "currency" -> currency = p.getText();
                case "exDividendDate" -> exDividendDate = LocalDate.parse(p.getText());
                case "recordDate" -> recordDate = LocalDate.parse(p.getText());
                case "paymentDate" -> paymentDate = LocalDate.parse(p.getText());
                case "dividendType" -> dividendType = Enums.DividendType.valueOf(p.getText());
                case "frequency" -> frequency = Enums.DividendFrequency.valueOf(p.getText());
            }
        }
        return new Payload.CorporateAction(actionType, dividendAmount, currency, exDividendDate, recordDate, paymentDate, dividendType, frequency);
    }

    private Payload.News deserializeNews(JsonParser p) throws IOException {
        String headline = null, source = null;
        Enums.NewsSentiment sentiment = null;
        BigDecimal relevanceScore = null;
        OffsetDateTime newsTime = null;
        Enums.NewsImpactLevel impactLevel = null;
        List<String> categories = null, relatedSymbols = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "headline" -> headline = p.getText();
                case "source" -> source = p.getText();
                case "sentiment" -> sentiment = Enums.NewsSentiment.valueOf(p.getText());
                case "relevanceScore" -> relevanceScore = new BigDecimal(p.getText());
                case "newsTime" -> newsTime = parseDateTime(p.getText());
                case "impactLevel" -> impactLevel = Enums.NewsImpactLevel.valueOf(p.getText());
                case "categories" -> categories = readStringList(p);
                case "relatedSymbols" -> relatedSymbols = readStringList(p);
            }
        }
        return new Payload.News(headline, source, sentiment, relevanceScore, newsTime, impactLevel, categories, relatedSymbols);
    }

    private Payload.VolumeSpike deserializeVolumeSpike(JsonParser p) throws IOException {
        Long currentVolume = null, averageVolume = null;
        BigDecimal volumeRatio = null;
        Enums.VolumeSpikePeriod timePeriod = null;
        OffsetDateTime spikeStartTime = null;
        List<String> contributingFactors = null;
        Boolean unusualActivity = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "currentVolume" -> currentVolume = p.getLongValue();
                case "averageVolume" -> averageVolume = p.getLongValue();
                case "volumeRatio" -> volumeRatio = new BigDecimal(p.getText());
                case "timePeriod" -> timePeriod = Enums.VolumeSpikePeriod.fromCode(p.getText());
                case "spikeStartTime" -> spikeStartTime = parseDateTime(p.getText());
                case "contributingFactors" -> contributingFactors = readStringList(p);
                case "unusualActivity" -> unusualActivity = p.getBooleanValue();
            }
        }
        return new Payload.VolumeSpike(currentVolume, averageVolume, volumeRatio, timePeriod, spikeStartTime, contributingFactors, unusualActivity);
    }

    private Payload.OptionsActivity deserializeOptionsActivity(JsonParser p) throws IOException {
        Enums.OptionType optionType = null;
        BigDecimal strikePrice = null, impliedVolatility = null, delta = null, gamma = null, theta = null;
        LocalDate expirationDate = null;
        Long volume = null, openInterest = null;
        Boolean unusualVolume = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "optionType" -> optionType = Enums.OptionType.valueOf(p.getText());
                case "strikePrice" -> strikePrice = new BigDecimal(p.getText());
                case "expirationDate" -> expirationDate = LocalDate.parse(p.getText());
                case "volume" -> volume = p.getLongValue();
                case "openInterest" -> openInterest = p.getLongValue();
                case "impliedVolatility" -> impliedVolatility = new BigDecimal(p.getText());
                case "delta" -> delta = new BigDecimal(p.getText());
                case "gamma" -> gamma = new BigDecimal(p.getText());
                case "theta" -> theta = new BigDecimal(p.getText());
                case "unusualVolume" -> unusualVolume = p.getBooleanValue();
            }
        }
        return new Payload.OptionsActivity(optionType, strikePrice, expirationDate, volume, openInterest, impliedVolatility, delta, gamma, theta, unusualVolume);
    }

    private Payload.TechnicalIndicator deserializeTechnicalIndicator(JsonParser p) throws IOException {
        Enums.TechnicalIndicatorType indicatorType = null;
        BigDecimal value = null, previousValue = null;
        Enums.TechnicalSignal signal = null;
        Enums.TechnicalTimeframe timeframe = null;
        Enums.TechnicalTrend trend = null;
        Payload.TechnicalIndicator.AdditionalIndicators additionalIndicators = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "indicatorType" -> indicatorType = Enums.TechnicalIndicatorType.valueOf(p.getText());
                case "value" -> value = new BigDecimal(p.getText());
                case "signal" -> signal = Enums.TechnicalSignal.valueOf(p.getText());
                case "timeframe" -> timeframe = Enums.TechnicalTimeframe.fromCode(p.getText());
                case "previousValue" -> previousValue = new BigDecimal(p.getText());
                case "trend" -> trend = Enums.TechnicalTrend.valueOf(p.getText());
                case "additionalIndicators" -> additionalIndicators = readAdditionalIndicators(p);
            }
        }
        return new Payload.TechnicalIndicator(indicatorType, value, signal, timeframe, previousValue, trend, additionalIndicators);
    }

    private Payload.OrderUpdate deserializeOrderUpdate(JsonParser p) throws IOException {
        String orderId = null, clientOrderId = null, symbol = null, rejectReason = null;
        Enums.OrderStatus status = null;
        Enums.TradeSide side = null;
        Enums.OrderType orderType = null;
        Long quantity = null, remainingQuantity = null, filledQuantity = null;
        BigDecimal limitPrice = null, stopPrice = null, filledAvgPrice = null;
        Enums.TimeInForce timeInForce = null;
        OffsetDateTime submittedAt = null, updatedAt = null;
        List<Payload.OrderUpdate.Fill> fills = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "orderId" -> orderId = p.getText();
                case "clientOrderId" -> clientOrderId = p.getText();
                case "status" -> status = Enums.OrderStatus.valueOf(p.getText());
                case "symbol" -> symbol = p.getText();
                case "side" -> side = Enums.TradeSide.valueOf(p.getText());
                case "orderType" -> orderType = Enums.OrderType.valueOf(p.getText());
                case "quantity" -> quantity = p.getLongValue();
                case "remainingQuantity" -> remainingQuantity = p.getLongValue();
                case "limitPrice" -> limitPrice = new BigDecimal(p.getText());
                case "stopPrice" -> stopPrice = new BigDecimal(p.getText());
                case "filledQuantity" -> filledQuantity = p.getLongValue();
                case "filledAvgPrice" -> filledAvgPrice = new BigDecimal(p.getText());
                case "timeInForce" -> timeInForce = Enums.TimeInForce.valueOf(p.getText());
                case "submittedAt" -> submittedAt = parseDateTime(p.getText());
                case "updatedAt" -> updatedAt = parseDateTime(p.getText());
                case "rejectReason" -> rejectReason = p.getText();
                case "fills" -> fills = readFills(p);
            }
        }
        return new Payload.OrderUpdate(orderId, clientOrderId, status, symbol, side, orderType,
                quantity, remainingQuantity, limitPrice, stopPrice, filledQuantity,
                filledAvgPrice, timeInForce, submittedAt, updatedAt, rejectReason, fills);
    }

    private Payload.PositionUpdate deserializePositionUpdate(JsonParser p) throws IOException {
        String symbol = null;
        Enums.PositionSide side = null;
        Long quantity = null;
        BigDecimal marketValue = null, costBasis = null, unrealizedPnl = null, realizedPnl = null,
                avgEntryPrice = null, currentPrice = null;
        OffsetDateTime lastUpdated = null;
        Enums.PositionUpdateReason updateReason = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "symbol" -> symbol = p.getText();
                case "side" -> side = Enums.PositionSide.valueOf(p.getText());
                case "quantity" -> quantity = p.getLongValue();
                case "marketValue" -> marketValue = new BigDecimal(p.getText());
                case "costBasis" -> costBasis = new BigDecimal(p.getText());
                case "unrealizedPnl" -> unrealizedPnl = new BigDecimal(p.getText());
                case "realizedPnl" -> realizedPnl = new BigDecimal(p.getText());
                case "avgEntryPrice" -> avgEntryPrice = new BigDecimal(p.getText());
                case "currentPrice" -> currentPrice = new BigDecimal(p.getText());
                case "lastUpdated" -> lastUpdated = parseDateTime(p.getText());
                case "updateReason" -> updateReason = Enums.PositionUpdateReason.valueOf(p.getText());
            }
        }
        return new Payload.PositionUpdate(symbol, side, quantity, marketValue, costBasis,
                unrealizedPnl, realizedPnl, avgEntryPrice, currentPrice,
                lastUpdated, updateReason);
    }

    private Payload.AccountUpdate deserializeAccountUpdate(JsonParser p) throws IOException {
        String accountId = null;
        BigDecimal buyingPower = null, cash = null, portfolioValue = null, equity = null,
                longMarketValue = null, shortMarketValue = null, dayTradeBuyingPower = null;
        Integer dayTradeCount = null;
        Boolean patternDayTrader = null;
        OffsetDateTime lastUpdated = null;
        Enums.AccountUpdateReason updateReason = null;
        Payload.AccountUpdate.AccountBalances balances = null;

        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();

            switch (field) {
                case "accountId" -> accountId = p.getText();
                case "buyingPower" -> buyingPower = new BigDecimal(p.getText());
                case "cash" -> cash = new BigDecimal(p.getText());
                case "portfolioValue" -> portfolioValue = new BigDecimal(p.getText());
                case "equity" -> equity = new BigDecimal(p.getText());
                case "longMarketValue" -> longMarketValue = new BigDecimal(p.getText());
                case "shortMarketValue" -> shortMarketValue = new BigDecimal(p.getText());
                case "dayTradeBuyingPower" -> dayTradeBuyingPower = new BigDecimal(p.getText());
                case "dayTradeCount" -> dayTradeCount = p.getIntValue();
                case "patternDayTrader" -> patternDayTrader = p.getBooleanValue();
                case "lastUpdated" -> lastUpdated = parseDateTime(p.getText());
                case "updateReason" -> updateReason = Enums.AccountUpdateReason.valueOf(p.getText());
                case "balances" -> balances = readAccountBalances(p);
            }
        }
        return new Payload.AccountUpdate(accountId, buyingPower, cash, portfolioValue, equity,
                longMarketValue, shortMarketValue, dayTradeBuyingPower,
                dayTradeCount, patternDayTrader, lastUpdated, updateReason, balances);
    }

    private Payload.TradePay.Fees readFees(JsonParser p) throws IOException {
        BigDecimal commission = null, secFee = null, tafFee = null;
        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();
            switch (field) {
                case "commission" -> commission = new BigDecimal(p.getText());
                case "secFee" -> secFee = new BigDecimal(p.getText());
                case "tafFee" -> tafFee = new BigDecimal(p.getText());
            }
        }
        return new Payload.TradePay.Fees(commission, secFee, tafFee);
    }

    private List<Payload.OrderBook.PriceLevel> readPriceLevels(JsonParser p) throws IOException {
       final var collector = new ArrayList<Payload.OrderBook.PriceLevel>();
        while (p.nextToken() != JsonToken.END_ARRAY) {
            BigDecimal price = null;
            Long size = null;
            Integer orders = null;

            while (p.nextToken() != JsonToken.END_OBJECT) {
                String field = p.currentName();
                p.nextToken();
                switch (field) {
                    case "price" -> price = new BigDecimal(p.getText());
                    case "size" -> size = p.getLongValue();
                    case "orders" -> orders = p.getIntValue();
                }
            }
            collector.add(new Payload.OrderBook.PriceLevel(price, size, orders));
        }
        return collector;
    }

    private Payload.TechnicalIndicator.AdditionalIndicators readAdditionalIndicators(JsonParser p) throws IOException {
        BigDecimal macd = null, ma50 = null, ma200 = null, bollingerUpper = null, bollingerLower = null;
        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();
            switch (field) {
                case "macd" -> macd = new BigDecimal(p.getText());
                case "movingAverage50" -> ma50 = new BigDecimal(p.getText());
                case "movingAverage200" -> ma200 = new BigDecimal(p.getText());
                case "bollingerUpper" -> bollingerUpper = new BigDecimal(p.getText());
                case "bollingerLower" -> bollingerLower = new BigDecimal(p.getText());
            }
        }
        return new Payload.TechnicalIndicator.AdditionalIndicators(macd, ma50, ma200, bollingerUpper, bollingerLower);
    }

    private List<Payload.OrderUpdate.Fill> readFills(JsonParser p) throws IOException {
        final var collector = new ArrayList<Payload.OrderUpdate.Fill>();
        while (p.nextToken() != JsonToken.END_ARRAY) {
            String fillId = null;
            BigDecimal price = null;
            Long quantity = null;
            OffsetDateTime timestamp = null;

            while (p.nextToken() != JsonToken.END_OBJECT) {
                String field = p.currentName();
                p.nextToken();
                switch (field) {
                    case "fillId" -> fillId = p.getText();
                    case "price" -> price = new BigDecimal(p.getText());
                    case "quantity" -> quantity = p.getLongValue();
                    case "timestamp" -> timestamp = parseDateTime(p.getText());
                }
            }
            collector.add(new Payload.OrderUpdate.Fill(fillId, price, quantity, timestamp));
        }
        return new ArrayList<>(collector);
    }

    private Payload.AccountUpdate.AccountBalances readAccountBalances(JsonParser p) throws IOException {
        BigDecimal cashSettled = null, cashUnsettled = null, marginMaintenanceExcess = null, regTCallAmount = null;
        while (p.nextToken() != JsonToken.END_OBJECT) {
            String field = p.currentName();
            p.nextToken();
            switch (field) {
                case "cashSettled" -> cashSettled = new BigDecimal(p.getText());
                case "cashUnsettled" -> cashUnsettled = new BigDecimal(p.getText());
                case "marginMaintenanceExcess" -> marginMaintenanceExcess = new BigDecimal(p.getText());
                case "regTCallAmount" -> regTCallAmount = new BigDecimal(p.getText());
            }
        }
        return new Payload.AccountUpdate.AccountBalances(cashSettled, cashUnsettled, marginMaintenanceExcess, regTCallAmount);
    }

    private List<String> readStringList(JsonParser p) throws IOException {
        final var collector = new ArrayList<String>();
        while (p.nextToken() != JsonToken.END_ARRAY) { collector.add(p.getText()); }
        return collector;
    }

    private static OffsetDateTime parseDateTime(String text) { return text != null ? OffsetDateTime.parse(text) : null; }
}
