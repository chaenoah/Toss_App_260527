import type { WeatherData, AirQualityData } from '../types';
import { getWeatherEmoji, getOutfitTip } from '../lib/weather';

interface Props {
  city: string;
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  loading: boolean;
  error: boolean;
}

export function WeatherCard({ city, weather, airQuality, loading, error }: Props) {
  return (
    <div className="weather-card">
      <div className="weather-card__city">{city}</div>
      {loading && <div className="weather-card__loading">날씨 불러오는 중...</div>}
      {error && !loading && (
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
            <span className="weather-card__meta-item">
              🌧️ 강수확률 {weather.precipitationProbability}%
            </span>
            {airQuality && (
              <span
                className={`weather-card__meta-item weather-card__pm25 weather-card__pm25--${airQuality.level}`}
              >
                {airQuality.emoji} 미세먼지 {airQuality.label} ({airQuality.pm25}㎍/㎥)
              </span>
            )}
          </div>

          <div className="weather-card__outfit">{getOutfitTip(weather.temperature)}</div>
        </>
      )}
    </div>
  );
}
