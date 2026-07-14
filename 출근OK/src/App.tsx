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
import { StreakInsuranceCard } from './components/StreakInsuranceCard';
import { useRewardAd } from './hooks/useRewardAd';
import { useInterstitialAd } from './hooks/useInterstitialAd';
import { useStreakInsurance } from './hooks/useStreakInsurance';
import { usePromotion } from './hooks/usePromotion';
import { loadCity, saveCity, loadCommuteTime, saveCommuteTime, loadAlarmEnabled, loadAlarmTime } from './lib/storage';
import { registerSW, scheduleAlarm } from './lib/alarm';
import { trackEvent } from './lib/adTracking';
import type { ViewType } from './types';
import './App.css';

export default function App() {
  const {
    items, toggle, addItem, removeItem,
    syncUmbrella, syncMask,
    toggleRequired, moveItem,
    requiredAllChecked, requiredChecked, requiredTotal,
  } = useChecklist();

  const [city, setCity] = useState(() => loadCity());
  const { weather, airQuality, loading, error, needsUmbrella, needsMask } = useWeather(city);
  const { streak, markComplete, restoreStreak, isMilestone } = useStreak();
  const { unlocked, watching, pointMsg, notReady, watchAd } = useRewardAd();
  const { showIfReady } = useInterstitialAd(); // 앱 진입 시 전면광고 프리로드 + 노출 제어
  const insurance = useStreakInsurance(streak, restoreStreak); // 스트릭 보험
  const checkinPromo = usePromotion('checkin'); // 출근 체크리스트 완료 프로모션(10원)

  const [view, setView] = useState<ViewType>('home');
  const [showModal, setShowModal] = useState(false);
  const [commuteTime, setCommuteTime] = useState(() => loadCommuteTime());
  const [modalShownToday, setModalShownToday] = useState(() => {
    return localStorage.getItem('modal_shown_date') === new Date().toISOString().slice(0, 10);
  });

  useEffect(() => {
    registerSW().then(() => {
      if (loadAlarmEnabled()) scheduleAlarm(loadAlarmTime(), true);
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      syncUmbrella(needsUmbrella);
      syncMask(needsMask);
    }
  }, [needsUmbrella, needsMask, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (requiredAllChecked && !modalShownToday) {
      markComplete();
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem('modal_shown_date', today);
      setModalShownToday(true);

      // 체크리스트 완료 도달 트래킹 (전면광고 노출 퍼널의 상단 지표)
      trackEvent('checklist_completed', { streak: streak.count });

      // 출근 체크 완료 프로모션 지급 (전면광고와 병렬, 중복/실패는 조용히 처리)
      void checkinPromo.claim();

      // 전면광고 노출 시도(로드돼 있으면 즉시, 아니면 최대 800ms 대기 후 스킵).
      // 광고 흐름이 끝나거나 스킵되면 완료 모달을 띄움.
      showIfReady().finally(() => setShowModal(true));
    }
  }, [requiredAllChecked]); // eslint-disable-line react-hooks/exhaustive-deps

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

        <WeatherCard
          city={city}
          weather={weather}
          airQuality={airQuality}
          loading={loading}
          error={error}
          unlocked={unlocked}
          watching={watching}
          pointMsg={pointMsg}
          notReady={notReady}
          onWatchAd={watchAd}
        />
        <WeatherTip needsUmbrella={needsUmbrella} needsMask={needsMask} airQuality={airQuality} />

        {insurance.canUse && (
          <StreakInsuranceCard
            streak={streak.count}
            usesThisMonth={insurance.usesThisMonth}
            monthlyLimit={insurance.monthlyLimit}
            watching={insurance.watching}
            onProtect={insurance.watchToProtect}
          />
        )}

        <Checklist
          items={items}
          onToggle={toggle}
          onRemove={removeItem}
          onAdd={addItem}
          checkedCount={requiredChecked}
          total={requiredTotal}
          done={requiredAllChecked}
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
          promoStatus={checkinPromo.status}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
