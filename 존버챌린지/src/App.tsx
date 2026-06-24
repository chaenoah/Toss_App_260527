import { useEffect, useState } from "react";
import "./App.css";
import type { Challenge } from "./types";
import { loadActive, pushGravestone, saveActive } from "./storage";
import { newId } from "./util";
import { ListScreen } from "./screens/ListScreen";
import { NewScreen } from "./screens/NewScreen";
import { DetailScreen } from "./screens/DetailScreen";

type Screen =
  | { kind: "list" }
  | { kind: "new" }
  | { kind: "detail"; id: string };

function App() {
  const [challenges, setChallenges] = useState<Challenge[]>(() => loadActive());
  const [screen, setScreen] = useState<Screen>({ kind: "list" });

  useEffect(() => {
    saveActive(challenges);
  }, [challenges]);

  if (screen.kind === "new") {
    return (
      <NewScreen
        excludeTickers={new Set(challenges.map((c) => c.ticker))}
        onBack={() => setScreen({ kind: "list" })}
        onCommit={(stock) => {
          const now = Date.now();
          const c: Challenge = {
            id: newId(),
            ticker: stock.ticker,
            name: stock.name,
            startedAt: now,
            createdAt: now,
          };
          setChallenges((prev) => [...prev, c]);
          setScreen({ kind: "detail", id: c.id });
        }}
      />
    );
  }

  if (screen.kind === "detail") {
    const c = challenges.find((x) => x.id === screen.id);
    if (!c) {
      setScreen({ kind: "list" });
      return null;
    }
    return (
      <DetailScreen
        challenge={c}
        onBack={() => setScreen({ kind: "list" })}
        onSurrender={() => {
          pushGravestone({ ...c, endedAt: Date.now(), reason: "sold" });
          setChallenges((prev) => prev.filter((x) => x.id !== c.id));
          setScreen({ kind: "list" });
        }}
      />
    );
  }

  return (
    <ListScreen
      challenges={challenges}
      onOpenNew={() => setScreen({ kind: "new" })}
      onOpenDetail={(id) => setScreen({ kind: "detail", id })}
    />
  );
}

export default App;
