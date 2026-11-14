import { useApi } from "../hooks/useApi";
import { describeWeather, getForecast } from "../services/api/weather";
import { formatDayNumber, formatWeekday } from "../utils/dates";

interface WeatherStripProps {
  latitude: number;
  longitude: number;
}

/** The next 7 days of weather for a destination, with its own loading and error states. */
export default function WeatherStrip({ latitude, longitude }: WeatherStripProps) {
  const forecast = useApi(`weather:${latitude.toFixed(2)},${longitude.toFixed(2)}`, (signal) =>
    getForecast(latitude, longitude, signal),
  );

  return (
    <section className="panel weather" aria-labelledby="weather-heading">
      <h2 id="weather-heading">Next 7 days</h2>

      {forecast.status === "loading" && (
        <div className="weather-row" aria-busy="true" aria-label="Loading the forecast">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="skeleton weather-skeleton" />
          ))}
        </div>
      )}

      {forecast.status === "error" && (
        <div className="notice notice-error" role="alert">
          <span>Couldn't load the forecast. {forecast.error}</span>
          <button className="btn btn-small" type="button" onClick={forecast.retry}>
            Try again
          </button>
        </div>
      )}

      {forecast.status === "success" && (
        <ol className="weather-row">
          {forecast.data.map((day) => {
            const weather = describeWeather(day.code);
            return (
              <li key={day.date} className="weather-day">
                <span className="weather-date">
                  {formatWeekday(day.date)} {formatDayNumber(day.date)}
                </span>
                <span className="weather-symbol" aria-hidden="true">
                  {weather.symbol}
                </span>
                <span className="sr-only">{weather.label}.</span>
                <span className="weather-temp">
                  <strong>{day.maxC}°</strong> <span>{day.minC}°</span>
                  <span className="sr-only"> high, low.</span>
                </span>
                <span className="weather-rain">{day.rainChance}% rain</span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="credit">
        Forecast by <a href="https://open-meteo.com/">Open-Meteo</a>
      </p>
    </section>
  );
}
