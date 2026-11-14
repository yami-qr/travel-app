/**
 * A three-letter, airport-style code for a destination, e.g. "Lisbon, Portugal"
 * becomes "LIS" and "São Paulo" becomes "SAO". Used on the boarding-pass cards.
 */
export function destinationCode(destination: string): string {
  const city = destination.split(",")[0];
  const letters = city
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/gi, "")
    .toUpperCase();
  return letters.slice(0, 3) || "???";
}
