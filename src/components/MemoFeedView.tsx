import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
  MoreVertical,
  Edit3,
  Trash2,
  Sparkles,
  X,
  MapPin,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoItem, MemoComment, INITIAL_MEMOS } from '../data/initialMemos';
import { MemoCommentsModal } from './MemoCommentsModal';
import { MemoShareModal } from './MemoShareModal';
import { MyMemosModal } from './MyMemosModal';
import { MemoWriteFlowModal } from './MemoWriteFlowModal';
import { Specimen } from '../types';

interface MemoFeedViewProps {
  onClose: () => void;
  specimens: Specimen[];
}

const STORAGE_KEY = 'moalog_memos_v2';
const TOOLTIP_KEY = 'moalog_memo_feed_tooltip_dismissed';

export const MemoFeedView: React.FC<MemoFeedViewProps> = ({ onClose, specimens }) => {
  const [activeTab, setActiveTab] = useState<'전체' | '즐겨찾기' | '근처'>('전체');
  const [memos, setMemos] = useState<MemoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_MEMOS;
  });

  // 툴팁 표시 여부 (최초 1회 노출)
  const [showTooltip, setShowTooltip] = useState<boolean>(() => {
    return localStorage.getItem(TOOLTIP_KEY) !== 'true';
  });

  // 모달 상태들
  const [activeCommentsMemo, setActiveCommentsMemo] = useState<MemoItem | null>(null);
  const [activeShareMemo, setActiveShareMemo] = useState<MemoItem | null>(null);
  const [isMyMemosOpen, setIsMyMemosOpen] = useState(false);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<MemoItem | null>(null);

  // 본문 '더보기' 확장 상태
  const [expandedMemos, setExpandedMemos] = useState<Record<string, boolean>>({});

  // 카드 더보기 메뉴 드롭다운
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 글로벌 토스트 알림
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 로컬스토리지 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
    } catch {
      // ignore
    }
  }, [memos]);

  const handleDismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_KEY, 'true');
  };

  // 좋아요 토글
  const handleToggleLike = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        const nextLiked = !memo.isLiked;
        return {
          ...memo,
          isLiked: nextLiked,
          likes: nextLiked ? memo.likes + 1 : Math.max(0, memo.likes - 1),
        };
      })
    );
  };

  // 북마크 토글
  const handleToggleBookmark = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        const next = !memo.isBookmarked;
        if (next) {
          showToast('즐겨찾기에 추가되었어요.');
        } else {
          showToast('즐겨찾기에서 해제되었어요.');
        }
        return {
          ...memo,
          isBookmarked: next,
        };
      })
    );
  };

  // 댓글 추가
  const handleAddComment = (
    memoId: string,
    content: string,
    parentId?: string,
    replyTo?: string
  ) => {
    const newComment: MemoComment = {
      id: `c-${Date.now()}`,
      writer: '나',
      writerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      time: '방금 전',
      content,
      likes: 0,
      isLiked: false,
      parentId,
      replyTo,
    };

    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        const updatedComments = [...(memo.comments || []), newComment];
        return {
          ...memo,
          comments: updatedComments,
          commentsCount: updatedComments.length,
        };
      })
    );

    // 댓글 모달 상태도 실시간 동기화
    if (activeCommentsMemo && activeCommentsMemo.id === memoId) {
      setActiveCommentsMemo((prev) => {
        if (!prev) return null;
        const updated = [...(prev.comments || []), newComment];
        return {
          ...prev,
          comments: updated,
          commentsCount: updated.length,
        };
      });
    }

    showToast('댓글을 등록했어요.');
  };

  // 댓글 좋아요 토글
  const handleToggleCommentLike = (memoId: string, commentId: string) => {
    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        const updatedComments = (memo.comments || []).map((c) => {
          if (c.id !== commentId) return c;
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        });
        return {
          ...memo,
          comments: updatedComments,
        };
      })
    );

    if (activeCommentsMemo && activeCommentsMemo.id === memoId) {
      setActiveCommentsMemo((prev) => {
        if (!prev) return null;
        const updatedComments = (prev.comments || []).map((c) => {
          if (c.id !== commentId) return c;
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        });
        return {
          ...prev,
          comments: updatedComments,
        };
      });
    }
  };

  // 공유 수 증가
  const handleShareSuccess = (memoId: string) => {
    setMemos((prev) =>
      prev.map((memo) => {
        if (memo.id !== memoId) return memo;
        return {
          ...memo,
          sharesCount: (memo.sharesCount || 0) + 1,
        };
      })
    );
  };

  // 메모 저장 (신규 또는 수정)
  const handleSaveMemo = (data: {
    id?: string;
    specimenId: string;
    specimenName: string;
    scientificName?: string;
    category: any;
    photoUrl: string;
    content: string;
    tags: string[];
    visibility: 'public' | 'private';
    locationScope: 'town_only' | 'exact';
    location: string;
    scoreGrade?: string;
    scoreTotal?: number;
  }) => {
    if (data.id) {
      // 수정
      setMemos((prev) =>
        prev.map((m) => {
          if (m.id !== data.id) return m;
          return {
            ...m,
            specimenId: data.specimenId,
            specimenName: data.specimenName,
            scientificName: data.scientificName,
            category: data.category,
            photoUrl: data.photoUrl,
            content: data.content,
            tags: data.tags,
            visibility: data.visibility,
            locationScope: data.locationScope,
            location: data.location,
            scoreGrade: data.scoreGrade || m.scoreGrade,
            scoreTotal: data.scoreTotal || m.scoreTotal,
          };
        })
      );
      showToast('메모를 수정했어요.');
    } else {
      // 신규 등록
      const newMemo: MemoItem = {
        id: `memo-${Date.now()}`,
        specimenId: data.specimenId,
        specimenName: data.specimenName,
        scientificName: data.scientificName,
        category: data.category,
        photoUrl: data.photoUrl,
        scoreGrade: data.scoreGrade || 'S',
        scoreTotal: data.scoreTotal || 92,
        writer: {
          id: 'me',
          name: 'moa_tamheom',
          level: 'Lv.4 자연 탐험가',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          isMe: true,
        },
        location: data.location,
        locationScope: data.locationScope,
        time: '방금 전',
        content: data.content,
        tags: data.tags,
        visibility: data.visibility,
        likes: 0,
        isLiked: false,
        commentsCount: 0,
        sharesCount: 0,
        isBookmarked: false,
        createdAt: Date.now(),
        comments: [],
      };

      setMemos([newMemo, ...memos]);
      showToast('메모를 올렸어요 · 내 메모에서 볼 수 있어요');
    }
    setEditingMemo(null);
  };

  // 메모 삭제
  const handleDeleteMemo = (memoId: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== memoId));
    showToast('메모를 삭제했어요.');
  };

  // 탭 필터링
  const filteredMemos = memos.filter((memo) => {
    // 나만 보기 글은 피드 메인에서는 작성자 본인 글만 노출
    if (memo.visibility === 'private' && !memo.writer.isMe) {
      return false;
    }

    if (activeTab === '즐겨찾기') {
      return memo.isBookmarked;
    }
    if (activeTab === '근처') {
      // 양재천, 서울숲, 남산 등 로컬 필터
      return (
        memo.location.includes('양재') ||
        memo.location.includes('서울숲') ||
        memo.location.includes('성수') ||
        memo.tags.some((t) => t.includes('양재') || t.includes('서울숲'))
      );
    }
    return true;
  });

  const myMemos = memos.filter((m) => m.writer.isMe || m.writer.name === 'moa_tamheom' || m.writer.name === '나');

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F6F8] flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-stone-200/80 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-1 rounded-full text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">메모 피드</h2>
        </div>

        {/* 내 메모 버튼 */}
        <button
          type="button"
          onClick={() => setIsMyMemosOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <span>내 메모</span>
          {myMemos.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-mono">
              {myMemos.length}
            </span>
          )}
        </button>
      </div>

      {/* 최초 1회 말풍선 툴팁 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="mx-4 mt-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl p-3.5 shadow-md flex items-center justify-between text-xs gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-200" />
              </span>
              <p className="leading-snug">
                <strong>생태 탐험가들의 관찰 메모</strong>를 둘러보고, 발견한 순간을 함께 나눠보세요!
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismissTooltip}
              className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 bg-white border-b border-stone-200/50">
        {(['전체', '즐겨찾기', '근처'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab}
            {tab === '즐겨찾기' && memos.filter((m) => m.isBookmarked).length > 0 && (
              <span className="ml-1 text-[10px] opacity-80">
                ({memos.filter((m) => m.isBookmarked).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {filteredMemos.length === 0 ? (
          <div className="py-20 text-center text-stone-400 space-y-2">
            <p className="text-sm font-semibold">
              {activeTab === '즐겨찾기' ? '즐겨찾기한 메모가 없습니다.' : '표시할 메모가 없습니다.'}
            </p>
            <p className="text-xs text-stone-400">
              {activeTab === '즐겨찾기' ? '피드의 별표(★)를 눌러 관심 있는 메모를 보관해 보세요.' : '새로운 메모를 작성해 첫 이야기를 남겨보세요!'}
            </p>
          </div>
        ) : (
          filteredMemos.map((memo) => {
            const isExpanded = !!expandedMemos[memo.id];
            const isLong = memo.content.length > 70;
            const isMyMemo = memo.writer.isMe || memo.writer.name === 'moa_tamheom';

            return (
              <div
                key={memo.id}
                className="bg-white rounded-3xl p-4 shadow-xs border border-stone-200/80 transition-all hover:border-stone-300"
              >
                {/* Author Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-stone-100 ring-1 ring-stone-200/80">
                      <img
                        src={memo.writer.avatar}
                        alt={memo.writer.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-stone-900">{memo.writer.name}</span>
                        {isMyMemo && (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                            내 메모
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-400 font-mono mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {memo.location}
                        </span>
                        <span>·</span>
                        <span>{memo.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu button for My Memo */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === memo.id ? null : memo.id)}
                      className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === memo.id && (
                      <div className="absolute right-0 top-7 w-28 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-30 text-xs">
                        {isMyMemo ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                setEditingMemo(memo);
                                setIsWriteOpen(true);
                              }}
                              className="w-full text-left px-3.5 py-2 text-stone-700 hover:bg-stone-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                              수정하기
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null);
                                handleDeleteMemo(memo.id);
                              }}
                              className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              삭제하기
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpenId(null);
                              showToast('게시물 신고가 접수되었습니다.');
                            }}
                            className="w-full text-left px-3.5 py-2 text-stone-600 hover:bg-stone-50 text-xs cursor-pointer"
                          >
                            신고하기
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo & Species Badge */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-900 mb-3 group">
                  <img
                    src={memo.photoUrl}
                    alt={memo.specimenName}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Top Left Specimen Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-stone-900 shadow-sm backdrop-blur-xs">
                      {memo.specimenName}
                    </span>
                    {memo.scoreGrade && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                        포착 {memo.scoreGrade}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content & Read More */}
                <div className="mb-2">
                  <p className="text-xs text-stone-900 leading-relaxed whitespace-pre-wrap">
                    {isLong && !isExpanded ? `${memo.content.slice(0, 70)}... ` : memo.content}
                    {isLong && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMemos((prev) => ({ ...prev, [memo.id]: !isExpanded }))
                        }
                        className="text-stone-400 hover:text-stone-700 font-bold ml-1 cursor-pointer"
                      >
                        {isExpanded ? '접기' : '더 보기'}
                      </button>
                    )}
                  </p>
                </div>

                {/* Tags */}
                {memo.tags && memo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {memo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-stone-600">
                  <div className="flex items-center gap-4 text-xs font-medium">
                    {/* 좋아요 버튼 */}
                    <button
                      type="button"
                      onClick={() => handleToggleLike(memo.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer active:scale-90 ${
                        memo.isLiked ? 'text-rose-500 font-bold' : 'hover:text-stone-900 text-stone-500'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          memo.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                        }`}
                      />
                      <span className="font-mono text-xs">{memo.likes}</span>
                    </button>

                    {/* 댓글 버튼 */}
                    <button
                      type="button"
                      onClick={() => setActiveCommentsMemo(memo)}
                      className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="font-mono text-xs">
                        {memo.commentsCount || memo.comments?.length || 0}
                      </span>
                    </button>

                    {/* 공유 버튼 */}
                    <button
                      type="button"
                      onClick={() => setActiveShareMemo(memo)}
                      className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer active:scale-95"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="font-mono text-xs">{memo.sharesCount || 0}</span>
                    </button>
                  </div>

                  {/* 즐겨찾기 북마크 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleToggleBookmark(memo.id)}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                      memo.isBookmarked
                        ? 'text-amber-500 hover:text-amber-600'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        memo.isBookmarked ? 'fill-amber-400 text-amber-500' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Comment Preview (댓글 1개 이상 있을 시) */}
                {memo.comments && memo.comments.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100/80">
                    <button
                      type="button"
                      onClick={() => setActiveCommentsMemo(memo)}
                      className="text-[11px] text-stone-400 hover:text-stone-600 font-medium mb-1.5 block cursor-pointer"
                    >
                      댓글 {memo.comments.length}개 모두 보기
                    </button>
                    <div className="text-xs text-stone-800 leading-snug">
                      <span className="font-bold text-stone-900 mr-1.5">
                        {memo.comments[0].writer}
                      </span>
                      <span className="text-stone-600">{memo.comments[0].content}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button: 새 메모 쓰기 (기획서 STEP 1 포착 고르기 진입) */}
      <button
        type="button"
        onClick={() => {
          setEditingMemo(null);
          setIsWriteOpen(true);
        }}
        className="fixed bottom-6 right-5 p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center z-30 ring-4 ring-emerald-600/20"
        title="새 메모 쓰기"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 댓글 모달 (MemoCommentsModal) */}
      {activeCommentsMemo && (
        <MemoCommentsModal
          isOpen={true}
          onClose={() => setActiveCommentsMemo(null)}
          memoId={activeCommentsMemo.id}
          memoWriter={activeCommentsMemo.writer.name}
          comments={activeCommentsMemo.comments || []}
          onAddComment={handleAddComment}
          onToggleCommentLike={handleToggleCommentLike}
        />
      )}

      {/* 공유 모달 (MemoShareModal) */}
      {activeShareMemo && (
        <MemoShareModal
          isOpen={true}
          onClose={() => setActiveShareMemo(null)}
          memo={activeShareMemo}
          onShareSuccess={handleShareSuccess}
        />
      )}

      {/* 내 메모 전체 모달 (MyMemosModal) */}
      {isMyMemosOpen && (
        <MyMemosModal
          isOpen={true}
          onClose={() => setIsMyMemosOpen(false)}
          myMemos={myMemos}
          onOpenWrite={(memoToEdit) => {
            setEditingMemo(memoToEdit || null);
            setIsWriteOpen(true);
          }}
          onDeleteMemo={handleDeleteMemo}
          onOpenComments={(m) => setActiveCommentsMemo(m)}
          onOpenShare={(m) => setActiveShareMemo(m)}
        />
      )}

      {/* 2단계 메모 쓰기 플로우 모달 (MemoWriteFlowModal) */}
      {isWriteOpen && (
        <MemoWriteFlowModal
          isOpen={true}
          onClose={() => {
            setIsWriteOpen(false);
            setEditingMemo(null);
          }}
          specimens={specimens}
          existingMemos={memos}
          editMemo={editingMemo}
          onSaveMemo={handleSaveMemo}
        />
      )}

      {/* 글로벌 토스트 알림 */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-900/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 z-50 pointer-events-none"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
