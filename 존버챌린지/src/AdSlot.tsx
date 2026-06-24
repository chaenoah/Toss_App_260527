import { useEffect, useRef, useState } from "react";
import { attachBanner } from "./ads";
import { tokens } from "./ui";

export function AdSlot() {
  const ref = useRef<HTMLDivElement>(null);
  const [attached, setAttached] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const destroy = attachBanner(ref.current);
    if (destroy) {
      setAttached(true);
      return destroy;
    }
  }, []);

  return (
    <div
      aria-label="광고"
      role="complementary"
      style={{
        margin: "8px 16px 0",
        minHeight: 64,
        borderRadius: 12,
        background: attached ? "transparent" : tokens.grey50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: tokens.grey500,
        fontSize: 12,
        border: attached ? "none" : `1px dashed ${tokens.grey200}`,
      }}
    >
      <div ref={ref} style={{ width: "100%" }} />
      {!attached && <span aria-hidden="true">광고 자리</span>}
    </div>
  );
}
