import type { EmotionMeta } from '../types';

export const EMOTIONS: EmotionMeta[] = [
  // 긍정군
  { key: 'joy',       label: '기쁨',   emoji: '😊', group: 'positive', baseColor: '#FFD700', gradient: ['#FFE082', '#FFCC02'] },
  { key: 'excited',   label: '설렘',   emoji: '🥰', group: 'positive', baseColor: '#F06292', gradient: ['#F8BBD0', '#F06292'] },
  { key: 'calm',      label: '평온',   emoji: '😌', group: 'positive', baseColor: '#4FC3F7', gradient: ['#B3E5FC', '#4FC3F7'] },
  { key: 'proud',     label: '뿌듯함', emoji: '🌟', group: 'positive', baseColor: '#81C784', gradient: ['#E8F5E9', '#81C784'] },
  { key: 'grateful',  label: '감사함', emoji: '🙏', group: 'positive', baseColor: '#F9A825', gradient: ['#FFF9C4', '#F9A825'] },
  { key: 'love',      label: '사랑',   emoji: '❤️', group: 'positive', baseColor: '#EF5350', gradient: ['#FFCDD2', '#EF5350'] },

  // 부정군
  { key: 'sad',       label: '슬픔',   emoji: '😢', group: 'negative', baseColor: '#78909C', gradient: ['#CFD8DC', '#78909C'] },
  { key: 'lonely',    label: '외로움', emoji: '🌧', group: 'negative', baseColor: '#7E57C2', gradient: ['#D1C4E9', '#7E57C2'] },
  { key: 'depressed', label: '우울',   emoji: '😞', group: 'negative', baseColor: '#546E7A', gradient: ['#B0BEC5', '#546E7A'] },
  { key: 'angry',     label: '분노',   emoji: '😡', group: 'negative', baseColor: '#FF5722', gradient: ['#FFCCBC', '#FF5722'] },
  { key: 'irritated', label: '짜증',   emoji: '😤', group: 'negative', baseColor: '#FB8C00', gradient: ['#FFE0B2', '#FB8C00'] },
  { key: 'anxious',   label: '불안',   emoji: '😰', group: 'negative', baseColor: '#AB47BC', gradient: ['#E1BEE7', '#AB47BC'] },
  { key: 'fearful',   label: '두려움', emoji: '😨', group: 'negative', baseColor: '#388E3C', gradient: ['#C8E6C9', '#388E3C'] },
  { key: 'empty',     label: '허무',   emoji: '🌫', group: 'negative', baseColor: '#90A4AE', gradient: ['#ECEFF1', '#90A4AE'] },

  // 중립군
  { key: 'tired',     label: '피곤함', emoji: '😴', group: 'neutral',  baseColor: '#BDBDBD', gradient: ['#F5F5F5', '#BDBDBD'] },
  { key: 'blank',     label: '멍함',   emoji: '😶', group: 'neutral',  baseColor: '#90CAF9', gradient: ['#E3F2FD', '#90CAF9'] },
];

export const EMOTION_MAP: Record<string, EmotionMeta> = Object.fromEntries(
  EMOTIONS.map(e => [e.key, e])
);
