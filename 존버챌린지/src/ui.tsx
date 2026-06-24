import type { ReactNode, CSSProperties, ButtonHTMLAttributes } from "react";

export const tokens = {
  blue: "#3182F6",
  blueBg: "#E8F3FF",
  grey900: "#191F28",
  grey700: "#4E5968",
  grey600: "#6B7684",
  grey500: "#8B95A1",
  grey200: "#E5E8EB",
  grey100: "#F2F4F6",
  grey50: "#F7F8FA",
  red: "#F04452",
};

export function TopBar({
  title,
  subtitle,
  left,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
}) {
  return (
    <div style={{ padding: "16px 24px 8px" }}>
      {left && <div style={{ marginBottom: 8 }}>{left}</div>}
      <div style={{ fontSize: 24, fontWeight: 800, color: tokens.grey900, letterSpacing: -0.5 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 15, color: tokens.grey600, marginTop: 6 }}>{subtitle}</div>
      )}
    </div>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "weak" | "danger" | "ghost";
};

export function Btn({ variant = "primary", style, children, ...rest }: BtnProps) {
  const base: CSSProperties = {
    border: 0,
    borderRadius: 12,
    padding: "16px 20px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    width: "100%",
    transition: "opacity 0.15s",
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: tokens.blue, color: "#fff" },
    weak: { background: tokens.grey100, color: tokens.grey900 },
    danger: { background: "#FFF0F1", color: tokens.red },
    ghost: { background: "transparent", color: tokens.grey700 },
  };
  return (
    <button
      {...rest}
      style={{
        ...base,
        ...variants[variant],
        opacity: rest.disabled ? 0.4 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px)",
        background: "linear-gradient(to top, #fff 70%, rgba(255,255,255,0))",
        display: "flex",
        gap: 8,
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {children}
    </div>
  );
}

export function ConfirmModal({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  primaryVariant = "primary",
  onPrimary,
  onSecondary,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryVariant?: "primary" | "danger";
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onSecondary}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 24px",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800, color: tokens.grey900, marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 15, color: tokens.grey600, lineHeight: 1.5, marginBottom: 24 }}>
          {description}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn variant={primaryVariant} onClick={onPrimary}>
            {primaryLabel}
          </Btn>
          <Btn variant="ghost" onClick={onSecondary}>
            {secondaryLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}
