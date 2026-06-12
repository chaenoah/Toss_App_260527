import type { UserLocation } from '../types';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY as string;

export interface RegionInfo {
  sido: string;       // 시도 (e.g. "광주광역시")
  sigungu: string;    // 시군구 (e.g. "광산구")
  /** 공공데이터 API용 시도 약칭 (e.g. "광주광역시" → "광주") */
  sidoShort: string;
  /** 화면 표시용 레이블 (e.g. "광주 광산구") */
  label: string;
}

/** 광역시·도 → 공공데이터 API 검색용 약칭 매핑 */
const SIDO_SHORT: Record<string, string> = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구',
  인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전',
  울산광역시: '울산', 세종특별자치시: '세종',
  경기도: '경기',   강원도: '강원',   충청북도: '충북',
  충청남도: '충남', 전라북도: '전북', 전라남도: '전남',
  경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주',
};

interface KakaoRegionDoc {
  region_type: 'H' | 'B';    // H=행정동, B=법정동
  address_name: string;
  region_1depth_name: string; // 시도
  region_2depth_name: string; // 시군구
  region_3depth_name: string; // 읍면동
  code: string;
}

interface KakaoResponse {
  meta: { total_count: number };
  documents: KakaoRegionDoc[];
}

/**
 * 위도·경도 → 행정구역 정보 변환
 * Kakao Local API: /v2/local/geo/coord2regioncode
 */
export async function reverseGeocode(location: UserLocation): Promise<RegionInfo> {
  const url =
    `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json` +
    `?x=${location.lng}&y=${location.lat}`;

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
  });

  if (!res.ok) throw new Error(`Kakao geocode HTTP ${res.status}`);

  const json: KakaoResponse = await res.json();

  // 행정동(H) 우선, 없으면 법정동(B) 사용
  const doc =
    json.documents.find((d) => d.region_type === 'H') ??
    json.documents[0];

  if (!doc) throw new Error('역지오코딩 결과 없음');

  const sido    = doc.region_1depth_name;
  const sigungu = doc.region_2depth_name;
  const sidoShort = SIDO_SHORT[sido] ?? sido;
  const label   = sigungu ? `${sidoShort} ${sigungu}` : sidoShort;

  return { sido, sigungu, sidoShort, label };
}
