package finstream.data.events;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public final class Payload {

    private Payload(){}

    public sealed interface Event permits
            TradePay,
            QuotePay,
            OrderBook,
            BarPay,
            MarketStatus,
            PriceMovement,
            CorporateAction,
            News,
            VolumeSpike,
            OptionsActivity,
            TechnicalIndicator,
            OrderUpdate,
            PositionUpdate,
            AccountUpdate {
    }

    public static final class AccountUpdate implements Event {}
    public static final class TradePay implements Event {
        public String tradeId;
        public BigDecimal price;
        public Long volume;
        public String side; // "BUY" or "SELL"
        public OffsetDateTime executionTime;
        public List<String> tradeConditions;
        public String counterparty;
        public Fees fees;

        public static class Fees {
            public BigDecimal commission;
            public BigDecimal secFee;
            public BigDecimal tafFee;
        }
    }
    public static final class QuotePay implements Event {
        public BigDecimal bidPrice;
        public Long bidSize;
        public BigDecimal askPrice;
        public Long askSize;
        public OffsetDateTime quoteTime;
        public String marketMaker;
        public BigDecimal spread;
        public BigDecimal midPrice;
    }
    public static final class OrderBook implements Event {
        public List<PriceLevel> bids;
        public List<PriceLevel> asks;
        public Long totalBidVolume;
        public Long totalAskVolume;
        public Integer bookDepth;

        public static class PriceLevel {
            public BigDecimal price;
            public Long size;
            public Integer orders;
        }
    }
    public static final class BarPay implements Event {
        public String timeframe; // "1m", "5m", "15m", "1h", "4h", "1d"
        public OffsetDateTime startTime;
        public OffsetDateTime endTime;
        public BigDecimal open;
        public BigDecimal high;
        public BigDecimal low;
        public BigDecimal close;
        public Long volume;
        public BigDecimal vwap; // Volume Weighted Average Price
        public Integer tradeCount;
        public Boolean isComplete; // true for historical, false for live updating
    }
    public static final class MarketStatus implements Event {
        public String status; // "OPEN", "CLOSED", "PRE_MARKET", "AFTER_HOURS", "HALTED"
        public String previousStatus;
        public OffsetDateTime statusChangeTime;
        public String reason;
        public OffsetDateTime nextStatusTime;
        public String tradingSession;
        public String haltReason;
    }
    public static final class PriceMovement implements Event {
        public BigDecimal previousPrice;
        public BigDecimal currentPrice;
        public BigDecimal priceChange;
        public BigDecimal priceChangePercent;
        public BigDecimal volumeWeightedPrice;
        public BigDecimal dayHigh;
        public BigDecimal dayLow;
        public String movementTrigger;
        public Boolean volatilitySpike;
    }
    public static final class CorporateAction implements Event {}
    public static final class News implements Event {}
    public static final class VolumeSpike implements Event {}
    public static final class OptionsActivity implements Event {}
    public static final class TechnicalIndicator implements Event {}
    public static final class OrderUpdate implements Event {}
    public static final class PositionUpdate implements Event {}
}
