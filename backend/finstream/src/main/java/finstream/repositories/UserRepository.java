package finstream.repositories;

import finstream.entities.User;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {

    public Uni<User> findByKeycloakUserId (final String keycloakUserId) {
        return find("keycloakUserId", keycloakUserId).firstResult();
    }
}
