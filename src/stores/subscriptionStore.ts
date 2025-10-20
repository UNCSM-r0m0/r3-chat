import { create } from 'zustand';

export interface SubscriptionState {
  subscription: any | null;
  isLoading: boolean;
  setSubscription: (s: any | null) => void;
  setLoading: (b: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  subscription: null,
  isLoading: false,
  setSubscription: (s) => set({ subscription: s }),
  setLoading: (b) => set({ isLoading: b }),
}));

