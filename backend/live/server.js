const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const FINNHUB_API_KEY = "d31i0e1r01qsprr13i20d31i0e1r01qsprr13i2g";
const FINNHUB_URL = `wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`;

const app = express();
app.use(cors());

const server = app.listen(3001, () => {
  console.log("🚀 Finnhub Live Proxy running on ws://localhost:3001");
});

// --- Yahoo Finance Proxy Endpoints ---

// Import Email Service
const emailService = require('./emailService');
emailService.initCron(); // Start Cron Job

// 0. Email Subscriptions
app.use(express.json()); // Enable JSON parsing

app.post("/api/subscribe", (req, res) => {
    const { email, symbols } = req.body;
    if (!email || !symbols || !Array.isArray(symbols)) {
        return res.status(400).json({ error: "Invalid data. Email and symbols array required." });
    }
    emailService.saveSubscription(email, symbols);
    res.json({ success: true, message: "Subscribed successfully" });
});

app.post("/api/unsubscribe", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });
    emailService.removeSubscription(email);
    res.json({ success: true, message: "Unsubscribed successfully" });
});

app.post("/api/trigger-email", async (req, res) => {
    try {
        const { email, symbols } = req.body;
        
        let result;
        if (email) {
            // Direct Test Mode
            const previewUrl = await emailService.sendTestEmail(email, symbols);
            result = { success: true, message: "Test email sent", previewUrl };
        } else {
            // Global Broadcast Mode
            const previews = await emailService.sendDailyDigest();
            result = { success: true, message: "Daily digest triggered", previews };
        }
        
        res.json(result);
    } catch (error) {
        console.error("Manual trigger failed:", error);
        res.status(500).json({ error: "Failed to trigger email: " + error.message });
    }
});

