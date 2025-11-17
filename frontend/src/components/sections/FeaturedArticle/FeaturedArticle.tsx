import React, { useEffect, useState } from "react";
import ArticleCard from "../../ui/ArticleCard";
import "./FeaturedArticle.css";

const FeaturedArticle: React.FC = () => {
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const API_KEY = "b196a8de07bb439cb7fcb9099563779d";

      // Correct endpoint for articles
      const url = `https://newsapi.org/v2/top-headlines?category=business&language=en&apiKey=${API_KEY}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "ok" && Array.isArray(data.articles)) {
          // Pick the *first* article with a valid image
          const validArticle = data.articles.find(
            (a: any) => a.urlToImage && a.title
          );

          if (validArticle) {
            setFeatured(validArticle);
          } else {
            console.error("No suitable featured article found");
          }

          console.log("Fetched featured article:", validArticle);
        } else {
          console.error("Invalid API response:", data);
        }
      } catch (error) {
        console.error("Error fetching featured article:", error);
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
        variant="featured"
        onClick={() => window.open(featured.url, "_blank")}
      />
    </div>
  );
};

export default FeaturedArticle;
