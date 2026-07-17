import { temperatureColors } from "../theme";

// 관계 온도 게이지.
// 큰 숫자(예: 68°) + 가로 막대. 막대는 블루그레이→코랄 그라데이션 위에
// 현재 온도만큼 채워지고, 끝에 마커(●)가 놓인다.

interface Props {
  temperature: number; // 0~100
  accent: string; // 현재 온도색 (마커·숫자 색)
}

export function TemperatureGauge({ temperature, accent }: Props) {
  const clamped = Math.max(0, Math.min(100, temperature));
  // 그라데이션 양 끝 색 (0도, 100도)
  const from = temperatureColors(0).accent;
  const to = temperatureColors(100).accent;

  return (
    <div className="gauge">
      {/* 큰 온도 숫자 */}
      <div className="gauge__value" style={{ color: accent }}>
        {clamped}
        <span className="gauge__unit">°</span>
      </div>

      {/* 가로 막대 트랙 (전체 그라데이션) */}
      <div
        className="gauge__track"
        style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
      >
        {/* 채워지지 않은 부분을 흰색 반투명으로 덮어 '채운 만큼'만 진하게 */}
        <div
          className="gauge__mask"
          style={{ left: `${clamped}%`, width: `${100 - clamped}%` }}
        />
        {/* 현재 위치 마커 */}
        <div
          className="gauge__marker"
          style={{ left: `${clamped}%`, borderColor: accent }}
        />
      </div>

      {/* 양 끝 라벨 */}
      <div className="gauge__labels">
        <span>0° 얼음</span>
        <span>100° 불꽃</span>
      </div>
    </div>
  );
}
