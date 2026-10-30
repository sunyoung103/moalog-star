import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, Check, Lock, Globe, AlertTriangle, Sparkles, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Specimen } from '../types';
import { MemoItem } from '../data/initialMemos';

interface MemoWriteFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  specimens: Specimen[];
  existingMemos: MemoItem[];
  initialSpecimen?: Specimen | null;
  editMemo?: MemoItem | null;
  onSaveMemo: (memoData: {
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
  }) => void;
}

export const MemoWriteFlowModal: React.FC<MemoWriteFlowModalProps> = ({
  isOpen,
  onClose,
  specimens,
  existingMemos,
  initialSpecimen,
  editMemo,
  onSaveMemo,
}) => {
  // 수집 완료된 표본 목록 필터링
  const collectedSpecimens = specimens.filter((s) => s.isCollected && !s.isDeleted);

  // 단계 상태: Step 1 (포착 고르기) vs Step 2 (메모 작성)
  const [step, setStep] = useState<'select' | 'write'>(() => {
    if (editMemo || initialSpecimen) return 'write';
    return 'select';
  });

  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(() => {
    if (initialSpecimen) return initialSpecimen;
    if (editMemo && editMemo.specimenId) {
      const found = collectedSpecimens.find((s) => s.id === editMemo.specimenId);
      if (found) return found;
    }
    return collectedSpecimens[0] || null;
  });

  // 작성 필드 상태
  const [content, setContent] = useState(editMemo?.content || '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(editMemo?.visibility || 'public');
  const [locationScope, setLocationScope] = useState<'town_only' | 'exact'>(editMemo?.locationScope || 'town_only');
  const [selectedTags, setSelectedTags] = useState<string[]>(editMemo?.tags || []);

  useEffect(() => {
    if (editMemo) {
      setContent(editMemo.content);
      setVisibility(editMemo.visibility);
      setLocationScope(editMemo.locationScope);
      setSelectedTags(editMemo.tags || []);
      const found = collectedSpecimens.find((s) => s.id === editMemo.specimenId);
      if (found) setSelectedSpecimen(found);
      setStep('write');
    } else if (initialSpecimen) {
      setSelectedSpecimen(initialSpecimen);
      // 기존 메모가 있는지 확인
      const existing = existingMemos.find((m) => m.specimenId === initialSpecimen.id && m.writer.isMe);
      if (existing) {
        setContent(existing.content);
        setVisibility(existing.visibility);
        setLocationScope(existing.locationScope);
        setSelectedTags(existing.tags || []);
      } else {
        setContent('');
        setVisibility('public');
        setLocationScope('town_only');
        setSelectedTags([
          `#${initialSpecimen.koreanName}`,
          `#${initialSpecimen.locationCoord?.district || initialSpecimen.locationCoord?.name || '생태탐험'}`,
        ]);
      }
      setStep('write');
    }
  }, [editMemo, initialSpecimen, collectedSpecimens]);

  if (!isOpen) return null;

  // 특정 표본에 이미 작성된 내 메모가 있는지 체크
  const getExistingMemoForSpecimen = (specimenId: string) => {
    return existingMemos.find((m) => m.specimenId === specimenId && (m.writer.isMe || m.writer.name === '나'));
  };

  const handleSelectSpecimen = (specimen: Specimen) => {
    setSelectedSpecimen(specimen);
    const existing = getExistingMemoForSpecimen(specimen.id);
    if (existing) {
      setContent(existing.content);
      setVisibility(existing.visibility);
      setLocationScope(existing.locationScope);
      setSelectedTags(existing.tags || []);
    } else {
      setContent('');
      setVisibility('public');
      setLocationScope('town_only');
      setSelectedTags([
        `#${specimen.koreanName}`,
        `#${specimen.locationCoord?.district || specimen.locationCoord?.name || '야생탐사'}`,
      ]);
    }
  };

  const handleProceedToWrite = () => {
    if (!selectedSpecimen) return;
    setStep('write');
  };

  // 추천 태그 후보 생성
  const defaultRecommendedTags = selectedSpecimen
    ? [
        `#${selectedSpecimen.koreanName}`,
        `#${selectedSpecimen.locationCoord?.district || selectedSpecimen.locationCoord?.name || '양재천'}`,
        '#생태탐사',
        '#아침산책',
        '#자연관찰',
      ]
    : ['#생태탐사', '#자연관찰'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = () => {
    if (!selectedSpecimen || !content.trim()) return;

    const obs = selectedSpecimen.observations?.[0];
    const photo = selectedSpecimen.originalImage || selectedSpecimen.stickerImage || obs?.photoUrl || '/assets/specimens/unsplash_TW2bfT_tWDI.png';
    const loc = selectedSpecimen.locationCoord?.district || selectedSpecimen.locationCoord?.name || obs?.location || '생태 공원';

    onSaveMemo({
      id: editMemo?.id,
      specimenId: selectedSpecimen.id,
      specimenName: selectedSpecimen.koreanName,
      scientificName: selectedSpecimen.scientificName,
      category: selectedSpecimen.category,
      photoUrl: photo,
      content: content.trim(),
      tags: selectedTags,
      visibility,
      locationScope,
      location: loc,
      scoreGrade: 'S',
      scoreTotal: 92,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Top App Bar */}
          <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              {step === 'write' && !initialSpecimen && !editMemo && (
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="p-1 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-base font-bold text-stone-900">
                {step === 'select' ? '포착 고르기' : '메모 쓰기'}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {step === 'write' && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!content.trim()}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                    content.trim()
                      ? 'bg-stone-900 text-white hover:bg-black active:scale-95'
                      : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {visibility === 'public' ? '올리기' : '저장'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -mr-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* STEP 1: 포착 고르기 */}
          {step === 'select' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-5 pt-4 pb-2 bg-stone-50/70 border-b border-stone-100">
                <h3 className="text-sm font-extrabold text-stone-900">어떤 포착에 메모를 남길까요?</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  메모는 포착 하나에 하나씩 붙어요. (기존 메모가 있다면 수정할 수 있어요)
                </p>
              </div>

              {/* Specimen Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {collectedSpecimens.length === 0 ? (
                  <div className="py-16 text-center text-stone-400 space-y-2">
                    <ImageIcon className="w-10 h-10 mx-auto text-stone-300" />
                    <p className="text-xs font-medium">아직 수집된 포착이 없습니다.</p>
                    <p className="text-[11px] text-stone-400">카메라로 생물을 포착하고 도감에 등록해 보세요!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {collectedSpecimens.map((specimen) => {
                      const isSelected = selectedSpecimen?.id === specimen.id;
                      const hasMemo = !!getExistingMemoForSpecimen(specimen.id);
                      const img = specimen.originalImage || specimen.stickerImage || '/assets/specimens/unsplash_TW2bfT_tWDI.png';
                      const dateText = specimen.observations?.[0]?.date || '오늘';

                      return (
                        <div
                          key={specimen.id}
                          onClick={() => handleSelectSpecimen(specimen)}
                          className={`relative rounded-2xl p-2 flex flex-col items-center cursor-pointer transition-all border-2 text-center group ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20'
                              : 'border-stone-200/80 bg-white hover:border-stone-300 shadow-xs'
                          }`}
                        >
                          {/* Image Box */}
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 relative mb-1.5">
                            <img
                              src={img}
                              alt={specimen.koreanName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {hasMemo && (
                              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-stone-900/80 text-white text-[9px] font-bold backdrop-blur-xs">
                                메모 있음
                              </div>
                            )}
                          </div>

                          <span className="text-xs font-bold text-stone-900 truncate w-full">
                            {specimen.koreanName}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono mt-0.5">
                            {dateText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="p-4 border-t border-stone-200 bg-white">
                <button
                  type="button"
                  disabled={!selectedSpecimen}
                  onClick={handleProceedToWrite}
                  className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    selectedSpecimen
                      ? 'bg-stone-900 text-white hover:bg-black active:scale-[0.99]'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  이 포착으로 메모 쓰기
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: 메모 작성 */}
          {step === 'write' && selectedSpecimen && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Selected Specimen Summary Card */}
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                  <img
                    src={selectedSpecimen.originalImage || selectedSpecimen.stickerImage || '/assets/specimens/unsplash_TW2bfT_tWDI.png'}
                    alt={selectedSpecimen.koreanName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-sm text-stone-900">{selectedSpecimen.koreanName}</h4>
                    <span className="text-[11px] text-stone-400 italic font-serif">
                      {selectedSpecimen.scientificName}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                    <span>📍 {selectedSpecimen.locationCoord?.district || selectedSpecimen.locationCoord?.name || '양재천 둔치'}</span>
                    <span>·</span>
                    <span className="font-mono">{selectedSpecimen.observations?.[0]?.date || '오늘'}</span>
                  </div>
                </div>
              </div>

              {/* Textarea Area (최대 500자) */}
              <div className="relative border border-stone-200 rounded-2xl p-3 bg-white focus-within:ring-2 focus-within:ring-stone-400 focus-within:border-transparent transition-all">
                <textarea
                  rows={4}
                  maxLength={500}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="버드나무 가지 끝에서 10분 넘게 기다렸어요. 물속으로 뛰어드는 순간 등 관찰한 순간의 감동을 기록해 보세요."
                  className="w-full text-xs text-stone-900 placeholder:text-stone-400 outline-none resize-none leading-relaxed"
                />
                <div className="text-right text-[10px] font-mono text-stone-400 pt-1 border-t border-stone-100">
                  {content.length} / 500
                </div>
              </div>

              {/* Recommended Tags Chips */}
              <div>
                <span className="text-[11px] font-bold text-stone-600 block mb-1.5">추천 태그</span>
                <div className="flex flex-wrap gap-1.5">
                  {defaultRecommendedTags.map((tag) => {
                    const isAdded = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {tag} {isAdded ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 공개 범위 라디오 */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-600 block">공개 범위</span>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                      visibility === 'private'
                        ? 'border-stone-900 bg-stone-900 text-white font-bold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'private'}
                      onChange={() => setVisibility('private')}
                      className="hidden"
                    />
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">나만 보기</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                      visibility === 'public'
                        ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                        : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      checked={visibility === 'public'}
                      onChange={() => setVisibility('public')}
                      className="hidden"
                    />
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs">메모 피드에 공개</span>
                  </label>
                </div>
              </div>

              {/* 위치 표시 라디오 */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-stone-600 block">위치 표시</span>
                <div className="space-y-1.5">
                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      locationScope === 'town_only'
                        ? 'border-emerald-600 bg-emerald-50/50 text-stone-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        locationScope === 'town_only' ? 'border-emerald-600' : 'border-stone-300'
                      }`}>
                        {locationScope === 'town_only' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </div>
                      <span className="text-xs">동네까지만</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-normal">
                      {selectedSpecimen.locationCoord?.district || '동네 단위'} · 기본값
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      locationScope === 'exact'
                        ? 'border-emerald-600 bg-emerald-50/50 text-stone-900 font-bold'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        locationScope === 'exact' ? 'border-emerald-600' : 'border-stone-300'
                      }`}>
                        {locationScope === 'exact' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </div>
                      <span className="text-xs">정확한 위치</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-normal">
                      찍은 자리에 핀이 꽂혀요
                    </span>
                  </label>
                </div>
              </div>

              {/* 멸종위기종 안내 문구 */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2 text-[11px] text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  멸종위기종 및 천연기념물은 공개로 설정해도 서식지 보호를 위해 위치가 자동으로 숨겨져요.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={!content.trim()}
                  onClick={handleSave}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    content.trim()
                      ? visibility === 'public'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99]'
                        : 'bg-stone-900 text-white hover:bg-black active:scale-[0.99]'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {visibility === 'public' ? '메모 피드에 올리기' : '저장'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
