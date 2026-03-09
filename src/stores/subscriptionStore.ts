import { create } from 'zustand';

export type SubscriptionTier = 'PREMIUM' | 'REGISTERED' | 'FREE';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  [key: string]: unknown;
}

export interface SubscriptionState {
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  setSubscription: (s: SubscriptionInfo | null) => void;
  setLoading: (b: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  subscription: null,
  isLoading: false,
  setSubscription: (s) => set({ subscription: s }),
  setLoading: (b) => set({ isLoading: b }),
}));
