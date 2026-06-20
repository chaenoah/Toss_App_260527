import { useRef, useState } from 'react';
import { EMOTION_MAP } from '../data/emotions';
import { saveEntry } from '../utils/storage';
import { haptic, shareImage } from '../utils/bridge';
import { useToast } from '../components/Toast';
import type { MoodEntry } from '../types';

interface Props {
  entry: MoodEntry;
  onBack: () => void;
  onRetry: () => void;
}

export function PrescriptionPage({ entry, onBack, onRetry }: Props) {
  const { show } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

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
      `🎨 ${rx.color.hex} ${rx.color.name} — ${rx.color.description}`,
      `🎵 ${rx.song.title} — ${rx.song.artist}`,
      `💬 "${rx.quote.text}"${authorPart}`,
      `🎯 ${rx.mission}`,
      `💙 ${rx.comfort}`,
    ].join('\n');

    const ok = await shareImage('오늘의 처방전', text, dataUrl);
    show(ok ? '처방전을 공유했어요 ✨' : '공유 기능을 지원하지 않는 환경이에요');
    setSharing(false);
  }

  function handleSave() {
    haptic('light');
    saveEntry(entry);
    show('처방전이 저장됐어요 💾');
  }

  function handleRetry() {
    haptic('medium');
    onRetry();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600">
          ←
        </button>
        <h2 className="font-bold text-gray-900">오늘의 처방전</h2>
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
      <div className="px-4 pb-10 pt-2 space-y-2">
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 rounded-2xl bg-white text-gray-800 font-semibold text-sm shadow-sm active:scale-95 transition-transform"
          >
            💾 저장하기
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex-1 py-3.5 rounded-2xl bg-white text-gray-800 font-semibold text-sm shadow-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {sharing ? '공유 중...' : '📤 공유하기'}
          </button>
        </div>
        <button
          onClick={handleRetry}
          className="w-full py-3.5 rounded-2xl bg-gray-900 text-white font-semibold text-sm active:scale-95 transition-transform"
        >
          🔄 다시 받기
        </button>
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