// 0.5 News Proxy
app.get("/api/yahoo/news", async (req, res) => {
    const symbols = req.query.symbols; 
    const query = req.query.q;

    try {
        let url;
        let isSearch = false;

        if (query) {
            // Explicit generic search
            url = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&newsCount=20`;
        } else {
            // "News" request (portfolio or market)
            // v2/news is blocked/unreliable, so we fallback to v1/search
            // We take the first symbol from the list to search for relevant news
            let targetSymbol = 'market';
            if (symbols && symbols !== 'market') {
                const parts = symbols.split(',');
                targetSymbol = parts[0]; // Search for the first/primary symbol
            } else {
                targetSymbol = 'economy'; // General market news search term
            }
            url = `https://query2.finance.yahoo.com/v1/finance/search?q=${targetSymbol}&newsCount=20`;
        }

        console.log(`Fetching News from: ${url}`);

        const response = await axios.get(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        
        let articles = [];
        const news = response.data.news || [];
        
        // Map V1 Search Results to our Article format
        articles = news.map(item => ({
            id: item.uuid,
            title: item.title,
            description: item.publisher || 'Click to read more', // Search API lacks summary
            source: item.publisher,
            timestamp: item.providerPublishTime,
            url: item.link,
            imageUrl: item.thumbnail?.url, // Fix: Capture thumbnail URL
            stockTicker: item.relatedTickers?.[0] || 'MARKET'
        }));

        console.log(`Found ${articles.length} articles`);
        res.json(articles.slice(0, 20));

    } catch (error) {
        console.error("Yahoo News Error Details:", error.response?.data || error.message);
        // Fallback or empty array instead of 500 to prevent UI crash
        res.json([]); 
    }
});

// 1. Search Stock
app.get("/api/yahoo/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' required" });

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=5&newsCount=0`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0' // Yahoo often blocks requests without a User-Agent
        }
    });

    // Transform to standard format
    const quotes = response.data.quotes || [];
    const results = quotes.map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exch: q.exchange,
        type: q.quoteType
    })).filter(q => q.type === 'EQUITY' || q.type === 'ETF');

    res.json({ results });
  } catch (error) {
    console.error("Yahoo Search Error:", error.message);
    res.status(500).json({ error: "Failed to fetch search results" });
  }
});

// 2. Get Quote (Current Price)
app.get("/api/yahoo/quote", async (req, res) => {
  const symbol = req.query.symbol;
  if (!symbol) return res.status(400).json({ error: "Query parameter 'symbol' required" });

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await axios.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });
    
    const result = response.data.chart.result[0];
    const quote = {
        symbol: result.meta.symbol,
        price: result.meta.regularMarketPrice,
        currency: result.meta.currency,
        previousClose: result.meta.chartPreviousClose,
        timestamp: Date.now()
    };

    res.json(quote);
  } catch (error) {
    console.error(`Yahoo Quote Error for ${symbol}:`, error.message);
    res.status(500).json({ error: "Failed to fetch quote" });
  }
});

// 2.5. Get Batch Quotes
app.get("/api/yahoo/quotes", async (req, res) => {
    const symbolsParam = req.query.symbols;
    if (!symbolsParam) return res.status(400).json({ error: "Query parameter 'symbols' required" });

    const symbols = symbolsParam.split(',');
    
    try {
        const promises = symbols.map(async (symbol) => {
            try {
                const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
                const response = await axios.get(url, {
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                
                const result = response.data.chart.result?.[0];
                if (!result || !result.meta) return null;

                const meta = result.meta;
                return {
                    symbol: meta.symbol,
                    price: meta.regularMarketPrice,
                    change: meta.regularMarketPrice - meta.chartPreviousClose, // generic calc
                    changePercent: ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100,
                    currency: meta.currency,
                    name: meta.symbol, // Chart endpoint doesn't give full name often, but that's acceptable or we can fallback
                    timestamp: Date.now()
                };
            } catch (err) {
                console.error(`Failed to fetch quote for ${symbol}: ${err.message}`);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const validQuotes = results.filter(q => q !== null);

        res.json(validQuotes);
    } catch (error) {
        console.error("Yahoo Batch Quotes Error:", error.message);
        res.status(500).json({ error: "Failed to fetch batch quotes" });
    }
});

// 3. Get Historical Data (Candles)
app.get("/api/yahoo/history", async (req, res) => {
    const symbol = req.query.symbol;
    const range = req.query.range || '1mo'; // 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max
    const interval = req.query.interval || '1d'; // 1m, 5m, 15m, 1d, 1wk, 1mo

    if (!symbol) return res.status(400).json({ error: "Query parameter 'symbol' required" });

    try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const result = response.data.chart.result[0];
        if (!result) {
             return res.status(404).json({ error: "No data found" });
        }

        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0];
        
        const history = timestamps.map((ts, index) => ({
            timestamp: ts,
            date: new Date(ts * 1000).toISOString(),
            close: quotes.close[index],
            open: quotes.open[index],
            high: quotes.high[index],
            low: quotes.low[index],
            volume: quotes.volume[index]
        })).filter(h => h.close !== null); // Filter out empty trading intervals

        res.json(history);

    } catch (error) {
        console.error(`Yahoo History Error for ${symbol}:`, error.message);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// Local WebSocket server for frontend
const wss = new WebSocket.Server({ server });

// Connect to Finnhub WS
let finnhubWS = new WebSocket(FINNHUB_URL);

// Map of internal IDs to Finnhub Symbols (using ETFs as proxies for Indices on free tier)
const SYMBOL_MAP = {
  "sp500": "SPY",     // S&P 500
  "dow30": "DIA",     // Dow 30
  "nasdaq": "QQQ",    // Nasdaq
  "russell2000": "IWM", // Russell 2000
  "vix": "VIXY",       // VIX
  "gold": "GLD"       // Gold
};

// Yahoo Finance Symbol Map
const YAHOO_SYMBOL_MAP = {
  "sp500": "^GSPC",
  "dow30": "^DJI",
  "nasdaq": "^IXIC",
  "russell2000": "^RUT",
  "vix": "^VIX",
  "gold": "GC=F"
};

// Reverse map for incoming messages
const REVERSE_SYMBOL_MAP = Object.fromEntries(
  Object.entries(SYMBOL_MAP).map(([k, v]) => [v, k])
);

function connectFinnhub() {
  finnhubWS = new WebSocket(FINNHUB_URL);

  finnhubWS.on("open", () => {
    console.log("🔌 Connected to Finnhub websocket");
    // Resubscribe to default indices on reconnect
    Object.values(SYMBOL_MAP).forEach(symbol => {
      finnhubWS.send(JSON.stringify({ type: "subscribe", symbol }));
    });
  });

  finnhubWS.on("message", (data) => {
    // Broadcast trade messages to all frontend clients
    const parsed = JSON.parse(data);
    if (parsed.type === "trade") {
      // Enhance data with internal IDs if applicable
      if (parsed.data) {
        parsed.data.forEach(trade => {
            if (REVERSE_SYMBOL_MAP[trade.s]) {
                trade.internalId = REVERSE_SYMBOL_MAP[trade.s];
            }
        });
      }
      
      const enhancedData = JSON.stringify(parsed);
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(enhancedData);
        }
      });
    }
  });

  finnhubWS.on("close", () => {
    console.log("⚠️ Finnhub closed. Reconnecting...");
    setTimeout(connectFinnhub, 2000);
  });

  finnhubWS.on("error", (err) => {
    console.error("❌ Finnhub error:", err);
  });
}

connectFinnhub();

// --- Top Gainers Emulation (Since free APIs are limited) ---
function generateRandomGainers() {
    const baseStocks = [
        { symbol: 'OKLO', name: 'Oklo Inc.', basePrice: 135.00 },
        { symbol: 'BHF', name: 'Brighthouse Financial', basePrice: 57.00 },
        { symbol: 'QUBT', name: 'Quantum Computing', basePrice: 23.00 },
        { symbol: 'MENS', name: 'Mens Wearhouse', basePrice: 65.00 },
        { symbol: 'PLTR', name: 'Palantir Technologies', basePrice: 42.00 },
        { symbol: 'SOFI', name: 'SoFi Technologies', basePrice: 9.50 }
    ];

    return baseStocks.map(stock => {
        const volatility = stock.basePrice * 0.05; // 5% volatility
        const randomChange = (Math.random() * volatility * 2) - volatility + (volatility * 0.5); // Bias towards gain
        const newPrice = stock.basePrice + randomChange;
        const changePercent = (randomChange / stock.basePrice) * 100;

        return {
            symbol: stock.symbol,
            name: stock.name,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(randomChange.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2))
        };
    }).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
}

// --- Market Indices using Yahoo Finance ---
const getMarketIndex = async (internalId, symbol) => {
  try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m`;
      const response = await axios.get(url);
      const result = response.data.chart.result[0];
      
      return {
        internalId,
        p: result.meta.regularMarketPrice, // 'p' for price compatibility
        t: Date.now()
      };
  } catch (error) {
      console.error(`Error fetching ${symbol}:`, error.message);
      return null;
  }
};

