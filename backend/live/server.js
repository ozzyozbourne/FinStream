const WebSocket = require("ws");
const express = require("express");
const cors = require("cors");

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

function connectFinnhub() {
  finnhubWS = new WebSocket(FINNHUB_URL);

  finnhubWS.on("open", () => {
    console.log("🔌 Connected to Finnhub websocket");
  });

  finnhubWS.on("message", (data) => {
    // Broadcast trade messages to all frontend clients
    const parsed = JSON.parse(data);
    if (parsed.type === "trade") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
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

// When frontend connects
wss.on("connection", (client) => {
  console.log("🟢 Frontend connected");

  // Frontend sends { type: 'subscribe', symbol: 'AAPL' }
  client.on("message", (msg) => {
    const { type, symbol } = JSON.parse(msg);

    if (type === "subscribe") {
      console.log(`📡 Subscribing to ${symbol}`);
      finnhubWS.send(JSON.stringify({ type: "subscribe", symbol }));
    }
  });
});
