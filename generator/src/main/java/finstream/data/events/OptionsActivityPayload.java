package finstream.data.events;

public final class OptionsActivityPayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.OPTIONS_ACTIVITY;
    }
}
