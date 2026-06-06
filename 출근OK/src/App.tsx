import { useEffect, useState } from 'react';
import { useChecklist } from './hooks/useChecklist';
import { useWeather } from './hooks/useWeather';
import { useStreak } from './hooks/useStreak';
import { WeatherCard } from './components/WeatherCard';
import { WeatherTip } from './components/WeatherTip';
import { Checklist } from './components/Checklist';
import { StreakFooter } from './components/StreakFooter';
import { CompletionModal } from './components/CompletionModal';
import './App.css';

export default function App() {
  const { items, toggle, addItem, removeItem, syncUmbrella, allChecked, checkedCount, total } =
    useChecklist();
  const { city, weather, loading, error, needsUmbrella } = useWeather();
  const { streak, markComplete } = useStreak();

  const [showModal, setShowModal] = useState(false);
  const [modalShownToday, setModalShownToday] = useState(() => {
    return localStorage.getItem('modal_shown_date') === new Date().toISOString().slice(0, 10);
  });

  // 날씨 로드 후 우산 자동 추가/제거
  useEffect(() => {
    if (!loading) syncUmbrella(needsUmbrella);
  }, [needsUmbrella, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // 전체 체크 완료 시 모달 표출 (오늘 최초 1회)
  useEffect(() => {
    if (allChecked && !modalShownToday) {
      markComplete();
      setShowModal(true);
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('modal_shown_date', today);
      setModalShownToday(true);
    }
  }, [allChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <div className="app__inner">
        <header className="app__header">
          <h1 className="app__logo">출근 OK 🫡</h1>
          <span className="app__date">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </span>
        </header>

        <WeatherCard city={city} weather={weather} loading={loading} error={error} />
        <WeatherTip needsUmbrella={needsUmbrella} />

        <Checklist
          items={items}
          onToggle={toggle}
          onRemove={removeItem}
          onAdd={addItem}
          checkedCount={checkedCount}
          total={total}
        />

        <StreakFooter
          streak={streak.count}
          onCalendarClick={() => alert('📅 캘린더는 3단계에서 오픈 예정이에요!')}
        />
      </div>

      {showModal && (
        <CompletionModal streak={streak.count} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
