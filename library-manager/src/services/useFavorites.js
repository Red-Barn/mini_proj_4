import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'library_favorites';
const SYNC_EVENT = 'favorites-updated';

function readFavorites() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).map(String) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readFavorites);

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const toggleFavorite = useCallback((bookId) => {
    const targetId = String(bookId);
    const current = readFavorites();
    const exists = current.includes(targetId);
    const next = exists
      ? current.filter((id) => id !== targetId)
      : [...current, targetId];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setFavorites(next);
    window.dispatchEvent(new Event(SYNC_EVENT));
  }, []);

  const isFavorite = useCallback(
    (bookId) => favorites.includes(String(bookId)),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}