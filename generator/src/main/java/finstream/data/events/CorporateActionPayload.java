package finstream.data.events;

public final class CorporateActionPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.CORPORATE_ACTION;
    }
}
