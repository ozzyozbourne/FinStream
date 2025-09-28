import React, { useEffect, useState } from "react";
import ArticleCard from "../../ui/ArticleCard";
import "./LatestNews.css";

const LatestNewsPage: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      const API_KEY = "670583b7174122d155e964b944194bc7";
      const url = `http://api.mediastack.com/v1/news?access_key=${API_KEY}&categories=business&languages=en&sort=published_desc`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.data && Array.isArray(data.data)) {
          setArticles(data.data.slice(1, 9)); // articles 1–8
        }
      } catch (err) {
        console.error("Error fetching latest news:", err);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="latest-news">
      {articles.map((article, index) => (
        <ArticleCard
          key={index}
          article={article}
          variant="standard"
          onClick={() => window.open(article.url, "_blank")}
        />
      ))}
    </div>
  );
};

export default LatestNewsPage;
