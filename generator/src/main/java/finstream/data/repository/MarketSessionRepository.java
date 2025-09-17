package finstream.data.repository;

import finstream.data.entity.MarketSession;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MarketSessionRepository implements PanacheRepository<MarketSession> {
}
