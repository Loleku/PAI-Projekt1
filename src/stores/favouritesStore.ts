import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavouriteLocation {
  lat: string;
  lon: string;
}

interface FavouritesState {
  favourites: FavouriteLocation[];
  addFavourite: (location: FavouriteLocation) => void;
  removeFavourite: (location: FavouriteLocation) => void;
}

export const useFavouritesStore = create(
  persist<FavouritesState>(
    (set) => ({
      favourites: [],
      addFavourite: (location) =>
        set((state) => {
          if (!state.favourites.some((fav) => fav.lat === location.lat && fav.lon === location.lon)) {
            return { favourites: [...state.favourites, location] };
          }
          return state;
        }),
      removeFavourite: (location) =>
        set((state) => {
          return {
            favourites: state.favourites.filter(
              (fav) => fav.lat !== location.lat || fav.lon !== location.lon
            ),
          };
        }),
    }),
    {
      name: "favourites-store",
    }
  )
);
