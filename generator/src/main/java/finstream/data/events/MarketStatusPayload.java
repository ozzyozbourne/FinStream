package finstream.data.events;

public final class MarketStatusPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.MARKET_STATUS;
    }
}
