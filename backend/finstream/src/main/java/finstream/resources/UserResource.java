package finstream.resources;

import finstream.dto.SubscriptionRequest;
import finstream.entities.User;
import finstream.repositories.UserRepository;
import io.quarkus.oidc.Tenant;
import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

    private final JsonWebToken jwt;
    private final UserRepository userRepository;

    UserResource(JsonWebToken jwt, UserRepository userRepository) {
        this.jwt = jwt;
        this.userRepository = userRepository;
    }

    @POST
    @Path("/subscription")
    @Authenticated
    @Tenant("external")
    public Uni<Response> saveOrUpdateSubscription(final SubscriptionRequest request) {
        final var keycloakUserId = jwt.getSubject();
        final String username = jwt.getClaim("preferred_username");
        final String email = jwt.getClaim("email");

        return userRepository.findByKeycloakUserId(keycloakUserId)
                .onItem().ifNull().continueWith(() -> new User(keycloakUserId, username, email))
                .onItem().transform(user -> {
                    user.setSubscribed(request.subscribed());
                    return user;
                })
                .onItem().transformToUni(user -> userRepository.persist(user))
                .onItem().transform(user -> Response.ok(user).build());
    }

    @GET
    @Path("/all")
    @Authenticated
    @Tenant("internal")
    public Uni<Response> getAllUsers() {
        return userRepository.listAll().onItem().transform(users -> Response.ok(users).build());
    }

    @GET
    @Path("/me")
    @Authenticated
    @Tenant("external")
    public Uni<Response> getCurrentUser() {
        return userRepository.findByKeycloakUserId(jwt.getSubject())
                .onItem().ifNull().failWith(new WebApplicationException("User not Found", Response.Status.NOT_FOUND))
                .onItem().transform(user -> Response.ok(user).build());
    }

}
