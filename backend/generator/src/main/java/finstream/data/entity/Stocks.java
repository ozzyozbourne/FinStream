package finstream.data.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import finstream.data.Enums;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "stocks")
public class Stocks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String symbol;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private Enums.Sector sector;

    @Column(name = "starting_price", nullable = false, precision = 12, scale = 4)
    private BigDecimal startingPrice;

    @Column(name = "current_price", nullable = false, precision = 12, scale = 4)
    private BigDecimal currentPrice;

    @Column(nullable = false, precision = 12, scale = 4)
    private BigDecimal volatility;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "market_cap", nullable = false)
    private Long marketCap;

    @Column(name = "shares_outstanding", nullable = false)
    private Long sharesOutstanding;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    private Enums.Currency currency = Enums.Currency.USD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Enums.Exchange exchange = Enums.Exchange.NASDAQ;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public Stocks() {}

    public Stocks(String symbol, String name, Enums.Sector sector, BigDecimal startingPrice, BigDecimal volatility) {
        this.symbol = symbol;
        this.name = name;
        this.sector = sector;
        this.startingPrice = startingPrice;
        this.volatility = volatility;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Enums.Sector getSector() {
        return sector;
    }

    public void setSector(Enums.Sector sector) {
        this.sector = sector;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getVolatility() {
        return volatility;
    }

    public void setVolatility(BigDecimal volatility) {
        this.volatility = volatility;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Long getMarketCap() {
        return marketCap;
    }

    public void setMarketCap(Long marketCap) {
        this.marketCap = marketCap;
    }

    public Long getSharesOutstanding() {
        return sharesOutstanding;
    }

    public void setSharesOutstanding(Long sharesOutstanding) {
        this.sharesOutstanding = sharesOutstanding;
    }

    public Enums.Currency getCurrency() {
        return currency;
    }

    public void setCurrency(Enums.Currency currency) {
        this.currency = currency;
    }

    public Enums.Exchange getExchange() {
        return exchange;
    }

    public void setExchange(Enums.Exchange exchange) {
        this.exchange = exchange;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return String.format(
                "Stocks{id=%d, symbol='%s', name='%s', sector=%s, exchange=%s, currentPrice=%s, currency=%s, active=%s}",
                id, symbol, name, sector, exchange, currentPrice, currency, active
        );
    }

}
