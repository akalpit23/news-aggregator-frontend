import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { NewsProvider } from '../context/NewsContext';
import ArticleThread from '../components/news/ArticleThread';
import LandingPage from '../components/LandingPage';
import LoadingState from '../components/common/LoadingState';

const NewsApp: React.FC = () => {
  const [hasSearched, setHasSearched] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (query: string) => {
    setIsTransitioning(true);
    setIsLoading(true);
    setTimeout(() => {
      setHasSearched(true);
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    }, 800);
  };

  const handleReset = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setHasSearched(false);
      setIsTransitioning(false);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      <div
        className={`transition-all duration-1000 ease-in-out absolute inset-0 bg-gray-900 ${
          hasSearched 
            ? 'scale-90 opacity-0 pointer-events-none blur-md transform-gpu' 
            : 'scale-100 opacity-100 transform-gpu'
        }`}
      >
        <LandingPage onSearch={handleSearch} />
      </div>

      <div
        className={`transition-all duration-1000 ease-in-out absolute inset-0 bg-gray-900 ${
          hasSearched 
            ? 'scale-100 opacity-100 transform-gpu' 
            : 'scale-125 opacity-0 pointer-events-none blur-md transform-gpu'
        }`}
      >
        <NewsProvider>
          <AppLayout onLogoClick={handleReset}>
            {isLoading ? (
              <div className="flex h-[calc(100vh-73px)]">
                <div className="w-[400px] border-r border-gray-800/50 p-4 space-y-4">
                  <LoadingState type="cards" count={5} />
                </div>
                <div className="flex-1 p-8">
                  <LoadingState type="article" />
                </div>
              </div>
            ) : (
              <ArticleThread />
            )}
          </AppLayout>
        </NewsProvider>
      </div>
    </div>
  );
};

export default NewsApp;