package finstream.data.enums;

public final class Enums {

    private Enums(){}

    public enum Currency {
        USD,
        EUR,
        GBP,
        JPY,
        CAD,
        AUD,
        CHF,
        CNY,
        INR,
        HKD,
        SGD,
        KRW
    }

    public enum Exchange {
        NASDAQ,
        NYSE,
        LSE,
        TSE,
        HKEX,
        SSE,
        BSE,
        ASX;
    }

    public enum Sector {
        TECHNOLOGY("Technology"),
        CONSUMER_DISCRETIONARY("Consumer Discretionary"),
        CONSUMER_STAPLES("Consumer Staples"),
        COMMUNICATION_SERVICES("Communication Services"),
        FINANCIAL_SERVICES("Financial Services"),
        HEALTHCARE("Healthcare"),
        INDUSTRIALS("Industrials"),
        MATERIALS("Materials"),
        ENERGY("Energy"),
        UTILITIES("Utilities"),
        REAL_ESTATE("Real Estate");

        private final String displayName;

        Sector(String displayName) {this.displayName = displayName;}

        @Override
        public String toString() {return displayName;}
    }

}
