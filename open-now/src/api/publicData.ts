import type { UserLocation, Pharmacy, Hospital, EmergencyRoom } from '../types';
import { calcDistance } from '../utils';

const BASE = 'https://apis.data.go.kr';
const KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY;

function qs(params: Record<string, string | number>) {
  return new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
}

export async function fetchNearbyPharmacies(
  location: UserLocation,
  radius = 1000,
): Promise<Pharmacy[]> {
  const query = qs({
    serviceKey: KEY,
    QT: 1,
    WGS84_LON: location.lng,
    WGS84_LAT: location.lat,
    numOfRows: 20,
    pageNo: 1,
    _type: 'json',
  });

  const res = await fetch(
    `${BASE}/B552657/ErmctInsttInfoInqireService/getParmacyListInfoInqire?${query}`,
  );
  if (!res.ok) throw new Error('약국 데이터를 불러오지 못했어요');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = json?.response?.body?.items?.item ?? [];

  return items
    .map((item): Pharmacy => ({
      id: item.hpid,
      name: item.dutyName,
      address: item.dutyAddr,
      phone: item.dutyTel1,
      lat: parseFloat(item.wgs84Lat),
      lng: parseFloat(item.wgs84Lon),
      distance: calcDistance(location, parseFloat(item.wgs84Lat), parseFloat(item.wgs84Lon)),
      hours: {
        mon: item.dutyTime1s ? { open: item.dutyTime1s, close: item.dutyTime1c } : undefined,
        tue: item.dutyTime2s ? { open: item.dutyTime2s, close: item.dutyTime2c } : undefined,
        wed: item.dutyTime3s ? { open: item.dutyTime3s, close: item.dutyTime3c } : undefined,
        thu: item.dutyTime4s ? { open: item.dutyTime4s, close: item.dutyTime4c } : undefined,
        fri: item.dutyTime5s ? { open: item.dutyTime5s, close: item.dutyTime5c } : undefined,
        sat: item.dutyTime6s ? { open: item.dutyTime6s, close: item.dutyTime6c } : undefined,
        sun: item.dutyTime7s ? { open: item.dutyTime7s, close: item.dutyTime7c } : undefined,
        holiday: item.dutyTime8s ? { open: item.dutyTime8s, close: item.dutyTime8c } : undefined,
      },
      isOpenNow: false, // App 레이어에서 isOpenNow(hours) 로 계산
      category: 'pharmacy',
      nightCare: item.dutyEryn === '1',
    }))
    .filter((p) => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export async function fetchNearbyHospitals(
  location: UserLocation,
  radius = 2000,
): Promise<Hospital[]> {
  const query = qs({
    serviceKey: KEY,
    QT: 1,
    WGS84_LON: location.lng,
    WGS84_LAT: location.lat,
    numOfRows: 20,
    pageNo: 1,
    _type: 'json',
  });

  const res = await fetch(
    `${BASE}/B552657/ErmctInsttInfoInqireService/getEgytListInfoInqire?${query}`,
  );
  if (!res.ok) throw new Error('병원 데이터를 불러오지 못했어요');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = json?.response?.body?.items?.item ?? [];

  return items
    .map((item): Hospital => ({
      id: item.hpid,
      name: item.dutyName,
      address: item.dutyAddr,
      phone: item.dutyTel1,
      lat: parseFloat(item.wgs84Lat),
      lng: parseFloat(item.wgs84Lon),
      distance: calcDistance(location, parseFloat(item.wgs84Lat), parseFloat(item.wgs84Lon)),
      hours: {
        mon: item.dutyTime1s ? { open: item.dutyTime1s, close: item.dutyTime1c } : undefined,
        tue: item.dutyTime2s ? { open: item.dutyTime2s, close: item.dutyTime2c } : undefined,
        wed: item.dutyTime3s ? { open: item.dutyTime3s, close: item.dutyTime3c } : undefined,
        thu: item.dutyTime4s ? { open: item.dutyTime4s, close: item.dutyTime4c } : undefined,
        fri: item.dutyTime5s ? { open: item.dutyTime5s, close: item.dutyTime5c } : undefined,
        sat: item.dutyTime6s ? { open: item.dutyTime6s, close: item.dutyTime6c } : undefined,
        sun: item.dutyTime7s ? { open: item.dutyTime7s, close: item.dutyTime7c } : undefined,
        holiday: item.dutyTime8s ? { open: item.dutyTime8s, close: item.dutyTime8c } : undefined,
      },
      isOpenNow: false,
      category: 'hospital',
      departments: item.dgidIdName ? item.dgidIdName.split('|') : [],
      hasEmergency: item.dutyEryn === '1',
    }))
    .filter((h) => h.distance <= radius)
    .sort((a, b) => a.distance - b.distance);
}

export async function fetchNearbyEmergencyRooms(
  location: UserLocation,
): Promise<EmergencyRoom[]> {
  const query = qs({
    serviceKey: KEY,
    WGS84_LON: location.lng,
    WGS84_LAT: location.lat,
    numOfRows: 10,
    pageNo: 1,
    _type: 'json',
  });

  const res = await fetch(
    `${BASE}/B552657/ErmctInfoInqireService/getEgytBassInfoInqire?${query}`,
  );
  if (!res.ok) throw new Error('응급실 데이터를 불러오지 못했어요');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items: any[] = json?.response?.body?.items?.item ?? [];

  return items
    .map((item): EmergencyRoom => ({
      id: item.hpid,
      name: item.dutyName,
      address: item.dutyAddr,
      phone: item.dutyTel1,
      lat: parseFloat(item.wgs84Lat),
      lng: parseFloat(item.wgs84Lon),
      distance: calcDistance(location, parseFloat(item.wgs84Lat), parseFloat(item.wgs84Lon)),
      hours: {},
      isOpenNow: true, // 응급실은 24시간 운영
      category: 'emergency',
      availableBeds: item.hvec != null ? parseInt(item.hvec) : null,
      totalBeds: item.hvidate != null ? parseInt(item.hvidate) : null,
      isTraumaCenter: item.dutyEmclsName === '권역응급의료센터',
      congestion: 'unknown',
    }))
    .sort((a, b) => a.distance - b.distance);
}
