/**
 * 행정구역 내장 데이터 + Kakao API 폴백
 * - 시도/시군구 입력 시 내장 데이터로 좌표 즉시 반환
 * - 상세 주소는 Kakao API 시도
 */

import type { UserLocation } from '../types';

const KAKAO_KEY = import.meta.env.VITE_KAKAO_API_KEY as string;

export interface RegionInfo {
  sido: string;
  sigungu: string;
  sidoShort: string;
  label: string;
}

const SIDO_SHORT: Record<string, string> = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구',
  인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전',
  울산광역시: '울산', 세종특별자치시: '세종',
  경기도: '경기',   강원도: '강원',   충청북도: '충북',
  충청남도: '충남', 전라북도: '전북', 전라남도: '전남',
  경상북도: '경북', 경상남도: '경남', 제주특별자치도: '제주',
};

// 주요 시군구 중심 좌표 (lat, lng)
const REGION_COORDS: Record<string, [number, number]> = {
  // 서울
  '서울': [37.5665, 126.9780],
  '서울 강남구': [37.5172, 127.0473], '서울 강동구': [37.5301, 127.1238],
  '서울 강북구': [37.6398, 127.0255], '서울 강서구': [37.5509, 126.8495],
  '서울 관악구': [37.4784, 126.9516], '서울 광진구': [37.5385, 127.0823],
  '서울 구로구': [37.4954, 126.8874], '서울 금천구': [37.4568, 126.8955],
  '서울 노원구': [37.6542, 127.0568], '서울 도봉구': [37.6688, 127.0471],
  '서울 동대문구': [37.5744, 127.0396], '서울 동작구': [37.5124, 126.9393],
  '서울 마포구': [37.5663, 126.9014], '서울 서대문구': [37.5791, 126.9368],
  '서울 서초구': [37.4837, 127.0324], '서울 성동구': [37.5634, 127.0369],
  '서울 성북구': [37.5894, 127.0167], '서울 송파구': [37.5145, 127.1059],
  '서울 양천구': [37.5270, 126.8561], '서울 영등포구': [37.5264, 126.8962],
  '서울 용산구': [37.5324, 126.9905], '서울 은평구': [37.6027, 126.9290],
  '서울 종로구': [37.5735, 126.9790], '서울 중구': [37.5636, 126.9975],
  '서울 중랑구': [37.6063, 127.0925],
  // 부산
  '부산': [35.1796, 129.0756],
  '부산 해운대구': [35.1631, 129.1635], '부산 수영구': [35.1453, 129.1134],
  '부산 남구': [35.1366, 129.0847], '부산 북구': [35.1974, 128.9901],
  '부산 동구': [35.1799, 129.0432], '부산 서구': [35.0977, 129.0246],
  '부산 사하구': [35.1040, 128.9745], '부산 금정구': [35.2430, 129.0921],
  '부산 강서구': [35.2154, 128.9804], '부산 연제구': [35.1768, 129.0794],
  '부산 동래구': [35.2097, 129.0860], '부산 부산진구': [35.1588, 129.0530],
  '부산 기장군': [35.2447, 129.2224],
  // 대구
  '대구': [35.8714, 128.6014],
  '대구 중구': [35.8703, 128.5911], '대구 동구': [35.8869, 128.6350],
  '대구 서구': [35.8717, 128.5597], '대구 남구': [35.8462, 128.5974],
  '대구 북구': [35.8855, 128.5827], '대구 수성구': [35.8581, 128.6308],
  '대구 달서구': [35.8298, 128.5326], '대구 달성군': [35.7747, 128.4314],
  // 인천
  '인천': [37.4563, 126.7052],
  '인천 남동구': [37.4490, 126.7314], '인천 부평구': [37.5087, 126.7217],
  '인천 계양구': [37.5375, 126.7377], '인천 서구': [37.5453, 126.6757],
  '인천 미추홀구': [37.4634, 126.6503], '인천 연수구': [37.4096, 126.6784],
  '인천 동구': [37.4739, 126.6437], '인천 중구': [37.4738, 126.6218],
  '인천 강화군': [37.7431, 126.4878], '인천 옹진군': [37.4470, 126.3646],
  // 광주
  '광주': [35.1595, 126.8526],
  '광주 동구': [35.1466, 126.9233], '광주 서구': [35.1525, 126.8892],
  '광주 남구': [35.1332, 126.9030], '광주 북구': [35.1743, 126.9116],
  '광주 광산구': [35.1396, 126.7932],
  // 대전
  '대전': [36.3504, 127.3845],
  '대전 동구': [36.3122, 127.4547], '대전 중구': [36.3250, 127.4213],
  '대전 서구': [36.3554, 127.3830], '대전 유성구': [36.3624, 127.3564],
  '대전 대덕구': [36.3462, 127.4149],
  // 울산
  '울산': [35.5384, 129.3114],
  '울산 중구': [35.5694, 129.3327], '울산 남구': [35.5395, 129.3323],
  '울산 동구': [35.5050, 129.4164], '울산 북구': [35.5826, 129.3612],
  '울산 울주군': [35.5219, 129.2419],
  // 세종
  '세종': [36.4801, 127.2890],
  // 경기
  '경기': [37.4138, 127.5183],
  '경기 수원시': [37.2636, 127.0286], '경기 성남시': [37.4449, 127.1388],
  '경기 용인시': [37.2411, 127.1776], '경기 부천시': [37.5034, 126.7660],
  '경기 안산시': [37.3236, 126.8308], '경기 화성시': [37.1998, 126.8316],
  '경기 고양시': [37.6564, 126.8351], '경기 광명시': [37.4784, 126.8647],
  '경기 평택시': [36.9926, 127.1128], '경기 안양시': [37.3942, 126.9568],
  '경기 시흥시': [37.3801, 126.8031], '경기 파주시': [37.7601, 126.7800],
  '경기 의정부시': [37.7381, 127.0337], '경기 김포시': [37.6152, 126.7156],
  '경기 광주시': [37.4294, 127.2554], '경기 하남시': [37.5397, 127.2148],
  '경기 오산시': [37.1499, 127.0773], '경기 군포시': [37.3615, 126.9351],
  '경기 이천시': [37.2720, 127.4344], '경기 양주시': [37.7851, 127.0459],
  '경기 구리시': [37.5944, 127.1296], '경기 안성시': [37.0078, 127.2798],
  '경기 포천시': [37.8949, 127.2004], '경기 의왕시': [37.3449, 126.9683],
  '경기 여주시': [37.2980, 127.6375], '경기 동두천시': [37.9035, 127.0607],
  '경기 과천시': [37.4292, 126.9878],
  // 강원
  '강원': [37.8228, 128.1555],
  '강원 춘천시': [37.8812, 127.7300], '강원 원주시': [37.3422, 127.9202],
  '강원 강릉시': [37.7519, 128.8760], '강원 동해시': [37.5247, 129.1141],
  // 충북
  '충북': [36.6356, 127.4916],
  '충북 청주시': [36.6424, 127.4890], '충북 충주시': [36.9910, 127.9259],
  '충북 제천시': [37.1324, 128.1911],
  // 충남
  '충남': [36.5184, 126.8000],
  '충남 천안시': [36.8151, 127.1139], '충남 아산시': [36.7897, 127.0024],
  '충남 서산시': [36.7846, 126.4503],
  // 전북
  '전북': [35.7175, 127.1530],
  '전북 전주시': [35.8242, 127.1479], '전북 익산시': [35.9483, 126.9578],
  '전북 군산시': [35.9676, 126.7365],
  // 전남
  '전남': [34.8161, 126.4629],
  '전남 여수시': [34.7604, 127.6622], '전남 순천시': [34.9506, 127.4872],
  '전남 목포시': [34.8118, 126.3922],
  // 경북
  '경북': [36.5760, 128.5057],
  '경북 포항시': [36.0190, 129.3435], '경북 경주시': [35.8562, 129.2247],
  '경북 구미시': [36.1194, 128.3445],
  // 경남
  '경남': [35.4606, 128.2132],
  '경남 창원시': [35.2280, 128.6811], '경남 김해시': [35.2285, 128.8892],
  '경남 양산시': [35.3350, 129.0377], '경남 진주시': [35.1800, 128.1076],
  // 제주
  '제주': [33.4996, 126.5312],
  '제주 제주시': [33.4996, 126.5312], '제주 서귀포시': [33.2541, 126.5600],
};

