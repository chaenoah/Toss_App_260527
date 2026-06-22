import { useRef, useState } from 'react';
import { EMOTION_MAP } from '../data/emotions';
import { saveEntry } from '../utils/storage';
import { generatePrescription } from '../data/prescriptions';
import { haptic, shareImage } from '../utils/bridge';
import { buildShareUrl } from '../utils/sharedLink';
import { useToast } from '../components/Toast';
import type { MoodEntry } from '../types';

interface Props {
  entry: MoodEntry | null;
  onBack: () => void;
  onRetry: (updated: MoodEntry) => void;
  /** When true: viewer is reading someone else's shared prescription — hides save/retry/share. */
  readOnly?: boolean;
}

export function PrescriptionPage({ entry: initialEntry, onBack, onRetry, readOnly = false }: Props) {
  const { show } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [entry, setEntry] = useState<MoodEntry | null>(initialEntry);

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-warm)' }}>
        <div className="text-center space-y-3">
          <p className="text-4xl">💊</p>
          <p className="text-sm" style={{ color: 'var(--ink-secondary)' }}>처방전을 찾을 수 없어요</p>
          <button onClick={onBack} className="text-sm font-semibold underline" style={{ color: 'var(--ink-primary)' }}>
            처음으로
          </button>
        </div>
      </div>
    );
  }

  const meta = EMOTION_MAP[entry.emotion];
  const rx = entry.prescription;
  const intensityLabel = ['', '아주 약한', '약한', '보통의', '강한', '아주 강한'][entry.intensity];

  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    haptic('medium');

    let dataUrl: string | undefined;
    try {
      const { toPng } = await import('html-to-image');
      if (ticketRef.current) dataUrl = await toPng(ticketRef.current, { pixelRatio: 2 });
    } catch { /* ignore */ }

    const authorPart = rx.quote.author ? ` — ${rx.quote.author}` : '';
    const text = [
      '[감정 자판기 처방전]',
      `${meta.emoji} ${intensityLabel} ${meta.label}`,
      '',
      `🎵 ${rx.song.title} — ${rx.song.artist}`,
      `💬 "${rx.quote.text}"${authorPart}`,
      `🎯 ${rx.mission}`,
      `💙 ${rx.comfort}`,
      '',
      '👇 처방전 자세히 보기',
    ].join('\n');

    const url = buildShareUrl(entry);
    const ok = await shareImage('오늘의 처방전', text, dataUrl, url);
    show(ok ? '처방전 링크를 공유했어요 ✨' : '공유 기능을 지원하지 않는 환경이에요');
    setSharing(false);
  }

  function handleSave() {
    haptic('light');
    saveEntry(entry);
    show('처방전이 저장됐어요 💾');
  }

  function handleRetry() {
    haptic('medium');
    const timestamp = Date.now();
    const newRx = generatePrescription(entry.emotion, entry.intensity, entry.memo, timestamp);
    const newEntry: MoodEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp,
      prescription: newRx,
    };
    saveEntry(newEntry);
    setEntry(newEntry);
    onRetry(newEntry);
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'var(--bg-warm)' }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          style={{ color: 'var(--ink-primary)' }}
        >
          ←
        </button>
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--ink-secondary)' }}>
            {readOnly ? '공유된 처방전' : '처방전'}
          </p>
          <h2 className="font-bold text-sm leading-none" style={{ color: 'var(--ink-primary)' }}>
            {readOnly ? '친구가 보낸 감정 처방' : '오늘의 감정 처방'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {/* Ticket */}
        <div ref={ticketRef} className="ticket-enter bg-[#F3F0EA] rounded-3xl overflow-hidden shadow-xl">
          <div className="serrated-top" />

          {/* Header */}
          <div
            className="mx-4 mt-2 mb-4 rounded-2xl p-4 text-center"
            style={{ background: `linear-gradient(135deg, ${meta.gradient[0]}, ${meta.gradient[1]})` }}
          >
            <div className="text-4xl mb-1">{meta.emoji}</div>
            <div className="font-bold text-gray-900 text-lg">{intensityLabel} {meta.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">{entry.date}</div>
            {entry.memo && (
              <div className="mt-2 text-xs text-gray-700 bg-white/50 rounded-xl px-3 py-1.5 italic">
                "{entry.memo}"
              </div>
            )}
          </div>

          {/* Dot divider */}
          <div className="flex items-center gap-1 px-4 mb-4">
            {Array.from({ length: 28 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
            ))}
          </div>

          {/* Sections */}
          <div className="px-4 space-y-4 pb-4">
            <Section icon="🎨" label="오늘의 색">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl shadow-sm flex-shrink-0 border border-white"
                  style={{ backgroundColor: rx.color.hex }}
                />
                <div>
                  <div className="font-bold text-gray-900 text-sm">{rx.color.hex} · {rx.color.name}</div>
                  <div className="text-xs text-gray-500">{rx.color.description}</div>
                </div>
              </div>
            </Section>

            <Divider />

            <Section icon="🎵" label="오늘의 곡">
              <div className="font-bold text-gray-900 text-sm">{rx.song.title}</div>
              <div className="text-xs text-gray-500">{rx.song.artist}</div>
              <div className="text-xs text-gray-400 mt-1 italic">{rx.song.reason}</div>
            </Section>

            <Divider />

            <Section icon="💬" label="오늘의 한 줄">
              <blockquote className="text-sm text-gray-800 leading-relaxed font-medium">
                "{rx.quote.text}"
              </blockquote>
              {rx.quote.author && (
                <div className="text-xs text-gray-400 mt-1">— {rx.quote.author}</div>
              )}
            </Section>

            <Divider />

            <Section icon="🎯" label="오늘의 미션">
              <div className="text-sm text-gray-800 leading-relaxed">{rx.mission}</div>
            </Section>

            <Divider />

            <Section icon="💙" label="오늘의 위로">
              <div className="text-sm text-gray-700 leading-relaxed">{rx.comfort}</div>
            </Section>
          </div>

          {/* Barcode footer */}
          <div className="px-6 pb-4 pt-2">
            <div className="flex gap-0.5 h-8">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    backgroundColor: '#2D2D2D',
                    opacity: ((i * 37 + 13) % 10) > 4 ? 0.8 : 0.2,
                    height: `${60 + ((i * 17 + 7) % 40)}%`,
                    alignSelf: 'flex-end',
                  }}
                />
              ))}
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-1 tracking-widest">
              감정 자판기 MOOD VENDING MACHINE
            </div>
          </div>

          <div className="serrated-bottom" />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-10 pt-2 space-y-2.5">
        {readOnly ? (
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-transform shadow-md"
            style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)' }}
          >
            🎰 나도 처방전 받기
          </button>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 rounded-2xl bg-white font-semibold text-sm shadow-sm active:scale-95 transition-transform"
                style={{ color: 'var(--ink-primary)' }}
              >
                💾 저장
              </button>
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 py-3.5 rounded-2xl bg-white font-semibold text-sm shadow-sm active:scale-95 transition-transform disabled:opacity-40"
                style={{ color: 'var(--ink-primary)' }}
              >
                {sharing ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <span className="shimmer inline-block w-4 h-4 rounded bg-gray-200" />
                    공유 중
                  </span>
                ) : '📤 공유'}
              </button>
            </div>
            <button
              onClick={handleRetry}
              className="w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-95 transition-transform shadow-md"
              style={{ background: 'linear-gradient(135deg, #2D2D2D 0%, #1A1A1A 100%)' }}
            >
              🔄 다른 처방 받기
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-dashed border-gray-300" />;
}
