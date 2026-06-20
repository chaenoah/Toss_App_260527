export type EmotionKey =
  | 'joy' | 'excited' | 'calm' | 'proud' | 'grateful' | 'love'
  | 'sad' | 'lonely' | 'depressed' | 'angry' | 'irritated' | 'anxious' | 'fearful' | 'empty'
  | 'tired' | 'blank';

export type EmotionGroup = 'positive' | 'negative' | 'neutral';

export interface EmotionMeta {
  key: EmotionKey;
  label: string;
  emoji: string;
  baseColor: string;
  gradient: [string, string];
  group: EmotionGroup;
}

export interface MoodEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  timestamp: number;
  emotion: EmotionKey;
  intensity: 1 | 2 | 3 | 4 | 5;
  memo?: string;
  prescription: {
    color: { hex: string; name: string; description: string };
    song: { title: string; artist: string; reason: string };
    quote: { text: string; author?: string };
    mission: string;
    comfort: string;
  };
}
