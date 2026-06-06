import type { WeatherData } from '../types';
import { getWeatherEmoji, getOutfitTip } from '../lib/weather';

interface Props {
  city: string;
  weather: WeatherData | null;
  loading: boolean;
  error: boolean;
}

export function WeatherCard({ city, weather, loading, error }: Props) {
  return (
    <div className="weather-card">
      <div className="weather-card__city">{city}</div>
      {loading && <div className="weather-card__loading">날씨 불러오는 중...</div>}
      {error && (
        <div className="weather-card__error">날씨 정보를 불러오지 못했어요 😅</div>
      )}
      {weather && (
        <>
          <div className="weather-card__main">
            <span className="weather-card__emoji">
              {getWeatherEmoji(weather.weatherCode)}
            </span>
            <span className="weather-card__temp">{weather.temperature}°</span>
          </div>
          <div className="weather-card__meta">
            <span>강수확률 {weather.precipitationProbability}%</span>
          </div>
          <div className="weather-card__outfit">{getOutfitTip(weather.temperature)}</div>
        </>
      )}
    </div>
  );
}
