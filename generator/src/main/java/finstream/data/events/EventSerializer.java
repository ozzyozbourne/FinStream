package finstream.data.events;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class EventSerializer extends JsonSerializer<Payload.Event> {

    private static final String EVENT_TYPE = "eventType";

    @Override
    public void serialize(Payload.Event event, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        switch (event) {
            case Payload.TradePay trade -> serializeTrade(trade, gen);
            case Payload.QuotePay quote -> serializeQuote(quote, gen);
            case Payload.OrderBook orderBook -> serializeOrderBook(orderBook, gen);
            case Payload.BarPay bar -> serializeBar(bar, gen);
            case Payload.MarketStatus status -> serializeMarketStatus(status, gen);
            case Payload.PriceMovement movement -> serializePriceMovement(movement, gen);
            case Payload.CorporateAction action -> serializeCorporateAction(action, gen);
            case Payload.News news -> serializeNews(news, gen);
            case Payload.VolumeSpike spike -> serializeVolumeSpike(spike, gen);
            case Payload.OptionsActivity options -> serializeOptionsActivity(options, gen);
            case Payload.TechnicalIndicator indicator -> serializeTechnicalIndicator(indicator, gen);
            case Payload.OrderUpdate order -> serializeOrderUpdate(order, gen);
            case Payload.PositionUpdate position -> serializePositionUpdate(position, gen);
            case Payload.AccountUpdate account -> serializeAccountUpdate(account, gen);
        }
        gen.writeEndObject();
    }

    private void serializeTrade(Payload.TradePay trade, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "TRADE");
        gen.writeStringField("tradeId", trade.tradeId());
        writeBigDecimal(gen, "price", trade.price());
        gen.writeNumberField("volume", trade.volume());
        gen.writeStringField("side", trade.side().name());
        writeDateTime(gen, "executionTime", trade.executionTime());
        writeStringList(gen, "tradeConditions", trade.tradeConditions());
        writeString(gen, "counterparty", trade.counterparty());

        if (trade.fees() != null) {
            gen.writeObjectFieldStart("fees");
            writeBigDecimal(gen, "commission", trade.fees().commission());
            writeBigDecimal(gen, "secFee", trade.fees().secFee());
            writeBigDecimal(gen, "tafFee", trade.fees().tafFee());
            gen.writeEndObject();
        }
    }

    private void serializeQuote(Payload.QuotePay quote, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "QUOTE");
        writeBigDecimal(gen, "bidPrice", quote.bidPrice());
        gen.writeNumberField("bidSize", quote.bidSize());
        writeBigDecimal(gen, "askPrice", quote.askPrice());
        gen.writeNumberField("askSize", quote.askSize());
        writeDateTime(gen, "quoteTime", quote.quoteTime());
        writeString(gen, "marketMaker", quote.marketMaker());
        writeBigDecimal(gen, "spread", quote.spread());
        writeBigDecimal(gen, "midPrice", quote.midPrice());
    }

    private void serializeOrderBook(Payload.OrderBook book, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "ORDER_BOOK");

        gen.writeArrayFieldStart("bids");
        for (var level : book.bids()) {
            gen.writeStartObject();
            writeBigDecimal(gen, "price", level.price());
            gen.writeNumberField("size", level.size());
            gen.writeNumberField("orders", level.orders());
            gen.writeEndObject();
        }
        gen.writeEndArray();

        gen.writeArrayFieldStart("asks");
        for (var level : book.asks()) {
            gen.writeStartObject();
            writeBigDecimal(gen, "price", level.price());
            gen.writeNumberField("size", level.size());
            gen.writeNumberField("orders", level.orders());
            gen.writeEndObject();
        }
        gen.writeEndArray();

        gen.writeNumberField("totalBidVolume", book.totalBidVolume());
        gen.writeNumberField("totalAskVolume", book.totalAskVolume());
        gen.writeNumberField("bookDepth", book.bookDepth());
    }

    private void serializeBar(Payload.BarPay bar, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "BAR");
        gen.writeStringField("timeframe", bar.timeframe().code);
        writeDateTime(gen, "startTime", bar.startTime());
        writeDateTime(gen, "endTime", bar.endTime());
        writeBigDecimal(gen, "open", bar.open());
        writeBigDecimal(gen, "high", bar.high());
        writeBigDecimal(gen, "low", bar.low());
        writeBigDecimal(gen, "close", bar.close());
        gen.writeNumberField("volume", bar.volume());
        writeBigDecimal(gen, "vwap", bar.vwap());
        gen.writeNumberField("tradeCount", bar.tradeCount());
        gen.writeBooleanField("isComplete", bar.isComplete());
    }

    private void serializeMarketStatus(Payload.MarketStatus status, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "MARKET_STATUS");
        gen.writeStringField("status", status.status().name());
        gen.writeStringField("previousStatus", status.previousStatus().name());
        writeDateTime(gen, "statusChangeTime", status.statusChangeTime());
        writeString(gen, "reason", status.reason());
        writeDateTime(gen, "nextStatusTime", status.nextStatusTime());
        writeString(gen, "tradingSession", status.tradingSession());
        writeString(gen, "haltReason", status.haltReason());
    }

    private void serializePriceMovement(Payload.PriceMovement movement, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "PRICE_MOVEMENT");
        writeBigDecimal(gen, "previousPrice", movement.previousPrice());
        writeBigDecimal(gen, "currentPrice", movement.currentPrice());
        writeBigDecimal(gen, "priceChange", movement.priceChange());
        writeBigDecimal(gen, "priceChangePercent", movement.priceChangePercent());
        writeBigDecimal(gen, "volumeWeightedPrice", movement.volumeWeightedPrice());
        writeBigDecimal(gen, "dayHigh", movement.dayHigh());
        writeBigDecimal(gen, "dayLow", movement.dayLow());
        writeString(gen, "movementTrigger", movement.movementTrigger());
        writeBoolean(gen, "volatilitySpike", movement.volatilitySpike());
    }

    private void serializeCorporateAction(Payload.CorporateAction action, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "CORPORATE_ACTION");
        gen.writeStringField("actionType", action.actionType().name());
        writeBigDecimal(gen, "dividendAmount", action.dividendAmount());
        writeString(gen, "currency", action.currency());
        writeDate(gen, "exDividendDate", action.exDividendDate());
        writeDate(gen, "recordDate", action.recordDate());
        writeDate(gen, "paymentDate", action.paymentDate());
        gen.writeStringField("dividendType", action.dividendType().name());
        gen.writeStringField("frequency", action.frequency().name());
    }

    private void serializeNews(Payload.News news, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "NEWS");
        gen.writeStringField("headline", news.headline());
        gen.writeStringField("source", news.source());
        gen.writeStringField("sentiment", news.sentiment().name());
        writeBigDecimal(gen, "relevanceScore", news.relevanceScore());
        writeDateTime(gen, "newsTime", news.newsTime());
        gen.writeStringField("impactLevel", news.impactLevel().name());
        writeStringList(gen, "categories", news.categories());
        writeStringList(gen, "relatedSymbols", news.relatedSymbols());
    }

    private void serializeVolumeSpike(Payload.VolumeSpike spike, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "VOLUME_SPIKE");
        gen.writeNumberField("currentVolume", spike.currentVolume());
        gen.writeNumberField("averageVolume", spike.averageVolume());
        writeBigDecimal(gen, "volumeRatio", spike.volumeRatio());
        gen.writeStringField("timePeriod", spike.timePeriod().code);
        writeDateTime(gen, "spikeStartTime", spike.spikeStartTime());
        writeStringList(gen, "contributingFactors", spike.contributingFactors());
        writeBoolean(gen, "unusualActivity", spike.unusualActivity());
    }

    private void serializeOptionsActivity(Payload.OptionsActivity options, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "OPTIONS_ACTIVITY");
        gen.writeStringField("optionType", options.optionType().name());
        writeBigDecimal(gen, "strikePrice", options.strikePrice());
        writeDate(gen, "expirationDate", options.expirationDate());
        gen.writeNumberField("volume", options.volume());
        gen.writeNumberField("openInterest", options.openInterest());
        writeBigDecimal(gen, "impliedVolatility", options.impliedVolatility());
        writeBigDecimal(gen, "delta", options.delta());
        writeBigDecimal(gen, "gamma", options.gamma());
        writeBigDecimal(gen, "theta", options.theta());
        writeBoolean(gen, "unusualVolume", options.unusualVolume());
    }

    private void serializeTechnicalIndicator(Payload.TechnicalIndicator indicator, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "TECHNICAL_INDICATOR");
        gen.writeStringField("indicatorType", indicator.indicatorType().name());
        writeBigDecimal(gen, "value", indicator.value());
        gen.writeStringField("signal", indicator.signal().name());
        gen.writeStringField("timeframe", indicator.timeframe().code);
        writeBigDecimal(gen, "previousValue", indicator.previousValue());
        gen.writeStringField("trend", indicator.trend().name());

        if (indicator.additionalIndicators() != null) {
            gen.writeObjectFieldStart("additionalIndicators");
            var add = indicator.additionalIndicators();
            writeBigDecimal(gen, "macd", add.macd());
            writeBigDecimal(gen, "movingAverage50", add.movingAverage50());
            writeBigDecimal(gen, "movingAverage200", add.movingAverage200());
            writeBigDecimal(gen, "bollingerUpper", add.bollingerUpper());
            writeBigDecimal(gen, "bollingerLower", add.bollingerLower());
            gen.writeEndObject();
        }
    }

    private void serializeOrderUpdate(Payload.OrderUpdate order, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "ORDER_UPDATE");
        gen.writeStringField("orderId", order.orderId());
        writeString(gen, "clientOrderId", order.clientOrderId());
        gen.writeStringField("status", order.status().name());
        gen.writeStringField("symbol", order.symbol());
        gen.writeStringField("side", order.side().name());
        gen.writeStringField("orderType", order.orderType().name());
        gen.writeNumberField("quantity", order.quantity());
        gen.writeNumberField("remainingQuantity", order.remainingQuantity());
        writeBigDecimal(gen, "limitPrice", order.limitPrice());
        writeBigDecimal(gen, "stopPrice", order.stopPrice());
        gen.writeNumberField("filledQuantity", order.filledQuantity());
        writeBigDecimal(gen, "filledAvgPrice", order.filledAvgPrice());
        gen.writeStringField("timeInForce", order.timeInForce().name());
        writeDateTime(gen, "submittedAt", order.submittedAt());
        writeDateTime(gen, "updatedAt", order.updatedAt());
        writeString(gen, "rejectReason", order.rejectReason());

        if (order.fills() != null && !order.fills().isEmpty()) {
            gen.writeArrayFieldStart("fills");
            for (var fill : order.fills()) {
                gen.writeStartObject();
                gen.writeStringField("fillId", fill.fillId());
                writeBigDecimal(gen, "price", fill.price());
                gen.writeNumberField("quantity", fill.quantity());
                writeDateTime(gen, "timestamp", fill.timestamp());
                gen.writeEndObject();
            }
            gen.writeEndArray();
        }
    }

    private void serializePositionUpdate(Payload.PositionUpdate position, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "POSITION_UPDATE");
        gen.writeStringField("symbol", position.symbol());
        gen.writeStringField("side", position.side().name());
        gen.writeNumberField("quantity", position.quantity());
        writeBigDecimal(gen, "marketValue", position.marketValue());
        writeBigDecimal(gen, "costBasis", position.costBasis());
        writeBigDecimal(gen, "unrealizedPnl", position.unrealizedPnl());
        writeBigDecimal(gen, "realizedPnl", position.realizedPnl());
        writeBigDecimal(gen, "avgEntryPrice", position.avgEntryPrice());
        writeBigDecimal(gen, "currentPrice", position.currentPrice());
        writeDateTime(gen, "lastUpdated", position.lastUpdated());
        gen.writeStringField("updateReason", position.updateReason().name());
    }

    private void serializeAccountUpdate(Payload.AccountUpdate account, JsonGenerator gen) throws IOException {
        gen.writeStringField(EVENT_TYPE, "ACCOUNT_UPDATE");
        gen.writeStringField("accountId", account.accountId());
        writeBigDecimal(gen, "buyingPower", account.buyingPower());
        writeBigDecimal(gen, "cash", account.cash());
        writeBigDecimal(gen, "portfolioValue", account.portfolioValue());
        writeBigDecimal(gen, "equity", account.equity());
        writeBigDecimal(gen, "longMarketValue", account.longMarketValue());
        writeBigDecimal(gen, "shortMarketValue", account.shortMarketValue());
        writeBigDecimal(gen, "dayTradeBuyingPower", account.dayTradeBuyingPower());
        gen.writeNumberField("dayTradeCount", account.dayTradeCount());
        writeBoolean(gen, "patternDayTrader", account.patternDayTrader());
        writeDateTime(gen, "lastUpdated", account.lastUpdated());
        gen.writeStringField("updateReason", account.updateReason().name());

        if (account.balances() != null) {
            gen.writeObjectFieldStart("balances");
            var bal = account.balances();
            writeBigDecimal(gen, "cashSettled", bal.cashSettled());
            writeBigDecimal(gen, "cashUnsettled", bal.cashUnsettled());
            writeBigDecimal(gen, "marginMaintenanceExcess", bal.marginMaintenanceExcess());
            writeBigDecimal(gen, "regTCallAmount", bal.regTCallAmount());
            gen.writeEndObject();
        }
    }

    private void writeBigDecimal(JsonGenerator gen, String field, BigDecimal value) throws IOException {
        if (value != null) gen.writeNumberField(field, value);
        else gen.writeNullField(field);
    }

    private void writeString(JsonGenerator gen, String field, String value) throws IOException {
        if (value != null) gen.writeStringField(field, value);
        else gen.writeNullField(field);
    }

    private void writeDateTime(JsonGenerator gen, String field, OffsetDateTime value) throws IOException {
        if (value != null) gen.writeStringField(field, value.toString());
        else gen.writeNullField(field);
    }

    private void writeDate(JsonGenerator gen, String field, LocalDate value) throws IOException {
        if (value != null) gen.writeStringField(field, value.toString());
        else gen.writeNullField(field);
    }

    private void writeBoolean(JsonGenerator gen, String field, Boolean value) throws IOException {
        if (value != null) gen.writeBooleanField(field, value);
        else gen.writeNullField(field);
    }

    private void writeStringList(JsonGenerator gen, String field, List<String> values) throws IOException {
        if (values != null && !values.isEmpty()) {
            gen.writeArrayFieldStart(field);
            for (String v : values) gen.writeString(v);
            gen.writeEndArray();
        } else gen.writeNullField(field);
    }
}
