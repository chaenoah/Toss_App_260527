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
import { loadCity, saveCity, loadCommuteTime, saveCommuteTime, loadAlarmEnabled, loadAlarmTime } from './lib/storage';
import { registerSW, scheduleAlarm } from './lib/alarm';
import type { ViewType } from './types';
import './App.css';

export default function App() {
  const {
    items, toggle, addItem, removeItem,
    syncUmbrella, syncMask,
    toggleRequired, moveItem,
    allChecked, checkedCount, total,
  } = useChecklist();

  const [city, setCity] = useState(() => loadCity());
  const { weather, airQuality, loading, error, needsUmbrella, needsMask } = useWeather(city);
  const { streak, markComplete, isMilestone } = useStreak();

  const [view, setView] = useState<ViewType>('home');
  const [showModal, setShowModal] = useState(false);
  const [commuteTime, setCommuteTime] = useState(() => loadCommuteTime());
  const [modalShownToday, setModalShownToday] = useState(() => {
    return localStorage.getItem('modal_shown_date') === new Date().toISOString().slice(0, 10);
  });

  useEffect(() => {
    // Re-register SW and re-schedule alarm on every app open (SW timer lost on browser restart)
    registerSW().then(() => {
      if (loadAlarmEnabled()) {
        scheduleAlarm(loadAlarmTime(), true);
      }
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      syncUmbrella(needsUmbrella);
      syncMask(needsMask);
    }
  }, [needsUmbrella, needsMask, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (allChecked && !modalShownToday) {
      markComplete();
      setShowModal(true);
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('modal_shown_date', today);
      setModalShownToday(true);
    }
  }, [allChecked]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleCityChange(c: string) {
    saveCity(c);
    setCity(c);
  }

  function handleCommuteTimeChange(t: string) {
    setCommuteTime(t);
    saveCommuteTime(t);
  }

  const renderView = () => {
    if (view === 'calendar') {
      return <CalendarView streak={streak} onBack={() => setView('home')} />;
    }

    if (view === 'settings') {
      return (
        <SettingsView
          items={items}
          city={city}
          onBack={() => setView('home')}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onToggleRequired={toggleRequired}
          onMoveItem={moveItem}
          onCityChange={handleCityChange}
          commuteTime={commuteTime}
          onCommuteTimeChange={handleCommuteTimeChange}
        />
      );
    }

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

        <WeatherCard city={city} weather={weather} airQuality={airQuality} loading={loading} error={error} />
        <WeatherTip needsUmbrella={needsUmbrella} needsMask={needsMask} airQuality={airQuality} />

        <Checklist
          items={items}
          onToggle={toggle}
          onRemove={removeItem}
          onAdd={addItem}
          checkedCount={checkedCount}
          total={total}
          allChecked={allChecked}
        />

        <StreakFooter streak={streak.count} onCalendarClick={() => setView('calendar')} />
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
