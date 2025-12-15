
import axios from 'axios';

const LIVE_API_URL = 'http://localhost:3001/api';

export interface NewsArticle {
    id: string;
    title: string;
    description: string;
    source: string;
    timestamp: number; // Unix timestamp
    url: string;
    imageUrl?: string;
    stockTicker?: string;
}

export const newsService = {
    // Fetch general, symbol-specific, or search query news
    getNews: async (input: string[] | string): Promise<NewsArticle[]> => {
        try {
            let url = `${LIVE_API_URL}/yahoo/news`;

            if (Array.isArray(input)) {
                // It's a list of symbols
                const query = input.length > 0 ? input.join(',') : 'market';
                url += `?symbols=${query}`;
            } else {
                // It's a search term
                url += `?q=${encodeURIComponent(input)}`;
            }

            const response = await axios.get(url);
            return response.data;
        } catch (error) {
            console.error("News Service Error:", error);
            return [];
        }
    },

    // Subscribe to email alerts
    subscribe: async (email: string, symbols: string[]) => {
        try {
            const response = await axios.post(`${LIVE_API_URL}/subscribe`, { email, symbols });
            return response.data;
        } catch (error) {
            console.error("Subscription Error:", error);
            throw error;
        }
    },

    // Unsubscribe
    unsubscribe: async (email: string) => {
        try {
            const response = await axios.post(`${LIVE_API_URL}/unsubscribe`, { email });
            return response.data;
        } catch (error) {
            console.error("Unsubscribe Error:", error);
            throw error;
        }
    }
};
