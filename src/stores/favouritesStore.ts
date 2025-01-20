import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavouritesState {
  favourites: string[];
  addFavourite: (city: string) => void;
  removeFavourite: (city: string) => void;
}

export const useFavouritesStore = create(
  persist<FavouritesState>(
    (set) => ({
      favourites: [],
      addFavourite: (city) =>
        set((state) => {
          if (!state.favourites.includes(city)) {
            return { favourites: [...state.favourites, city] };
          }
          return state;
        }),
      removeFavourite: (city) =>
        set((state) => ({
          favourites: state.favourites.filter((c) => c !== city),
        })),
    }),
    {
      name: "favourites-store",
    }
  )
);