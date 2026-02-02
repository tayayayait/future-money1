/**
 * 채팅 모달 컴포넌트
 */
import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { isOpenAIConfigured, type FinancialContext } from '@/lib/openai';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialContext?: FinancialContext;
}

export function ChatModal({ isOpen, onClose, financialContext }: ChatModalProps) {
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({ financialContext });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 새 메시지 시 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 모달 열릴 때 입력창 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  const isConfigured = isOpenAIConfigured();

  return (
    <div className="fixed inset-0 z-[100] bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-surface-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">AI 재정 상담</h2>
            <p className="text-xs text-muted-foreground">무엇이든 물어보세요</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearMessages}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        ref={scrollRef}
        className="flex-1 h-[calc(100vh-140px)] px-4 py-4"
      >
        {!isConfigured ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageCircle className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              API 설정 필요
            </h3>
            <p className="text-sm text-muted-foreground">
              AI 상담 기능을 사용하려면 OpenAI API 키가 필요합니다.
              환경 변수에 VITE_OPENAI_API_KEY를 설정해주세요.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <MessageCircle className="w-16 h-16 text-primary/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              AI 재정 상담사에게 질문하세요
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              저축, 투자, 예산 관리 등 재정에 관한 모든 질문에 답해드립니다.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                '월급 300만원, 저축 얼마나 해야 해요?',
                '비상금 규모는 어느 정도가 적당한가요?',
                '20대 투자 전략 추천해주세요',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs px-3 py-2 rounded-full bg-surface-dark border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <ChatMessage
                message={{
                  id: 'loading',
                  role: 'assistant',
                  content: '',
                  timestamp: new Date(),
                }}
                isLoading
              />
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="absolute bottom-0 left-0 right-0 p-4 bg-surface-dark border-t border-white/10 safe-area-bottom"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={!isConfigured || isLoading}
            rows={1}
            className={cn(
              "flex-1 resize-none rounded-xl px-4 py-3 text-sm",
              "bg-background border border-white/10",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent",
              "placeholder:text-muted-foreground",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "max-h-32"
            )}
            style={{ minHeight: '44px' }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || !isConfigured}
            className="h-11 w-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
