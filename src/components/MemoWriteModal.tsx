import React, { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';

interface MemoWriteProps {
  onClose: () => void;
  onPost: (content: string) => void;
}

export const MemoWriteModal: React.FC<MemoWriteProps> = ({ onClose, onPost }) => {
  const [content, setContent] = useState('');

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col font-geist">
      <div className="px-4 py-3 flex items-center justify-between border-b border-stone-200">
        <button onClick={onClose}><X /></button>
        <h2 className="text-lg font-bold">메모 쓰기</h2>
        <button 
          onClick={() => { onPost(content); onClose(); }}
          className="text-emerald-600 font-bold"
        >
          저장
        </button>
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-4 w-full outline-none resize-none"
        placeholder="이 순간을 기록해 두세요."
      />
    </div>
  );
};