/** 사용자 입력에서 지역 매칭 후 좌표 반환 */
function lookupRegion(input: string): { location: UserLocation; info: RegionInfo } | null {
  const cleaned = input.trim().replace(/\s+/g, ' ');

  // 정확 매칭 먼저 시도
  for (const [key, coords] of Object.entries(REGION_COORDS)) {
    const normalizedKey = key.replace(/\s+/g, ' ');
    if (
      cleaned === normalizedKey ||
      cleaned.includes(normalizedKey) ||
      normalizedKey.includes(cleaned)
    ) {
      const parts = key.split(' ');
      const sidoFull = Object.keys(SIDO_SHORT).find((s) => s.startsWith(parts[0])) ?? parts[0];
      const sidoShort = SIDO_SHORT[sidoFull] ?? parts[0];
      const sigungu = parts[1] ?? '';
      return {
        location: { lat: coords[0], lng: coords[1] },
        info: {
          sido: sidoFull,
          sigungu,
          sidoShort,
          label: sigungu ? `${sidoShort} ${sigungu}` : sidoShort,
        },
      };
    }
  }
  return null;
}

/** Kakao 주소 검색 API */
async function kakaoGeocode(query: string): Promise<{ location: UserLocation; info: RegionInfo } | null> {
  try {
    const origin = import.meta.env.PROD ? 'https://dapi.kakao.com' : '/proxy/kakao';
    const url = `${origin}/v2/local/search/address.json?query=${encodeURIComponent(query)}&size=1`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await res.json();
    const doc = json?.documents?.[0];
    if (!doc) return null;
    const lat = parseFloat(doc.y);
    const lng = parseFloat(doc.x);
    if (isNaN(lat) || isNaN(lng)) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ra = doc.road_address as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = doc.address as any;
    const region1 = ra?.region_1depth_name ?? a?.region_1depth_name ?? '';
    const region2 = ra?.region_2depth_name ?? a?.region_2depth_name ?? '';
    const sidoShort = SIDO_SHORT[region1] ?? region1;
    return {
      location: { lat, lng },
      info: { sido: region1, sigungu: region2, sidoShort, label: region2 ? `${sidoShort} ${region2}` : sidoShort },
    };
  } catch {
    return null;
  }
}

