import { useState, useEffect } from 'react';
import { MainPage } from './pages/MainPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { CalendarPage } from './pages/CalendarPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { ToastProvider } from './components/Toast';
import { getWeekEntries, getEntries, saveEntry } from './utils/storage';
import { generatePrescription } from './data/prescriptions';
import type { MoodEntry } from './types';

type Page = 'main' | 'prescription' | 'calendar' | 'weekly';

export default function App() {
  const [page, setPage] = useState<Page>('main');
  const [currentEntry, setCurrentEntry] = useState<MoodEntry | null>(null);

  useEffect(() => {
    if (new Date().getDay() === 0 && getWeekEntries().length > 0) {
      setPage('weekly');
    }
  }, []);

  function handleComplete(entry: MoodEntry) {
    setCurrentEntry(entry);
    setPage('prescription');
  }

  function handleRetry() {
    if (!currentEntry) return;
    const timestamp = Date.now();
    const newRx = generatePrescription(currentEntry.emotion, currentEntry.intensity, currentEntry.memo, timestamp);
    const newEntry: MoodEntry = {
      ...currentEntry,
      id: crypto.randomUUID(),
      timestamp,
      prescription: newRx,
    };
    saveEntry(newEntry);
    setCurrentEntry(newEntry);
  }

  return (
    <ToastProvider>
      {page === 'main' && (
        <MainPage
          onComplete={handleComplete}
          onCalendar={() => setPage('calendar')}
        />
      )}
      {page === 'prescription' && currentEntry && (
        <PrescriptionPage
          entry={currentEntry}
          onBack={() => setPage('main')}
          onRetry={handleRetry}
        />
      )}
      {page === 'calendar' && (
        <CalendarPage
          onBack={() => setPage('main')}
          onViewEntry={entry => {
            setCurrentEntry(entry);
            setPage('prescription');
          }}
        />
      )}
      {page === 'weekly' && (
        <WeeklyReportPage onClose={() => setPage('main')} />
      )}
    </ToastProvider>
  );
}
