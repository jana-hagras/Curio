import { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { favoriteService } from '../services/favoriteService';

export const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('curio_favorites');
    return stored ? JSON.parse(stored) : [];
  });

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('curio_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Load from backend when user logs in
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      favoriteService.getByUser(user.id)
        .then(res => {
          const backendFavs = res.data?.favorites || res?.favorites || [];
          if (backendFavs.length > 0) {
            setFavorites(backendFavs);
          }
        })
        .catch(() => {
          // Fallback to localStorage (already loaded)
        });
    }
  }, [isAuthenticated, user?.id]);

  const addFavorite = useCallback((product) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.id === product.id)) return prev;
      return [...prev, product];
    });
    // Persist to backend
    if (user?.id) {
      favoriteService.add({ user_id: user.id, item_id: product.id }).catch(() => {});
    }
  }, [user?.id]);

  const removeFavorite = useCallback((productId) => {
    setFavorites((prev) => prev.filter((f) => f.id !== productId));
    // Remove from backend
    if (user?.id) {
      // Find the favorite entry to get its id for deletion
      favoriteService.check(user.id, productId)
        .then(res => {
          const favId = res.data?.favorite?.id || res?.favorite?.id;
          if (favId) {
            favoriteService.remove(favId).catch(() => {});
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  const isFavorite = useCallback(
    (productId) => favorites.some((f) => f.id === productId),
    [favorites]
  );

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    totalFavorites: favorites.length,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
