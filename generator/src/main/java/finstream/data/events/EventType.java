package finstream.data.events;

public enum EventType {
    TRADE("TRADE"),
    QUOTE("QUOTE");

    public final String value;
    EventType(String value) { this.value = value; }

}
