package finstream.data.events;

public final class OrderUpdatePayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.ORDER_UPDATE;
    }
}
