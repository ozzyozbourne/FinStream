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
