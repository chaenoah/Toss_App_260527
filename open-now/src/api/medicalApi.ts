import { XMLParser } from 'fast-xml-parser';
import type { Pharmacy, Hospital, EmergencyRoom, UserLocation } from '../types';
import { calcDistance } from '../utils';
import { parseWeeklyHours, getOperatingStatus } from '../utils/operatingHours';

const KEY = import.meta.env.VITE_PUBLIC_DATA_API_KEY as string;

const PHARMACY_BASE   = 'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService';
const HOSPITAL_BASE   = 'https://apis.data.go.kr/B551182/hospInfoServicev2';
const EMERGENCY_BASE  = 'https://apis.data.go.kr/B552657/ErmctInfoInqireService';

// ── XML 파서 (공공데이터 XML 특성 반영) ────────────────────────────────────
const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  // 숫자처럼 보이는 값도 문자열 유지 (시간 "0900" → "0900")
  isArray: (name) => name === 'item',
});

// ── 공통 유틸 ──────────────────────────────────────────────────────────────
function buildUrl(base: string, path: string, params: Record<string, string | number>) {
  const qs = new URLSearchParams();
  // 서비스키는 인코딩 없이 직접 추가
  qs.append('serviceKey', KEY);
  for (const [k, v] of Object.entries(params)) qs.append(k, String(v));
  return `${base}${path}?${qs.toString()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchXml(url: string): Promise<any[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);

  const text = await res.text();
  const parsed = parser.parse(text);

  // 공공데이터 공통 래퍼: response.body.items.item
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: any = parsed?.response?.body;
  const totalCount: number = body?.totalCount ?? 0;
  if (totalCount === 0) return [];

  // item이 1개면 배열이 아닌 객체로 파싱될 수 있음 → 강제 배열화
  const raw = body?.items?.item;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

// ── 위치 기반 거리 계산 헬퍼 ───────────────────────────────────────────────
function toNum(v: unknown): number {
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. 약국 목록 조회
// ══════════════════════════════════════════════════════════════════════════════
export async function getPharmacies(
  sido: string,
  sigungu: string,
  userLocation?: UserLocation,
): Promise<Pharmacy[]> {
  try {
    const url = buildUrl(PHARMACY_BASE, '/getParmacyListInfoInqire', {
      Q0: sido,
      Q1: sigungu,
      pageNo: 1,
      numOfRows: 30,
    });

    const items = await fetchXml(url);

    return items
      .map((item): Pharmacy => {
        const lat = toNum(item.wgs84Lat);
        const lng = toNum(item.wgs84Lon);
        const hours = parseWeeklyHours(item);
        const status = getOperatingStatus(hours);

        return {
          id:       String(item.hpid ?? item.ykiho ?? Math.random()),
          name:     String(item.dutyName ?? ''),
          address:  String(item.dutyAddr ?? ''),
          phone:    String(item.dutyTel1 ?? ''),
          lat,
          lng,
          distance: userLocation ? calcDistance(userLocation, lat, lng) : 0,
          hours,
          isOpenNow: status !== 'closed',
          category: 'pharmacy',
          nightCare: item.dutyEryn === '1' || item.dutyEryn === 1,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('[getPharmacies]', err);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. 병의원 목록 조회
// ══════════════════════════════════════════════════════════════════════════════
export async function getHospitals(
  sido: string,
  sigungu: string,
  /** 진료과목 코드 (빈 문자열 = 전체) e.g. 'D001' 내과 */
  dgsbjtCd = '',
  userLocation?: UserLocation,
): Promise<Hospital[]> {
  try {
    const params: Record<string, string | number> = {
      Q0: sido,
      Q1: sigungu,
      pageNo: 1,
      numOfRows: 30,
    };
    if (dgsbjtCd) params.dgsbjtCd = dgsbjtCd;

    const url = buildUrl(HOSPITAL_BASE, '/getHospBasisList', params);
    const items = await fetchXml(url);

    return items
      .map((item): Hospital => {
        const lat = toNum(item.YPos ?? item.wgs84Lat);
        const lng = toNum(item.XPos ?? item.wgs84Lon);
        const hours = parseWeeklyHours(item);
        const status = getOperatingStatus(hours);

        // dgidIdName: "내과^외과^정형외과" 형식
        const depts = item.dgidIdName
          ? String(item.dgidIdName).split(/\||\^/).map((s: string) => s.trim()).filter(Boolean)
          : [];

        return {
          id:       String(item.ykiho ?? item.hpid ?? Math.random()),
          name:     String(item.yadmNm ?? item.dutyName ?? ''),
          address:  String(item.addr ?? item.dutyAddr ?? ''),
          phone:    String(item.telno ?? item.dutyTel1 ?? ''),
          lat,
          lng,
          distance: userLocation ? calcDistance(userLocation, lat, lng) : 0,
          hours,
          isOpenNow: status !== 'closed',
          category: 'hospital',
          departments: depts,
          hasEmergency: item.emgyn === 'Y' || item.dutyEryn === '1',
        };
      })
      .sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('[getHospitals]', err);
    return [];
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. 응급의료기관 조회 (기본정보 + 실시간 가용병상 병합)
// ══════════════════════════════════════════════════════════════════════════════

/** 실시간 가용 병상 맵 { hpid → availableBeds } */
async function fetchRealtimeBeds(
  stage1: string,
  stage2: string,
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  try {
    const url = buildUrl(EMERGENCY_BASE, '/getEmrrmRltmUsefulSckbdInfoInqire', {
      STAGE1: stage1,
      STAGE2: stage2,
      pageNo: 1,
      numOfRows: 50,
    });
    const items = await fetchXml(url);
    for (const item of items) {
      if (item.hpid && item.hvec != null) {
        map.set(String(item.hpid), parseInt(String(item.hvec)) || 0);
      }
    }
  } catch {
    // 실시간 병상 실패는 무시 — 기본 정보만으로 표시
  }
  return map;
}

export async function getEmergencyRooms(
  stage1: string,
  stage2: string,
  userLocation?: UserLocation,
): Promise<EmergencyRoom[]> {
  try {
    const [items, bedsMap] = await Promise.all([
      fetchXml(
        buildUrl(EMERGENCY_BASE, '/getEgytBassInfoInqire', {
          STAGE1: stage1,
          STAGE2: stage2,
          pageNo: 1,
          numOfRows: 20,
        }),
      ),
      fetchRealtimeBeds(stage1, stage2),
    ]);

    return items
      .map((item): EmergencyRoom => {
        const lat = toNum(item.wgs84Lat);
        const lng = toNum(item.wgs84Lon);
        const hpid = String(item.hpid ?? '');
        const availableBeds = bedsMap.has(hpid) ? bedsMap.get(hpid)! : null;
        const totalBeds = item.hvctayn != null ? parseInt(String(item.hvctayn)) || null : null;

        const congestion =
          availableBeds == null ? 'unknown'
          : availableBeds === 0  ? 'high'
          : availableBeds <= 3   ? 'high'
          : availableBeds <= 10  ? 'medium'
          : 'low';

        return {
          id:      hpid || String(Math.random()),
          name:    String(item.dutyName ?? ''),
          address: String(item.dutyAddr ?? ''),
          phone:   String(item.dutyTel1 ?? item.dutyTel3 ?? ''),
          lat,
          lng,
          distance: userLocation ? calcDistance(userLocation, lat, lng) : 0,
          hours: {},   // 응급실 24시간
          isOpenNow: true,
          category: 'emergency',
          availableBeds,
          totalBeds,
          isTraumaCenter: String(item.dutyEmclsName ?? '').includes('권역'),
          congestion,
        };
      })
      .sort((a, b) => a.distance - b.distance);
  } catch (err) {
    console.error('[getEmergencyRooms]', err);
    return [];
  }
}
