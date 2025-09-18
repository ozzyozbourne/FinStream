package finstream.data.entity;

import finstream.data.Enums;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "market_sessions")
public class MarketSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_date", nullable = false, unique = true)
    private LocalDate sessionDate;

    @Column(name = "market_open")
    private OffsetDateTime marketOpen;

    @Column(name = "market_close")
    private OffsetDateTime marketClose;

    @Column(name = "is_trading_day", nullable = false)
    private Boolean isTradingDay = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type", nullable = false, length = 20)
    private Enums.SessionType sessionType = Enums.SessionType.REGULAR;

    @Column(name = "total_volume", nullable = false)
    private Long totalVolume = 0L;

    @Column(name = "total_trades", nullable = false)
    private Integer totalTrades = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public MarketSession() {}

    public MarketSession(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public MarketSession(LocalDate sessionDate, boolean isTradingDay, Enums.SessionType sessionType) {
        this.sessionDate = sessionDate;
        this.isTradingDay = isTradingDay;
        this.sessionType = sessionType;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public OffsetDateTime getMarketOpen() {
        return marketOpen;
    }

    public void setMarketOpen(OffsetDateTime marketOpen) {
        this.marketOpen = marketOpen;
    }

    public OffsetDateTime getMarketClose() {
        return marketClose;
    }

    public void setMarketClose(OffsetDateTime marketClose) {
        this.marketClose = marketClose;
    }

    public Boolean getIsTradingDay() {
        return isTradingDay;
    }

    public void setIsTradingDay(Boolean isTradingDay) {
        this.isTradingDay = isTradingDay;
    }

    public Enums.SessionType getSessionType() {
        return sessionType;
    }

    public void setSessionType(Enums.SessionType sessionType) {
        this.sessionType = sessionType;
    }

    public Long getTotalVolume() {
        return totalVolume;
    }

    public void setTotalVolume(Long totalVolume) {
        this.totalVolume = totalVolume;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Integer totalTrades) {
        this.totalTrades = totalTrades;
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
                "MarketSession{id=%d, sessionDate=%s, sessionType='%s', isTradingDay=%s, totalVolume=%d, totalTrades=%d}",
                id, sessionDate, sessionType, isTradingDay, totalVolume, totalTrades
        );
    }
}