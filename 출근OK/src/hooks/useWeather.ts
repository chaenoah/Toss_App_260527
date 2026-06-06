import { useState, useEffect } from 'react';
import type { WeatherData, AirQualityData } from '../types';
import { fetchWeather, fetchAirQuality } from '../lib/weather';
import { loadCity } from '../lib/storage';

export function useWeather() {
  const [city] = useState(() => loadCity());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [airQuality, setAirQuality] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    // 날씨 + 미세먼지 병렬 fetch
    Promise.allSettled([fetchWeather(city), fetchAirQuality(city)]).then(
      ([weatherResult, airResult]) => {
        if (weatherResult.status === 'fulfilled') {
          setWeather(weatherResult.value);
          setError(false);
        } else {
          setError(true);
        }
        if (airResult.status === 'fulfilled') {
          setAirQuality(airResult.value);
        }
        setLoading(false);
      }
    );
  }, [city]);

  const needsUmbrella = (weather?.precipitationProbability ?? 0) >= 50;
  const needsMask = (airQuality?.pm25 ?? 0) > 35;

  return { city, weather, airQuality, loading, error, needsUmbrella, needsMask };
}
