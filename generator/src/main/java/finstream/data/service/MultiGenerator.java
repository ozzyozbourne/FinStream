package finstream.data.service;


import finstream.data.entity.Stocks;
import finstream.data.repository.StocksRepository;
import io.quarkus.websockets.next.OnTextMessage;
import io.smallrye.mutiny.Multi;
import org.eclipse.microprofile.reactive.messaging.Incoming;
import org.eclipse.microprofile.reactive.messaging.Outgoing;

import java.time.Duration;


class MultiGenerator {

    private final StocksRepository stocksRepository;

    MultiGenerator(StocksRepository stocksRepository) {
        this.stocksRepository = stocksRepository;
    }

    @Outgoing("data")
    Multi<Stocks> generator() {
        return Multi.createFrom().ticks().every(Duration.ofSeconds(1)).map(tick -> new Stocks());
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
}
