export interface MemoComment {
  id: string;
  writer: string;
  writerAvatar?: string;
  time: string;
  content: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string;
  replyTo?: string;
}

export interface MemoItem {
  id: string;
  specimenId?: string;
  specimenName: string;
  scientificName?: string;
  category: 'birds' | 'insects' | 'plants' | 'mammals' | 'reptiles' | 'amphibians' | 'fishes' | 'fungi' | 'others';
  photoUrl: string;
  scoreGrade?: string;
  scoreTotal?: number;
  writer: {
    id: string;
    name: string;
    level: string;
    avatar: string;
    isMe?: boolean;
  };
  location: string;
  locationScope: 'town_only' | 'exact';
  time: string;
  content: string;
  tags: string[];
  visibility: 'public' | 'private';
  likes: number;
  isLiked: boolean;
  commentsCount: number;
  sharesCount: number;
  isBookmarked: boolean;
  isThreatenedSpecies?: boolean;
  comments: MemoComment[];
  createdAt: number;
}

export const INITIAL_MEMOS: MemoItem[] = [
  {
    id: 'memo-1',
    specimenId: 'ex-5', // 물총새
    specimenName: '물총새',
    scientificName: 'Alcedo atthis',
    category: 'birds',
    photoUrl: '/assets/specimens/unsplash_TW2bfT_tWDI.png',
    scoreGrade: 'S',
    scoreTotal: 93,
    writer: {
      id: 'user-soop-walker',
      name: 'soop_walker',
      level: 'Lv.12 숙련 조류 탐험가',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    },
    location: '양재천 둔치 수풀',
    locationScope: 'town_only',
    time: '2시간 전',
    content: '버드나무 가지 끝에서 10분 넘게 기다렸어요.\n물속으로 뛰어드는 순간은 놓쳤지만 앉은 모습은 건졌어요. 아침 햇살에 코발트색 깃털이 정말 보석처럼 반짝였습니다.',
    tags: ['#양재천', '#물총새', '#아침산책', '#탐조'],
    visibility: 'public',
    likes: 129,
    isLiked: false,
    commentsCount: 18,
    sharesCount: 15,
    isBookmarked: true,
    isThreatenedSpecies: false,
    createdAt: Date.now() - 2 * 3600 * 1000,
    comments: [
      {
        id: 'c-1',
        writer: '참새방앗간',
        writerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
        time: '1시간 전',
        content: '10분 기다린 보람이 있네요. 저도 양재천에서 어제 봤어요!',
        likes: 12,
        isLiked: false,
      },
      {
        id: 'c-2',
        writer: 'soop_walker',
        writerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        time: '50분 전',
        content: '@참새방앗간 아침 7시쯤이 제일 자주 보여요',
        likes: 5,
        isLiked: false,
        parentId: 'c-1',
        replyTo: '참새방앗간',
      },
      {
        id: 'c-3',
        writer: '풀잎채집',
        writerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        time: '30분 전',
        content: '깃털 색 진짜 선명하다! 줌 렌즈 뭐 쓰셨나요?',
        likes: 3,
        isLiked: false,
      },
      {
        id: 'c-4',
        writer: 'birdie_kim',
        writerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        time: '12분 전',
        content: '어떤 렌즈로 찍으셨어요? 구도가 정말 안정적이네요.',
        likes: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: 'memo-2',
    specimenId: 'ex-7', // 왕나비 / 제왕나비
    specimenName: '왕나비',
    scientificName: 'Danaus plexippus',
    category: 'insects',
    photoUrl: '/assets/specimens/unsplash_4fRDBzmcU6g.png',
    scoreGrade: 'A',
    scoreTotal: 88,
    writer: {
      id: 'user-pul-ip',
      name: '풀잎채집',
      level: 'Lv.7 숲길 탐험가',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    location: '서울숲 야생초화원',
    locationScope: 'town_only',
    time: '5시간 전',
    content: '올해 처음 본 왕나비... 더 보기 전에 날아갈까 봐 숨도 죽이고 다가갔네요. 날개맥 패턴이 아주 또렷합니다.',
    tags: ['#서울숲', '#왕나비', '#나비관찰', '#가을생태'],
    visibility: 'public',
    likes: 47,
    isLiked: false,
    commentsCount: 6,
    sharesCount: 3,
    isBookmarked: false,
    isThreatenedSpecies: false,
    createdAt: Date.now() - 5 * 3600 * 1000,
    comments: [
      {
        id: 'c-201',
        writer: 'moa_tamheom',
        writerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        time: '3시간 전',
        content: '날개 편 모습이 장관이네요! 초점도 아주 잘 맞았습니다.',
        likes: 4,
        isLiked: false,
      },
    ],
  },
  {
    id: 'memo-3',
    specimenId: 'ex-1', // 서양민들레
    specimenName: '작은멋쟁이나비',
    scientificName: 'Vanessa cardui',
    category: 'insects',
    photoUrl: '/assets/specimens/unsplash_hX_hf2lPpUU.png',
    scoreGrade: 'S',
    scoreTotal: 92,
    writer: {
      id: 'user-birdie',
      name: 'birdie_kim',
      level: 'Lv.9 생태 사진가',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    location: '남산 둘레길',
    locationScope: 'town_only',
    time: '어제',
    content: '코스모스 위에서 한참을 쉬다 갔어요. 햇살 받으며 날개 펴고 일광욕하는 모습이 평화로웠습니다.',
    tags: ['#남산둘레길', '#작은멋쟁이나비', '#접사'],
    visibility: 'public',
    likes: 88,
    isLiked: false,
    commentsCount: 9,
    sharesCount: 6,
    isBookmarked: true,
    isThreatenedSpecies: false,
    createdAt: Date.now() - 24 * 3600 * 1000,
    comments: [],
  },
  {
    id: 'memo-4',
    specimenId: 'ex-3', // 유칼립투스
    specimenName: '유칼립투스',
    scientificName: 'Eucalyptus globulus',
    category: 'plants',
    photoUrl: '/assets/specimens/unsplash_5FE-eOmduf0.png',
    scoreGrade: 'A',
    scoreTotal: 84,
    writer: {
      id: 'user-green-leaf',
      name: '초록정원사',
      level: 'Lv.5 식물 가드너',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    },
    location: '성수동 카페거리',
    locationScope: 'town_only',
    time: '2일 전',
    content: '베란다 화분이 드디어 새 잎을 냈어요. 은회색 분가루가 뽀얗게 덮여서 향기도 은은하게 퍼지네요.',
    tags: ['#유칼립투스', '#홈가드닝', '#반려식물'],
    visibility: 'public',
    likes: 54,
    isLiked: false,
    commentsCount: 4,
    sharesCount: 2,
    isBookmarked: false,
    isThreatenedSpecies: false,
    createdAt: Date.now() - 48 * 3600 * 1000,
    comments: [],
  },
];
