import { useEffect, useState } from 'react';
import { useChecklist } from './hooks/useChecklist';
import { useWeather } from './hooks/useWeather';
import { useStreak } from './hooks/useStreak';
import { WeatherCard } from './components/WeatherCard';
import { WeatherTip } from './components/WeatherTip';
import { Checklist } from './components/Checklist';
import { StreakFooter } from './components/StreakFooter';
import { CompletionModal } from './components/CompletionModal';
import { CalendarView } from './components/CalendarView';
import { SettingsView } from './components/SettingsView';
import { BottomNav } from './components/BottomNav';
import { loadCommuteTime, saveCommuteTime } from './lib/storage';
import type { ViewType } from './types';
import './App.css';

export default function App() {
  const {
    items, toggle, addItem, removeItem,
    syncUmbrella, syncMask,
    toggleRequired, moveItem,
    allChecked, checkedCount, total,
  } = useChecklist();

  const { city, weather, airQuality, loading, error, needsUmbrella, needsMask } = useWeather();
  const { streak, markComplete, isMilestone } = useStreak();

  const [view, setView] = useState<ViewType>('home');
  const [showModal, setShowModal] = useState(false);
  const [commuteTime, setCommuteTime] = useState(() => loadCommuteTime());
  const [modalShownToday, setModalShownToday] = useState(() => {
    return localStorage.getItem('modal_shown_date') === new Date().toISOString().slice(0, 10);
  });

  // 날씨 로드 후 우산·마스크 자동 추가/제거
  useEffect(() => {
    if (!loading) {
      syncUmbrella(needsUmbrella);
      syncMask(needsMask);
    }
  }, [needsUmbrella, needsMask, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // 전체 체크 완료 시 모달 (오늘 최초 1회)
  useEffect(() => {
    if (allChecked && !modalShownToday) {
      markComplete();
      setShowModal(true);
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('modal_shown_date', today);
      setModalShownToday(true);
    }
  }, [allChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCommuteTimeChange(t: string) {
    setCommuteTime(t);
    saveCommuteTime(t);
  }

  // ── 뷰 렌더 ─────────────────────────────────────────────────────────────────
  const renderView = () => {
    if (view === 'calendar') {
      return (
        <CalendarView
          streak={streak}
          onBack={() => setView('home')}
        />
      );
    }

    if (view === 'settings') {
      return (
        <SettingsView
          items={items}
          onBack={() => setView('home')}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onToggleRequired={toggleRequired}
          onMoveItem={moveItem}
          onCityChange={() => window.location.reload()}
          commuteTime={commuteTime}
          onCommuteTimeChange={handleCommuteTimeChange}
        />
      );
    }

    // 홈 뷰
    return (
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

        <WeatherCard
          city={city}
          weather={weather}
          airQuality={airQuality}
          loading={loading}
          error={error}
        />

        <WeatherTip
          needsUmbrella={needsUmbrella}
          needsMask={needsMask}
          airQuality={airQuality}
        />

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
          onCalendarClick={() => setView('calendar')}
        />
      </div>
    );
  };

  return (
    <div className="app">
      {renderView()}

      <BottomNav current={view} onChange={setView} />

      {showModal && (
        <CompletionModal
          streak={streak.count}
          isMilestone={isMilestone}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
