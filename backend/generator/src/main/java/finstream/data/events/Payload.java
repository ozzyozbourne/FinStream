package finstream.data.events;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import finstream.data.Enums;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

public final class Payload {

    private Payload(){}

    @JsonSerialize(using = EventSerializer.class)
    @JsonDeserialize(using = EventDeserializer.class)
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

    public record AccountUpdate(
            String accountId,
            BigDecimal buyingPower,
            BigDecimal cash,
            BigDecimal portfolioValue,
            BigDecimal equity,
            BigDecimal longMarketValue,
            BigDecimal shortMarketValue,
            BigDecimal dayTradeBuyingPower,
            Integer dayTradeCount,
            Boolean patternDayTrader,
            OffsetDateTime lastUpdated,
            Enums.AccountUpdateReason updateReason,
            AccountBalances balances
    ) implements Event {

        public record AccountBalances(
                BigDecimal cashSettled,
                BigDecimal cashUnsettled,
                BigDecimal marginMaintenanceExcess,
                BigDecimal regTCallAmount
        ) {}
    }

    public record TradePay(
            String tradeId,
            BigDecimal price,
            Long volume,
            Enums.TradeSide side,
            OffsetDateTime executionTime,
            List<String> tradeConditions,
            String counterparty,
            Fees fees
    ) implements Event {

        public record Fees(
                BigDecimal commission,
                BigDecimal secFee,
                BigDecimal tafFee
        ) {}
    }

    public record QuotePay(
            BigDecimal bidPrice,
            Long bidSize,
            BigDecimal askPrice,
            Long askSize,
            OffsetDateTime quoteTime,
            String marketMaker,
            BigDecimal spread,
            BigDecimal midPrice
    ) implements Event {}

    public record OrderBook(
            List<PriceLevel> bids,
            List<PriceLevel> asks,
            Long totalBidVolume,
            Long totalAskVolume,
            Integer bookDepth
    ) implements Event {

        public record PriceLevel(
                BigDecimal price,
                Long size,
                Integer orders
        ) {}
    }

    public record BarPay(
            Enums.BarTimeframe timeframe,
            OffsetDateTime startTime,
            OffsetDateTime endTime,
            BigDecimal open,
            BigDecimal high,
            BigDecimal low,
            BigDecimal close,
            Long volume,
            BigDecimal vwap, // Volume Weighted Average Price
            Integer tradeCount,
            Boolean isComplete // true for historical, false for live updating
    ) implements Event {}

    public record MarketStatus(
            Enums.MarketStatus status,
            Enums.MarketStatus previousStatus,
            OffsetDateTime statusChangeTime,
            String reason,
            OffsetDateTime nextStatusTime,
            String tradingSession,
            String haltReason
    ) implements Event {}

    public record PriceMovement(
            BigDecimal previousPrice,
            BigDecimal currentPrice,
            BigDecimal priceChange,
            BigDecimal priceChangePercent,
            BigDecimal volumeWeightedPrice,
            BigDecimal dayHigh,
            BigDecimal dayLow,
            String movementTrigger,
            Boolean volatilitySpike
    ) implements Event {}

    public record CorporateAction(
            Enums.CorporateActionType actionType,
            BigDecimal dividendAmount,
            String currency,
            LocalDate exDividendDate,
            LocalDate recordDate,
            LocalDate paymentDate,
            Enums.DividendType dividendType,
            Enums.DividendFrequency frequency
    ) implements Event {}

    public record News(
            String headline,
            String source,
            Enums.NewsSentiment sentiment,
            BigDecimal relevanceScore,
            OffsetDateTime newsTime,
            Enums.NewsImpactLevel impactLevel,
            List<String> categories,
            List<String> relatedSymbols
    ) implements Event {}

    public record VolumeSpike(
            Long currentVolume,
            Long averageVolume,
            BigDecimal volumeRatio,
            Enums.VolumeSpikePeriod timePeriod,
            OffsetDateTime spikeStartTime,
            List<String> contributingFactors,
            Boolean unusualActivity
    ) implements Event {}

    public record OptionsActivity(
            Enums.OptionType optionType,
            BigDecimal strikePrice,
            LocalDate expirationDate,
            Long volume,
            Long openInterest,
            BigDecimal impliedVolatility,
            BigDecimal delta,
            BigDecimal gamma,
            BigDecimal theta,
            Boolean unusualVolume
    ) implements Event {}

    public record TechnicalIndicator(
            Enums.TechnicalIndicatorType indicatorType,
            BigDecimal value,
            Enums.TechnicalSignal signal,
            Enums.TechnicalTimeframe timeframe,
            BigDecimal previousValue,
            Enums.TechnicalTrend trend,
            AdditionalIndicators additionalIndicators
    ) implements Event {

        public record AdditionalIndicators(
                BigDecimal macd,
                BigDecimal movingAverage50,
                BigDecimal movingAverage200,
                BigDecimal bollingerUpper,
                BigDecimal bollingerLower
        ) {}
    }

    public record OrderUpdate(
            String orderId,
            String clientOrderId,
            Enums.OrderStatus status,
            String symbol,
            Enums.TradeSide side,
            Enums.OrderType orderType,
            Long quantity,
            Long remainingQuantity,
            BigDecimal limitPrice,
            BigDecimal stopPrice,
            Long filledQuantity,
            BigDecimal filledAvgPrice,
            Enums.TimeInForce timeInForce,
            OffsetDateTime submittedAt,
            OffsetDateTime updatedAt,
            String rejectReason,
            List<Fill> fills
    ) implements Event {

        public record Fill(
                String fillId,
                BigDecimal price,
                Long quantity,
                OffsetDateTime timestamp
        ) {}
    }

    public record PositionUpdate(
            String symbol,
            Enums.PositionSide side,
            Long quantity,
            BigDecimal marketValue,
            BigDecimal costBasis,
            BigDecimal unrealizedPnl,
            BigDecimal realizedPnl,
            BigDecimal avgEntryPrice,
            BigDecimal currentPrice,
            OffsetDateTime lastUpdated,
            Enums.PositionUpdateReason updateReason
    ) implements Event {}
}