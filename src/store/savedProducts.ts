import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedProduct {
  id: number;
  name: string;
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  price: string;
  available: string;
  description?: string;
  specifications?: {
    [key: string]: string;
  };
}

interface SavedProductsStore {
  savedProducts: SavedProduct[];
  addSavedProduct: (product: SavedProduct) => void;
  removeSavedProduct: (productId: number) => void;
  isSaved: (productId: number) => boolean;
  clearSavedProducts: () => void;
}

export const useSavedProducts = create<SavedProductsStore>()(
  persist(
    (set, get) => ({
      savedProducts: [],
      addSavedProduct: (product) => 
        set((state) => ({
          savedProducts: [...state.savedProducts, product]
        })),
      removeSavedProduct: (productId) =>
        set((state) => ({
          savedProducts: state.savedProducts.filter((p) => p.id !== productId)
        })),
      isSaved: (productId) =>
        get().savedProducts.some((p) => p.id === productId),
      clearSavedProducts: () =>
        set({ savedProducts: [] }),
    }),
    {
      name: 'saved-products-storage',
    }
  )
);