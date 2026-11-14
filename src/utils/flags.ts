/**
 * Turns a two-letter country code into its flag emoji, e.g. "PT" becomes 🇵🇹.
 * Flag emoji are two "regional indicator" letters, so no image files are needed.
 * Returns an empty string for anything that is not a two-letter code.
 */
export function flagEmoji(countryCode: string | undefined): string {
  if (!countryCode || !/^[a-z]{2}$/i.test(countryCode)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    ...countryCode
      .toUpperCase()
      .split("")
      .map((letter) => A + letter.charCodeAt(0) - 65),
  );
}

/** Formats a population as "517,802" or "5.6M" when large. */
export function formatPopulation(population: number | undefined): string {
  if (!population) return "";
  if (population >= 1_000_000) return `${(population / 1_000_000).toFixed(1)}M`;
  return population.toLocaleString("en-GB");
}
