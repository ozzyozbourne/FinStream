package finstream.data.repository;

import finstream.data.entity.Stocks;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class StocksRepository implements PanacheRepository<Stocks> {

}
