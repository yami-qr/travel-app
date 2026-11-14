import { buildUrl, fetchJson } from "./http";

export interface DailyForecast {
  /** ISO date, "YYYY-MM-DD", in the destination's own time zone. */
  date: string;
  maxC: number;
  minC: number;
  /** Highest chance of rain during the day, 0–100. */
  rainChance: number;
  /** WMO weather code, see describeWeather. */
  code: number;
}

interface ForecastResponse {
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
    weather_code: number[];
  };
}

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** 7-day forecast for a point, from Open-Meteo. Cached for 30 minutes. */
export async function getForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<DailyForecast[]> {
  const url = buildUrl(FORECAST_URL, {
    latitude: latitude.toFixed(3),
    longitude: longitude.toFixed(3),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
    timezone: "auto",
    forecast_days: 7,
  });

  const data = await fetchJson<ForecastResponse>(url, { signal, ttl: 30 * 60 * 1000 });
  const daily = data.daily;
  if (!daily) return [];

  return daily.time.map((date, i) => ({
    date,
    maxC: Math.round(daily.temperature_2m_max[i]),
    minC: Math.round(daily.temperature_2m_min[i]),
    rainChance: daily.precipitation_probability_max[i] ?? 0,
    code: daily.weather_code[i],
  }));
}

export interface WeatherDescription {
  label: string;
  /** Emoji used as a small picture. Always shown next to the label, never alone. */
  symbol: string;
}

/** Plain-language name for a WMO weather code. */
export function describeWeather(code: number): WeatherDescription {
  if (code === 0) return { label: "Clear", symbol: "☀️" };
  if (code <= 2) return { label: "Partly cloudy", symbol: "⛅" };
  if (code === 3) return { label: "Overcast", symbol: "☁️" };
  if (code === 45 || code === 48) return { label: "Fog", symbol: "🌫️" };
  if (code >= 51 && code <= 57) return { label: "Drizzle", symbol: "🌦️" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: "Rain", symbol: "🌧️" };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: "Snow", symbol: "❄️" };
  if (code >= 95) return { label: "Thunderstorm", symbol: "⛈️" };
  return { label: "Mixed", symbol: "🌤️" };
}
