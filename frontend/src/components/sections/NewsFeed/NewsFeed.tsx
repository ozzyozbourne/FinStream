import React, { useEffect, useState } from "react";
import ArticleCard from "../../ui/ArticleCard";
import "./NewsFeed.css";

const NewsFeed: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const API_KEY = "b196a8de07bb439cb7fcb9099563779d";
     const url = `https://newsapi.org/v2/everything?q=finance&language=en&sortBy=publishedAt&apiKey=${API_KEY}`;      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "ok" && Array.isArray(data.articles)) {
            const allArticles = data.articles;
            let articlesToLog: any[] = []; // Declare a variable with wider scope
            
            if (allArticles.length > 0) {
                // Correctly slice the array to get articles 1 through 9 (10 items total)
                const displayedArticles = allArticles.slice(1, 10);
                setArticles(displayedArticles);
                articlesToLog = displayedArticles;
            }
            
            // FIX: Log the variable that holds the displayed articles
            console.log("Fetched articles for news feed:", articlesToLog);
        } else {
            // Handle cases where the API call was successful but returned an error status or no articles
            console.error("API status not 'ok' or no articles found:", data);
        }
      } catch (err) {
        console.error("Error fetching latest news:", err);
      }
    };

    fetchNews();
  }, []);

  if (articles.length === 0) {
      return <div className="news-feed-loading">Loading latest news...</div>;
  }

  return (
    <div className="news-feed">
      {articles.map((article, index) => (
        <ArticleCard
          key={article?.url || index} 
          article={article}
          variant="standard"
          onClick={() => article?.url && window.open(article.url, "_blank")}
        />
      ))}
    </div>
  );
};

export default NewsFeed;