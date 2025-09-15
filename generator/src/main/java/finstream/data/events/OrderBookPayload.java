package finstream.data.events;

public final class OrderBookPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.ORDER_BOOK;
    }

}
