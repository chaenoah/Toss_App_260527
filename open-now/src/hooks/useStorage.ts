import { useState, useEffect, useCallback } from 'react';
import { Storage } from '@apps-in-toss/web-framework';

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    Storage.getItem(key).then((raw) => {
      if (raw != null) {
        try {
          setValue(JSON.parse(raw) as T);
        } catch {
          setValue(defaultValue);
        }
      }
    });
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback(
    async (next: T) => {
      await Storage.setItem(key, JSON.stringify(next));
      setValue(next);
    },
    [key],
  );

  const remove = useCallback(async () => {
    await Storage.removeItem(key);
    setValue(defaultValue);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { value, save, remove };
}