/** 키워드 검색 (행정구역명 등) */
async function kakaoKeyword(query: string): Promise<{ location: UserLocation; info: RegionInfo } | null> {
  try {
    const origin = import.meta.env.PROD ? 'https://dapi.kakao.com' : '/proxy/kakao';
    const url = `${origin}/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`;
    const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await res.json();
    const doc = json?.documents?.[0];
    if (!doc) return null;
    const lat = parseFloat(doc.y);
    const lng = parseFloat(doc.x);
    if (isNaN(lat) || isNaN(lng)) return null;
    const sidoShort = SIDO_SHORT[doc.address_name?.split(' ')[0]] ?? '';
    return {
      location: { lat, lng },
      info: { sido: '', sigungu: '', sidoShort, label: doc.place_name ?? query },
    };
  } catch {
    return null;
  }
}

/**
 * 주소/지역명 → 좌표 + 지역 정보
 * 우선순위: 내장 데이터 → Kakao 주소검색 → Kakao 키워드검색
 */
export async function geocodeAddress(query: string): Promise<{ location: UserLocation; info: RegionInfo } | null> {
  return lookupRegion(query) ?? await kakaoGeocode(query) ?? await kakaoKeyword(query);
}

export async function reverseGeocode(location: UserLocation): Promise<RegionInfo> {
  const origin = import.meta.env.PROD ? 'https://dapi.kakao.com' : '/proxy/kakao';
  const url = `${origin}/v2/local/geo/coord2regioncode.json?x=${location.lng}&y=${location.lat}`;
  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${KAKAO_KEY}` } });
  if (!res.ok) throw new Error(`Kakao geocode HTTP ${res.status}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json: any = await res.json();
  const doc = json.documents?.find((d: any) => d.region_type === 'H') ?? json.documents?.[0];
  if (!doc) throw new Error('역지오코딩 결과 없음');
  const sido = doc.region_1depth_name;
  const sigungu = doc.region_2depth_name;
  const sidoShort = SIDO_SHORT[sido] ?? sido;
  return { sido, sigungu, sidoShort, label: sigungu ? `${sidoShort} ${sigungu}` : sidoShort };
}
