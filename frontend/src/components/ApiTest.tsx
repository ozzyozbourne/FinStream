import React, { useState } from 'react';
import { polygonService } from '../services/polygonService';

const ApiTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiKey = async () => {
    setIsLoading(true);
    setTestResult('Testing API key...');
    
    try {
      // Test with a simple API call
      const result = await polygonService.getStockDetails('AAPL');
      console.log('API Test Result:', result);
      
      if (result) {
        setTestResult(`✅ API Key is working! Apple details: ${JSON.stringify(result, null, 2)}`);
      } else {
        setTestResult('❌ API call returned no data. Check your API key.');
      }
    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult(`❌ API Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    setTestResult('Testing direct fetch...');
    
    try {
      const apiKey = process.env.REACT_APP_POLYGON_API_KEY;
      console.log('Direct fetch API key:', apiKey);
      
      const response = await fetch(`https://api.polygon.io/v3/reference/tickers/AAPL?apikey=${apiKey}`);
      const data = await response.json();
      
      console.log('Direct fetch result:', data);
      
      if (data.status === 'OK') {
        setTestResult(`✅ Direct fetch working! Response: ${JSON.stringify(data, null, 2)}`);
      } else {
        setTestResult(`❌ Direct fetch failed: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.error('Direct fetch error:', error);
      setTestResult(`❌ Direct fetch error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', margin: '20px' }}>
      <h3>API Key Test</h3>
      <div style={{ marginBottom: '10px' }}>
        <button 
          onClick={testApiKey} 
          disabled={isLoading}
          style={{ padding: '10px', marginRight: '10px' }}
        >
          {isLoading ? 'Testing...' : 'Test Polygon Service'}
        </button>
        <button 
          onClick={testDirectFetch} 
          disabled={isLoading}
          style={{ padding: '10px' }}
        >
          {isLoading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>
      <div style={{ backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '5px' }}>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          {testResult}
        </pre>
      </div>
    </div>
  );
};

export default ApiTest;
