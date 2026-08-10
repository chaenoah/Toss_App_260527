# YouTube Shorts 벤치마크 수집기

YouTube Data API v3로 니치별 '조회수 N 이상 쇼츠'를 수집해 CSV로 저장합니다.
엑셀에서 바로 열리는 UTF-8 BOM 인코딩입니다.

## 설치

```bash
pip install -r requirements.txt
```

## API 키 준비

1. https://console.cloud.google.com 에서 프로젝트 생성
2. **YouTube Data API v3** 사용 설정
3. 사용자 인증 정보 > **API 키** 발급
4. 환경변수로 전달 (코드에 직접 적지 마세요)

```bash
export YT_API_KEY="발급받은_키"
```

## 실행

```bash
python shorts_collector.py
```

결과는 `shorts_benchmark.csv` 로 저장됩니다.

## 설정

`shorts_collector.py` 상단 상수만 고치면 됩니다.

| 변수 | 기본값 | 설명 |
|---|---|---|
| `MIN_VIEWS` | `1_000_000` | 최소 조회수 |
| `TARGET_PER_NICHE` | `30` | 니치당 목표 개수 |
| `MAX_SHORT_SECONDS` | `180` | 쇼츠 최대 길이 (2024.10부터 3분) |
| `MONTHS_BACK` | `12` | 최근 몇 개월치를 볼지 |
| `REGION` | `"KR"` | `"KR"` / `"US"` / `None`(전체) |
| `LANG` | `None` | `"ko"` 한국어만 / `None` 제한 없음 |
| `NICHES` | 10개 | `{니치명: [검색어들]}` |

## 할당량 주의

- `search.list` = 100유닛/호출, `videos.list` = 1유닛/50개
- 기본 일일 할당량 10,000유닛 → 하루 약 95회 검색
- 니치 10개 × 검색어 3개 × 최대 3페이지 = 최대 90회 검색 (약 9,000유닛)

할당량이 부족하면 `NICHES`를 절반씩 나눠서 며칠에 걸쳐 돌리세요.

## 출력 컬럼

`니치`, `제목`, `채널`, `조회수`, `좋아요`, `참여율%`, `길이(초)`, `업로드`,
`링크`, `채널링크`, `쇼츠RPM추정`, `추정수익$`

`추정수익$`는 RPM $0.15 기준의 보수적 추정치이며 실제 수익과 다릅니다.
`쇼츠RPM추정`은 공개 벤치마크 기반 참고치입니다.
