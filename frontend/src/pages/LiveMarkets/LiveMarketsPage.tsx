import React from "react";
import LiveChart from "../../components/ui/LiveChart/LiveChart";
import "./LiveMarketsPage.css";

const LiveMarketsPage = () => {
  return (
    <div className="live-markets-container">
      <h1>Live Markets</h1>
      <p>Streaming real-time data from Finnhub</p>

      <div className="charts-grid">
        <LiveChart symbol="AAPL" />
        <LiveChart symbol="TSLA" />
        <LiveChart symbol="MSFT" />
        <LiveChart symbol="NVDA" />
        <LiveChart symbol="GOOGL" />
      </div>
    </div>
  );
};

export default LiveMarketsPage;
