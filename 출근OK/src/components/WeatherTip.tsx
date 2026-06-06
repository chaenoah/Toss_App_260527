import { UMBRELLA_TIP } from '../lib/copy';

interface Props {
  needsUmbrella: boolean;
}

export function WeatherTip({ needsUmbrella }: Props) {
  if (!needsUmbrella) return null;
  return (
    <div className="weather-tip">
      <span className="weather-tip__icon">☂️</span>
      <span>{UMBRELLA_TIP}</span>
    </div>
  );
}
