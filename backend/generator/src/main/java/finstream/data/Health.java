package finstream.data;

import io.quarkus.logging.Log;
import io.smallrye.health.api.AsyncHealthCheck;
import io.smallrye.health.api.event.HealthStatusChangeEvent;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Default;
import jakarta.inject.Singleton;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Liveness;
import org.eclipse.microprofile.health.Readiness;
import org.eclipse.microprofile.health.Startup;

import java.time.Duration;
import java.time.Instant;

final class Health {

    private Health() {}

    @Liveness
    static final class Alive implements AsyncHealthCheck {

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

    @Startup
    static final class Init implements AsyncHealthCheck {
        @Override
        public Uni<HealthCheckResponse> call() {
            return Uni.createFrom().item(HealthCheckResponse.named("Generator").up().build());
        }
    }

    @Readiness
    static class Ready implements AsyncHealthCheck {

        @Override
        public Uni<HealthCheckResponse> call() {
            return Uni.createFrom().item(HealthCheckResponse.named("Generator-Ready").up().build());
        }
    }

    @Singleton
    static final class Observer {

        void observeHealthChange(@Observes @Default HealthStatusChangeEvent event){ Log.warn(event);}

        void observeReadinessChanges(@Observes @Readiness HealthStatusChangeEvent event){ Log.warn(event);}

        void observeLivenessChange(@Observes @Liveness HealthStatusChangeEvent event) { Log.warn(event); }

    }
}
