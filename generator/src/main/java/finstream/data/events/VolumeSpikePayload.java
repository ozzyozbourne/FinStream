package finstream.data.events;

public final class VolumeSpikePayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.VOLUME_SPIKE;
    }
}
