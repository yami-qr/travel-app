import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  loadFavourites,
  saveFavourites,
  toggleFavourite,
  type FavouritePlace,
} from "../services/favourites";

interface FavouritesValue {
  favourites: FavouritePlace[];
  isFavourite: (id: number) => boolean;
  toggle: (place: Omit<FavouritePlace, "savedAt">) => void;
}

const FavouritesContext = createContext<FavouritesValue | null>(null);

/** Shares favourite destinations across pages and saves them to localStorage. */
export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favourites, setFavourites] = useState<FavouritePlace[]>(() => loadFavourites());

  useEffect(() => {
    saveFavourites(favourites);
  }, [favourites]);

  const toggle = useCallback((place: Omit<FavouritePlace, "savedAt">) => {
    setFavourites((current) => toggleFavourite(current, place));
  }, []);

  const value = useMemo<FavouritesValue>(
    () => ({
      favourites,
      isFavourite: (id) => favourites.some((f) => f.id === id),
      toggle,
    }),
    [favourites, toggle],
  );

  return <FavouritesContext.Provider value={value}>{children}</FavouritesContext.Provider>;
}

export function useFavourites(): FavouritesValue {
  const value = useContext(FavouritesContext);
  if (!value) throw new Error("useFavourites must be used inside a FavouritesProvider");
  return value;
}
