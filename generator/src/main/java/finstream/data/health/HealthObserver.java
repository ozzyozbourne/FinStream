package finstream.data.health;

import io.quarkus.logging.Log;
import io.smallrye.health.api.event.HealthStatusChangeEvent;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Default;
import jakarta.inject.Singleton;
import org.eclipse.microprofile.health.Liveness;
import org.eclipse.microprofile.health.Readiness;

@Singleton
final class HealthObserver {

    void observeHealthChange(@Observes @Default HealthStatusChangeEvent event){
        Log.info(event);
    }

    void observeReadinessChanges(@Observes @Readiness HealthStatusChangeEvent event){
        Log.info(event);
    }

    void observeLivenessChange(@Observes @Liveness HealthStatusChangeEvent event) {
        Log.info(event);
        System.out.println(event);
    }

}
