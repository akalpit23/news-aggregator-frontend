// src/App.tsx
import React, { useState, useEffect } from "react";
import AppLayout from "./components/layout/AppLayout";
import { NewsProvider } from "./context/NewsContext";
import ArticleThread from "./components/news/ArticleThread";
import LandingPage from "./components/LandingPage";
import config from "./config/config";
import SessionService from "./services/sessionService";
import LoadingState from "./components/common/LoadingState";

function App() {
  const [hasSearched, setHasSearched] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  const [providerKey, setProviderKey] = useState(0);
  const [showShimmer, setShowShimmer] = useState(false);

  /**
   * 1) selectedKeywords: array of all currently active keywords (typed + clicked)
   */
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  useEffect(() => {
    SessionService.initSession();
    return () => {
      SessionService.clearSession();
    };
  }, []);

  /**
   * Utility to merge newly typed query tokens into selectedKeywords
   */
  const mergeQueryIntoSelectedKeywords = (query: string) => {
    // Split typed text by whitespace, filter out empty tokens
    const tokens = query.split(/\s+/).filter(Boolean);

    // Merge into the existing keywords (like a set, so no duplicates)
    setSelectedKeywords((prev) => {
      const merged = new Set([...prev, ...tokens]);
      return Array.from(merged);
    });
  };

  /**
   * 2) Toggle a keyword in or out of selectedKeywords
   */
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords((prev) => {
      // If it’s already in the array, remove it; otherwise add it
      if (prev.includes(keyword)) {
        return prev.filter((k) => k !== keyword);
      } else {
        return [...prev, keyword];
      }
    });
  };

  /**
   * 3) Build the final search string from all selected keywords
   */
  const buildSearchString = (keywords: string[]) => {
    return keywords.join(" ");
  };

  /**
   * 4) Perform the actual search using all selected keywords
   */
  const performSearch = async (keywords: string[]) => {
    const finalQuery = buildSearchString(keywords);
    if (!finalQuery.trim()) {
      // If user cleared everything, you might want to reset
      setHasSearched(false);
      setNewsData([]);
      return;
    }

    setShowShimmer(true);
    setIsTransitioning(true);
    setError(null);

    try {
      const sessionId = SessionService.getSessionId();
      const fetchResponse = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.fetchNews}?keyword=${encodeURIComponent(
          finalQuery
        )}&session_id=${sessionId}`
      );
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch news");
      }
      const fetchedData = await fetchResponse.json();

      const processResponse = await fetch(
        `${config.api.baseUrl}${config.api.endpoints.processNews}?session_id=${sessionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: fetchedData }),
        }
      );
      if (!processResponse.ok) {
        throw new Error("Failed to process news");
      }
      const { data: processedData } = await processResponse.json();

      setNewsData(processedData);
      setHasSearched(true);
      setShowShimmer(false);
      setTimeout(() => setIsTransitioning(false), 1000);
    } catch (err) {
      console.error("Error during news search:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setHasSearched(false);
      setShowShimmer(false);
      setIsTransitioning(false);
    }
  };

  /**
   * 5) handleSearch is called by the LandingPage or Header search bar
   *    - merges typed query tokens into selectedKeywords
   *    - then triggers an actual search
   */
  const handleSearch = async (query: string) => {
    mergeQueryIntoSelectedKeywords(query);
  };

  /**
   * Whenever selectedKeywords changes, run the actual search
   * (so toggling a keyword or typing new text triggers a fresh search)
   */
  useEffect(() => {
    performSearch(selectedKeywords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKeywords]);

  /**
   * Reset to initial state
   */
  const handleReset = () => {
    console.log("Logo clicked – resetting state");
    setIsTransitioning(true);
    setError(null);
    setHasSearched(false);
    setNewsData([]);
    setProviderKey((prev) => prev + 1);
    setSelectedKeywords([]); // Clear all selected keywords
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out">
          {error}
        </div>
      )}

      {hasSearched ? (
        <NewsProvider key={providerKey} newsData={newsData}>
          <AppLayout
            onLogoClick={handleReset}
            onSearch={handleSearch} // For typed queries
            toggleKeyword={toggleKeyword} // For filter toggles
            selectedKeywords={selectedKeywords} // So sidebar can display them
          >
            <ArticleThread />
          </AppLayout>
          {showShimmer && (
            <div className="absolute inset-0 flex items-center justify-center z-50">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 animate-pulse"></div>
              <LoadingState type="spinner" />
            </div>
          )}
        </NewsProvider>
      ) : (
        <LandingPage onSearch={handleSearch} />
      )}
    </div>
  );
}

export default App;