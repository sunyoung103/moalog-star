import React, { useState } from 'react';
import { X, Heart, CornerDownRight, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoComment } from '../data/initialMemos';

interface MemoCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoId: string;
  memoWriter: string;
  comments: MemoComment[];
  onAddComment: (memoId: string, content: string, parentId?: string, replyTo?: string) => void;
  onToggleCommentLike: (memoId: string, commentId: string) => void;
}

export const MemoCommentsModal: React.FC<MemoCommentsModalProps> = ({
  isOpen,
  onClose,
  memoId,
  memoWriter,
  comments,
  onAddComment,
  onToggleCommentLike,
}) => {
  const [inputText, setInputText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; writer: string } | null>(null);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onAddComment(memoId, inputText.trim(), replyingTo?.id, replyingTo?.writer);
    setInputText('');
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startReply = (comment: MemoComment) => {
    setReplyingTo({ id: comment.id, writer: comment.writer });
    setInputText(`@${comment.writer} `);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex flex-col justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative bg-white w-full max-w-lg mx-auto rounded-t-[28px] max-h-[85vh] flex flex-col shadow-2xl overflow-hidden z-10"
        >
          {/* Drag Handle */}
          <div className="w-full pt-3 pb-1 flex justify-center">
            <div className="w-10 h-1 bg-stone-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-1.5">
              <span>댓글</span>
              <span className="text-stone-400 font-mono text-sm">{comments.length}</span>
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[220px]">
            {comments.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-sm">
                첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              comments.map((comment) => {
                const isReply = !!comment.parentId;
                return (
                  <div
                    key={comment.id}
                    className={`flex gap-3 text-xs ${isReply ? 'ml-8 pl-2 border-l-2 border-stone-200/60' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-100 shrink-0">
                      {comment.writerAvatar ? (
                        <img
                          src={comment.writerAvatar}
                          alt={comment.writer}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          {comment.writer.slice(0, 1)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{comment.writer}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{comment.time}</span>
                      </div>
                      <p className="text-stone-800 text-[13px] mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {comment.replyTo && (
                          <span className="text-emerald-600 font-medium mr-1">@{comment.replyTo}</span>
                        )}
                        {comment.content.replace(new RegExp(`^@${comment.replyTo}\\s*`), '')}
                      </p>

                      <div className="mt-1 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => startReply(comment)}
                          className="text-[11px] text-stone-500 font-medium hover:text-stone-900"
                        >
                          답글 달기
                        </button>
                      </div>
                    </div>

                    {/* Like button */}
                    <button
                      type="button"
                      onClick={() => onToggleCommentLike(memoId, comment.id)}
                      className="flex flex-col items-center gap-0.5 text-stone-400 hover:text-rose-500 pt-0.5 px-1"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-colors ${
                          comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                      {comment.likes > 0 && (
                        <span className="text-[10px] font-mono text-stone-500">{comment.likes}</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Context indicator */}
          {replyingTo && (
            <div className="px-4 py-1.5 bg-stone-100/80 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1 truncate">
                <CornerDownRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="font-bold text-stone-800">@{replyingTo.writer}</span>님에게 답글 남기는 중
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setInputText('');
                }}
                className="text-stone-400 hover:text-stone-700 text-xs px-1"
              >
                취소
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
              나
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={replyingTo ? `@${replyingTo.writer}에게 답글 달기...` : `${memoWriter}님에게 댓글 달기...`}
              className="flex-1 bg-stone-100 rounded-full px-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 outline-none focus:ring-1 focus:ring-stone-400"
            />
            <button
              type="button"
              disabled={!inputText.trim()}
              onClick={handleSend}
              className={`p-2 rounded-full transition-all ${
                inputText.trim()
                  ? 'bg-stone-900 text-white cursor-pointer active:scale-95'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
