import type { EmotionKey, MoodEntry } from '../types';

type ColorItem  = { hex: string; name: string; description: string };
type SongItem   = { title: string; artist: string; reason: string };
type QuoteItem  = { text: string; author?: string };

/**
 * 강도(1~5)를 세 단계로 그룹화.
 * low(1~2) / mid(3) / high(4~5)
 */
type IntensityBand = 'low' | 'mid' | 'high';

function band(intensity: number): IntensityBand {
  if (intensity <= 2) return 'low';
  if (intensity === 3) return 'mid';
  return 'high';
}

type PrescriptionPool = {
  colors:   ColorItem[];
  songs:    SongItem[];
  quotes:   QuoteItem[];
  missions: string[];
  /** 강도 단계별 위로 메시지 풀 */
  comforts: Record<IntensityBand, string[]>;
};

// ─────────────────────────────────────────────────────────────
// 감정별 풀
// ─────────────────────────────────────────────────────────────
const POOLS: Record<EmotionKey, PrescriptionPool> = {

  // ── 기쁨 ──────────────────────────────────────────────────
  joy: {
    colors: [
      { hex: '#FFE066', name: '선샤인 옐로',   description: '햇살처럼 반짝이는 황금빛이에요' },
      { hex: '#FFC8A2', name: '피치 크림',      description: '복숭아처럼 달콤하고 환한 색이에요' },
      { hex: '#FFFDE7', name: '크리미 화이트',  description: '따뜻한 오후 햇살을 담은 크림색이에요' },
      { hex: '#B5EAD7', name: '민트 스프레이',  description: '상쾌하고 산뜻한 기쁨의 색이에요' },
    ],
    songs: [
      { title: '좋은 날',                  artist: 'IU',                  reason: '오늘의 기분과 꼭 닮은 시티팝이에요' },
      { title: 'Dynamite',                 artist: 'BTS',                 reason: '기쁜 에너지를 폭발시켜줄 K-팝이에요' },
      { title: 'HAPPY',                    artist: 'DAY6',                reason: '온몸으로 행복을 노래하는 곡이에요' },
      { title: 'Butter',                   artist: 'BTS',                 reason: '부드럽게 기분을 끌어올려주는 곡이에요' },
      { title: 'Telephone (feat. Beyoncé)', artist: 'Lady Gaga',          reason: '자신감 넘치게 흥이 오르는 곡이에요' },
    ],
    quotes: [
      { text: '기쁨은 나눌수록 배가 된다.',                                        author: '프리드리히 실러' },
      { text: '지금 이 순간의 행복을 충분히 느껴라. 그것이 삶의 전부다.' },
      { text: '웃음은 마음의 햇살이다.',                                           author: '워드 비처' },
      { text: '작은 기쁨들이 모여 큰 삶이 된다.' },
    ],
    missions: [
      '좋아하는 사람에게 "오늘 기분 좋아서 생각났어"라고 문자 한 통 보내기',
      '창문 열고 맑은 공기 마시며 5초 동안 크게 웃기',
      '오늘 가장 좋았던 순간을 사진 한 장으로 남기기',
      '좋아하는 노래 한 곡 틀고 자유롭게 몸 움직이기',
    ],
    comforts: {
      low: [
        '오늘 살짝 기분 좋은 날이군요. 그 작은 기쁨도 소중해요.',
        '소소한 기쁨도 삶을 빛나게 해요. 충분히 즐기세요.',
      ],
      mid: [
        '기분 좋은 하루를 보내고 있군요. 이 에너지가 내일까지 이어지길 바랍니다.',
        '오늘 이 기쁨, 충분히 느끼셔도 돼요. 기쁨은 부끄러운 게 아니에요.',
      ],
      high: [
        '정말 행복한 날이군요! 이 순간을 마음 깊이 새겨두세요. 힘든 날의 버팀목이 될 거예요.',
        '온몸으로 느껴지는 기쁨이군요. 오늘 이 감정, 메모해두세요. 당신이 행복할 수 있다는 증거예요.',
      ],
    },
  },

  // ── 설렘 ──────────────────────────────────────────────────
  excited: {
    colors: [
      { hex: '#FFB6C1', name: '라이트 핑크',  description: '설레는 마음처럼 살짝 빨개진 분홍이에요' },
      { hex: '#FF8FAB', name: '코랄 핑크',    description: '두근거리는 심장처럼 생기 넘치는 색이에요' },
      { hex: '#FFDDE6', name: '베이비 핑크',  description: '첫사랑처럼 수줍고 포근한 분홍이에요' },
      { hex: '#FF9EBC', name: '캔디 핑크',    description: '달콤한 설렘이 가득 담긴 색이에요' },
    ],
    songs: [
      { title: '라일락',       artist: 'IU',               reason: '봄처럼 설레는 선율이 딱 맞아요' },
      { title: 'Levitating',   artist: 'Dua Lipa',         reason: '두둥실 떠오르는 설렘을 표현한 곡이에요' },
      { title: 'FEVER',        artist: 'ENHYPEN',          reason: '뜨겁게 두근거리는 K-팝이에요' },
      { title: 'Love Poem',    artist: 'IU',               reason: '따뜻하고 설레는 마음을 담은 곡이에요' },
      { title: 'Romantic Sail', artist: 'Mellow Fellow',   reason: '시티팝 특유의 설렘이 가득해요' },
    ],
    quotes: [
      { text: '설렘은 아직 오지 않은 좋은 일이 오는 소리다.' },
      { text: '가슴이 두근거리는 일을 해라. 그것이 살아있다는 증거다.',   author: '스티브 잡스' },
      { text: '기대는 또 다른 형태의 희망이다.',                           author: '빅토르 위고' },
      { text: '두근거리는 마음, 그것이 삶을 아름답게 만든다.' },
    ],
    missions: [
      '설레는 이유를 세 줄로 적어두기',
      '좋아하는 플레이리스트 틀고 잠깐 눈 감고 느끼기',
      '기대되는 일정을 캘린더에 이모지와 함께 저장하기',
      '설레는 마음을 담아 일기 첫 줄만 써보기',
    ],
    comforts: {
      low: [
        '살짝 두근거리는 오늘이군요. 그 작은 설렘도 소중해요.',
        '은은하게 설레는 날이에요. 그 느낌 잘 간직하세요.',
      ],
      mid: [
        '두근거리는 감정, 그 자체가 살아있다는 신호예요. 충분히 즐기세요.',
        '설렘을 느낄 수 있다는 건 정말 멋진 일이에요.',
      ],
      high: [
        '온 마음이 두근거리는군요! 이 설렘, 잊지 마세요. 살아있다는 가장 강한 증거예요.',
        '이렇게 설레는 날이 있다는 것 자체가 행운이에요. 그 감정 오래오래 간직하세요.',
      ],
    },
  },

  // ── 평온 ──────────────────────────────────────────────────
  calm: {
    colors: [
      { hex: '#B2DFDB', name: '민트 그린',   description: '잔잔한 호수처럼 맑고 고요한 민트예요' },
      { hex: '#E0F7FA', name: '아이스 블루', description: '구름 한 점 없는 하늘색이에요' },
      { hex: '#80DEEA', name: '아쿠아',      description: '선선한 바람 같은 아쿠아 블루예요' },
      { hex: '#E8F5E9', name: '세이지 화이트', description: '이슬 맺힌 새벽 잎사귀 같은 색이에요' },
    ],
    songs: [
      { title: 'Weightless',         artist: 'Marconi Union',     reason: '과학적으로 긴장을 낮춰주는 곡이에요' },
      { title: '봄날',               artist: 'BTS',               reason: '고요하고 잔잔한 멜로디가 지금과 어울려요' },
      { title: 'Clair de Lune',      artist: 'Claude Debussy',    reason: '달빛처럼 차분하고 아름다운 클래식이에요' },
      { title: 'Forest (숲)',         artist: 'BTS',               reason: '자연 속에 있는 듯한 평온함을 줘요' },
      { title: 'Rainy Day',          artist: 'Ghibli Lofi',       reason: '비 오는 날 창가에 앉은 듯한 로파이예요' },
    ],
    quotes: [
      { text: '고요함 속에서 가장 많은 것을 들을 수 있다.',      author: '블레즈 파스칼' },
      { text: '평온은 인생에서 얻을 수 있는 가장 아름다운 선물이다.', author: '마르쿠스 아우렐리우스' },
      { text: '잠잠한 물이 깊다.' },
      { text: '아무것도 하지 않는 시간은 낭비가 아니다. 그것은 삶이다.' },
    ],
    missions: [
      '지금 이 순간 들리는 소리 세 가지 적어보기',
      '따뜻한 차 한 잔 천천히 두 손으로 감싸고 마시기',
      '5분간 아무것도 안 하고 그냥 앉아있기',
      '눈 감고 코로 4초 들이쉬고 4초 내쉬기 (5회)',
    ],
    comforts: {
      low: [
        '잔잔한 하루를 보내고 있군요. 이런 날도 참 좋아요.',
        '특별한 일 없는 오늘, 사실 그게 가장 좋은 날이에요.',
      ],
      mid: [
        '평온한 하루를 보내고 있군요. 이런 날들이 쌓여 삶의 기반이 됩니다.',
        '아무 일도 없는 오늘이 사실 가장 소중한 하루일 수 있어요.',
      ],
      high: [
        '마음이 완전히 고요하군요. 이 상태를 잘 기억해두세요. 흔들릴 때 돌아올 닻이 될 거예요.',
        '깊은 평온함이 느껴지는 날이에요. 이 감각, 언제든 떠올릴 수 있도록 한 번 더 느껴보세요.',
      ],
    },
  },

  // ── 뿌듯함 ────────────────────────────────────────────────
  proud: {
    colors: [
      { hex: '#A5D6A7', name: '새싹 그린',    description: '성장하는 새싹처럼 신선한 초록이에요' },
      { hex: '#FFD700', name: '골드',          description: '금메달처럼 빛나는 황금빛이에요' },
      { hex: '#81C784', name: '포레스트 민트', description: '잘 자란 나무처럼 든든한 초록이에요' },
      { hex: '#FFF176', name: '레몬 크림',     description: '따스한 성취감을 담은 연노랑이에요' },
    ],
    songs: [
      { title: 'Eye of the Tiger',     artist: 'Survivor',       reason: '해냈다는 뿌듯함에 딱 맞는 클래식 록이에요' },
      { title: 'On Top of the World',  artist: 'Imagine Dragons', reason: '세상 위에 선 것 같은 기분이 들어요' },
      { title: 'CELEBRATE',            artist: 'SHINee',          reason: '오늘의 성취를 같이 축하해주는 K-팝이에요' },
      { title: 'Champion',             artist: 'Fall Out Boy',    reason: '진짜 챔피언이 된 기분을 주는 곡이에요' },
    ],
    quotes: [
      { text: '자신을 자랑스러워할 줄 아는 것도 용기다.' },
      { text: '작은 진전도 진전이다. 한 걸음이 모여 길이 된다.' },
      { text: '오늘의 나는 어제의 나보다 조금 더 성장했다.' },
      { text: '잘했어요. 오늘의 당신이 그 증거예요.' },
    ],
    missions: [
      '오늘 잘한 일 세 가지를 소리 내어 말해보기',
      '나에게 "오늘 정말 잘했어"라고 메모 남기기',
      '달성한 일에 ✅ 표시하고 5초 동안 바라보기',
      '소중한 사람에게 오늘의 성취 자랑해보기',
    ],
    comforts: {
      low: [
        '작지만 뿌듯한 하루를 보냈군요. 그 감각 기억해두세요.',
        '소소하게 해냈다는 느낌, 그게 쌓여서 큰 힘이 돼요.',
      ],
      mid: [
        '오늘 잘하셨어요. 그 뿌듯함은 완전히 당신이 만들어낸 거예요.',
        '스스로를 자랑스럽게 여기는 감정, 충분히 누리세요. 당연한 거예요.',
      ],
      high: [
        '정말 대단한 하루를 보냈군요. 이 뿌듯함을 한껏 느끼세요. 당신 스스로가 만들어낸 거예요.',
        '이렇게 뿌듯한 날, 자주 오길 바라요. 오늘처럼 해낸 당신이 정말 자랑스러워요.',
      ],
    },
  },

  // ── 감사함 ────────────────────────────────────────────────
  grateful: {
    colors: [
      { hex: '#FFF9C4', name: '버터 옐로',   description: '따스한 감사의 마음을 담은 연노랑이에요' },
      { hex: '#FFECB3', name: '허니 앰버',   description: '꿀처럼 달콤하고 따뜻한 앰버예요' },
      { hex: '#FFF3E0', name: '피치 크림',   description: '아늑한 오후 햇살 같은 피치 크림이에요' },
      { hex: '#FFE082', name: '선플라워 크림', description: '해바라기처럼 환하고 따뜻한 색이에요' },
    ],
    songs: [
      { title: '고마워',               artist: '성시경',          reason: '감사함을 표현하는 데 이보다 어울리는 곡은 없어요' },
      { title: 'Count on Me',          artist: 'Bruno Mars',       reason: '소중한 사람들이 떠오르는 따뜻한 곡이에요' },
      { title: '고마워요',              artist: '볼빨간사춘기',     reason: '따뜻하고 진심 어린 감사 인사예요' },
      { title: 'Thank You',            artist: 'Boyz II Men',      reason: '진심이 담긴 클래식 R&B 감사곡이에요' },
    ],
    quotes: [
      { text: '감사하는 사람은 언제나 풍요롭다.' },
      { text: '오늘 하루에 감사할 것이 하나 이상이라면, 그것으로 충분하다.' },
      { text: '감사는 과거를 의미 있게 하고, 현재를 평화롭게 하며, 미래에 비전을 준다.', author: '멜로디 비티' },
      { text: '고마움을 느끼는 마음이 곧 풍요의 시작이다.' },
    ],
    missions: [
      '감사한 사람에게 짧은 메시지 한 통 보내기',
      '오늘 감사한 것 다섯 가지를 적어보기',
      '소중한 사람 얼굴 떠올리며 30초간 미소 짓기',
      '감사 일기 첫 줄 써보기 — "오늘 고마웠던 건..."',
    ],
    comforts: {
      low: [
        '오늘 감사함을 느꼈군요. 그 마음 자체가 아름다워요.',
        '작은 감사도 마음을 따뜻하게 해줘요. 잘하고 있어요.',
      ],
      mid: [
        '감사함을 느낄 수 있다는 건 마음이 건강하다는 증거예요.',
        '그 마음 잊지 마세요. 감사를 기억하는 사람은 늘 풍요로워요.',
      ],
      high: [
        '마음 깊은 곳에서 올라오는 감사함이 느껴지는군요. 그 감정이 당신의 삶을 더 아름답게 만들어요.',
        '이토록 감사함을 깊이 느끼다니, 당신 주변에 참 좋은 사람과 순간들이 많은 거예요.',
      ],
    },
  },

  // ── 사랑 ──────────────────────────────────────────────────
  love: {
    colors: [
      { hex: '#FF8A80', name: '로즈 레드',   description: '사랑에 빠진 마음처럼 붉고 따뜻한 색이에요' },
      { hex: '#FF80AB', name: '핫 핑크',     description: '사랑스러운 핑크, 지금 당신의 색이에요' },
      { hex: '#FCE4EC', name: '블러시 로즈', description: '포근하게 감싸는 연한 장밋빛이에요' },
      { hex: '#F48FB1', name: '딥 핑크',     description: '진하고 따뜻한 사랑의 분홍이에요' },
    ],
    songs: [
      { title: 'All of Me',       artist: 'John Legend',   reason: '온전히 사랑에 빠진 감정을 담은 곡이에요' },
      { title: '사랑인가요',       artist: '김동률',         reason: '사랑의 설레고 따뜻한 감정을 담았어요' },
      { title: 'Love Story',      artist: 'Taylor Swift',  reason: '사랑의 두근거림을 함께 느낄 수 있어요' },
      { title: '나의 사랑 내 곁에', artist: '이선희',        reason: '오래된 사랑의 따뜻함을 담은 명곡이에요' },
      { title: 'Perfect',         artist: 'Ed Sheeran',    reason: '사랑하는 사람을 떠올리게 하는 발라드예요' },
    ],
    quotes: [
      { text: '사랑받는 것도 행복이지만, 사랑하는 것은 더 큰 행복이다.', author: '빅토르 위고' },
      { text: '사랑은 삶을 의미 있게 만드는 것이다.',                   author: '파울로 코엘료' },
      { text: '사랑하는 사람 곁에 있으면, 세상이 조금 더 따뜻해진다.' },
      { text: '사랑은 동사다. 느끼는 것을 행동으로 보여줄 때 완성된다.',  author: '스티브 마라볼리' },
    ],
    missions: [
      '사랑하는 사람에게 "보고 싶어"라고 지금 바로 전하기',
      '그 사람과의 소중한 사진 한 장 꺼내보기',
      '사랑한다는 감정을 세 줄의 편지로 표현해보기',
      '오늘 함께하고 싶은 것을 메모해두기',
    ],
    comforts: {
      low: [
        '사랑하는 마음이 피어오르는군요. 그 따뜻함 오래 간직하세요.',
        '사랑을 느끼는 오늘이 특별해요. 충분히 느끼세요.',
      ],
      mid: [
        '사랑을 느끼고 있다니, 정말 아름다운 순간이에요. 충분히 누리세요.',
        '사랑하는 마음 자체가 이미 삶을 풍요롭게 해요.',
      ],
      high: [
        '온 마음이 사랑으로 가득 차 있군요. 이 감정, 정말 소중한 거예요. 그 사람에게, 혹은 당신 자신에게 충분히 표현하세요.',
        '이렇게 깊이 사랑을 느낄 수 있다는 것, 정말 아름다운 일이에요. 오늘 이 마음 꼭 전해보세요.',
      ],
    },
  },

  // ── 슬픔 ──────────────────────────────────────────────────
  sad: {
    colors: [
      { hex: '#90A4AE', name: '슬레이트 블루', description: '조용히 내리는 비처럼 차분한 색이에요' },
      { hex: '#B0BEC5', name: '실버 그레이',   description: '흐린 날 하늘처럼 은은하게 가라앉은 색이에요' },
      { hex: '#78909C', name: '스틸 블루',     description: '깊은 물속처럼 고요하고 깊은 색이에요' },
      { hex: '#CFD8DC', name: '페일 슬레이트', description: '슬픔이 잦아들 때의 연한 색이에요' },
    ],
    songs: [
      { title: 'The Night We Met',     artist: 'Lord Huron',       reason: '슬픔을 억지로 지우지 않아도 되는 인디 곡이에요' },
      { title: '나무',                 artist: '짙은',              reason: '울고 싶을 때 함께 울어줄 수 있는 노래예요' },
      { title: 'Someone Like You',     artist: 'Adele',             reason: '슬픔을 정면으로 바라보게 해주는 곡이에요' },
      { title: '가을 아침',            artist: 'IU',                reason: '조용히 눈물 흘리기 좋은 어쿠스틱이에요' },
      { title: 'Let Her Go',          artist: 'Passenger',          reason: '잃고 나서야 소중함을 깨닫는 슬픈 곡이에요' },
    ],
    quotes: [
      { text: '슬픔은 사랑했다는 증거다.' },
      { text: '눈물은 말로 표현 못 한 감정이 흘러나오는 것이다.',     author: '워싱턴 어빙' },
      { text: '울어도 괜찮아. 비가 와야 무지개가 뜨니까.' },
      { text: '슬픔을 느낄 수 있는 것은 아직 마음이 살아있다는 뜻이다.' },
    ],
    missions: [
      '이불 속에 5분만 파묻혀 있기',
      '좋아하는 따뜻한 음료 한 잔 천천히 마시기',
      '창밖을 바라보며 3분간 아무 생각 내려놓기',
      '지금 가장 보고 싶은 사람 떠올리며 잠깐 눈 감기',
    ],
    comforts: {
      low: [
        '살짝 마음이 무겁군요. 그래도 괜찮아요. 오늘 하루 잘 버텼어요.',
        '조금 슬픈 날도 있어요. 그 감정 그대로 두어도 돼요.',
      ],
      mid: [
        '슬퍼도 괜찮아요. 지금 느끼는 감정은 잘못된 게 아니에요. 충분히 울어도 돼요.',
        '힘든 하루를 버티고 있는 당신, 정말 잘하고 있어요. 오늘도 고생 많았어요.',
      ],
      high: [
        '많이 힘들군요. 혼자 다 담으려 하지 않아도 돼요. 오늘 이 슬픔, 그냥 느껴도 괜찮아요. 당신 곁에 있을게요.',
        '이렇게 깊은 슬픔을 느끼고 있군요. 그래도 오늘 이 자리에 있어줘서 고마워요. 당신은 충분히 잘하고 있어요.',
      ],
    },
  },

  // ── 외로움 ────────────────────────────────────────────────
  lonely: {
    colors: [
      { hex: '#CE93D8', name: '라벤더',     description: '아무도 없는 밤의 보랏빛 하늘이에요' },
      { hex: '#E1BEE7', name: '라일락',     description: '홀로 피어난 라벤더처럼 은은한 색이에요' },
      { hex: '#9C27B0', name: '딥 퍼플',   description: '혼자만의 깊고 깊은 자색이에요' },
      { hex: '#EDE7F6', name: '라일락 미스트', description: '멀리서 바라보는 노을 같은 연보라예요' },
    ],
    songs: [
      { title: '너에게 난, 나에게 넌', artist: '성시경',     reason: '외로운 밤을 함께해줄 따뜻한 목소리예요' },
      { title: 'Fix You',             artist: 'Coldplay',    reason: '곁에 있어주고 싶다는 마음을 담은 곡이에요' },
      { title: '솔로 (SOLO)',          artist: 'JENNIE',     reason: '혼자도 괜찮다고 말해주는 K-팝이에요' },
      { title: '혼자이고 싶어',        artist: '이소라',      reason: '외로움을 솔직하게 표현한 인디 발라드예요' },
      { title: 'Better Together',     artist: 'Jack Johnson', reason: '함께하고 싶다는 마음을 담은 따뜻한 곡이에요' },
    ],
    quotes: [
      { text: '혼자라는 것은 스스로와 함께 있는 것이다.',      author: '폴 틸리히' },
      { text: '고독은 생각을 깊게 만든다.',                    author: '쇼펜하우어' },
      { text: '외로움은 누군가와 연결되고 싶다는 마음이다. 그 마음은 옳다.' },
      { text: '혼자인 시간이 자기 자신을 만나게 해준다.' },
    ],
    missions: [
      '좋아하는 사람에게 안부 전화 한 통 하기',
      '따뜻한 조명 켜고 좋아하는 영화나 음악 틀기',
      '나에게 "오늘도 수고했어"라고 크게 말하기',
      '온라인 커뮤니티에 짧은 글 한 줄 남기기',
    ],
    comforts: {
      low: [
        '살짝 외로운 오늘이군요. 혼자인 시간도 소중해요.',
        '조금 허전한 날이에요. 그래도 당신은 혼자가 아니에요.',
      ],
      mid: [
        '외로움을 느끼는 건 연결을 원한다는 신호예요. 그 마음은 정상이에요.',
        '지금 혼자인 것 같아도, 당신을 생각하는 사람이 분명히 있어요.',
      ],
      high: [
        '깊은 외로움을 느끼고 있군요. 그 감정을 억지로 밀어내지 않아도 돼요. 지금 이 순간도 당신 편인 사람이 있어요.',
        '이토록 외로운 날, 정말 힘들겠어요. 오늘 한 명에게만 연락해보세요. 당신 생각에 기뻐할 사람이 꼭 있어요.',
      ],
    },
  },

  // ── 우울 ──────────────────────────────────────────────────
  depressed: {
    colors: [
      { hex: '#546E7A', name: '슬레이트 그레이', description: '흐리고 어두운 날의 색이에요' },
      { hex: '#607D8B', name: '블루 그레이',     description: '무거운 마음처럼 차분하고 깊은 색이에요' },
      { hex: '#455A64', name: '다크 슬레이트',   description: '깊은 밤 바다처럼 어둡고 고요한 색이에요' },
      { hex: '#78909C', name: '스틸 블루 그레이', description: '빗속을 걷는 것 같은 색이에요' },
    ],
    songs: [
      { title: '광화문에서',                    artist: '규현',                reason: '우울한 날에도 함께 걸어줄 수 있는 노래예요' },
      { title: 'The Sound of Silence',         artist: 'Simon & Garfunkel',   reason: '우울한 감정을 억압하지 않고 표현해요' },
      { title: '사월이 지나면 우리 헤어져요',   artist: '적재',                reason: '깊은 감정을 함께 느껴볼 수 있어요' },
      { title: 'Holocene',                     artist: 'Bon Iver',            reason: '우울한 날 위로가 되는 인디 포크예요' },
      { title: 'River',                        artist: 'Leon Bridges',        reason: '우울함을 부드럽게 감싸주는 소울 곡이에요' },
    ],
    quotes: [
      { text: '가장 어두운 밤이 지나면, 가장 밝은 아침이 온다.',   author: '빅토르 위고' },
      { text: '폭풍은 영원히 계속되지 않는다.' },
      { text: '지금 이 감정도 지나간다. 당신은 생각보다 강하다.' },
      { text: '살아있는 것만으로도 충분히 잘하고 있다.' },
    ],
    missions: [
      '지금 당장 할 수 있는 가장 작은 일 하나만 하기 (예: 물 한 잔 마시기)',
      '15분만 밖에 나가 햇빛 쐬기',
      '믿을 수 있는 한 사람에게 "요즘 좀 힘들어"라고 솔직하게 말해보기',
      '오늘 하루 중 그나마 나았던 순간 한 가지만 떠올려보기',
    ],
    comforts: {
      low: [
        '좀 우울한 날이군요. 그래도 오늘 하루 잘 버텼어요.',
        '무기력한 날도 있어요. 아무것도 안 해도 괜찮아요.',
      ],
      mid: [
        '우울한 날은 지나가요. 지금 느끼는 이 감정이 영원하지 않아요. 오늘 하루만 버텨요.',
        '이렇게 힘든데도 오늘 하루를 버텨낸 당신, 생각보다 훨씬 강한 사람이에요.',
      ],
      high: [
        '많이 힘드군요. 오늘 아무것도 못 해도 괜찮아요. 살아있는 것만으로 충분해요. 당신 곁에 있을게요.',
        '이토록 힘든 감정을 혼자 품고 있었군요. 전문가의 도움을 받아보는 것도 용기 있는 선택이에요. 당신은 혼자가 아니에요.',
      ],
    },
  },

  // ── 분노 ──────────────────────────────────────────────────
  angry: {
    colors: [
      { hex: '#FF7043', name: '버닝 오렌지',  description: '활활 타오르는 분노처럼 강렬한 오렌지 레드예요' },
      { hex: '#BF360C', name: '딥 레드',      description: '뜨거운 마음이 쏟아져 나오는 딥 레드예요' },
      { hex: '#FFCCBC', name: '피치 살구',    description: '분노가 잠잠해질 때의 부드러운 살구색이에요' },
      { hex: '#FF5722', name: '딥 오렌지',    description: '타오르는 불꽃 같은 딥 오렌지예요' },
    ],
    songs: [
      { title: '화',                   artist: 'BTS',              reason: '내 분노를 이해해주는 가사가 있어요' },
      { title: 'Break Stuff',          artist: 'Limp Bizkit',      reason: '분노를 밖으로 터뜨릴 수 있는 록이에요' },
      { title: 'Killing in the Name',  artist: 'Rage Against the Machine', reason: '강렬하게 에너지를 발산하는 곡이에요' },
      { title: 'Fighter',              artist: 'Christina Aguilera', reason: '분노를 힘으로 바꾸는 곡이에요' },
      { title: '분노의 질주 OST',       artist: 'Brian Tyler',      reason: '강렬한 오케스트라로 에너지를 발산해요' },
    ],
    quotes: [
      { text: '분노를 느끼는 것은 괜찮다. 그러나 분노에 먹히는 것은 위험하다.' },
      { text: '화를 내기 전에 열을 세어라. 그래도 화가 나면 백을 세어라.',   author: '토머스 제퍼슨' },
      { text: '분노는 자신을 태우는 불이다.',                                author: '부처' },
      { text: '화는 에너지다. 어디에 쓸지를 선택하는 것은 나다.' },
    ],
    missions: [
      '종이에 지금 감정을 빠르게 쓰고 구기기',
      '30초간 팔 힘차게 흔들거나 제자리 뛰기',
      '5분간 빠른 걸음으로 걷기',
      '찬물로 얼굴 씻고 거울 보기',
    ],
    comforts: {
      low: [
        '살짝 화가 나는군요. 그 감정 자연스러운 거예요.',
        '작은 화도 유효한 감정이에요. 잘 처리하면 돼요.',
      ],
      mid: [
        '화가 나는 건 당연해요. 그 감정이 뭔가 중요한 것을 알려주고 있을 거예요.',
        '분노를 느끼는 당신의 감정은 유효해요. 그 에너지를 잘 쓸 방법을 찾아봐요.',
      ],
      high: [
        '많이 화가 나있군요. 그 분노는 당신이 중요하게 여기는 것이 침해받았기 때문이에요. 일단 몸을 움직여 에너지를 빼내세요.',
        '이렇게 강하게 화가 날 때는, 지금 당장 결정하지 않아도 돼요. 조금 진정되고 나서 다시 생각해도 늦지 않아요.',
      ],
    },
  },

  // ── 짜증 ──────────────────────────────────────────────────
  irritated: {
    colors: [
      { hex: '#FFB74D', name: '앰버 오렌지',  description: '은근히 끓어오르는 주황빛 짜증이에요' },
      { hex: '#FF8F00', name: '딥 앰버',      description: '신호등처럼 눈에 띄는 앰버 오렌지예요' },
      { hex: '#FFF3E0', name: '크림 오렌지',  description: '짜증이 조금 가라앉을 때의 연한 오렌지예요' },
      { hex: '#FFE0B2', name: '퍼시몬',       description: '타오르는 듯한 옅은 오렌지예요' },
    ],
    songs: [
      { title: 'Bad Day',         artist: 'Daniel Powter',   reason: '나쁜 하루를 공감해주는 팝이에요' },
      { title: 'Shake It Off',    artist: 'Taylor Swift',    reason: '다 털어버리자고 외치는 곡이에요' },
      { title: '쓸쓸함',          artist: '짙은',            reason: '잔잔하게 기분을 환기시켜줄 거예요' },
      { title: 'Stressed Out',    artist: 'Twenty One Pilots', reason: '스트레스를 공감해주는 얼터너티브예요' },
    ],
    quotes: [
      { text: '짜증은 내가 통제할 수 없는 것에 대한 반응이다. 통제할 수 있는 것에 집중하자.' },
      { text: '기분이 나쁠 땐 잠시 멈추는 것이 최선이다.' },
      { text: '오늘의 짜증은 내일의 웃음거리가 된다.' },
      { text: '모든 짜증에는 이유가 있다. 그 이유를 찾으면 해결책도 보인다.' },
    ],
    missions: [
      '짜증의 원인을 한 줄로 적고 "해결 가능한가?" 판단하기',
      '찬물에 손 씻기 (기분 전환 효과 있어요)',
      '좋아하는 간식 하나 먹기',
      '잠깐 자리에서 일어나 스트레칭 2분 하기',
    ],
    comforts: {
      low: [
        '살짝 짜증나는 날이군요. 그럴 수 있어요.',
        '소소하게 기분이 안 좋은 날도 있어요. 금방 지나갈 거예요.',
      ],
      mid: [
        '짜증나는 날이 있어요. 모든 날이 좋을 수는 없으니까요.',
        '짜증나는 당신도 괜찮아요. 감정을 숨기지 않아도 돼요.',
      ],
      high: [
        '많이 짜증스럽군요. 오늘 정말 힘들었겠어요. 잠깐 모든 걸 내려놓고 쉬어도 돼요.',
        '이렇게까지 짜증이 쌓였다면 뭔가 제대로 쉬어야 할 신호예요. 오늘 딱 하나만 내려놓아보세요.',
      ],
    },
  },

  // ── 불안 ──────────────────────────────────────────────────
  anxious: {
    colors: [
      { hex: '#CE93D8', name: '소프트 라벤더', description: '불안처럼 아른거리는 연보라예요' },
      { hex: '#9575CD', name: '라벤더 퍼플',  description: '진정되기를 기다리는 라벤더 퍼플이에요' },
      { hex: '#EDE7F6', name: '라일락 미스트', description: '불안이 걷히고 나면 보이는 연한 라일락이에요' },
      { hex: '#B39DDB', name: '미디엄 퍼플',  description: '잔잔하게 진정되는 보라색이에요' },
    ],
    songs: [
      { title: 'Breathe (2 AM)',  artist: 'Anna Nalick',         reason: '숨 쉬라고 말해주는 곡이에요' },
      { title: 'Weightless',      artist: 'Marconi Union',        reason: '불안을 줄여주는 것으로 알려진 로파이예요' },
      { title: 'The Night',       artist: 'Lauv & BTS',           reason: '불안한 밤을 함께해주는 K-인디예요' },
      { title: 'Aqueous Transmission', artist: 'Incubus',         reason: '불안을 잠재우는 명상 같은 곡이에요' },
      { title: 'Gymnopédie No.1', artist: 'Erik Satie',           reason: '마음을 차분하게 가라앉혀주는 클래식이에요' },
    ],
    quotes: [
      { text: '불안은 아직 일어나지 않은 일에 대한 두려움이다. 지금 이 순간에 집중하라.' },
      { text: '걱정의 90%는 일어나지 않는다.' },
      { text: '지금 이 순간만 살아라. 과거도 미래도 아닌 바로 지금.',       author: '에크하르트 톨레' },
      { text: '숨을 쉬어라. 그것이 모든 것의 시작이다.' },
    ],
    missions: [
      '4-7-8 호흡: 4초 들이쉬고 → 7초 참고 → 8초 내쉬기 (3회)',
      '발이 바닥에 닿는 느낌에 집중하며 1분간 서 있기',
      '지금 주변에서 보이는 것 5가지, 들리는 것 3가지 적어보기',
      '양손을 무릎에 올리고 눈 감고 3번 깊게 숨쉬기',
    ],
    comforts: {
      low: [
        '조금 불안한가요. 그래도 지금 이 순간은 안전해요.',
        '살짝 마음이 불안하군요. 숨 한 번 크게 쉬어봐요.',
      ],
      mid: [
        '불안하다는 건 당신이 중요하게 여기는 것이 있다는 뜻이에요. 그 마음이 소중해요.',
        '지금 숨을 쉬고 있어요. 그것만으로도 충분해요. 한 번에 한 걸음씩이면 돼요.',
      ],
      high: [
        '많이 불안하군요. 지금 당장 해결하려 하지 않아도 돼요. 일단 숨부터 같이 쉬어봐요 — 들이쉬고… 내쉬고…',
        '이토록 강한 불안을 느끼고 있군요. 혼자 감당하려 하지 말고, 믿을 수 있는 사람에게 지금 느끼는 것을 말해보세요.',
      ],
    },
  },

  // ── 두려움 ────────────────────────────────────────────────
  fearful: {
    colors: [
      { hex: '#A5D6A7', name: '세이지 그린',  description: '두려움 속에서도 찾아볼 수 있는 연한 희망이에요' },
      { hex: '#66BB6A', name: '스프링 그린',  description: '두려움을 이겨낸 자리에 피어나는 초록이에요' },
      { hex: '#E8F5E9', name: '민트 화이트',  description: '두려움이 차분히 가라앉을 때의 민트 크림이에요' },
      { hex: '#C8E6C9', name: '페일 세이지',  description: '두려움을 품은 채 앞으로 가는 색이에요' },
    ],
    songs: [
      { title: 'Brave',           artist: 'Sara Bareilles',    reason: '두려워도 용감하게 나아가자는 곡이에요' },
      { title: 'Fight Song',      artist: 'Rachel Platten',    reason: '작은 용기를 북돋아 주는 팝이에요' },
      { title: '바람이 분다',      artist: 'IU',                reason: '두려움 앞에서도 담담하게 서 있을 힘이 돼요' },
      { title: 'Hall of Fame',    artist: 'The Script',        reason: '두려워도 나아가는 용기를 주는 곡이에요' },
      { title: '무서워도 괜찮아',  artist: '숲',                reason: '두려운 마음을 이해해주는 인디 곡이에요' },
    ],
    quotes: [
      { text: '용감한 것은 두렵지 않은 게 아니라, 두려워도 행동하는 것이다.', author: '마크 트웨인' },
      { text: '두려움과 친해져라. 그것이 성장의 시작이다.' },
      { text: '두려움은 실패가 아니다. 피하는 것이 실패다.' },
      { text: '지금 무서운 것, 나중에 가장 잘한 선택이 될 수도 있다.' },
    ],
    missions: [
      '두려운 것을 종이에 적고, 최악의 경우와 해결책 함께 적어보기',
      '신뢰하는 사람에게 두려운 감정 솔직하게 털어놓기',
      '두렵지만 아주 작은 한 걸음만 내딛기',
      '지금 몸에서 두려움이 어디 있는지 느껴보고 그 부위 손으로 감싸기',
    ],
    comforts: {
      low: [
        '조금 두려운가요. 그 감각은 당신이 진지하게 생각하고 있다는 증거예요.',
        '살짝 무서운 오늘이군요. 그래도 여기까지 왔잖아요.',
      ],
      mid: [
        '두려움을 느끼는 건 나쁜 게 아니에요. 그것이 당신이 살아있다는 증거예요.',
        '무서운 거 당연해요. 하지만 당신은 생각보다 훨씬 강해요.',
      ],
      high: [
        '지금 많이 두렵군요. 그 두려움, 혼자 감당하려 하지 않아도 돼요. 옆에 있어줄 사람을 찾아보세요.',
        '이렇게 깊은 두려움이 있군요. 당신이 두려워하는 것이 그만큼 소중하다는 뜻이에요. 천천히, 한 걸음씩이면 돼요.',
      ],
    },
  },

  // ── 허무 ──────────────────────────────────────────────────
  empty: {
    colors: [
      { hex: '#ECEFF1', name: '페일 그레이',  description: '아무것도 채워지지 않은 듯한 페일 블루그레이예요' },
      { hex: '#CFD8DC', name: '클라우드 그레이', description: '텅 빈 방의 고요한 회색이에요' },
      { hex: '#B0BEC5', name: '실버 미스트',  description: '허무함처럼 희미하게 남아있는 실버 그레이예요' },
      { hex: '#90A4AE', name: '블루 그레이',  description: '빈 하늘처럼 펼쳐진 색이에요' },
    ],
    songs: [
      { title: '빈 방',           artist: '짙은',              reason: '허무함을 억지로 채우려 하지 않는 어쿠스틱이에요' },
      { title: 'The A Team',      artist: 'Ed Sheeran',        reason: '조용히 마음을 들여다보게 하는 곡이에요' },
      { title: 'Fade Into You',   artist: 'Mazzy Star',        reason: '텅 빈 감정을 조용히 품어주는 슈게이징이에요' },
      { title: 'Motion Picture Soundtrack', artist: 'Radiohead', reason: '허무함 속에 아름다움을 찾게 해줘요' },
    ],
    quotes: [
      { text: '비어있어야 채울 수 있다.',                  author: '노자' },
      { text: '허무함은 새로운 것을 담을 준비가 된 상태다.' },
      { text: '모든 것이 덧없어 보이는 날이 있다. 그 느낌도 진실이다.' },
      { text: '지금 이 텅 빈 느낌도 지나간다.' },
    ],
    missions: [
      '지금 몸의 감각 하나에 집중해보기 (발이 차갑다, 손이 따뜻하다 등)',
      '오늘 단 하나라도 의미 있었던 순간 떠올려보기',
      '좋아하는 냄새 (커피, 향수 등) 맡으며 현재로 돌아오기',
      '유리창에 이름 한 글자 써보기 (현재를 느끼는 행동)',
    ],
    comforts: {
      low: [
        '살짝 허전한 오늘이군요. 그래도 오늘을 보내고 있잖아요.',
        '의미 없는 날 같아도, 그 하루가 쌓여 삶이 돼요.',
      ],
      mid: [
        '허무함을 느끼는 날도 있어요. 억지로 의미를 찾지 않아도 돼요.',
        '비어있는 지금이 오히려 새로운 것들이 들어올 자리를 만드는 거예요.',
      ],
      high: [
        '깊은 허무감이 드는군요. 그 감정 억지로 채우려 하지 않아도 돼요. 오늘은 그냥 이 느낌과 함께 있어보세요.',
        '이토록 텅 빈 느낌이 드는 건 뭔가 재설정이 필요하다는 신호일 수 있어요. 지금 당신이 진짜 원하는 게 무엇인지 천천히 생각해봐도 좋아요.',
      ],
    },
  },

  // ── 피곤함 ────────────────────────────────────────────────
  tired: {
    colors: [
      { hex: '#D7CCC8', name: '그레이 베이지',  description: '지친 몸처럼 부드럽고 따뜻한 그레이 베이지예요' },
      { hex: '#BCAAA4', name: '로즈 브라운',    description: '눈꺼풀처럼 무겁게 가라앉은 로즈 브라운이에요' },
      { hex: '#EFEBE9', name: '크리미 베이지',  description: '깊은 잠에 들기 직전의 크리미 베이지예요' },
      { hex: '#A1887F', name: '따뜻한 모카',    description: '따뜻한 담요처럼 포근한 모카 브라운이에요' },
    ],
    songs: [
      { title: 'Saturn',           artist: 'Sleeping at Last',   reason: '지친 몸을 부드럽게 쉬게 해주는 로파이예요' },
      { title: '잠',               artist: '멜로망스',            reason: '포근하게 잠들고 싶을 때 딱이에요' },
      { title: 'Nuvole Bianche',   artist: 'Ludovico Einaudi',   reason: '피아노 선율이 지친 마음을 쉬게 해줘요' },
      { title: '편히 쉬어요',      artist: '에픽하이',            reason: '지친 당신에게 건네는 따뜻한 인사예요' },
      { title: 'Sleepyhead',       artist: 'Passion Pit',        reason: '피곤하지만 포근한 느낌을 주는 인디팝이에요' },
    ],
    quotes: [
      { text: '잘 쉬는 것도 능력이다.' },
      { text: '지쳤을 때 멈추는 건 포기가 아니라 전략이다.' },
      { text: '몸이 쉬고 싶다고 하면, 귀 기울여야 한다.' },
      { text: '오늘의 휴식이 내일의 에너지가 된다.' },
    ],
    missions: [
      '지금 당장 눈 감고 10분만 쉬기',
      '오늘 일정 중 하나를 내일로 미루기 (완벽하지 않아도 됩니다)',
      '따뜻한 물로 샤워하거나 족욕하기',
      '스마트폰 30분 내려놓기',
    ],
    comforts: {
      low: [
        '살짝 피곤한 오늘이군요. 조금만 쉬면 괜찮아질 거예요.',
        '소소하게 지쳤군요. 오늘 조금 일찍 쉬어봐요.',
      ],
      mid: [
        '많이 지쳤군요. 오늘은 그냥 쉬어도 돼요. 아무것도 안 해도 괜찮아요.',
        '지친 당신도 충분히 잘하고 있어요. 오늘 하루 수고 많았어요.',
      ],
      high: [
        '몸과 마음이 모두 지쳐있군요. 오늘은 정말로 아무것도 안 해도 돼요. 쉬는 것이 지금 가장 중요한 일이에요.',
        '이렇게 피곤한데도 하루를 버텨냈군요. 정말 대단해요. 오늘 밤은 푹 자도록 해요. 내일은 조금 더 나아질 거예요.',
      ],
    },
  },

  // ── 멍함 ──────────────────────────────────────────────────
  blank: {
    colors: [
      { hex: '#E3F2FD', name: '스카이 블루',   description: '아무 생각 없이 보는 하늘처럼 맑고 연한 블루예요' },
      { hex: '#BBDEFB', name: '베이비 블루',   description: '멍하게 바라보는 창밖 같은 스카이 블루예요' },
      { hex: '#F8F9FA', name: '퓨어 화이트',   description: '아무것도 아닌 것들로 가득한 흰 공간이에요' },
      { hex: '#E1F5FE', name: '아이시 블루',   description: '시원하게 비어있는 느낌의 색이에요' },
    ],
    songs: [
      { title: 'lo-fi beats to study/relax to', artist: 'Lofi Girl', reason: '아무 생각 없이 흘려보내기 좋은 로파이예요' },
      { title: '오후의 볕',                      artist: '짙은',       reason: '멍한 오후를 함께 보내기 좋은 곡이에요' },
      { title: 'Experience',                    artist: 'Ludovico Einaudi', reason: '멍하게 떠돌아다니는 기분에 어울려요' },
      { title: '첫 눈',                          artist: 'IU',          reason: '조용하게 시간을 보내기 좋은 어쿠스틱이에요' },
    ],
    quotes: [
      { text: '멍하게 있는 것도 뇌가 정리되는 시간이다.' },
      { text: '아무 생각 없이 있어도 괜찮다. 그냥 지금 있으면 된다.' },
      { text: '멍은 마음의 방전이 아니라 재충전이다.' },
      { text: '가끔은 아무것도 생각하지 않는 것이 가장 좋은 생각이다.' },
    ],
    missions: [
      '창밖을 5분간 그냥 바라보기',
      '핸드폰 내려놓고 1분간 멍때리기',
      '지금 이 순간 몸의 느낌에만 집중해보기',
      '커피나 차 한 잔 만들어 냄새 맡으며 현재로 돌아오기',
    ],
    comforts: {
      low: [
        '살짝 멍한 날이군요. 그래도 괜찮아요. 그냥 흘러가도 돼요.',
        '아무 생각 없는 오늘, 그것도 하나의 쉬는 방식이에요.',
      ],
      mid: [
        '멍한 날도 있어요. 억지로 뭔가를 느끼려 하지 않아도 돼요.',
        '오늘은 그냥 흘러가도 괜찮아요. 모든 날이 의미 있어야 할 필요는 없어요.',
      ],
      high: [
        '완전히 멍한 상태군요. 지금은 그냥 그대로 있어도 돼요. 뇌도 가끔은 리셋이 필요해요.',
        '이렇게 아무것도 없는 것 같은 날, 사실 모든 게 내려앉는 시간이에요. 오늘은 그냥 쉬는 날이에요.',
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// 처방 생성
// ─────────────────────────────────────────────────────────────

/** LCG 기반 시드 랜덤 — 같은 seed면 항상 같은 결과 */
function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s, 1664525) + 1013904223;
    return (s >>> 0) / 0x100000000;
  };
}

export function generatePrescription(
  emotionKey: EmotionKey,
  intensity: number,
  memo: string | undefined,
  seed?: number,
): MoodEntry['prescription'] {
  const pool  = POOLS[emotionKey];
  const rand  = seededRandom(seed ?? Date.now());
  const pick  = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const b = band(intensity);

  const color   = pick(pool.colors);
  const song    = pick(pool.songs);
  const quote   = pick(pool.quotes);
  const mission = pick(pool.missions);
  let   comfort = pick(pool.comforts[b]);

  // 메모가 있으면 위로 메시지 앞에 반영
  if (memo && memo.trim().length > 5) {
    const snippet = memo.length > 20 ? memo.slice(0, 20) + '…' : memo;
    comfort = `"${snippet}" — 그 마음, 충분히 이해해요. ${comfort}`;
  }

  return { color, song, quote, mission, comfort };
}
