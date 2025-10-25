// Polygon.io API Configuration
// Get your API key from https://polygon.io/
// Replace 'YOUR_API_KEY_HERE' with your actual API key

export const POLYGON_CONFIG = {
  API_KEY: process.env.REACT_APP_POLYGON_API_KEY || 'YOUR_API_KEY_HERE',
  BASE_URL: 'https://api.polygon.io',
  RATE_LIMIT: 5, // requests per minute for free tier
};

// Debug logging
console.log('Environment check:');
console.log('REACT_APP_POLYGON_API_KEY:', process.env.REACT_APP_POLYGON_API_KEY);
console.log('POLYGON_CONFIG.API_KEY:', POLYGON_CONFIG.API_KEY);

// Instructions for setup:
// 1. Go to https://polygon.io/ and create an account
// 2. Get your API key from the dashboard
// 3. Create a .env file in the frontend directory
// 4. Add: REACT_APP_POLYGON_API_KEY=your_actual_api_key_here
// 5. Restart the development server
