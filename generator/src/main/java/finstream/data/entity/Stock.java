package finstream.data.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table
public class Stock extends PanacheEntity {

    @Column(nullable = false, unique = true, length = 10)
    public String symbol;

    @Column(nullable = false, length = 200)
    public String name;

    @Column(nullable = false, length = 100)
    public String sector;

    @Column(nullable = false, precision = 12, scale = 4)
    public BigDecimal startingPrice;

    @Column(precision = 12, scale = 4)
    public BigDecimal currentPrice;

    @Column(nullable = false, precision = 6, scale = 4)
    public BigDecimal volatility;

    @Column(nullable = false)
    public Boolean active = true;

    @Column(name = "market_cap")
    public Long marketCap;

    @Column(name = "shares_outstanding")
    public Long sharesOutstanding;

    @Column(nullable = false, length = 3)
    public String currency = "USD";

    @Column(nullable = false, length = 10)
    public String exchange = "NASDAQ";

    @Column(name = "created_at", nullable = false)
    public Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt;

    // Default constructor
    public Stock() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Constructor for creating new stocks
    public Stock(String symbol, String name, String sector, BigDecimal startingPrice, BigDecimal volatility) {
        this();
        this.symbol = symbol;
        this.name = name;
        this.sector = sector;
        this.startingPrice = startingPrice;
        this.currentPrice = startingPrice;
        this.volatility = volatility;
        this.active = true;
    }

    // Panache finder methods
    public static Uni<List<Stock>> findActive() {
        return find("active = true ORDER BY symbol").list();
    }

    public static Uni<Stock> findBySymbol(String symbol) {
        return find("symbol = ?1", symbol.toUpperCase()).firstResult();
    }

    public static Uni<List<Stock>> findBySector(String sector) {
        return find("sector = ?1 and active = true ORDER BY symbol", sector).list();
    }

    public static Uni<List<Stock>> findByExchange(String exchange) {
        return find("exchange = ?1 and active = true ORDER BY symbol", exchange).list();
    }

    public static Uni<Boolean> existsBySymbol(String symbol) {
        return count("symbol = ?1", symbol.toUpperCase()).map(count -> count > 0);
    }

    public static Uni<List<Stock>> findActiveBySector(String sector) {
        return find("active = true and sector = ?1 ORDER BY symbol", sector).list();
    }

    public static Uni<List<Stock>> findByMarketCapRange(Long minMarketCap, Long maxMarketCap) {
        return find("active = true and market_cap >= ?1 and market_cap <= ?2 ORDER BY market_cap DESC",
                minMarketCap, maxMarketCap).list();
    }

    // Business methods
    public void updateCurrentPrice(BigDecimal newPrice) {
        this.currentPrice = newPrice;
        this.updatedAt = Instant.now();
    }

    public BigDecimal calculateMarketCapAtPrice(BigDecimal price) {
        if (sharesOutstanding != null && price != null) {
            return price.multiply(BigDecimal.valueOf(sharesOutstanding));
        }
        return null;
    }

    @Override
    public String toString() {
        return "Stock{" +
                "symbol='" + symbol + '\'' +
                ", name='" + name + '\'' +
                ", sector='" + sector + '\'' +
                ", currentPrice=" + currentPrice +
                ", marketCap=" + marketCap +
                ", exchange='" + exchange + '\'' +
                '}';
    }
}

