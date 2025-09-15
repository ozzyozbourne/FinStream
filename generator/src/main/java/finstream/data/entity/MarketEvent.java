package finstream.data.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import finstream.data.events.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "eventType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = TradePayload.class, name = "TRADE"),
        @JsonSubTypes.Type(value = TradePayload.class, name = "TRADE"),
        @JsonSubTypes.Type(value = QuotePayload.class, name = "QUOTE"),
        @JsonSubTypes.Type(value = OrderBookPayload.class, name = "ORDER_BOOK"),
        @JsonSubTypes.Type(value = BarPayload.class, name = "BAR"),
        @JsonSubTypes.Type(value = MarketStatusPayload.class, name = "MARKET_STATUS"),
        @JsonSubTypes.Type(value = PriceMovementPayload.class, name = "PRICE_MOVEMENT"),
        @JsonSubTypes.Type(value = CorporateActionPayload.class, name = "CORPORATE_ACTION"),
        @JsonSubTypes.Type(value = NewsPayload.class, name = "NEWS"),
        @JsonSubTypes.Type(value = VolumeSpikePayload.class, name = "VOLUME_SPIKE"),
        @JsonSubTypes.Type(value = OptionsActivityPayload.class, name = "OPTIONS_ACTIVITY"),
        @JsonSubTypes.Type(value = TechnicalIndicatorPayload.class, name = "TECHNICAL_INDICATOR"),
        @JsonSubTypes.Type(value = OrderUpdatePayload.class, name = "ORDER_UPDATE"),
        @JsonSubTypes.Type(value = PositionUpdatePayload.class, name = "POSITION_UPDATE"),
        @JsonSubTypes.Type(value = AccountUpdatePayload.class, name = "ACCOUNT_UPDATE")
})

@Entity
@Table(name = "market_events")
public class MarketEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false, unique = true, length = 255)
    private String eventId;

    @Column(name = "symbol", nullable = false, length = 10)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 50)
    private EventType eventType;

    @Column(name = "timestamp", nullable = false)
    private OffsetDateTime timestamp;

    @Column(name = "sequence_number", nullable = false)
    private Long sequenceNumber;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "event_payload", nullable = false, columnDefinition = "jsonb")
    private String eventPayload;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Long getSequenceNumber() {
        return sequenceNumber;
    }

    public void setSequenceNumber(Long sequenceNumber) {
        this.sequenceNumber = sequenceNumber;
    }

    public String getEventPayload() {
        return eventPayload;
    }

    public void setEventPayload(String eventPayload) {
        this.eventPayload = eventPayload;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return String.format(
                "MarketEvent{id=%d, eventId='%s', symbol='%s', eventType='%s', timestamp=%s, sequenceNumber=%d}",
                id, eventId, symbol, eventType, timestamp, sequenceNumber
        );
    }

}
