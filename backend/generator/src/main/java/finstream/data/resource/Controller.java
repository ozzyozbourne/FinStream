package finstream.data.resource;

import finstream.data.repository.StocksRepository;


class Controller {

    private final StocksRepository stocksRepository;

    Controller(StocksRepository stocksRepository) {
        this.stocksRepository = stocksRepository;
    }


    void longer() {}
}
