package finstream.data.events;

public final class BarPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.BAR;
    }
}
