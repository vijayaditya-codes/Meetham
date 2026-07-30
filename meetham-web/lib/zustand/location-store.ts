import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationState {
  lat: number;
  lng: number;
  city: string;
  radius: number;
  setLocation: (lat: number, lng: number, city: string) => void;
  setRadius: (radius: number) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      lat: 19.0760, // default Mumbai latitude
      lng: 72.8777, // default Mumbai longitude
      city: 'Mumbai',
      radius: 10,
      setLocation: (lat, lng, city) => set({ lat, lng, city }),
      setRadius: (radius) => set({ radius }),
    }),
    {
      name: 'meetham-location',
    }
  )
);
