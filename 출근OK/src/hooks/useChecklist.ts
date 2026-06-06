import { useState, useEffect, useCallback } from 'react';
import type { ChecklistItem, AppState } from '../types';
import { loadAppState, saveAppState } from '../lib/storage';

let idCounter = Date.now();
function genId() {
  return `item_${++idCounter}`;
}

export function useChecklist() {
  const [state, setState] = useState<AppState>(() => loadAppState());

  // 매 분마다 자정 여부 체크
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const today = new Date().toISOString().slice(0, 10);
        if (prev.lastResetDate !== today) {
          const reset: AppState = {
            items: prev.items
              .filter((i) => !i.autoAdded)
              .map((i) => ({ ...i, checked: false })),
            lastResetDate: today,
          };
          saveAppState(reset);
          return reset;
        }
        return prev;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const update = useCallback((next: AppState) => {
    saveAppState(next);
    setState(next);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      update({
        ...state,
        items: state.items.map((i) =>
          i.id === id ? { ...i, checked: !i.checked } : i
        ),
      });
    },
    [state, update]
  );

  const addItem = useCallback(
    (label: string) => {
      if (!label.trim()) return;
      const item: ChecklistItem = {
        id: genId(),
        label: label.trim(),
        checked: false,
        required: false,
      };
      update({ ...state, items: [...state.items, item] });
    },
    [state, update]
  );

  const removeItem = useCallback(
    (id: string) => {
      update({ ...state, items: state.items.filter((i) => i.id !== id) });
    },
    [state, update]
  );

  // 날씨 기반 우산 자동 추가/제거
  const syncUmbrella = useCallback(
    (shouldAdd: boolean) => {
      const hasUmbrella = state.items.some((i) => i.id === 'umbrella');
      if (shouldAdd && !hasUmbrella) {
        const umbrella: ChecklistItem = {
          id: 'umbrella',
          label: '우산',
          checked: false,
          required: false,
          autoAdded: true,
        };
        update({ ...state, items: [umbrella, ...state.items] });
      } else if (!shouldAdd && hasUmbrella) {
        const item = state.items.find((i) => i.id === 'umbrella');
        if (item?.autoAdded) {
          update({ ...state, items: state.items.filter((i) => i.id !== 'umbrella') });
        }
      }
    },
    [state, update]
  );

  // 미세먼지 기반 마스크 자동 추가/제거
  const syncMask = useCallback(
    (shouldAdd: boolean) => {
      const hasMask = state.items.some((i) => i.id === 'mask');
      if (shouldAdd && !hasMask) {
        const mask: ChecklistItem = {
          id: 'mask',
          label: '마스크',
          checked: false,
          required: false,
          autoAdded: true,
        };
        update({ ...state, items: [mask, ...state.items] });
      } else if (!shouldAdd) {
        const item = state.items.find((i) => i.id === 'mask');
        // autoAdded인 경우만 제거 (사용자가 직접 추가한 마스크는 유지)
        if (item?.autoAdded) {
          update({ ...state, items: state.items.filter((i) => i.id !== 'mask') });
        }
      }
    },
    [state, update]
  );

  const allChecked =
    state.items.length > 0 && state.items.every((i) => i.checked);
  const requiredAllChecked =
    state.items.filter((i) => i.required).every((i) => i.checked);
  const checkedCount = state.items.filter((i) => i.checked).length;

  return {
    items: state.items,
    toggle,
    addItem,
    removeItem,
    syncUmbrella,
    syncMask,
    allChecked,
    requiredAllChecked,
    checkedCount,
    total: state.items.length,
  };
}
