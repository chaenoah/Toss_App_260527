import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { MainPage } from './pages/MainPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { CalendarPage } from './pages/CalendarPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { ToastProvider } from './components/Toast';
import { ScrollToTop } from './components/ScrollToTop';
import { getWeekEntries } from './utils/storage';
import { decodeEntry } from './utils/sharedLink';
import type { MoodEntry } from './types';

// Persist prescription result across navigation via sessionStorage
function saveResult(entry: MoodEntry) {
  sessionStorage.setItem('last_entry', JSON.stringify(entry));
}
function loadResult(): MoodEntry | null {
  try {
    const raw = sessionStorage.getItem('last_entry');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect to weekly report on Sunday if entries exist
  useEffect(() => {
    if (location.pathname === '/' && new Date().getDay() === 0 && getWeekEntries().length > 0) {
      navigate('/report');
    }
  }, []);

  function handleComplete(entry: MoodEntry) {
    saveResult(entry);
    navigate('/result');
  }

  function handleRetry(entry: MoodEntry) {
    saveResult(entry);
  }

  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route
        path="/"
        element={
          <MainPage
            onComplete={handleComplete}
            onCalendar={() => navigate('/history')}
            onSettings={() => navigate('/settings')}
          />
        }
      />
      <Route
        path="/result"
        element={
          <PrescriptionPage
            entry={loadResult()}
            onBack={() => navigate('/')}
            onRetry={handleRetry}
          />
        }
      />
      <Route
        path="/history"
        element={
          <CalendarPage
            onBack={() => navigate('/')}
            onViewEntry={entry => {
              saveResult(entry);
              navigate('/result');
            }}
          />
        }
      />
      <Route
        path="/report"
        element={<WeeklyReportPage onClose={() => navigate('/')} />}
      />
      <Route
        path="/settings"
        element={<SettingsPage onBack={() => navigate('/')} />}
      />
      <Route
        path="/shared/:data"
        element={<SharedRoute onBack={() => navigate('/')} onRetry={() => {}} />}
      />
    </Routes>
    </>
  );
}

function SharedRoute({ onBack, onRetry }: { onBack: () => void; onRetry: (e: MoodEntry) => void }) {
  const { data } = useParams<{ data: string }>();
  const entry = data ? decodeEntry(data) : null;
  return <PrescriptionPage entry={entry} onBack={onBack} onRetry={onRetry} readOnly />;
}

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
}
