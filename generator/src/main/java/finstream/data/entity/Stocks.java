package finstream.data.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import finstream.data.enums.Currency;
import finstream.data.enums.Exchange;
import finstream.data.enums.Sector;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "stocks")
public class Stocks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true, length = 10)
    String symbol;

    @Column(nullable = false, length = 200)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    Sector sector;

    @Column(name = "starting_price", nullable = false, precision = 12, scale = 4)
    BigDecimal startingPrice;

    @Column(name = "current_price", nullable = false, precision = 12, scale = 4)
    BigDecimal currentPrice;

    @Column(nullable = false, precision = 12, scale = 4)
    BigDecimal volatility;

    @Column(nullable = false)
    Boolean active = true;

    @Column(name = "market_cap", nullable = false)
    Long marketCap;

    @Column(name = "shares_outstanding", nullable = false)
    Long sharesOutstanding;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 3)
    Currency currency = Currency.USD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    Exchange exchange = Exchange.NASDAQ;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    OffsetDateTime updatedAt;

    public Stocks() {}

    public Stocks(String symbol, String name, Sector sector, BigDecimal startingPrice, BigDecimal volatility) {
        this.symbol = symbol;
        this.name = name;
        this.sector = sector;
        this.startingPrice = startingPrice;
        this.volatility = volatility;
    }

    @Override
    public String toString() {
        return String.format("Stock{id=%d, symbol='%s', name='%s', currentPrice=%s}", id, symbol, name, currentPrice);
    }

}
