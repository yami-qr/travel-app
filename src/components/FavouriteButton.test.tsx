import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import FavouriteButton from "./FavouriteButton";
import { FavouritesProvider, useFavourites } from "../context/FavouritesContext";
import { FAVOURITES_STORAGE_KEY } from "../services/favourites";

const lisbon = {
  id: 2267057,
  name: "Lisbon",
  country: "Portugal",
  countryCode: "PT",
  latitude: 38.725,
  longitude: -9.15,
};

function Count() {
  const { favourites } = useFavourites();
  return <p>Saved: {favourites.length}</p>;
}

function renderButton(variant: "icon" | "full" = "icon") {
  return render(
    <FavouritesProvider>
      <FavouriteButton place={lisbon} variant={variant} />
      <Count />
    </FavouritesProvider>,
  );
}

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("FavouriteButton", () => {
  it("saves and unsaves a place, and reports its state", () => {
    renderButton();
    const button = screen.getByRole("button", { name: "Save Lisbon to favourites" });
    expect(button.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Saved: 1")).toBeTruthy();

    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(screen.getByText("Saved: 0")).toBeTruthy();
  });

  it("persists favourites to localStorage", () => {
    renderButton();
    fireEvent.click(screen.getByRole("button"));

    const stored = JSON.parse(window.localStorage.getItem(FAVOURITES_STORAGE_KEY) ?? "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Lisbon");
  });

  it("restores saved favourites on the next visit", () => {
    const first = renderButton();
    fireEvent.click(screen.getByRole("button"));
    first.unmount();

    renderButton();
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("shows a text label in the full variant", () => {
    renderButton("full");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("button", { name: "Saved" })).toBeTruthy();
  });
});
