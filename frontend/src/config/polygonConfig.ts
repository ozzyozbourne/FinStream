export const POLYGON_CONFIG = {
  API_KEY: process.env.REACT_APP_POLYGON_API_KEY || 'YOUR_API_KEY_HERE',
  BASE_URL: 'https://api.polygon.io',
  RATE_LIMIT: 5,
};

console.log('Environment check (CRA):');
console.log('REACT_APP_POLYGON_API_KEY:', process.env.REACT_APP_POLYGON_API_KEY);
console.log('POLYGON_CONFIG.API_KEY:', POLYGON_CONFIG.API_KEY);
