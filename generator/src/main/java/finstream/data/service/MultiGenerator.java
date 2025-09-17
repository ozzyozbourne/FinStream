package finstream.data.service;

import finstream.data.entity.MarketEvent;
import finstream.data.entity.Stocks;
import finstream.data.repository.StocksRepository;
import io.quarkus.websockets.next.OnTextMessage;
import io.smallrye.mutiny.Multi;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import javax.inject.Inject;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import static finstream.data.ComUtils.EVENT_TYPES;

@ApplicationScoped
class MultiGenerator {

    private static final AtomicLong sequenceCounter = new AtomicLong(0);
    private final Random random = new Random();
    private final StocksRepository stocksRepository;

    @Inject
    MultiGenerator(StocksRepository stocksRepository) {
        this.stocksRepository = stocksRepository;
    }

    @Outgoing("data")
    Multi<Stocks> generator() {
        stocksRepository.listAll().onItem().transformToMulti(s ->null );
        return null;
    }

    @Incoming("data")
    @OnTextMessage
    Multi<Stocks> onText(Multi<Stocks> inStream) {
        return inStream;
    }


    @Incoming("data")
    Multi<Void> persistToDB(Multi<Stocks> inStream) {
       return  inStream
               .group()
               .intoLists()
               .every(Duration.ofMinutes(2))
               .onItem()
               .transformToUniAndConcatenate(stocksRepository::persist);
    }

    private MarketEvent generateRandomMarketEvent(final List<Stocks> stocks) {
        final var stock = stocks.get(random.nextInt(stocks.size()));
        final var event = new MarketEvent();

        event.setEventId(UUID.randomUUID().toString());
        event.setSymbol(stock.getSymbol());
        event.setTimestamp(OffsetDateTime.now());
        event.setSequenceNumber(sequenceCounter.incrementAndGet());

        final var eventType = EVENT_TYPES[random.nextInt(EVENT_TYPES.length)];
        event.setEventType(eventType);

        return null;
    }
}
