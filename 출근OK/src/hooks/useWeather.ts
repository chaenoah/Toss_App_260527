import { useState, useEffect } from 'react';
import type { WeatherData } from '../types';
import { fetchWeather } from '../lib/weather';
import { loadCity } from '../lib/storage';

export function useWeather() {
  const [city] = useState(() => loadCity());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchWeather(city)
      .then((data) => {
        setWeather(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  const needsUmbrella = (weather?.precipitationProbability ?? 0) >= 50;

  return { city, weather, loading, error, needsUmbrella };
}
