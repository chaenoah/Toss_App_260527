import { useState, useEffect } from 'react';
import { MainPage } from './pages/MainPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { CalendarPage } from './pages/CalendarPage';
import { WeeklyReportPage } from './pages/WeeklyReportPage';
import { ToastProvider } from './components/Toast';
import { getRecords } from './utils/storage';
import { generatePrescription } from './data/prescriptions';
import { saveRecord } from './utils/storage';
import type { EmotionRecord } from './types';

type Page = 'main' | 'prescription' | 'calendar' | 'weekly';

function isSunday(): boolean {
  return new Date().getDay() === 0;
}

function hasWeekRecords(): boolean {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return getRecords().some(r => new Date(r.date) >= monday);
}

export default function App() {
  const [page, setPage] = useState<Page>('main');
  const [currentRecord, setCurrentRecord] = useState<EmotionRecord | null>(null);

  useEffect(() => {
    if (isSunday() && hasWeekRecords()) {
      setPage('weekly');
    }
  }, []);

  function handleComplete(record: EmotionRecord) {
    setCurrentRecord(record);
    setPage('prescription');
  }

  function handleRetry(record: EmotionRecord) {
    const seed = Date.now();
    const newRx = generatePrescription(record.emotion, record.intensity, record.memo, seed);
    const newRecord: EmotionRecord = { ...record, id: String(seed), prescription: newRx, createdAt: seed };
    saveRecord(newRecord);
    setCurrentRecord(newRecord);
  }

  return (
    <ToastProvider>
      {page === 'main' && (
        <MainPage
          onComplete={handleComplete}
          onCalendar={() => setPage('calendar')}
        />
      )}
      {page === 'prescription' && currentRecord && (
        <PrescriptionPage
          record={currentRecord}
          onBack={() => setPage('main')}
          onRetry={() => handleRetry(currentRecord)}
        />
      )}
      {page === 'calendar' && (
        <CalendarPage
          onBack={() => setPage('main')}
          onViewRecord={record => {
            setCurrentRecord(record);
            setPage('prescription');
          }}
        />
      )}
      {page === 'weekly' && (
        <WeeklyReportPage
          records={getRecords()}
          onClose={() => setPage('main')}
        />
      )}
    </ToastProvider>
  );
}
