import { create } from 'zustand';

interface Coordinate {
  lat: number;
  lng: number;
}

interface TrackingState {
  riderLocation: Coordinate | null;
  deliveryStatus: string | null;
  setRiderLocation: (loc: Coordinate | null) => void;
  setDeliveryStatus: (status: string | null) => void;
  resetTracking: () => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  riderLocation: null,
  deliveryStatus: null,
  setRiderLocation: (riderLocation) => set({ riderLocation }),
  setDeliveryStatus: (deliveryStatus) => set({ deliveryStatus }),
  resetTracking: () => set({ riderLocation: null, deliveryStatus: null }),
}));
