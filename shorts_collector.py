#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
shorts_collector.py
────────────────────────────────────────────────────────────
YouTube Data API v3로 '조회수 N 이상 쇼츠'를 니치별로 수집해
CSV(엑셀에서 바로 열림)로 저장합니다.

준비:
  1) https://console.cloud.google.com 에서 프로젝트 생성
  2) 'YouTube Data API v3' 사용 설정
  3) 사용자 인증 정보 > API 키 발급
  4) pip install -r requirements.txt
  5) 환경변수로 키 전달:  export YT_API_KEY="발급받은_키"

할당량 메모:
  search.list = 100유닛/호출, videos.list = 1유닛/호출
  기본 일일 할당량 10,000유닛 → 하루 약 95회 검색 (최대 4,750개 스캔)
  니치를 늘릴수록 할당량이 빨리 소진되니 NICHES를 나눠 돌리세요.
"""

import os
import csv
import re
import sys
import time
from datetime import datetime, timedelta, timezone

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# ═══════════════════════════════════════════════════════════
# 설정 — 여기만 고치면 됩니다
# ═══════════════════════════════════════════════════════════

# API 키는 코드에 적지 말고 환경변수로 넘기세요 (키가 깃에 올라가면 폐기해야 합니다)
API_KEY = os.environ.get("YT_API_KEY", "")

MIN_VIEWS = 1_000_000          # 최소 조회수 (요청하신 100만)
TARGET_PER_NICHE = 30          # 니치당 목표 개수
MAX_SHORT_SECONDS = 180        # 쇼츠 최대 길이 (2024.10부터 3분)
MONTHS_BACK = 12               # 최근 몇 개월치를 볼지 (트렌드 반영용)
REGION = "KR"                  # "KR" 한국 / "US" 미국 / None 전체
LANG = None                    # "ko" 한국어만 / None 제한 없음

# 니치: {이름: [검색어들]}
# RPM 높은 순으로 배치했습니다. 필요 없는 건 주석 처리하세요.
NICHES = {
    "01_금융투자": ["investing tips", "stock market shorts", "personal finance"],
    "02_비즈니스": ["business idea", "side hustle", "entrepreneur tips"],
    "03_교육과학": ["science facts", "study tips", "how it works"],
    "04_테크AI":  ["ai tools", "tech tips", "chatgpt trick"],
    "05_건강피트니스": ["workout form", "fitness tips", "healthy habits"],
    "06_생활꿀팁": ["life hacks", "kitchen hack", "cleaning hack"],
    "07_변화전후": ["before and after", "transformation", "restoration"],
    "08_음악": ["music shorts", "cover song", "beat making"],
    "09_요리": ["easy recipe", "food shorts", "cooking hack"],
    "10_동기부여": ["motivation shorts", "mindset", "discipline"],
}

# 니치별 쇼츠 RPM 추정 (USD, per 1,000 views) — 벤치마크용 참고치
RPM_HINT = {
    "01_금융투자": "$0.10–0.50", "02_비즈니스": "$0.10–0.40",
    "03_교육과학": "$0.10–0.35", "04_테크AI": "$0.08–0.30",
    "05_건강피트니스": "$0.06–0.20", "06_생활꿀팁": "$0.05–0.18",
    "07_변화전후": "$0.05–0.18", "08_음악": "$0.50–1.48",
    "09_요리": "$0.04–0.15", "10_동기부여": "$0.05–0.20",
}

OUTPUT = "shorts_benchmark.csv"

# ═══════════════════════════════════════════════════════════


def parse_duration(iso: str) -> int:
    """PT1M30S → 90 (초)"""
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 9999
    h, mi, s = (int(x) if x else 0 for x in m.groups())
    return h * 3600 + mi * 60 + s


def search_ids(yt, query, published_after, page_token=None):
    """search.list — 조회수순 정렬. 100유닛."""
    req = yt.search().list(
        q=query,
        part="id",
        type="video",
        videoDuration="short",       # 4분 미만 (쇼츠 상위집합)
        order="viewCount",
        maxResults=50,
        publishedAfter=published_after,
        pageToken=page_token,
        **({"regionCode": REGION} if REGION else {}),
        **({"relevanceLanguage": LANG} if LANG else {}),
    )
    res = req.execute()
    ids = [it["id"]["videoId"] for it in res.get("items", [])]
    return ids, res.get("nextPageToken")


def fetch_details(yt, video_ids):
    """videos.list — 실제 조회수/길이. 1유닛per50개."""
    out = []
    for i in range(0, len(video_ids), 50):
        chunk = video_ids[i:i + 50]
        res = yt.videos().list(
            part="snippet,statistics,contentDetails",
            id=",".join(chunk),
        ).execute()
        out.extend(res.get("items", []))
    return out


def collect(yt, niche, queries, seen):
    published_after = (
        datetime.now(timezone.utc) - timedelta(days=30 * MONTHS_BACK)
    ).replace(microsecond=0).isoformat().replace("+00:00", "Z")

    rows = []
    for q in queries:
        if len(rows) >= TARGET_PER_NICHE:
            break
        token = None
        for _ in range(3):                     # 쿼리당 최대 3페이지 (150개)
            try:
                ids, token = search_ids(yt, q, published_after, token)
            except HttpError as e:
                print(f"  ! 검색 실패 ({q}): {e}", file=sys.stderr)
                break
            if not ids:
                break

            ids = [v for v in ids if v not in seen]
            seen.update(ids)                   # 삭제/비공개 영상도 재조회하지 않도록
            for v in fetch_details(yt, ids):
                vid = v["id"]
                stats = v.get("statistics", {})
                views = int(stats.get("viewCount", 0))
                secs = parse_duration(v["contentDetails"]["duration"])

                if views < MIN_VIEWS or secs > MAX_SHORT_SECONDS:
                    continue

                sn = v["snippet"]
                likes = int(stats.get("likeCount", 0))
                rows.append({
                    "니치": niche,
                    "제목": sn["title"],
                    "채널": sn["channelTitle"],
                    "조회수": views,
                    "좋아요": likes,
                    "참여율%": round(likes / views * 100, 3) if views else 0,
                    "길이(초)": secs,
                    "업로드": sn["publishedAt"][:10],
                    "링크": f"https://www.youtube.com/shorts/{vid}",
                    "채널링크": f"https://www.youtube.com/channel/{sn['channelId']}",
                    "쇼츠RPM추정": RPM_HINT.get(niche, "-"),
                    "추정수익$": round(views / 1000 * 0.15, 2),  # 보수적 단가
                })
                if len(rows) >= TARGET_PER_NICHE:
                    break

            if not token or len(rows) >= TARGET_PER_NICHE:
                break
            time.sleep(0.2)

    rows.sort(key=lambda r: r["조회수"], reverse=True)
    return rows[:TARGET_PER_NICHE]


def main():
    if not API_KEY:
        sys.exit('❌ 환경변수 YT_API_KEY를 설정하세요.  예) export YT_API_KEY="발급받은_키"')

    yt = build("youtube", "v3", developerKey=API_KEY)
    seen, all_rows = set(), []

    for niche, queries in NICHES.items():
        print(f"▶ {niche} 수집 중...")
        rows = collect(yt, niche, queries, seen)
        print(f"  → {len(rows)}개 확보")
        all_rows.extend(rows)

    if not all_rows:
        sys.exit("결과 없음. MIN_VIEWS를 낮추거나 MONTHS_BACK을 늘려보세요.")

    with open(OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(all_rows[0].keys()))
        w.writeheader()
        w.writerows(all_rows)

    print(f"\n✅ 총 {len(all_rows)}개 → {OUTPUT}")
    print("   (엑셀에서 바로 열립니다. 한글 깨짐 없음)")


if __name__ == "__main__":
    main()
