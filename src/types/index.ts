export type EmotionGroup = 'positive' | 'negative' | 'neutral';

export interface Emotion {
  id: string;
  label: string;
  emoji: string;
  group: EmotionGroup;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
}

export interface Prescription {
  color: { hex: string; description: string };
  song: { title: string; artist: string; reason: string };
  quote: { text: string; author: string };
  mission: string;
  comfort: string;
}

export interface EmotionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  emotion: Emotion;
  intensity: number; // 1-5
  memo: string;
  prescription: Prescription;
  createdAt: number;
}
