/**
 * 플로팅 채팅 버튼 컴포넌트
 */
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatModal } from './ChatModal';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed z-50 right-4 bottom-24 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-[0_8px_24px_rgba(19,236,91,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white/20"
        aria-label="AI 채팅 상담 열기"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* 채팅 모달 */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
