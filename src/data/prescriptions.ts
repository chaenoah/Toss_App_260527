import type { EmotionKey, MoodEntry } from '../types';

type PrescriptionPool = {
  colors: Array<{ hex: string; name: string; description: string }>;
  songs: Array<{ title: string; artist: string; reason: string }>;
  quotes: Array<{ text: string; author?: string }>;
  missions: string[];
  comforts: string[];
};

const POOLS: Record<EmotionKey, PrescriptionPool> = {
  joy: {
    colors: [
      { hex: '#FFE066', name: '선샤인 옐로우', description: '햇살처럼 반짝이는 황금빛이에요' },
      { hex: '#FFC8A2', name: '피치 크림', description: '복숭아처럼 달콤하고 환한 색이에요' },
      { hex: '#FFFDE7', name: '크리미 화이트', description: '따뜻한 오후 햇살을 담은 크림색이에요' },
    ],
    songs: [
      { title: 'Happy', artist: 'Pharrell Williams', reason: '온몸으로 기쁨을 표현하고 싶을 때' },
      { title: '좋은 날', artist: 'IU', reason: '오늘의 기분과 꼭 닮은 곡이에요' },
      { title: "Can't Stop the Feeling!", artist: 'Justin Timberlake', reason: '움직이고 싶어지는 에너지가 넘쳐요' },
    ],
    quotes: [
      { text: '기쁨은 나누면 두 배가 된다.', author: '괴테' },
      { text: '행복한 순간을 놓치지 마세요. 지금 이 순간이 나중에 그리워질 추억이 됩니다.' },
      { text: '웃음은 마음의 비타민이다.', author: '마거릿 어네스트' },
    ],
    missions: [
      '좋아하는 사람에게 "오늘 기분 좋아서 생각났어"라고 문자 보내기',
      '창문 열고 맑은 공기 마시며 5초간 웃기',
      '오늘의 기쁜 순간을 사진 한 장으로 남기기',
    ],
    comforts: [
      '오늘 이 기쁨, 충분히 느끼셔도 돼요. 기쁨은 부끄러운 게 아니에요.',
      '좋은 하루를 보내고 있군요. 이 에너지가 내일까지 이어지길 바랍니다.',
      '기분이 좋을 때 그 느낌을 잘 기억해두세요. 힘든 날의 버팀목이 될 거예요.',
    ],
  },
  excited: {
    colors: [
      { hex: '#FFB6C1', name: '라이트 핑크', description: '설레는 마음처럼 살짝 빨개진 분홍이에요' },
      { hex: '#FF8FAB', name: '코랄 핑크', description: '두근거리는 심장처럼 생기 넘치는 색이에요' },
      { hex: '#FFDDE6', name: '베이비 핑크', description: '첫사랑처럼 수줍고 포근한 분홍이에요' },
    ],
    songs: [
      { title: 'Dynamite', artist: 'BTS', reason: '설레는 마음을 터뜨릴 에너지가 필요할 때' },
      { title: '라일락', artist: 'IU', reason: '봄의 설렘과 꼭 닮은 선율이에요' },
      { title: 'Levitating', artist: 'Dua Lipa', reason: '두둥실 떠오르는 설렘을 표현한 곡이에요' },
    ],
    quotes: [
      { text: '설렘이란, 아직 오지 않은 좋은 일이 오는 소리다.' },
      { text: '가슴이 두근거리는 일을 해라. 그것이 살아있다는 증거다.', author: '스티브 잡스' },
      { text: '기대는 또 다른 형태의 희망이다.', author: '빅토르 위고' },
    ],
    missions: [
      '설레는 이유를 세 줄로 적어보기',
      '좋아하는 플레이리스트 틀고 잠깐 눈 감기',
      '기대되는 일정을 캘린더에 이모지와 함께 저장하기',
    ],
    comforts: [
      '두근거리는 감정, 그 자체가 살아있다는 신호예요. 충분히 즐기세요.',
      '설렘을 느낄 수 있다는 건 정말 멋진 일이에요. 그 감정 오래 간직하세요.',
    ],
  },
  calm: {
    colors: [
      { hex: '#B2DFDB', name: '민트 그린', description: '잔잔한 호수처럼 맑고 고요한 민트예요' },
      { hex: '#E0F7FA', name: '아이스 블루', description: '구름 한 점 없는 하늘색이에요' },
      { hex: '#80DEEA', name: '아쿠아 블루', description: '선선한 바람 같은 아쿠아 블루예요' },
    ],
    songs: [
      { title: 'Weightless', artist: 'Marconi Union', reason: '세상에서 가장 편안한 곡 중 하나예요' },
      { title: '봄날', artist: 'BTS', reason: '고요하고 잔잔한 멜로디가 지금과 어울려요' },
      { title: 'Clair de Lune', artist: 'Debussy', reason: '달빛처럼 차분하고 아름다운 곡이에요' },
    ],
    quotes: [
      { text: '고요함 속에서 가장 많은 것을 들을 수 있다.', author: '파스칼' },
      { text: '평온은 모든 덕의 어머니다.', author: '키케로' },
      { text: '잠잠한 물이 깊다.' },
    ],
    missions: [
      '지금 이 순간 들리는 소리 세 가지 적어보기',
      '따뜻한 차 한 잔 천천히 마시기',
      '5분간 아무것도 안 하고 그냥 앉아있기',
    ],
    comforts: [
      '평온한 하루를 보내고 있군요. 이런 날들이 쌓여 삶의 기반이 됩니다.',
      '아무 일도 없는 오늘이 사실 가장 좋은 날일 수 있어요.',
    ],
  },
  proud: {
    colors: [
      { hex: '#A5D6A7', name: '새싹 그린', description: '성장하는 새싹처럼 신선한 초록이에요' },
      { hex: '#FFD700', name: '골드', description: '금메달처럼 빛나는 황금빛이에요' },
      { hex: '#81C784', name: '포레스트 민트', description: '잘 자란 나무처럼 든든한 초록이에요' },
    ],
    songs: [
      { title: 'Eye of the Tiger', artist: 'Survivor', reason: '해냈다는 뿌듯함에 딱 맞는 곡이에요' },
      { title: 'On Top of the World', artist: 'Imagine Dragons', reason: '세상 위에 선 것 같은 기분이 들어요' },
      { title: '우리들의 블루스', artist: '이적', reason: '묵묵히 해낸 당신에게 어울리는 곡이에요' },
    ],
    quotes: [
      { text: '자신을 자랑스러워할 줄 아는 것도 용기다.' },
      { text: '작은 진전도 진전이다.' },
      { text: '오늘의 나는 어제의 나보다 조금 더 성장했다.' },
    ],
    missions: [
      '오늘 잘한 일 세 가지를 큰 소리로 말해보기',
      '나에게 수고했다고 문자 한 통 쓰기',
      '달성한 일을 메모에 기록하고 ✅ 표시하기',
    ],
    comforts: [
      '오늘 잘하셨어요. 그 뿌듯함은 완전히 당신이 만들어낸 거예요.',
      '스스로를 자랑스럽게 여기는 감정, 충분히 누리세요. 당연한 거예요.',
    ],
  },
  grateful: {
    colors: [
      { hex: '#FFF9C4', name: '버터 옐로우', description: '따스한 감사의 마음을 담은 연노랑이에요' },
      { hex: '#FFECB3', name: '허니 앰버', description: '꿀처럼 달콤하고 따뜻한 앰버예요' },
      { hex: '#FFF3E0', name: '피치 크림', description: '아늑한 오후 햇살 같은 피치 크림이에요' },
    ],
    songs: [
      { title: 'Thank You', artist: 'Dido', reason: '감사한 마음을 차분히 전하는 곡이에요' },
      { title: 'Count on Me', artist: 'Bruno Mars', reason: '소중한 사람들이 떠오르는 따뜻한 곡이에요' },
      { title: '고마워', artist: '성시경', reason: '감사함을 표현하는 데 이보다 어울리는 곡은 없어요' },
    ],
    quotes: [
      { text: '감사하는 사람은 언제나 풍요롭다.' },
      { text: '오늘 하루에 감사할 것이 하나 이상이라면, 그것으로 충분하다.' },
      { text: '감사는 기억하는 마음이다.', author: '니체' },
    ],
    missions: [
      '감사한 사람에게 짧은 메시지 보내기',
      '오늘 감사한 것 다섯 가지 적어보기',
      '소중한 사람 얼굴 떠올리며 30초간 미소 짓기',
    ],
    comforts: [
      '감사함을 느낄 수 있다는 건 마음이 건강하다는 증거예요.',
      '그 마음 잊지 마세요. 감사를 기억하는 사람은 늘 풍요로워요.',
    ],
  },
  love: {
    colors: [
      { hex: '#FF8A80', name: '로즈 레드', description: '사랑에 빠진 마음처럼 붉고 따뜻한 색이에요' },
      { hex: '#FF80AB', name: '핫 핑크', description: '사랑스러운 핑크, 지금 당신의 색이에요' },
      { hex: '#FCE4EC', name: '블러시', description: '포근하게 감싸는 연한 장밋빛이에요' },
    ],
    songs: [
      { title: 'All of Me', artist: 'John Legend', reason: '온전히 사랑에 빠진 감정을 담은 곡이에요' },
      { title: 'Love Story', artist: 'Taylor Swift', reason: '사랑의 두근거림을 함께 느낄 수 있어요' },
      { title: '사랑인가요', artist: '김동률', reason: '사랑의 설레고 따뜻한 감정을 담았어요' },
    ],
    quotes: [
      { text: '사랑받는 것도 행복이지만, 사랑하는 것은 더 큰 행복이다.', author: '빅토르 위고' },
      { text: '사랑은 삶을 의미 있게 만드는 유일한 것이다.', author: '파울로 코엘료' },
      { text: '사랑하는 사람 옆에 있으면, 세상이 조금 더 따뜻해진다.' },
    ],
    missions: [
      '사랑하는 사람에게 "보고 싶어"라고 전하기',
      '그 사람과의 소중한 사진 한 장 꺼내보기',
      '사랑한다는 감정을 세 줄의 글로 표현해보기',
    ],
    comforts: [
      '사랑을 느끼고 있다니, 정말 아름다운 순간이에요. 충분히 누리세요.',
      '사랑하는 마음 자체가 이미 삶을 풍요롭게 해요. 오늘도 그 마음 간직하세요.',
    ],
  },
  sad: {
    colors: [
      { hex: '#90A4AE', name: '슬레이트 블루', description: '조용히 내리는 비처럼 차분한 색이에요' },
      { hex: '#B0BEC5', name: '실버 그레이', description: '흐린 날 하늘처럼 은은하게 가라앉은 색이에요' },
      { hex: '#78909C', name: '스틸 블루', description: '깊은 물속처럼 고요하고 깊은 색이에요' },
    ],
    songs: [
      { title: 'The Night We Met', artist: 'Lord Huron', reason: '슬픔을 억지로 지우지 않아도 되는 곡이에요' },
      { title: '나무', artist: '짙은', reason: '울고 싶을 때 함께 울어줄 수 있는 노래예요' },
      { title: 'Someone Like You', artist: 'Adele', reason: '슬픔을 정면으로 바라보게 해주는 곡이에요' },
    ],
    quotes: [
      { text: '슬픔 뒤에는 반드시 기쁨이 온다. 그래서 슬픔도 소중하다.' },
      { text: '눈물은 마음이 쉬는 방법이다.' },
      { text: '울어도 괜찮아. 비가 와야 무지개가 뜨니까.' },
    ],
    missions: [
      '이불 속에 5분만 파묻혀 있기',
      '좋아하는 따뜻한 음료 한 잔 천천히 마시기',
      '창밖을 바라보며 3분간 아무 생각 안 하기',
    ],
    comforts: [
      '슬퍼도 괜찮아요. 지금 느끼는 감정은 잘못된 게 아니에요. 충분히 울어도 돼요.',
      '힘든 하루를 버티고 있는 당신, 정말 잘하고 있어요. 오늘 하루도 고생 많았어요.',
    ],
  },
  lonely: {
    colors: [
      { hex: '#CE93D8', name: '라벤더', description: '아무도 없는 밤의 보랏빛 하늘이에요' },
      { hex: '#9C27B0', name: '딥 퍼플', description: '혼자만의 깊고 깊은 자색이에요' },
      { hex: '#E1BEE7', name: '라일락', description: '홀로 피어난 라벤더처럼 은은한 색이에요' },
    ],
    songs: [
      { title: '너에게 난, 나에게 넌', artist: '성시경', reason: '외로운 밤을 함께해줄 따뜻한 목소리예요' },
      { title: 'Fix You', artist: 'Coldplay', reason: '곁에 있어주고 싶다는 마음을 담은 곡이에요' },
      { title: '외로운 밤', artist: '버즈', reason: '외로움을 이해해주는 곡이에요' },
    ],
    quotes: [
      { text: '혼자라는 것은 스스로와 함께 있는 것이다.', author: '폴 틸리히' },
      { text: '외로움은 당신이 자기 자신과 더 가까워지는 시간이다.' },
      { text: '고독은 생각을 깊게 만든다.', author: '쇼펜하우어' },
    ],
    missions: [
      '좋아하는 사람에게 안부 전화 한 통 하기',
      '따뜻한 조명 켜고 좋아하는 영화 틀기',
      '나에게 "오늘도 수고했어"라고 크게 말하기',
    ],
    comforts: [
      '외로움을 느끼는 건 연결을 원한다는 신호예요. 그 마음은 정상이에요.',
      '지금 혼자인 것 같아도, 당신을 생각하는 사람이 분명히 있어요.',
    ],
  },
  depressed: {
    colors: [
      { hex: '#546E7A', name: '슬레이트 그레이', description: '흐리고 어두운 날의 색이에요' },
      { hex: '#607D8B', name: '블루 그레이', description: '무거운 마음처럼 차분하고 깊은 색이에요' },
      { hex: '#455A64', name: '다크 슬레이트', description: '깊은 밤 바다처럼 어둡고 고요한 색이에요' },
    ],
    songs: [
      { title: '광화문에서', artist: '규현', reason: '우울한 날에도 함께 걸어줄 수 있는 노래예요' },
      { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', reason: '우울한 감정을 억압하지 않고 표현해요' },
      { title: '사월이 지나면 우리 헤어져요', artist: '적재', reason: '깊은 감정을 함께 느껴볼 수 있어요' },
    ],
    quotes: [
      { text: '가장 어두운 밤이 지나면, 가장 밝은 아침이 온다.', author: '빅토르 위고' },
      { text: '지금 힘든 것은 아직 살아있다는 의미다.' },
      { text: '폭풍은 영원히 계속되지 않는다.' },
    ],
    missions: [
      '지금 당장 할 수 있는 가장 작은 일 하나만 하기 (예: 물 한 잔 마시기)',
      '15분만 밖에 나가 햇빛 받기',
      '믿을 수 있는 한 사람에게 "요즘 좀 힘들어"라고 솔직하게 말해보기',
    ],
    comforts: [
      '우울한 날은 지나가요. 지금 느끼는 이 감정이 영원하지 않아요. 오늘 하루만 버텨요.',
      '이렇게 힘든데도 오늘 하루를 버텨낸 당신, 생각보다 훨씬 강한 사람이에요.',
    ],
  },
  angry: {
    colors: [
      { hex: '#FF7043', name: '버닝 오렌지', description: '활활 타오르는 분노처럼 강렬한 오렌지 레드예요' },
      { hex: '#BF360C', name: '딥 레드', description: '뜨거운 마음이 쏟아져 나오는 딥 레드예요' },
      { hex: '#FFCCBC', name: '피치 살구', description: '분노가 잠잠해질 때의 부드러운 살구색이에요' },
    ],
    songs: [
      { title: 'Break Stuff', artist: 'Limp Bizkit', reason: '분노를 밖으로 터뜨릴 수 있는 곡이에요' },
      { title: 'Killing Me Softly', artist: 'Fugees', reason: '분노가 차분히 가라앉을 무렵에 듣기 좋아요' },
      { title: '화', artist: 'BTS', reason: '내 분노를 이해해주는 가사가 있어요' },
    ],
    quotes: [
      { text: '분노를 느끼는 것은 괜찮다. 그러나 분노에 먹히는 것은 위험하다.' },
      { text: '화를 내기 전에 10을 세어라. 그래도 화가 나면 100을 세어라.', author: '토머스 제퍼슨' },
      { text: '분노는 자신을 태우는 불이다.', author: '부처' },
    ],
    missions: [
      '종이에 지금의 감정을 빠르게 적고 구기기',
      '30초간 팔 힘차게 흔들기 (에너지 발산)',
      '5분간 빠른 걸음으로 걷기',
    ],
    comforts: [
      '화가 나는 건 당연해요. 그 감정이 뭔가 중요한 것을 알려주고 있을 거예요.',
      '분노를 느끼는 당신의 감정은 유효해요. 다만, 그 에너지를 잘 쓸 방법을 찾아봐요.',
    ],
  },
  irritated: {
    colors: [
      { hex: '#FFB74D', name: '앰버 오렌지', description: '은근히 끓어오르는 주황빛 짜증이에요' },
      { hex: '#FF8F00', name: '딥 앰버', description: '신호등처럼 눈에 띄는 앰버 오렌지예요' },
      { hex: '#FFF3E0', name: '크림 오렌지', description: '짜증이 조금 가라앉을 때의 연한 오렌지예요' },
    ],
    songs: [
      { title: 'Bad Day', artist: 'Daniel Powter', reason: '나쁜 하루를 공감해주는 곡이에요' },
      { title: 'Shake It Off', artist: 'Taylor Swift', reason: '털어버리자고 외치는 곡이에요' },
      { title: '일상으로의 초대', artist: '한스밴드', reason: '잔잔하게 기분을 환기시켜줄 거예요' },
    ],
    quotes: [
      { text: '짜증은 내가 통제할 수 없는 것에 대한 반응이다. 내가 통제할 수 있는 것에 집중하자.' },
      { text: '기분이 나쁠 땐 잠시 멈추는 것이 최선이다.' },
      { text: '오늘의 짜증은 내일의 웃음거리가 된다.' },
    ],
    missions: [
      '짜증의 원인을 한 줄로 적고 "이건 내가 해결할 수 있다/없다" 판단하기',
      '찬물에 손 씻기 (기분 전환 효과)',
      '좋아하는 간식 하나 먹기',
    ],
    comforts: [
      '짜증나는 날이 있어요. 모든 날이 좋을 수는 없으니까요. 오늘은 그냥 넘겨도 돼요.',
      '짜증나는 당신도 괜찮아요. 감정을 숨기지 않아도 돼요.',
    ],
  },
  anxious: {
    colors: [
      { hex: '#CE93D8', name: '소프트 라벤더', description: '불안처럼 아른거리는 연보라예요' },
      { hex: '#9575CD', name: '라벤더 퍼플', description: '진정되기를 기다리는 라벤더 퍼플이에요' },
      { hex: '#EDE7F6', name: '라일락 미스트', description: '불안이 걷히고 나면 보이는 연한 라일락이에요' },
    ],
    songs: [
      { title: 'Breathe (2 AM)', artist: 'Anna Nalick', reason: '숨 쉬라고 말해주는 곡이에요' },
      { title: '그냥 있어줘', artist: '빅뱅', reason: '불안할 때 옆에 있어줄 것 같은 노래예요' },
      { title: 'Ride', artist: 'Twenty One Pilots', reason: '불안을 함께 달리는 느낌으로 표현한 곡이에요' },
    ],
    quotes: [
      { text: '불안은 아직 일어나지 않은 일에 대한 두려움이다. 지금에 집중하라.' },
      { text: '걱정의 90%는 일어나지 않는다.' },
      { text: '지금 이 순간만 살아라. 과거도 미래도 아닌 바로 지금.', author: '에크하르트 톨레' },
    ],
    missions: [
      '4-7-8 호흡법: 4초 들이쉬고, 7초 참고, 8초 내쉬기 (3회)',
      '발이 땅에 닿는 느낌에 집중하며 1분간 서 있기',
      '지금 주변에서 보이는 것 5가지, 들리는 것 3가지 적어보기',
    ],
    comforts: [
      '불안하다는 건 당신이 중요하게 여기는 것이 있다는 뜻이에요. 그 마음이 소중해요.',
      '지금 숨을 쉬고 있어요. 그것만으로도 충분해요. 한 번에 한 걸음씩이면 돼요.',
    ],
  },
  fearful: {
    colors: [
      { hex: '#A5D6A7', name: '세이지 그린', description: '두려움 속에서도 찾아볼 수 있는 연한 초록 희망이에요' },
      { hex: '#66BB6A', name: '스프링 그린', description: '두려움을 이겨낸 자리에 피어나는 초록이에요' },
      { hex: '#E8F5E9', name: '민트 화이트', description: '두려움이 차분히 가라앉을 때의 민트 크림이에요' },
    ],
    songs: [
      { title: 'Brave', artist: 'Sara Bareilles', reason: '두려워도 용감하게 나아가자는 곡이에요' },
      { title: 'Fight Song', artist: 'Rachel Platten', reason: '작은 용기를 북돋아 주는 곡이에요' },
      { title: '바람이 분다', artist: 'IU', reason: '두려움 앞에서도 담담하게 서 있을 힘이 돼요' },
    ],
    quotes: [
      { text: '용감한 것은 두렵지 않은 게 아니라, 두려워도 행동하는 것이다.', author: '마크 트웨인' },
      { text: '두려움과 친해져라. 그것이 성장의 시작이다.' },
      { text: '두려움은 실패가 아니다. 포기가 실패다.' },
    ],
    missions: [
      '두려운 것을 종이에 적고, 최악의 경우와 해결책 함께 적어보기',
      '신뢰하는 사람에게 두려운 감정 솔직하게 털어놓기',
      '두렵지만 작게 한 걸음 내딛기',
    ],
    comforts: [
      '두려움을 느끼는 건 나쁜 게 아니에요. 그것이 당신이 살아있다는 증거예요.',
      '무서운 거 당연해요. 하지만 당신은 생각보다 훨씬 강해요.',
    ],
  },
  empty: {
    colors: [
      { hex: '#ECEFF1', name: '페일 그레이', description: '아무것도 채워지지 않은 듯한 페일 블루그레이예요' },
      { hex: '#CFD8DC', name: '클라우드 그레이', description: '텅 빈 방의 고요한 회색이에요' },
      { hex: '#B0BEC5', name: '실버 미스트', description: '허무함처럼 희미하게 남아있는 실버 그레이예요' },
    ],
    songs: [
      { title: 'Empty', artist: 'Ray LaMontagne', reason: '허무함을 억지로 채우려 하지 않는 곡이에요' },
      { title: '비가 와', artist: '다이나믹 듀오', reason: '빈 마음을 함께 앉아있는 느낌이에요' },
      { title: 'The A Team', artist: 'Ed Sheeran', reason: '조용히 마음을 들여다보게 하는 곡이에요' },
    ],
    quotes: [
      { text: '허무함은 새로운 것을 채울 준비가 된 상태다.' },
      { text: '비어있어야 채울 수 있다.', author: '노자' },
      { text: '지금 이 텅 빈 느낌도 지나간다.' },
    ],
    missions: [
      '지금 몸의 감각 하나에 집중해보기 (발이 차갑다, 손이 따뜻하다 등)',
      '오늘 단 하나라도 의미 있었던 순간 떠올려보기',
      '좋아하는 냄새 (커피, 향수 등) 맡으며 현재로 돌아오기',
    ],
    comforts: [
      '허무함을 느끼는 날도 있어요. 억지로 의미를 찾지 않아도 돼요. 그냥 오늘을 보내도 괜찮아요.',
      '비어있는 지금이 오히려 새로운 것들이 들어올 자리를 만드는 거예요.',
    ],
  },
  tired: {
    colors: [
      { hex: '#D7CCC8', name: '그레이 베이지', description: '지친 몸처럼 부드럽고 따뜻한 그레이 베이지예요' },
      { hex: '#BCAAA4', name: '로즈 브라운', description: '눈꺼풀처럼 무겁게 가라앉은 로즈 브라운이에요' },
      { hex: '#EFEBE9', name: '크리미 베이지', description: '깊은 잠에 들기 직전의 크리미 베이지예요' },
    ],
    songs: [
      { title: 'Saturn', artist: 'Sleeping at Last', reason: '지친 몸을 쉬게 해주는 음악이에요' },
      { title: '잠', artist: '멜로망스', reason: '포근하게 잠들고 싶을 때 딱이에요' },
      { title: 'Nuvole Bianche', artist: 'Ludovico Einaudi', reason: '피아노 선율이 지친 마음을 쉬게 해줘요' },
    ],
    quotes: [
      { text: '잘 쉬는 것도 능력이다.' },
      { text: '지쳤을 때 멈추는 건 포기가 아니라 전략이다.' },
      { text: '몸이 쉬고 싶다고 하면, 들어줘야 한다.' },
    ],
    missions: [
      '지금 당장 눈 감고 10분만 쉬기',
      '오늘 일정 중 하나를 내일로 미루기 (완벽하지 않아도 됩니다)',
      '따뜻한 물로 샤워하거나 족욕하기',
    ],
    comforts: [
      '많이 지쳤군요. 오늘은 그냥 쉬어도 돼요. 아무것도 안 해도 괜찮아요.',
      '지친 당신도 충분히 잘하고 있어요. 오늘 하루 수고 많았어요.',
    ],
  },
  blank: {
    colors: [
      { hex: '#E3F2FD', name: '스카이 블루', description: '아무 생각 없이 보는 하늘처럼 맑고 연한 블루예요' },
      { hex: '#BBDEFB', name: '베이비 블루', description: '멍하게 바라보는 창밖 같은 스카이 블루예요' },
      { hex: '#F8F9FA', name: '퓨어 화이트', description: '아무것도 아닌 것들로 가득한 흰 공간이에요' },
    ],
    songs: [
      { title: 'Lo-Fi Hip Hop Radio', artist: 'Lofi Girl', reason: '아무 생각 없이 흘려보내기 좋은 배경음이에요' },
      { title: '오후의 볕', artist: '짙은', reason: '멍한 오후를 함께 보내기 좋은 곡이에요' },
      { title: 'Experience', artist: 'Ludovico Einaudi', reason: '멍하게 떠돌아다니는 기분에 어울려요' },
    ],
    quotes: [
      { text: '멍하게 있는 것도 뇌가 정리되는 시간이다.' },
      { text: '아무 생각 없이 있어도 괜찮다. 그냥 지금 있으면 된다.' },
      { text: '멍은 마음의 방전이 아니라 재충전이다.' },
    ],
    missions: [
      '창밖을 5분간 그냥 바라보기',
      '핸드폰 내려놓고 1분간 멍때리기',
      '지금 이 순간 몸의 느낌에만 집중해보기',
    ],
    comforts: [
      '멍한 날도 있어요. 아무 생각이 없다는 것도 하나의 감정이에요. 억지로 뭔가를 느끼려 하지 않아도 돼요.',
      '오늘은 그냥 흘러가도 괜찮아요. 모든 날이 의미 있어야 할 필요는 없어요.',
    ],
  },
};

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export function generatePrescription(
  emotionKey: EmotionKey,
  intensity: number,
  memo: string | undefined,
  seed?: number
): MoodEntry['prescription'] {
  const pool = POOLS[emotionKey];
  const rand = seededRandom(seed ?? Date.now());
  const pick = <T>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const color = pick(pool.colors);
  const song = pick(pool.songs);
  const quote = pick(pool.quotes);
  const mission = pick(pool.missions);

  let comfort = pick(pool.comforts);
  if (memo && memo.length > 5) {
    comfort = `"${memo.slice(0, 20)}${memo.length > 20 ? '...' : ''}" — 그 마음, 충분히 이해해요. ` + comfort;
  }

  return { color, song, quote, mission, comfort };
}
