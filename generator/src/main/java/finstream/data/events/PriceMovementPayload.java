package finstream.data.events;

public final class PriceMovementPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.PRICE_MOVEMENT;
    }
}
