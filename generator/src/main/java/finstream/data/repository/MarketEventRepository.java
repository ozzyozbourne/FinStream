package finstream.data.repository;

import finstream.data.entity.MarketEvent;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MarketEventRepository implements PanacheRepository<MarketEvent> {
}
