import type { Challenge, EndedChallenge } from "./types";

const ACTIVE_KEY = "jonber.active.v1";
const GRAVE_KEY = "jonber.grave.v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadActive(): Challenge[] {
  return read<Challenge[]>(ACTIVE_KEY, []);
}

export function saveActive(items: Challenge[]) {
  write(ACTIVE_KEY, items);
}

export function loadGraveyard(): EndedChallenge[] {
  return read<EndedChallenge[]>(GRAVE_KEY, []);
}

export function pushGravestone(ended: EndedChallenge) {
  const list = loadGraveyard();
  list.unshift(ended);
  write(GRAVE_KEY, list);
}
