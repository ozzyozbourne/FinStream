package finstream.data;

public final class Enums {

    public sealed interface TaggedEnum permits
            Currency,
            Exchange,
            SessionType,
            Sector,
            EventType,
            TradeSide,
            PositionSide,
            AccountUpdateReason,
            PositionUpdateReason,
            MarketStatus,
            CorporateActionType,
            DividendType,
            DividendFrequency,
            NewsSentiment,
            NewsImpactLevel,
            OptionType,
            TechnicalIndicatorType,
            TechnicalSignal,
            TechnicalTrend,
            OrderStatus,
            OrderType,
            TimeInForce,
            BarTimeframe,
            TechnicalTimeframe,
            VolumeSpikePeriod
    {}

    public enum Currency implements TaggedEnum {
        USD,
        EUR,
        GBP,
        JPY,
        CAD,
        AUD,
        CHF,
        CNY,
        INR,
        HKD,
        SGD,
        KRW
    }

    public enum Exchange implements TaggedEnum {
        NASDAQ,
        NYSE,
        LSE,
        TSE,
        HKEX,
        SSE,
        BSE,
        ASX
    }

    public enum SessionType implements TaggedEnum {
        REGULAR,
        PRE_MARKET,
        AFTER_HOURS,
        HOLIDAY,
        HALF_DAY,
        EXTENDED,
        MAINTENANCE
    }

    public enum Sector implements TaggedEnum  {
        TECHNOLOGY("Technology"),
        CONSUMER_DISCRETIONARY("Consumer Discretionary"),
        CONSUMER_STAPLES("Consumer Staples"),
        COMMUNICATION_SERVICES("Communication Services"),
        FINANCIAL_SERVICES("Financial Services"),
        HEALTHCARE("Healthcare"),
        INDUSTRIALS("Industrials"),
        MATERIALS("Materials"),
        ENERGY("Energy"),
        UTILITIES("Utilities"),
        REAL_ESTATE("Real Estate");

        private final String displayName;

        Sector(String displayName) {this.displayName = displayName;}

        @Override
        public String toString() {return displayName;}
    }

    public enum EventType implements TaggedEnum  {
        TRADE("TRADE"),
        QUOTE("QUOTE"),
        ORDER_BOOK("ORDER_BOOK"),
        BAR("BAR"),
        MARKET_STATUS("MARKET_STATUS"),
        PRICE_MOVEMENT("PRICE_MOVEMENT"),
        CORPORATE_ACTION("CORPORATE_ACTION"),
        NEWS("NEWS"),
        VOLUME_SPIKE("VOLUME_SPIKE"),
        OPTIONS_ACTIVITY("OPTIONS_ACTIVITY"),
        TECHNICAL_INDICATOR("TECHNICAL_INDICATOR"),
        ORDER_UPDATE("ORDER_UPDATE"),
        POSITION_UPDATE("POSITION_UPDATE"),
        ACCOUNT_UPDATE("ACCOUNT_UPDATE");

        public final String value;

        EventType(final String value) {
            this.value = value;
        }
    }

    public enum TradeSide implements TaggedEnum { BUY, SELL }

    public enum PositionSide implements TaggedEnum  { LONG, SHORT }

    public enum AccountUpdateReason implements TaggedEnum  { TRADE, DEPOSIT, WITHDRAWAL, DIVIDEND, FEE }

    public enum PositionUpdateReason implements TaggedEnum  { TRADE, MARKET_MOVE, ADJUSTMENT }

    public enum MarketStatus implements TaggedEnum  { OPEN, CLOSED, PRE_MARKET, AFTER_HOURS, HALTED }

    public enum CorporateActionType implements TaggedEnum { DIVIDEND, SPLIT, MERGER, SPINOFF }

    public enum DividendType implements TaggedEnum { CASH, STOCK }

    public enum DividendFrequency implements TaggedEnum { QUARTERLY, ANNUAL, SPECIAL }

    public enum NewsSentiment implements TaggedEnum { POSITIVE, NEGATIVE, NEUTRAL }

    public enum NewsImpactLevel implements TaggedEnum{ HIGH, MEDIUM, LOW }

    public enum OptionType implements TaggedEnum{ CALL, PUT }

    public enum TechnicalIndicatorType implements TaggedEnum{ RSI, MACD, BOLLINGER_BANDS }

    public enum TechnicalSignal implements TaggedEnum{ OVERBOUGHT, OVERSOLD, BUY, SELL }

    public enum TechnicalTrend implements TaggedEnum{ RISING, FALLING, SIDEWAYS }

    public enum OrderStatus implements TaggedEnum{ NEW, PARTIALLY_FILLED, FILLED, CANCELED, REJECTED, EXPIRED }

    public enum OrderType implements TaggedEnum{ MARKET, LIMIT, STOP, STOP_LIMIT }

    public enum TimeInForce implements TaggedEnum{ DAY, GTC, IOC, FOK }

    public enum BarTimeframe implements TaggedEnum {
        ONE_MINUTE("1m"),
        FIVE_MINUTES("5m"),
        FIFTEEN_MINUTES("15m"),
        ONE_HOUR("1h"),
        FOUR_HOURS("4h"),
        ONE_DAY("1d");

        public final String code;

        BarTimeframe(final String code) { this.code = code; }

        public static BarTimeframe fromCode(final String code) throws IllegalArgumentException {
            for (final var timeframe : values()) {
                if (timeframe.code.equals(code)) return timeframe;
            }
            throw new IllegalArgumentException("Unknown timeframe code: " + code);
        }
    }

    public enum TechnicalTimeframe implements TaggedEnum{
        ONE_MINUTE("1M"),
        FIVE_MINUTES("5M"),
        ONE_HOUR("1H"),
        ONE_DAY("1D");

        public final String code;

        TechnicalTimeframe(final String code) { this.code = code; }

        public static TechnicalTimeframe fromCode(final String code) throws IllegalArgumentException {
            for (final var timeframe : values()) {
                if (timeframe.code.equals(code)) return timeframe;
            }
            throw new IllegalArgumentException("Unknown technical timeframe code: " + code);
        }
    }

    public enum VolumeSpikePeriod implements TaggedEnum {
        ONE_HOUR("1H"),
        FOUR_HOURS("4H"),
        ONE_DAY("1D");

        public final String code;

        VolumeSpikePeriod(final String code) { this.code = code; }

        public static VolumeSpikePeriod fromCode(final String code) throws IllegalArgumentException  {
            for (final var period : values()) {
                if (period.code.equals(code)) return period;
            }
            throw new IllegalArgumentException("Unknown volume spike period code: " + code);
        }
    }
}
