import type { Pharmacy, Hospital, EmergencyRoom } from '../types';

export const DUMMY_PHARMACIES: Pharmacy[] = [
  {
    id: 'p1', category: 'pharmacy', name: '광산약국',
    address: '광주 광산구 수완로 12', phone: '062-960-1234',
    lat: 35.1796, lng: 126.8129, distance: 180,
    isOpenNow: true, nightCare: false,
    hours: { mon: { open: '09:00', close: '21:00' }, tue: { open: '09:00', close: '21:00' }, wed: { open: '09:00', close: '21:00' }, thu: { open: '09:00', close: '21:00' }, fri: { open: '09:00', close: '21:00' }, sat: { open: '09:00', close: '18:00' } },
  },
  {
    id: 'p2', category: 'pharmacy', name: '수완온누리약국',
    address: '광주 광산구 장신로 45', phone: '062-960-5678',
    lat: 35.1812, lng: 126.8143, distance: 320,
    isOpenNow: true, nightCare: true,
    hours: { mon: { open: '08:30', close: '22:00' }, tue: { open: '08:30', close: '22:00' }, wed: { open: '08:30', close: '22:00' }, thu: { open: '08:30', close: '22:00' }, fri: { open: '08:30', close: '22:00' }, sat: { open: '09:00', close: '19:00' }, sun: { open: '10:00', close: '16:00' } },
  },
  {
    id: 'p3', category: 'pharmacy', name: '하나로약국',
    address: '광주 광산구 임방울대로 89', phone: '062-961-2222',
    lat: 35.1774, lng: 126.8097, distance: 540,
    isOpenNow: false, nightCare: false,
    hours: { mon: { open: '09:00', close: '19:00' }, tue: { open: '09:00', close: '19:00' }, wed: { open: '09:00', close: '19:00' }, thu: { open: '09:00', close: '19:00' }, fri: { open: '09:00', close: '19:00' } },
  },
  {
    id: 'p4', category: 'pharmacy', name: '건강플러스약국',
    address: '광주 광산구 월계로 22', phone: '062-962-3344',
    lat: 35.1830, lng: 126.8160, distance: 720,
    isOpenNow: true, nightCare: false,
    hours: { mon: { open: '09:00', close: '21:00' }, tue: { open: '09:00', close: '21:00' }, wed: { open: '09:00', close: '21:00' }, thu: { open: '09:00', close: '21:00' }, fri: { open: '09:00', close: '21:00' }, sat: { open: '09:00', close: '17:00' } },
  },
  {
    id: 'p5', category: 'pharmacy', name: '신세계약국',
    address: '광주 광산구 상무대로 501', phone: '062-963-5566',
    lat: 35.1750, lng: 126.8070, distance: 980,
    isOpenNow: false, nightCare: false,
    hours: { mon: { open: '09:00', close: '18:30' }, tue: { open: '09:00', close: '18:30' }, wed: { open: '09:00', close: '18:30' }, thu: { open: '09:00', close: '18:30' }, fri: { open: '09:00', close: '18:30' } },
  },
];

export const DUMMY_HOSPITALS: Hospital[] = [
  {
    id: 'h1', category: 'hospital', name: '광산나눔의원',
    address: '광주 광산구 수완로 56', phone: '062-970-1001',
    lat: 35.1800, lng: 126.8135, distance: 250,
    isOpenNow: true, hasEmergency: false,
    departments: ['내과', '소아청소년과'],
    hours: { mon: { open: '09:00', close: '18:00' }, tue: { open: '09:00', close: '18:00' }, wed: { open: '09:00', close: '13:00' }, thu: { open: '09:00', close: '18:00' }, fri: { open: '09:00', close: '18:00' }, sat: { open: '09:00', close: '13:00' } },
  },
  {
    id: 'h2', category: 'hospital', name: '수완연세병원',
    address: '광주 광산구 장신로 100', phone: '062-970-2002',
    lat: 35.1820, lng: 126.8150, distance: 410,
    isOpenNow: true, hasEmergency: true,
    departments: ['내과', '외과', '정형외과', '응급의학과'],
    hours: { mon: { open: '08:30', close: '17:30' }, tue: { open: '08:30', close: '17:30' }, wed: { open: '08:30', close: '17:30' }, thu: { open: '08:30', close: '17:30' }, fri: { open: '08:30', close: '17:30' } },
  },
  {
    id: 'h3', category: 'hospital', name: '광산가정의학과의원',
    address: '광주 광산구 임방울대로 130', phone: '062-971-3003',
    lat: 35.1770, lng: 126.8090, distance: 600,
    isOpenNow: false, hasEmergency: false,
    departments: ['가정의학과', '내과'],
    hours: { mon: { open: '09:00', close: '18:00' }, tue: { open: '09:00', close: '18:00' }, wed: { open: '09:00', close: '13:00' }, thu: { open: '09:00', close: '18:00' }, fri: { open: '09:00', close: '18:00' } },
  },
  {
    id: 'h4', category: 'hospital', name: '첨단한양병원',
    address: '광주 광산구 첨단과기로 200', phone: '062-972-4004',
    lat: 35.1840, lng: 126.8170, distance: 850,
    isOpenNow: true, hasEmergency: false,
    departments: ['정형외과', '신경외과', '재활의학과'],
    hours: { mon: { open: '09:00', close: '18:00' }, tue: { open: '09:00', close: '18:00' }, wed: { open: '09:00', close: '18:00' }, thu: { open: '09:00', close: '18:00' }, fri: { open: '09:00', close: '18:00' }, sat: { open: '09:00', close: '13:00' } },
  },
  {
    id: 'h5', category: 'hospital', name: '수완이비인후과',
    address: '광주 광산구 월계로 78', phone: '062-973-5005',
    lat: 35.1760, lng: 126.8110, distance: 1100,
    isOpenNow: false, hasEmergency: false,
    departments: ['이비인후과', '알레르기내과'],
    hours: { mon: { open: '09:00', close: '18:30' }, tue: { open: '09:00', close: '18:30' }, wed: { open: '09:00', close: '13:00' }, thu: { open: '09:00', close: '18:30' }, fri: { open: '09:00', close: '18:30' } },
  },
];

export const DUMMY_EMERGENCY_ROOMS: EmergencyRoom[] = [
  {
    id: 'e1', category: 'emergency', name: '전남대학교병원 응급실',
    address: '광주 동구 백서로 160', phone: '062-220-5555',
    lat: 35.1478, lng: 126.9233, distance: 4200,
    isOpenNow: true, isTraumaCenter: true,
    availableBeds: 8, totalBeds: 30,
    congestion: 'medium',
    hours: {},
  },
  {
    id: 'e2', category: 'emergency', name: '조선대학교병원 응급실',
    address: '광주 동구 필문대로 365', phone: '062-220-3000',
    lat: 35.1392, lng: 126.9275, distance: 5800,
    isOpenNow: true, isTraumaCenter: false,
    availableBeds: 3, totalBeds: 20,
    congestion: 'high',
    hours: {},
  },
  {
    id: 'e3', category: 'emergency', name: '광주기독병원 응급실',
    address: '광주 남구 양림로 37', phone: '062-650-5000',
    lat: 35.1313, lng: 126.9082, distance: 7100,
    isOpenNow: true, isTraumaCenter: false,
    availableBeds: 12, totalBeds: 18,
    congestion: 'low',
    hours: {},
  },
];
