package finstream.data.events;

public final class QuotePayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.QUOTE;
    }
}
