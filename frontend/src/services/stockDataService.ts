import axios from 'axios';

const STOCK_DATA_API = 'https://api.stockdata.org/v1/data/eod';
const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';

export const stockDataService = {
  async getEODData(symbols: string) {
    const response = await axios.get(`${STOCK_DATA_API}?symbols=${symbols}&api_token=5Y6WU8HpCIHzZiQx5W3ulg6KMJUEFqdKEk8VQdOr`);
    return response.data;
  },

  async getTimeSeriesDaily(symbol: string) {
    const response = await axios.get(`${ALPHA_VANTAGE_API}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=UYO1158BS5E11JAY`);
    return response.data;
  }
};

