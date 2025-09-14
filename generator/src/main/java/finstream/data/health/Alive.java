package finstream.data.health;

import io.smallrye.health.api.AsyncHealthCheck;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;

import java.time.Duration;
import java.time.Instant;

@Liveness
final class Alive implements AsyncHealthCheck {

    private final Duration healthyDuration = Duration.ofSeconds(10);
    private final Instant startTime = Instant.now();

    @Override
    public Uni<HealthCheckResponse> call() {
        return Uni.createFrom().emitter(emitter -> {
            final var uptime = Duration.between(startTime, Instant.now());
            if (uptime.compareTo(healthyDuration) <= 0)
                emitter.complete(HealthCheckResponse.named("Alive again").up().withData("uptime", uptime.toString())
                                .withData("remaining_time", healthyDuration.minus(uptime).toString()).build());
            else emitter.complete(HealthCheckResponse.named("Sick").down().withData("uptime", uptime.toString())
                                .withData("sick_since", healthyDuration.toString()).build());
        });
    }
}