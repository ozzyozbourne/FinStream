package finstream.data.events;

public final class TradePayload implements EventPayload {

    @Override
    public EventType getEventType() {
        return EventType.TRADE;
    }
}
