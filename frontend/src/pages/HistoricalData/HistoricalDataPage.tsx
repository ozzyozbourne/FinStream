import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { stockDataService } from '../../services/stockDataService';
import Button from '../../components/ui/Button';
import './HistoricalDataPage.css';

export const HistoricalDataPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [symbol, setSymbol] = useState(searchParams.get('symbol') || 'AAPL');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await stockDataService.getEODData(symbol);
      if (!result.data || result.data.length === 0) {
        setError(`No data found for symbol: ${symbol}`);
      } else {
        setData(result);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch data. Please check the symbol and try again.');
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (!data?.data) return;
    
    const headers = 'Date,Open,High,Low,Close,Volume\n';
    const rows = data.data.map((item: any) => 
      `${item.date},${item.open},${item.high},${item.low},${item.close},${item.volume}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${symbol}_historical_data.csv`;
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
        <Button onClick={fetchData} disabled={loading}>
          {loading ? 'Loading...' : 'Get Data'}
        </Button>
        {data?.data && <Button onClick={downloadCSV} variant="primary">Download CSV</Button>}
      </div>
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <p className="hint">Try using valid stock symbols like: AAPL, GOOGL, MSFT, TSLA, AMZN</p>
        </div>
      )}
      {data?.data && data.data.length > 0 && (
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
              {data.data.slice(0, 20).map((item: any, i: number) => (
                <tr key={i}>
                  <td>{new Date(item.date).toLocaleDateString()}</td>
                  <td>${item.open.toFixed(2)}</td>
                  <td>${item.high.toFixed(2)}</td>
                  <td>${item.low.toFixed(2)}</td>
                  <td>${item.close.toFixed(2)}</td>
                  <td>{item.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.data.length > 20 && (
            <p className="showing-message">Showing first 20 of {data.data.length} records</p>
          )}
        </div>
      )}
    </div>
  );
};

