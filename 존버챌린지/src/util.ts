export function daysSince(startedAt: number, now = Date.now()): number {
  const MS = 24 * 60 * 60 * 1000;
  const start = new Date(startedAt);
  const end = new Date(now);
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.floor((endUTC - startUTC) / MS));
}

export function handTier(days: number): { label: string; emoji: string } {
  if (days < 7) return { label: "신생 손", emoji: "👋" };
  if (days < 30) return { label: "굳은살", emoji: "✊" };
  if (days < 100) return { label: "강철 손", emoji: "🦾" };
  if (days < 300) return { label: "다이아 핸드", emoji: "💎" };
  return { label: "전설의 존버", emoji: "🏆" };
}

export function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
