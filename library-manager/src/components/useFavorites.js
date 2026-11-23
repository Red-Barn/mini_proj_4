import { useState, useEffect } from "react";

const STORAGE_KEY = "library_favorite_ids";
const SYNC_EVENT = "favorites-updated";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 다른 컴포넌트(카드, 상세페이지)에서 즐겨찾기 변경 시 즉시 동기화
  useEffect(() => {
    const handleSync = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        setFavoriteIds(saved ? JSON.parse(saved) : []);
      } catch {
        setFavoriteIds([]);
      }
    };
    window.addEventListener(SYNC_EVENT, handleSync);
    return () => window.removeEventListener(SYNC_EVENT, handleSync);
  }, []);

  const toggleFavorite = (bookId) => {
    const next = favoriteIds.includes(bookId)
      ? favoriteIds.filter((id) => id !== bookId)
      : [...favoriteIds, bookId];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavoriteIds(next);
    window.dispatchEvent(new Event(SYNC_EVENT)); // 다른 컴포넌트에 변경 알림
  };

  const isFavorite = (bookId) => favoriteIds.includes(bookId);

  return { favoriteIds, toggleFavorite, isFavorite };
}