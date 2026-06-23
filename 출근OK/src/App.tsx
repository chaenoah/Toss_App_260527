import { useEffect, useRef, useState } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-bridge';
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

const AD_GROUP_ID = 'ait.v2.live.8898421fe1154a09';

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
  const adLoaded = useRef(false);

  useEffect(() => {
    registerSW().then(() => {
      if (loadAlarmEnabled()) scheduleAlarm(loadAlarmTime(), true);
    });

    // 앱 진입 시 전면광고 미리 로드
    if (loadFullScreenAd.isSupported()) {
      loadFullScreenAd({
        onEvent: () => { adLoaded.current = true; },
        onError: () => {},
        options: { adGroupId: AD_GROUP_ID },
      });
    }
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
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('modal_shown_date', today);
      setModalShownToday(true);

      // 전면광고 로드 완료 시 노출, 아니면 바로 완료 모달
      if (adLoaded.current && showFullScreenAd.isSupported()) {
        showFullScreenAd({
          onEvent: (e) => {
            if (e.type === 'dismissed' || e.type === 'failedToShow') setShowModal(true);
          },
          onError: () => setShowModal(true),
          options: { adGroupId: AD_GROUP_ID },
        });
      } else {
        setShowModal(true);
      }
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
