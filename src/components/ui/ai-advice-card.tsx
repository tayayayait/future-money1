import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, RefreshCw, AlertCircle, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAIAdvice } from '@/hooks/useAIAdvice';
import { type FinancialContext } from '@/lib/openai';
import { ChatModal } from '@/components/chat';

interface AIAdviceCardProps {
  context: FinancialContext;
  className?: string;
}

/**
 * AI 재정 조언 카드 컴포넌트
 * 
 * ChatGPT API를 사용하여 개인화된 재정 조언을 표시합니다.
 */
export function AIAdviceCard({ context, className = '' }: AIAdviceCardProps) {
  const { advice, isLoading, error, isConfigured, fetchInsight, clearAdvice } = useAIAdvice();
  const [hasRequested, setHasRequested] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleGetAdvice = async () => {
    setHasRequested(true);
    await fetchInsight(context, 'general');
  };

  // API가 설정되지 않은 경우
  if (!isConfigured) {
    return null;
  }

  return (
    <>
      <Card className={`overflow-hidden ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  AI 재정 조언
                  <span className="text-xs text-muted-foreground font-normal">
                    Powered by ChatGPT
                  </span>
                </h3>
                {advice && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={clearAdvice}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGetAdvice}
                      className="h-6 px-2"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      재시도
                    </Button>
                  </motion.div>
                ) : advice ? (
                  <motion.div
                    key="advice"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      {advice}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsChatOpen(true)}
                      className="gap-2 w-full"
                    >
                      <MessageCircle className="w-4 h-4" />
                      AI와 더 대화하기
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasRequested 
                        ? 'AI가 당신의 재정 상태를 분석할 준비가 되었습니다.'
                        : 'AI가 개인화된 재정 조언을 제공해드려요.'
                      }
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGetAdvice}
                        className="gap-2 flex-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        AI 조언 받기
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setIsChatOpen(true)}
                        className="gap-2 flex-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        AI와 대화하기
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 채팅 모달 */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} financialContext={context} />
    </>
  );
}

