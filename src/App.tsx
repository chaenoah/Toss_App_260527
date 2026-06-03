import { useEffect, useRef } from "react";
import { initGame } from "./game";
import "./App.css";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      initGame(containerRef.current);
    }
  }, []);

  return <div ref={containerRef} id="game-root" />;
}

export default App;
