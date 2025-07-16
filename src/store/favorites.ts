import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: number;
  name: string;
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  price: string;
  available: string;
}

interface FavoritesStore {
  favorites: Product[];
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (product) => 
        set((state) => ({
          favorites: [...state.favorites, product]
        })),
      removeFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.filter((p) => p.id !== productId)
        })),
      isFavorite: (productId) =>
        get().favorites.some((p) => p.id === productId),
    }),
    {
      name: 'favorites-storage',
    }
  )
);