import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NegotiationProduct {
  name: string;
  producer: string;
  image: string;
  price: string;
  available: string;
  rating: number;
}

interface LastMessage {
  text: string;
  timestamp: string;
  unread: boolean;
}

export interface Negotiation {
  id: number;
  productId: number;
  sellerId: string;
  product: NegotiationProduct;
  lastMessage: LastMessage;
  status: 'new' | 'pending' | 'active' | 'completed';
  deliveryType: 'delivery' | 'pickup';
  deliveryDate: string;
  quantity: number;
}

interface NegotiationsStore {
  negotiations: Negotiation[];
  addNegotiation: (negotiation: Negotiation) => void;
  removeNegotiation: (productId: number) => void;
  hasNegotiation: (productId: number) => boolean;
  updateLastMessage: (productId: number, message: LastMessage) => void;
}

export const useNegotiations = create<NegotiationsStore>()(
  persist(
    (set, get) => ({
      negotiations: [],
      addNegotiation: (negotiation) => {
        // Check if negotiation already exists
        if (!get().hasNegotiation(negotiation.productId)) {
          set((state) => ({
            negotiations: [...state.negotiations, negotiation]
          }));
          // Save to localStorage
          localStorage.setItem(
            `negotiation_${negotiation.sellerId}_${negotiation.productId}`,
            JSON.stringify(negotiation)
          );
        }
      },
      removeNegotiation: (productId) => {
        const negotiation = get().negotiations.find(n => n.productId === productId);
        if (negotiation) {
          localStorage.removeItem(`negotiation_${negotiation.sellerId}_${negotiation.productId}`);
          localStorage.removeItem(`chat_${negotiation.sellerId}_${negotiation.productId}`);
        }
        set((state) => ({
          negotiations: state.negotiations.filter((n) => n.productId !== productId)
        }));
      },
      hasNegotiation: (productId) =>
        get().negotiations.some((n) => n.productId === productId),
      updateLastMessage: (productId, message) => {
        const negotiation = get().negotiations.find(n => n.productId === productId);
        if (negotiation) {
          set((state) => ({
            negotiations: state.negotiations.map((n) =>
              n.productId === productId
                ? { ...n, lastMessage: message }
                : n
            )
          }));
          // Update localStorage
          localStorage.setItem(
            `negotiation_${negotiation.sellerId}_${negotiation.productId}`,
            JSON.stringify({ ...negotiation, lastMessage: message })
          );
        }
      },
    }),
    {
      name: 'negotiations-storage',
    }
  )
);