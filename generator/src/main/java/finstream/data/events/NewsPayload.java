package finstream.data.events;

public final class NewsPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.NEWS;
    }
}
