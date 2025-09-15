package finstream.data.events;

public final class TechnicalIndicatorPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.TECHNICAL_INDICATOR;
    }
}
