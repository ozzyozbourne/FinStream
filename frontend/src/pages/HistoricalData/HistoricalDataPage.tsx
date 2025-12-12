import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { polygonService } from '../../services/polygonService';
import Button from '../../components/ui/Button';
import './HistoricalDataPage.css';

export const HistoricalDataPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData([]);
    try {
      // Use the newly added getHistoricalData method
      // It handles date logic internally if arguments are missing, but we pass them explicitly
      const results = await polygonService.getHistoricalData(symbol, startDate, endDate);

      if (!results || results.length === 0) {
        setError(`No data found for symbol: ${symbol} in the selected range.`);
      } else {
        // Sort by date descending (newest first)
        const sorted = [...results].sort((a, b) => b.t - a.t);
        setData(sorted);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch data. Please check the symbol and try again.');
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = 'Date,Open,High,Low,Close,Volume\n';
    const rows = data.map((item: any) => {
      // Polygon returns 't' as unix timestamp in milliseconds
      const dateStr = new Date(item.t).toLocaleDateString();
      return `${dateStr},${item.o},${item.h},${item.l},${item.c},${item.v}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_historical_data_${startDate || 'start'}_to_${endDate || 'end'}.csv`;
    a.click();
  };

  return (
    <div className="historical-data-page">
      <h1>Historical Data</h1>
      <div className="controls">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g., AAPL)"
          className="symbol-input"
        />
        <div className="date-inputs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="date-input"
            aria-label="Start Date"
          />
          <span className="date-separator">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="date-input"
            aria-label="End Date"
          />
        </div>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Get Data'}
        </Button>
        {data.length > 0 && (
          <Button onClick={downloadCSV} variant="primary">
            Download CSV ({data.length})
          </Button>
        )}
      </div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p className="hint">Try using valid stock symbols like: AAPL, GOOGL, MSFT, TSLA, AMZN</p>
        </div>
      )}
      {data.length > 0 ? (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 20).map((item: any, i: number) => (
                <tr key={i}>
                  <td>{new Date(item.t).toLocaleDateString()}</td>
                  <td>${item.o.toFixed(2)}</td>
                  <td>${item.h.toFixed(2)}</td>
                  <td>${item.l.toFixed(2)}</td>
                  <td>${item.c.toFixed(2)}</td>
                  <td>{item.v.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 20 && (
            <p className="showing-message">Showing first 20 of {data.length} records</p>
          )}
        </div>
      ) : (
        !loading && !error && <p className="no-data-message">Enter a symbol and select dates to view historical data.</p>
      )}
    </div>
  );
};
