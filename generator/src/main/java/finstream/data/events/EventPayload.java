package finstream.data.events;

public sealed interface EventPayload permits
        TradePayload,
        QuotePayload,
        OrderBookPayload,
        BarPayload,
        MarketStatusPayload,
        PriceMovementPayload,
        CorporateActionPayload,
        NewsPayload,
        VolumeSpikePayload,
        OptionsActivityPayload,
        TechnicalIndicatorPayload,
        OrderUpdatePayload,
        PositionUpdatePayload,
        AccountUpdatePayload
{
    EventType getEventType();
}
