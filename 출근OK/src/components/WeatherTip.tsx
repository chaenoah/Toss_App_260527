import { UMBRELLA_TIP, MASK_TIP_BAD, MASK_TIP_VERY_BAD } from '../lib/copy';
import type { AirQualityData } from '../types';

interface Props {
  needsUmbrella: boolean;
  needsMask: boolean;
  airQuality: AirQualityData | null;
}

export function WeatherTip({ needsUmbrella, needsMask, airQuality }: Props) {
  const tips: { key: string; icon: string; text: string; variant: 'blue' | 'orange' | 'red' }[] = [];

  if (needsUmbrella) {
    tips.push({ key: 'umbrella', icon: '☂️', text: UMBRELLA_TIP, variant: 'blue' });
  }

  if (needsMask) {
    const isVeryBad = (airQuality?.pm25 ?? 0) > 75;
    tips.push({
      key: 'mask',
      icon: isVeryBad ? '🤢' : '😷',
      text: isVeryBad ? MASK_TIP_VERY_BAD : MASK_TIP_BAD,
      variant: isVeryBad ? 'red' : 'orange',
    });
  }

  if (tips.length === 0) return null;

  return (
    <div className="weather-tips">
      {tips.map((tip) => (
        <div key={tip.key} className={`weather-tip weather-tip--${tip.variant}`}>
          <span className="weather-tip__icon">{tip.icon}</span>
          <span>{tip.text}</span>
        </div>
      ))}
    </div>
  );
}
