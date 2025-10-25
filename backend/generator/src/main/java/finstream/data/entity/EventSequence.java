package finstream.data.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "event_sequences")
public class EventSequence {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String symbol;

    @Column(name = "last_sequence_number", nullable = false)
    private Long lastSequenceNumber = 0L;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public EventSequence() {}

    public EventSequence(String symbol, Long lastSequenceNumber) {
        this.symbol = symbol;
        this.lastSequenceNumber = lastSequenceNumber;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Long getLastSequenceNumber() {
        return lastSequenceNumber;
    }

    public void setLastSequenceNumber(Long lastSequenceNumber) {
        this.lastSequenceNumber = lastSequenceNumber;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- toString() ---

    @Override
    public String toString() {
        return String.format(
                "EventSequence{id=%d, symbol='%s', lastSequenceNumber=%d, updatedAt=%s}",
                id, symbol, lastSequenceNumber, updatedAt
        );
    }
}
