import { useState, useEffect } from 'react';

export interface BrowsingHistoryItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  price_min: number;
  price_max: number;
  viewed_at: number;
}

const MAX_HISTORY_ITEMS = 20;

export const useBrowsingHistory = () => {
  const [history, setHistory] = useState<BrowsingHistoryItem[]>(() => {
    const stored = localStorage.getItem('browsingHistory');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('browsingHistory', JSON.stringify(history));
  }, [history]);

  const addToHistory = (item: Omit<BrowsingHistoryItem, 'viewed_at'>) => {
    setHistory(prev => {
      // Remove existing entry for this product
      const filtered = prev.filter(h => h.id !== item.id);
      // Add to front with timestamp
      const newHistory = [
        { ...item, viewed_at: Date.now() },
        ...filtered
      ].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return { history, addToHistory, clearHistory };
};
