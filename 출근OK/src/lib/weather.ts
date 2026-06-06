import type { WeatherData, AirQualityData } from '../types';

export const CITIES: Record<string, { lat: number; lon: number }> = {
  서울: { lat: 37.5665, lon: 126.978 },
  부산: { lat: 35.1796, lon: 129.0756 },
  대구: { lat: 35.8714, lon: 128.6014 },
  인천: { lat: 37.4563, lon: 126.7052 },
  광주: { lat: 35.1595, lon: 126.8526 },
  대전: { lat: 36.3504, lon: 127.3845 },
  울산: { lat: 35.5384, lon: 129.3114 },
  세종: { lat: 36.4801, lon: 127.2882 },
};

export async function fetchWeather(city: string): Promise<WeatherData> {
  const { lat, lon } = CITIES[city] ?? CITIES['광주'];
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code` +
    `&daily=precipitation_probability_max` +
    `&timezone=Asia%2FSeoul&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('날씨 API 실패');
  const data = await res.json();

  return {
    temperature: Math.round(data.current.temperature_2m),
    precipitationProbability: data.daily.precipitation_probability_max[0] ?? 0,
    weatherCode: data.current.weather_code,
  };
}

export async function fetchAirQuality(city: string): Promise<AirQualityData> {
  const { lat, lon } = CITIES[city] ?? CITIES['광주'];
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=pm2_5` +
    `&timezone=Asia%2FSeoul`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('미세먼지 API 실패');
  const data = await res.json();

  const pm25: number = Math.round(data.current.pm2_5 ?? 0);
  return { pm25, ...classifyPm25(pm25) };
}

function classifyPm25(pm25: number): Omit<AirQualityData, 'pm25'> {
  if (pm25 <= 15)  return { level: 'good',     label: '좋음',   emoji: '😊' };
  if (pm25 <= 35)  return { level: 'moderate', label: '보통',   emoji: '🙂' };
  if (pm25 <= 75)  return { level: 'bad',      label: '나쁨',   emoji: '😷' };
  return             { level: 'very_bad',  label: '매우나쁨', emoji: '🤢' };
}

export function getWeatherEmoji(code: number): string {
  if (code === 0)  return '☀️';
  if (code <= 3)   return '🌤️';
  if (code <= 48)  return '🌫️';
  if (code <= 67)  return '🌧️';
  if (code <= 77)  return '❄️';
  if (code <= 82)  return '🌧️';
  return '⛈️';
}

export function getOutfitTip(temp: number): string {
  if (temp >= 28) return '반팔 + 선크림 필수 ☀️';
  if (temp >= 23) return '얇은 셔츠면 충분해요 👕';
  if (temp >= 17) return '긴팔 + 얇은 카디건 추천 🧥';
  if (temp >= 12) return '재킷 또는 가디건 챙기세요 🧣';
  if (temp >= 5)  return '코트 또는 패딩 필수예요 🧥';
  return '두꺼운 패딩 + 목도리 무장 🧤';
}
