import { useState, useCallback, createContext, useContext, useRef } from 'react';

interface ToastItem { id: number; message: string }
interface ToastCtx { show: (msg: string) => void }

const Ctx = createContext<ToastCtx>({ show: () => {} });

export function useToast() { return useContext(Ctx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string) => {
    const id = ++counter.current;
    setToasts(t => [...t, { id, message }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  }, []);

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className="fade-up bg-gray-800 text-white text-sm px-5 py-2.5 rounded-full shadow-lg"
          >
            {t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
