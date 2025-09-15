package finstream.data.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import finstream.data.enums.Enums;
import finstream.data.events.*;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "eventType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = Payload.TradePay.class, name = "TRADE"),
        @JsonSubTypes.Type(value = Payload.QuotePay.class, name = "QUOTE"),
        @JsonSubTypes.Type(value = Payload.OrderBook.class, name = "ORDER_BOOK"),
        @JsonSubTypes.Type(value = Payload.BarPay.class, name = "BAR"),
        @JsonSubTypes.Type(value = Payload.MarketStatus.class, name = "MARKET_STATUS"),
        @JsonSubTypes.Type(value = Payload.PriceMovement.class, name = "PRICE_MOVEMENT"),
        @JsonSubTypes.Type(value = Payload.CorporateAction.class, name = "CORPORATE_ACTION"),
        @JsonSubTypes.Type(value = Payload.News.class, name = "NEWS"),
        @JsonSubTypes.Type(value = Payload.VolumeSpike.class, name = "VOLUME_SPIKE"),
        @JsonSubTypes.Type(value = Payload.OptionsActivity.class, name = "OPTIONS_ACTIVITY"),
        @JsonSubTypes.Type(value = Payload.TechnicalIndicator.class, name = "TECHNICAL_INDICATOR"),
        @JsonSubTypes.Type(value = Payload.OrderUpdate.class, name = "ORDER_UPDATE"),
        @JsonSubTypes.Type(value = Payload.PositionUpdate.class, name = "POSITION_UPDATE"),
        @JsonSubTypes.Type(value = Payload.AccountUpdate.class, name = "ACCOUNT_UPDATE")
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
    private Enums.EventType eventType;

    @Column(name = "timestamp", nullable = false)
    private OffsetDateTime timestamp;

    @Column(name = "sequence_number", nullable = false)
    private Long sequenceNumber;

    @Convert(converter = EventPayloadConverter.class)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "event_payload", nullable = false, columnDefinition = "jsonb")
    private Payload.Event eventPayload;

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

    public Enums.EventType getEventType() {
        return eventType;
    }

    public void setEventType(Enums.EventType eventType) {
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

    public Payload.Event getEventPayload() {
        return eventPayload;
    }

    public void setEventPayload(Payload.Event eventPayload) {
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
