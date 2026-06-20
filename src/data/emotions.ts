import type { Emotion } from '../types';

export const EMOTIONS: Emotion[] = [
  // 긍정군
  { id: 'joy',       label: '기쁨',   emoji: '😊', group: 'positive', gradientFrom: '#FFE082', gradientTo: '#FFCC02', textColor: '#7A5800' },
  { id: 'excited',   label: '설렘',   emoji: '🥰', group: 'positive', gradientFrom: '#F8BBD0', gradientTo: '#F06292', textColor: '#880E4F' },
  { id: 'calm',      label: '평온',   emoji: '😌', group: 'positive', gradientFrom: '#B3E5FC', gradientTo: '#4FC3F7', textColor: '#01579B' },
  { id: 'proud',     label: '뿌듯함', emoji: '🌟', group: 'positive', gradientFrom: '#E8F5E9', gradientTo: '#81C784', textColor: '#1B5E20' },
  { id: 'grateful',  label: '감사함', emoji: '🙏', group: 'positive', gradientFrom: '#FFF9C4', gradientTo: '#F9A825', textColor: '#6D4C00' },
  { id: 'love',      label: '사랑',   emoji: '❤️', group: 'positive', gradientFrom: '#FFCDD2', gradientTo: '#EF5350', textColor: '#7F0000' },

  // 부정군
  { id: 'sad',       label: '슬픔',   emoji: '😢', group: 'negative', gradientFrom: '#CFD8DC', gradientTo: '#78909C', textColor: '#1A237E' },
  { id: 'lonely',    label: '외로움', emoji: '🌧', group: 'negative', gradientFrom: '#D1C4E9', gradientTo: '#7E57C2', textColor: '#1A0060' },
  { id: 'depressed', label: '우울',   emoji: '😞', group: 'negative', gradientFrom: '#B0BEC5', gradientTo: '#546E7A', textColor: '#102027' },
  { id: 'angry',     label: '분노',   emoji: '😡', group: 'negative', gradientFrom: '#FFCCBC', gradientTo: '#FF5722', textColor: '#5D0000' },
  { id: 'annoyed',   label: '짜증',   emoji: '😤', group: 'negative', gradientFrom: '#FFE0B2', gradientTo: '#FB8C00', textColor: '#4A1800' },
  { id: 'anxious',   label: '불안',   emoji: '😰', group: 'negative', gradientFrom: '#E1BEE7', gradientTo: '#AB47BC', textColor: '#38006B' },
  { id: 'afraid',    label: '두려움', emoji: '😨', group: 'negative', gradientFrom: '#C8E6C9', gradientTo: '#388E3C', textColor: '#1B2A1B' },
  { id: 'empty',     label: '허무',   emoji: '🌫', group: 'negative', gradientFrom: '#ECEFF1', gradientTo: '#90A4AE', textColor: '#263238' },

  // 중립군
  { id: 'tired',     label: '피곤함', emoji: '😴', group: 'neutral',  gradientFrom: '#F5F5F5', gradientTo: '#BDBDBD', textColor: '#212121' },
  { id: 'blank',     label: '멍함',   emoji: '😶', group: 'neutral',  gradientFrom: '#E3F2FD', gradientTo: '#90CAF9', textColor: '#0D2137' },
];
