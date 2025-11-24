import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { ProductDetail } from '../data/productData';
import {
  addToFavoritesAPI,
  removeFromFavoritesAPI,
  getUserFavoritesAPI,
  clearAllFavoritesAPI,
} from '../../services/favoritesService';

// ===========================
// INTERFACES
// ===========================

interface FavoritesContextType {
  // State
  favorites: ProductDetail[];
  isLoading: boolean;
  error: string | null;
  numberOfFavorites: number;

  // Actions
  addToFavorites: (product: ProductDetail) => Promise<void>;
  removeFromFavorites: (productId: number) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => Promise<void>;
  refetchFavorites: () => Promise<void>;
}

interface FavoritesProviderProps {
  children: ReactNode;
}

// ===========================
// CONTEXT CREATION
// ===========================

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// ===========================
// CUSTOM HOOK
// ===========================

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

// ===========================
// PROVIDER COMPONENT
// ===========================

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  // State management
  const [favorites, setFavorites] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get auth context
  const { user } = useAuth();
  const isAuthenticated = !!user?.jwt;
  const navigate = useNavigate();

  // ===========================
  // FETCH FAVORITES FROM API
  // ===========================

  const fetchFavoritesFromAPI = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const favoriteProducts = await getUserFavoritesAPI(user!.jwt!);
      setFavorites(favoriteProducts || []);
      setError(null);
    } catch (err: any) {
      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to load favorites from server';

      console.error('[FavoritesContext] Error fetching favorites:', errorMessage);
      setError(errorMessage);

      // Don't clear favorites array on error - keep showing cached data
      // This prevents breaking the UI if there's a temporary API issue
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isAuthenticated, user?.jwt]);

  // ===========================
  // EFFECT: Load favorites on mount and auth changes
  // ===========================

  useEffect(() => {
    fetchFavoritesFromAPI();
  }, [fetchFavoritesFromAPI]);

  // ===========================
  // ADD TO FAVORITES
  // ===========================

  const addToFavorites = useCallback(
    async (product: ProductDetail) => {
      // Validation
      if (!isAuthenticated) {
        setError('Please log in to add items to your favorites');
        return; // Don't throw error, just return
      }

      if (!product || !product.id) {
        setError('Invalid product');
        return; // Don't throw error, just return
      }

      // Check if already favorited
      if (favorites.some((fav) => fav.id === product.id)) {
        return; // Already in favorites, skip
      }

      const previousFavorites = [...favorites];
      setError(null);

      try {
        // Optimistic update - add to UI immediately
        setFavorites((prev) => [...prev, product]);

        // Call API to persist to database
        await addToFavoritesAPI(product.id, user!.jwt!);

        console.log(
          `[FavoritesContext] Product ${product.id} added to favorites successfully`
        );
      } catch (err: any) {
        // Revert optimistic update on error
        setFavorites(previousFavorites);

        const errorMessage =
          typeof err === 'string'
            ? err
            : err?.message || 'Failed to add product to favorites';

        console.error('[FavoritesContext] Error adding to favorites:', errorMessage);
        setError(errorMessage);

        // Don't throw error, just log it
      }
    },
    [isAuthenticated, favorites, user?.jwt]
  );

  // ===========================
  // REMOVE FROM FAVORITES
  // ===========================

  const removeFromFavorites = useCallback(
    async (productId: number) => {
      // Validation
      if (!isAuthenticated) {
        setError('Please log in to manage your favorites');
        navigate('/login');
        throw new Error('Not authenticated');
      }

      if (!productId) {
        setError('Invalid product ID');
        throw new Error('Invalid product ID');
      }

      const previousFavorites = [...favorites];
      setError(null);

      try {
        // Optimistic update - remove from UI immediately
        setFavorites((prev) => prev.filter((fav) => fav.id !== productId));

        // Call API to persist deletion to database
        await removeFromFavoritesAPI(productId, user!.jwt!);

        console.log(
          `[FavoritesContext] Product ${productId} removed from favorites successfully`
        );
      } catch (err: any) {
        // Revert optimistic update on error
        setFavorites(previousFavorites);

        const errorMessage =
          typeof err === 'string'
            ? err
            : err?.message || 'Failed to remove product from favorites';

        console.error('[FavoritesContext] Error removing from favorites:', errorMessage);
        setError(errorMessage);

        throw err;
      }
    },
    [isAuthenticated, favorites, user?.jwt, navigate]
  );

  // ===========================
  // CHECK IF FAVORITE
  // ===========================

  const isFavorite = useCallback(
    (productId: number): boolean => {
      return favorites.some((fav) => fav.id === productId);
    },
    [favorites]
  );

  // ===========================
  // CLEAR ALL FAVORITES
  // ===========================

  const clearFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to manage your favorites');
      throw new Error('Not authenticated');
    }

    const previousFavorites = [...favorites];
    setError(null);

    try {
      // Optimistic update
      setFavorites([]);

      // Call API
      await clearAllFavoritesAPI(user!.jwt!);

      console.log('[FavoritesContext] All favorites cleared successfully');
    } catch (err: any) {
      // Revert optimistic update
      setFavorites(previousFavorites);

      const errorMessage =
        typeof err === 'string'
          ? err
          : err?.message || 'Failed to clear favorites';

      console.error('[FavoritesContext] Error clearing favorites:', errorMessage);
      setError(errorMessage);

      throw err;
    }
  }, [isAuthenticated, favorites, user?.jwt]);

  // ===========================
  // REFETCH FAVORITES
  // ===========================

  const refetchFavorites = useCallback(async () => {
    await fetchFavoritesFromAPI();
  }, [fetchFavoritesFromAPI]);

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    error,
    numberOfFavorites: favorites.length,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    refetchFavorites,
  };

  // ===========================
  // LOADING STATE
  // ===========================

  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <svg
            className="animate-spin h-6 w-6 text-green-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-green-600 font-medium">Loading your PestoFarm...</span>
        </div>
      </div>
    );
  }

  // ===========================
  // PROVIDER RENDER
  // ===========================

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
};
