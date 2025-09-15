package finstream.data.events;

public final class AccountUpdatePayload implements EventPayload{

    @Override
    public EventType getEventType() {
        return EventType.ACCOUNT_UPDATE;
    }
}
