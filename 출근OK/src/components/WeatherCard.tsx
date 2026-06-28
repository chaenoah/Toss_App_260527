import type { WeatherData, AirQualityData } from '../types';
import { getWeatherEmoji, getOutfitTip } from '../lib/weather';

interface Props {
  city: string;
  weather: WeatherData | null;
  airQuality: AirQualityData | null;
  loading: boolean;
  error: boolean;
  unlocked: boolean;
  watching: boolean;
  onWatchAd: () => void;
}

export function WeatherCard({ city, weather, airQuality, loading, error, unlocked, watching, onWatchAd }: Props) {
  return (
    <div className="weather-card">
      <div className="weather-card__city">📍 {city}</div>

      {loading && <div className="weather-card__loading">날씨 불러오는 중...</div>}
      {error && !loading && (
        <div className="weather-card__error">날씨 정보를 불러오지 못했어요 😅</div>
      )}

      {weather && (
        <>
          <div className="weather-card__main">
            <span className="weather-card__emoji">{getWeatherEmoji(weather.weatherCode)}</span>
            <div className="weather-card__temps">
              <span className="weather-card__temp">{weather.temperature}°</span>
              <span className="weather-card__feels">
                체감 {weather.feelsLikeTemperature}°
              </span>
            </div>
          </div>

          <div className="weather-card__meta">
            <span className="weather-card__meta-item">
              🌧️ 강수 {weather.precipitationProbability}%
            </span>
            {airQuality && (
              <span className={`weather-card__pm25 weather-card__pm25--${airQuality.level}`}>
                {airQuality.emoji} 미세먼지 {airQuality.label}
              </span>
            )}
          </div>

          {/* 잠금 해제 영역 */}
          {unlocked ? (
            <div className="weather-card__detail">
              <div className="weather-card__detail-row">
                <span>🌡️ 체감온도</span>
                <span>{weather.feelsLikeTemperature}° (실제 {weather.temperature}°)</span>
              </div>
              <div className="weather-card__detail-row">
                <span>☂️ 우산</span>
                <span>{weather.precipitationProbability >= 50 ? '챙기세요!' : '안 챙겨도 돼요'}</span>
              </div>
              {airQuality && (
                <div className="weather-card__detail-row">
                  <span>😷 미세먼지</span>
                  <span>{airQuality.label} ({airQuality.pm25}㎍/㎥)</span>
                </div>
              )}
              <div className="weather-card__outfit">{getOutfitTip(weather.temperature)}</div>
            </div>
          ) : (
            <button
              className="weather-card__reward-btn"
              onClick={onWatchAd}
              disabled={watching}
            >
              {watching ? '광고 시청 중…' : '🎁 광고 보고 오늘 옷차림 추천받기'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
