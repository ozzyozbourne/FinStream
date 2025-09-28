import React, { useEffect, useState } from "react";
import ArticleCard from "../../ui/ArticleCard";
import "./FeaturedArticle.css";

const FeaturedArticle: React.FC = () => {
  const [featured, setFeatured] = useState<any>(null);
  
  useEffect(() => {
    const fetchNews = async () => {
      const API_KEY = "b196a8de07bb439cb7fcb9099563779d";
      const url = `https://newsapi.org/v2/everything?q=bitcoin&apiKey=${API_KEY}`
      
      // CLEANUP: Removed unused image and proxy variables (imageUrl, proxyBase, proxiedUrl)
      
      try {
        const response = await fetch(url);
        const data = await response.json();
         if (data.status === "ok" && Array.isArray(data.articles)) {
            const articles = data.articles;
            if (articles.length > 0) {
                setFeatured(articles[0]); 
            }        
            console.log("Fetched featured article:", articles[0]);
        } else {
            console.error("API status not 'ok' or no articles found:", data);
        }
      } catch (err) {
        console.error("Error fetching featured article:", err);
      }
    };

    fetchNews();
  }, []);

  if (!featured) {
      return <div className="featured-article-loading">Loading featured article...</div>;
  }

  return (
    <div className="featured-article">
      <ArticleCard
        article={featured}
        variant="featured" // This is what triggers the image in ArticleCard.tsx
        onClick={() => featured?.url && window.open(featured.url, "_blank")}
      />
    </div>
  );
};
export default FeaturedArticle;