async function broadcastMarketIndices() {
    const promises = Object.entries(YAHOO_SYMBOL_MAP).map(([id, symbol]) => getMarketIndex(id, symbol));
    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null);

    if (validResults.length > 0) {
        const tradeMsg = JSON.stringify({ type: 'trade', data: validResults });
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(tradeMsg);
            }
        });
    }
}

// Broadcast Loop
setInterval(() => {
    // 1. Top Gainers
    const gainers = generateRandomGainers();
    const gainersMsg = JSON.stringify({ type: 'top_gainers', data: gainers });
    
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(gainersMsg);
        }
    });

    // 2. Market Indices (Yahoo Finance)
    broadcastMarketIndices();

}, 10000); // Slower interval (10s) to avoid Yahoo rate limits


// When frontend connects
wss.on("connection", (client) => {
  console.log("🟢 Frontend connected");

  // Send initial data immediately
  client.send(JSON.stringify({ type: 'top_gainers', data: generateRandomGainers() }));
  broadcastMarketIndices(); // Try to send initial data

  // Frontend sends { type: 'subscribe', symbol: 'AAPL' }
  client.on("message", (msg) => {
    try {
        const parsedMsg = JSON.parse(msg);
        const { type, symbol } = parsedMsg;

        if (type === "subscribe") {
        console.log(`📡 Subscribing to ${symbol}`);
        // If it's an internal ID, map it; otherwise pass through
        const actualSymbol = SYMBOL_MAP[symbol] || symbol;
        finnhubWS.send(JSON.stringify({ type: "subscribe", symbol: actualSymbol }));
        }
    } catch (e) {
        console.error("Error parsing message:", e);
    }
  });
});
