package finstream.data.events;

public final class PositionUpdatePayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.POSITION_UPDATE;
    }
}
