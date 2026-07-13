import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SlotMachineScreen } from "./screens/SlotMachineScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { RecoveryModal } from "./components/RecoveryModal";
import { getFortune, type Fortune } from "./logic/fortuneEngine";
import {
  commitToday,
  hasDrawnToday,
  isBroken,
  loadStreak,
  newlyEarnedBadge,
  recoverStreak,
  type StreakRecord,
} from "./logic/streakManager";
import { useRewardAd } from "./hooks/useRewardAd";
import { dateKey } from "./utils/date";
import { loadItem, saveItem } from "./sdk";
import { track } from "./utils/eventTracking";

const BIRTH_KEY = "birthdate";

type Phase = "loading" | "onboarding" | "home" | "slot" | "result";

function App() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [birth, setBirth] = useState<string | null>(null);
  const [record, setRecord] = useState<StreakRecord>({ lastDate: "", streak: 0 });
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);

  const { showRewardedAd } = useRewardAd();

  // 초기 로드: 생년월일 + streak 불러오기, 끊긴 streak면 복구 모달 노출
  useEffect(() => {
    let alive = true;
    (async () => {
      track("app_open");
      const [savedBirth, rec] = await Promise.all([loadItem(BIRTH_KEY), loadStreak()]);
      if (!alive) return;
      setRecord(rec);
      if (savedBirth) {
        setBirth(savedBirth);
        setPhase("home");
        if (isBroken(rec) && !hasDrawnToday(rec)) {
          setShowRecovery(true);
        }
      } else {
        setPhase("onboarding");
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleOnboard = useCallback(async (b: string) => {
    await saveItem(BIRTH_KEY, b);
    track("onboarding_completed");
    setBirth(b);
    setPhase("home");
  }, []);

  const startDraw = useCallback(() => setPhase("slot"), []);

  const finishDraw = useCallback(async () => {
    if (!birth) return;
    const today = dateKey();
    const f = getFortune(birth, today);
    setFortune(f);
    const prevStreak = record.streak;
    const next = await commitToday(record, today);
    setRecord(next);
    const badge = newlyEarnedBadge(prevStreak, next.streak);
    setNewBadge(badge);
    track("result_generated", { score: f.score, sipsin: f.sipsin, streak: next.streak });
    setPhase("result");
  }, [birth, record]);

  const goHome = useCallback(() => setPhase("home"), []);

  // 리워드 광고 시청 → streak 복구
  const handleRecover = useCallback(async (): Promise<boolean> => {
    const rewarded = await showRewardedAd();
    if (!rewarded) return false;
    const bridged = await recoverStreak(record);
    setRecord(bridged);
    track("streak_recovered", { streak: bridged.streak });
    setShowRecovery(false);
    return true;
  }, [record, showRewardedAd]);

  switch (phase) {
    case "onboarding":
      return <OnboardingScreen onComplete={handleOnboard} />;
    case "home":
      return (
        <>
          <HomeScreen
            streak={record.streak}
            drawnToday={hasDrawnToday(record)}
            onDraw={startDraw}
          />
          {showRecovery && (
            <RecoveryModal
              streak={record.streak}
              onRecover={handleRecover}
              onDismiss={() => setShowRecovery(false)}
            />
          )}
        </>
      );
    case "slot":
      return <SlotMachineScreen onDone={finishDraw} />;
    case "result":
      return fortune ? (
        <ResultScreen
          fortune={fortune}
          streak={record.streak}
          newBadge={newBadge}
          onHome={goHome}
        />
      ) : null;
    default:
      return (
        <div className="screen center">
          <div className="loading">🪙</div>
        </div>
      );
  }
}

export default App;
