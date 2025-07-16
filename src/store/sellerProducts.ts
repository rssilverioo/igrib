import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SellerProduct {
  id: string;
  name: string;
  type: string;
  description: string;
  price: string;
  available: string;
  location: string;
  specifications: {
    humidity: string;
    protein: string;
    purity: string;
    certification: string;
  };
  images: string[];
  status: 'draft' | 'pending' | 'active' | 'inactive' | 'sold_out';
  createdAt: string;
}

interface SellerProductsStore {
  products: SellerProduct[];
  addProduct: (product: SellerProduct) => void;
  updateProduct: (id: string, product: Partial<SellerProduct>) => void;
  removeProduct: (id: string) => void;
  getProduct: (id: string) => SellerProduct | undefined;
}

export const useSellerProducts = create<SellerProductsStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const newProduct = {
          ...product,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'draft' as const,
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },
      updateProduct: (id, updatedProduct) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...updatedProduct } : product
          ),
        }));
      },
      removeProduct: (id) => {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
        }));
      },
      getProduct: (id) => {
        return get().products.find((product) => product.id === id);
      },
    }),
    {
      name: 'seller-products',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);