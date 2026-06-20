import { XMLParser } from 'fast-xml-parser';
import type { Pharmacy, Hospital, EmergencyRoom, UserLocation } from '../types';
import { calcDistance } from '../utils';
import { parseWeeklyHours, getOperatingStatus } from '../utils/operatingHours';

const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY as string;
const KAKAO_KEY  = import.meta.env.VITE_KAKAO_API_KEY as string;

const KAKAO_ORIGIN = import.meta.env.PROD ? 'https://dapi.kakao.com' : '/proxy/kakao';
const DATA_ORIGIN  = import.meta.env.PROD ? 'https://apis.data.go.kr' : '/proxy/data';
const EMERGENCY_BASE = `${DATA_ORIGIN}/B552657/ErmctInfoInqireService`;

// ── Kakao 장소 검색 (약국·병원) ────────────────────────────────────────────
// category_group_code: PM9=약국, HP8=병원
async function kakaoPlaceSearch(
  categoryCode: 'PM9' | 'HP8',
  location: UserLocation,
  radius = 3000,
  pages = 3,
): Promise<KakaoPlace[]> {
  const all: KakaoPlace[] = [];
  for (let page = 1; page <= pages; page++) {
    const url =
      `${KAKAO_ORIGIN}/v2/local/search/keyword.json` +
      `?category_group_code=${categoryCode}` +
      `&x=${location.lng}&y=${location.lat}` +
      `&radius=${radius}&size=15&page=${page}&sort=distance`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
      });
      if (!res.ok) break;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await res.json();
      const docs: KakaoPlace[] = json.documents ?? [];
      all.push(...docs);
      if (json.meta?.is_end) break;
    } catch {
      break;
    }
  }
  return all;
}

interface KakaoPlace {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  phone: string;
  x: string; // lng
  y: string; // lat
  distance: string; // meters
  category_name: string;
}

// ── 공공데이터 XML 파서 (응급실 전용) ─────────────────────────────────────
const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  isArray: (name) => name === 'item',
});

function buildUrl(base: string, path: string, params: Record<string, string | number>) {
  const qs = new URLSearchParams();
  qs.append('serviceKey', PUBLIC_KEY);
  for (const [k, v] of Object.entries(params)) qs.append(k, String(v));
  return `${base}${path}?${qs.toString()}`;
}

async function fetchXml(url: string): Promise<unknown[]> {
  // 직접 시도 → allorigins 폴백
  let text: string;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    text = await res.text();
  } catch {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res2 = await fetch(proxy);
    if (!res2.ok) throw new Error(`proxy HTTP ${res2.status}`);
    text = await res2.text();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = parser.parse(text)?.response?.body;
  const totalCount: number = body?.totalCount ?? 0;
  if (totalCount === 0) return [];
  const raw = body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function toNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. 약국 (Kakao Places PM9)
// ══════════════════════════════════════════════════════════════════════════════
export async function getPharmacies(
  _sido: string,
  _sigungu: string,
  userLocation: UserLocation,
): Promise<Pharmacy[]> {
  try {
    const places = await kakaoPlaceSearch('PM9', userLocation);
    return places.map((p): Pharmacy => ({
      id:       p.id,
      name:     p.place_name,
      address:  p.road_address_name || p.address_name,
      phone:    p.phone,
      lat:      parseFloat(p.y),
      lng:      parseFloat(p.x),
      distance: parseInt(p.distance) || calcDistance(userLocation, parseFloat(p.y), parseFloat(p.x)),
      hours:    {},
      isOpenNow: true, // Kakao API는 영업 중인 곳 위주로 반환
      category: 'pharmacy',
      nightCare: p.category_name.includes('야간') || p.category_name.includes('24'),
    }));
  } catch (err) {
    console.error('[getPharmacies]', err);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. 병원 (Kakao Places HP8)
// ══════════════════════════════════════════════════════════════════════════════
export async function getHospitals(
  _sido: string,
  _sigungu: string,
  _dgsbjtCd = '',
  userLocation: UserLocation,
): Promise<Hospital[]> {
  try {
    const places = await kakaoPlaceSearch('HP8', userLocation);
    return places.map((p): Hospital => {
      // category_name: "의료,건강 > 병원 > 내과" 형태에서 진료과 추출
      const parts = p.category_name.split('>').map((s: string) => s.trim());
      const dept = parts.length >= 3 ? [parts[parts.length - 1]] : [];
      return {
        id:          p.id,
        name:        p.place_name,
        address:     p.road_address_name || p.address_name,
        phone:       p.phone,
        lat:         parseFloat(p.y),
        lng:         parseFloat(p.x),
        distance:    parseInt(p.distance) || calcDistance(userLocation, parseFloat(p.y), parseFloat(p.x)),
        hours:       {},
        isOpenNow:   true,
        category:    'hospital',
        departments: dept,
        hasEmergency: false,
      };
    });
  } catch (err) {
    console.error('[getHospitals]', err);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. 응급실 (공공데이터 API — 실시간 병상 정보 필요)
// ══════════════════════════════════════════════════════════════════════════════
async function fetchRealtimeBeds(stage1: string, stage2: string): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const url = buildUrl(EMERGENCY_BASE, '/getEmrrmRltmUsefulSckbdInfoInqire', {
      STAGE1: stage1, STAGE2: stage2, pageNo: 1, numOfRows: 50,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = await fetchXml(url) as any[];
    for (const item of items) {
      if (item.hpid && item.hvec != null)
        map.set(String(item.hpid), parseInt(String(item.hvec)) || 0);
    }
  } catch { /* 무시 */ }
  return map;
}

export async function getEmergencyRooms(
  stage1: string,
  stage2: string,
  userLocation: UserLocation,
): Promise<EmergencyRoom[]> {
  try {
    const [items, bedsMap] = await Promise.all([
      fetchXml(buildUrl(EMERGENCY_BASE, '/getEgytBassInfoInqire', {
        STAGE1: stage1, STAGE2: stage2, pageNo: 1, numOfRows: 20,
      })) as Promise<any[]>,
      fetchRealtimeBeds(stage1, stage2),
    ]);

    return (items as any[]).map((item): EmergencyRoom => {
      const lat = toNum(item.wgs84Lat);
      const lng = toNum(item.wgs84Lon);
      const hpid = String(item.hpid ?? '');
      const availableBeds = bedsMap.has(hpid) ? bedsMap.get(hpid)! : null;
      const congestion =
        availableBeds == null ? 'unknown'
        : availableBeds <= 3  ? 'high'
        : availableBeds <= 10 ? 'medium'
        : 'low';
      return {
        id: hpid || String(Math.random()),
        name: String(item.dutyName ?? ''),
        address: String(item.dutyAddr ?? ''),
        phone: String(item.dutyTel1 ?? item.dutyTel3 ?? ''),
        lat, lng,
        distance: userLocation ? calcDistance(userLocation, lat, lng) : 0,
        hours: {},
        isOpenNow: true,
        category: 'emergency',
        availableBeds,
        totalBeds: item.hvctayn != null ? parseInt(String(item.hvctayn)) || null : null,
        isTraumaCenter: String(item.dutyEmclsName ?? '').includes('권역'),
        congestion,
      };
    }).sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('[getEmergencyRooms]', err);
    return [];
  }
}
