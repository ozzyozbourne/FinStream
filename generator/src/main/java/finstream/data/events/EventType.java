package finstream.data.events;

public enum EventType {
    TRADE(TradePayload.class),
    QUOTE(QuotePayload.class),
    ORDER_BOOK(OrderBookPayload.class),
    BAR(BarPayload.class),
    MARKET_STATUS(MarketStatusPayload.class),
    PRICE_MOVEMENT(PriceMovementPayload.class),
    CORPORATE_ACTION(CorporateActionPayload.class),
    NEWS(NewsPayload.class),
    VOLUME_SPIKE(VolumeSpikePayload.class),
    OPTIONS_ACTIVITY(OptionsActivityPayload.class),
    TECHNICAL_INDICATOR(TechnicalIndicatorPayload.class),

    // Trading/Account Events
    ORDER_UPDATE(OrderUpdatePayload.class),
    POSITION_UPDATE(PositionUpdatePayload.class),
    ACCOUNT_UPDATE(AccountUpdatePayload.class);

    public final Class<? extends EventPayload> payloadClass;

    EventType(final Class<? extends EventPayload> payloadClass) { this.payloadClass = payloadClass; }

}
