import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { SlotMachineScreen } from "./screens/SlotMachineScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { getFortune, type Fortune } from "./logic/fortuneEngine";
import {
  commitToday,
  hasDrawnToday,
  loadStreak,
  type StreakRecord,
} from "./logic/streakManager";
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

  // 초기 로드: 생년월일 + streak 불러오기
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
    const next = await commitToday(record, today);
    setRecord(next);
    track("result_generated", { score: f.score, sipsin: f.sipsin, streak: next.streak });
    setPhase("result");
  }, [birth, record]);

  const goHome = useCallback(() => setPhase("home"), []);

  switch (phase) {
    case "onboarding":
      return <OnboardingScreen onComplete={handleOnboard} />;
    case "home":
      return (
        <HomeScreen
          streak={record.streak}
          drawnToday={hasDrawnToday(record)}
          onDraw={startDraw}
        />
      );
    case "slot":
      return <SlotMachineScreen onDone={finishDraw} />;
    case "result":
      return fortune ? (
        <ResultScreen fortune={fortune} streak={record.streak} onHome={goHome} />
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
