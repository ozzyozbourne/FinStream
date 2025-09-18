package finstream.data.repository;

import finstream.data.entity.EventSequence;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EventSequenceRepository implements PanacheRepository<EventSequence> {
}
