package finstream.data.health;

import io.smallrye.health.api.AsyncHealthCheck;
import io.smallrye.mutiny.Uni;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

@Readiness
class Ready implements AsyncHealthCheck {

    @Override
    public Uni<HealthCheckResponse> call() {
        return null;
    }
}
