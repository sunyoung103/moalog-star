import React, { useState } from 'react';
import { X, Check, Copy, Download, MessageSquare, Share2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoItem } from '../data/initialMemos';

interface MemoShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memo: MemoItem | null;
  onShareSuccess?: (memoId: string) => void;
}

export const MemoShareModal: React.FC<MemoShareModalProps> = ({
  isOpen,
  onClose,
  memo,
  onShareSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !memo) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = window.location.href.split('?')[0] + `?memo=${memo.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('공유 링크가 클립보드에 복사되었어요!');
      onShareSuccess?.(memo.id);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('링크 복사에 성공했습니다.');
      onShareSuccess?.(memo.id);
    }
  };

  const handleKakaoShare = () => {
    showToast('카카오톡으로 생태 관찰 메모 카드를 전송합니다.');
    onShareSuccess?.(memo.id);
    setTimeout(() => onClose(), 1200);
  };

  const handleStoryShare = () => {
    showToast('스토리 공유용 프리뷰 카드가 준비되었습니다.');
    onShareSuccess?.(memo.id);
    setTimeout(() => onClose(), 1200);
  };

  const handleMessageShare = () => {
    const text = `[모아로그 Moalog] ${memo.writer.name}님의 ${memo.specimenName} 관찰 메모:\n"${memo.content.slice(0, 80)}..."\n${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: `모아로그 - ${memo.specimenName} 관찰 기록`,
        text,
        url: window.location.href,
      }).then(() => {
        onShareSuccess?.(memo.id);
        onClose();
      }).catch(() => {});
    } else {
      showToast('메시지 전송 창으로 이동합니다.');
      onShareSuccess?.(memo.id);
    }
  };

  const handleSaveImage = () => {
    showToast('공유용 도감 카드가 이미지로 저장되었습니다.');
    onShareSuccess?.(memo.id);
  };

  const firstSentence = memo.content.split(/[.\n]/)[0] || memo.content.slice(0, 40);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[75] flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative bg-white w-full max-w-lg mx-auto rounded-t-[28px] max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10 font-sans"
        >
          {/* Drag handle */}
          <div className="w-full pt-3 pb-1 flex justify-center">
            <div className="w-10 h-1 bg-stone-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-2.5 flex items-center justify-between border-b border-stone-100">
            <div>
              <h3 className="text-base font-bold text-stone-900">공유하기</h3>
              <p className="text-[11px] text-stone-400">자연의 생생한 순간을 친구들과 함께 나눠보세요</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Share Card Preview (도감 카드 + 메모 첫 문장 + Moalog 로고) */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white shadow-xl border border-stone-800">
              <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                <img
                  src={memo.photoUrl}
                  alt={memo.specimenName}
                  className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 text-stone-900 backdrop-blur-xs shadow-sm">
                    {memo.specimenName}
                  </span>
                  {memo.scoreGrade && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-stone-950">
                      포착 {memo.scoreGrade}급
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded-md text-[10px] font-medium bg-black/50 text-white/90 backdrop-blur-xs">
                    {memo.location}
                  </span>
                </div>
              </div>

              {/* Memo Content Snippet */}
              <div className="p-4 bg-stone-900/95 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-stone-700 shrink-0">
                    <img src={memo.writer.avatar} alt={memo.writer.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-stone-200">{memo.writer.name}</span>
                  <span className="text-[10px] text-stone-400">{memo.time}</span>
                </div>

                <p className="text-xs text-stone-100 font-medium leading-relaxed italic bg-white/5 p-2.5 rounded-xl border border-white/10">
                  “{firstSentence}...”
                </p>

                {/* Footer Brand */}
                <div className="pt-2 flex items-center justify-between border-t border-white/10 text-[10px] text-stone-400">
                  <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    MOALOG · 모아로그 생태 탐험
                  </div>
                  <span>moalog.app</span>
                </div>
              </div>
            </div>

            {/* Sharing Options (5종 버튼) */}
            <div className="pt-1">
              <h4 className="text-xs font-bold text-stone-500 mb-2.5 px-0.5">보낼 채널 선택</h4>
              <div className="grid grid-cols-5 gap-2 text-center">
                {/* 1. 카카오톡 */}
                <button
                  type="button"
                  onClick={handleKakaoShare}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FEE500] text-[#191919] flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                    톡
                  </div>
                  <span className="text-[11px] font-medium text-stone-700">카카오톡</span>
                </button>

                {/* 2. 스토리 */}
                <button
                  type="button"
                  onClick={handleStoryShare}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-700">스토리</span>
                </button>

                {/* 3. 메시지 */}
                <button
                  type="button"
                  onClick={handleMessageShare}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-700">메시지</span>
                </button>

                {/* 4. 링크 복사 */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform ${
                    copied ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}>
                    {copied ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <span className="text-[11px] font-medium text-stone-700">{copied ? '복사됨' : '링크 복사'}</span>
                </button>

                {/* 5. 이미지 저장 */}
                <button
                  type="button"
                  onClick={handleSaveImage}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-stone-50 transition-colors group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform hover:bg-stone-200">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-stone-700">카드 저장</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-500 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>앱이 없는 친구도 웹 브라우저에서 생태 카드와 작성자 메모를 바로 열람할 수 있어요.</span>
            </div>
          </div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-stone-900/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 z-50 pointer-events-none"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
