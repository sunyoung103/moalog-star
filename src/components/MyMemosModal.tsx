import React, { useState } from 'react';
import { ChevronLeft, Lock, Globe, Heart, MessageCircle, Share2, Plus, MoreVertical, Trash2, Edit3, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoItem } from '../data/initialMemos';

interface MyMemosModalProps {
  isOpen: boolean;
  onClose: () => void;
  myMemos: MemoItem[];
  onOpenWrite: (editMemo?: MemoItem) => void;
  onDeleteMemo: (memoId: string) => void;
  onOpenComments: (memo: MemoItem) => void;
  onOpenShare: (memo: MemoItem) => void;
}

export const MyMemosModal: React.FC<MyMemosModalProps> = ({
  isOpen,
  onClose,
  myMemos,
  onOpenWrite,
  onDeleteMemo,
  onOpenComments,
  onOpenShare,
}) => {
  const [tab, setTab] = useState<'all' | 'public' | 'private'>('all');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  if (!isOpen) return null;

  // 통계 계산
  const totalMemos = myMemos.length;
  const totalLikes = myMemos.reduce((acc, m) => acc + (m.likes || 0), 0);
  const totalComments = myMemos.reduce((acc, m) => acc + (m.commentsCount || m.comments?.length || 0), 0);
  const totalShares = myMemos.reduce((acc, m) => acc + (m.sharesCount || 0), 0);

  // 필터링
  const filteredMemos = myMemos.filter((memo) => {
    if (tab === 'public') return memo.visibility === 'public';
    if (tab === 'private') return memo.visibility === 'private';
    return true;
  });

  return (
    <div className="fixed inset-0 z-[65] bg-[#F5F6F8] flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-stone-200/80 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-1 rounded-full text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">내 메모</h2>
        </div>
        <button
          type="button"
          onClick={() => onOpenWrite()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-full text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>메모 쓰기</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {/* Statistics Bar (4종 요약) */}
        <div className="p-4 bg-white border-b border-stone-200/70">
          <div className="text-xs font-bold text-stone-500 mb-2.5">내 탐험 활동 요약</div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block mb-0.5">남긴 메모</span>
              <span className="text-base font-extrabold text-stone-900 font-mono">{totalMemos}</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block mb-0.5">받은 하트</span>
              <span className="text-base font-extrabold text-rose-500 font-mono">{totalLikes}</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block mb-0.5">받은 댓글</span>
              <span className="text-base font-extrabold text-blue-600 font-mono">{totalComments}</span>
            </div>
            <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block mb-0.5">공유된 횟수</span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">{totalShares}</span>
            </div>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="px-4 py-3 bg-white border-b border-stone-200/50 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 ({myMemos.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('public')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'public'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            공개 ({myMemos.filter((m) => m.visibility === 'public').length})
          </button>
          <button
            type="button"
            onClick={() => setTab('private')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              tab === 'private'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Lock className="w-3 h-3" />
            나만 보기 ({myMemos.filter((m) => m.visibility === 'private').length})
          </button>
        </div>

        {/* Memos List */}
        <div className="p-4 space-y-3.5 max-w-xl mx-auto">
          {filteredMemos.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                ✏️
              </div>
              <div>
                <p className="text-sm font-bold text-stone-800">
                  {tab === 'private' ? '나만 보기로 등록한 메모가 없습니다.' : '아직 작성한 메모가 없어요.'}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  관찰한 포착 카드에 생생한 메모를 남겨 탐험 일지를 완성해 보세요!
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenWrite()}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                첫 메모 남기기
              </button>
            </div>
          ) : (
            filteredMemos.map((memo) => (
              <div
                key={memo.id}
                className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-xs relative"
              >
                {/* Top bar: Visibility Badge + Time + Menu */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        memo.visibility === 'public'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border border-stone-200'
                      }`}
                    >
                      {memo.visibility === 'public' ? (
                        <>
                          <Globe className="w-2.5 h-2.5" />
                          <span>피드 공개</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-2.5 h-2.5" />
                          <span>나만 보기</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">{memo.time}</span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === memo.id ? null : memo.id)}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === memo.id && (
                      <div className="absolute right-0 top-6 w-28 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-30 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onOpenWrite(memo);
                          }}
                          className="w-full text-left px-3 py-2 text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                          수정하기
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpenId(null);
                            onDeleteMemo(memo.id);
                          }}
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          삭제하기
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specimen Info Preview Bar */}
                <div className="flex items-center gap-3 p-2 bg-stone-50 rounded-xl mb-3 border border-stone-100">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-200 shrink-0">
                    <img
                      src={memo.photoUrl}
                      alt={memo.specimenName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-stone-900">{memo.specimenName}</span>
                      {memo.scoreGrade && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                          {memo.scoreGrade}급
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 truncate block mt-0.5">
                      📍 {memo.location} ({memo.locationScope === 'town_only' ? '동네 표기' : '정확한 위치'})
                    </span>
                  </div>
                </div>

                {/* Memo Content */}
                <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-wrap mb-2.5">
                  {memo.content}
                </p>

                {/* Tags */}
                {memo.tags && memo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {memo.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom Reactions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-stone-500 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${memo.likes > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
                      <span className="font-mono text-[11px]">{memo.likes || 0}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenComments(memo)}
                      className="flex items-center gap-1 hover:text-stone-800 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">{memo.commentsCount || memo.comments?.length || 0}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenShare(memo)}
                      className="flex items-center gap-1 hover:text-stone-800 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="font-mono text-[11px]">{memo.sharesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
