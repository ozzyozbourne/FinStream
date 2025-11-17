import React, { useState } from "react";
import LiveChart from "../../components/ui/LiveChart/LiveChart";
import "./ResearchPage.css";

const defaultSymbols = ["AAPL", "TSLA", "MSFT", "NVDA", "GOOGL", "AMZN"];

const ResearchPage = () => {
  const [symbols, setSymbols] = useState<string[]>(defaultSymbols);
  const [search, setSearch] = useState("");

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;

    const upper = search.toUpperCase().trim();
    if (!upper) return;

    // Add new symbol to TOP
    if (!symbols.includes(upper)) {
      setSymbols([upper, ...symbols]);
    }

    setSearch("");
  };

  return (
    <div className="research-live-container">
      <h1 className="research-title">Live Market Data</h1>
      <p className="research-subtitle">
        Real-time intraday prices powered by Finnhub
      </p>

      {/* Search Bar */}
      <form className="symbol-search-container" onSubmit={handleAddSymbol}>
        <input
          type="text"
          value={search}
          placeholder="Enter a stock symbol (META, NFLX, NVDA)..."
          onChange={(e) => setSearch(e.target.value)}
          className="symbol-input"
        />
        <button type="submit" className="symbol-add-btn">
          Add
        </button>
      </form>

      {/* Chart Grid */}
      <div className="research-charts-grid">
        {symbols.map((sym) => (
          <LiveChart
            key={sym}
            symbol={sym}
            onRemove={(symbol) =>
              setSymbols(symbols.filter((s) => s !== symbol))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ResearchPage;
