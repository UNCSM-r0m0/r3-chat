import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import MessageBubble, { type ChatMessage } from '../ui/MessageBubble';

type ChatAreaProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  isConversationLoading?: boolean;
  loadingVariant?: 'default' | 'code' | 'math';
  /** padding inferior reservado para el input (px) */
  bottomPadding?: number;
  onResend?: (text: string) => void;
};

const ConversationSkeleton: React.FC<{ variant: 'default' | 'code' | 'math' }> = ({ variant }) => {
  const baseClasses = "space-y-4 animate-pulse";
  
  if (variant === 'code') {
    return (
      <div className={baseClasses} aria-hidden="true">
        {/* User message skeleton */}
        <div className="flex items-start gap-4 max-w-3xl mx-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
          <div className="bg-zinc-800/50 rounded-2xl rounded-tr-sm px-4 py-3 w-[70%] h-12" />
        </div>
        {/* Code block skeleton */}
        <div className="flex items-start gap-4 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
            <div className="bg-zinc-900/80 rounded-xl border border-white/[0.06] p-4 space-y-2">
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-11/12" />
              <div className="h-3 bg-zinc-800 rounded w-4/5" />
              <div className="h-3 bg-zinc-800 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'math') {
    return (
      <div className={baseClasses} aria-hidden="true">
        <div className="flex items-start gap-4 max-w-3xl mx-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
          <div className="bg-zinc-800/50 rounded-2xl rounded-tr-sm px-4 py-3 w-[60%] h-12" />
        </div>
        <div className="flex items-start gap-4 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-zinc-800/50 rounded w-2/3" />
            <div className="bg-zinc-900/50 rounded-xl border border-white/[0.06] p-4">
              <div className="h-8 bg-zinc-800/50 rounded w-1/2 mb-2" />
              <div className="h-3 bg-zinc-800/30 rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={baseClasses} aria-hidden="true">
      <div className="flex items-start gap-4 max-w-3xl mx-auto flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
        <div className="bg-zinc-800/50 rounded-2xl rounded-tr-sm px-4 py-3 w-[65%] h-12" />
      </div>
      <div className="flex items-start gap-4 max-w-3xl mx-auto">
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800/50 rounded w-full" />
          <div className="h-4 bg-zinc-800/40 rounded w-11/12" />
          <div className="h-4 bg-zinc-800/30 rounded w-4/5" />
          <div className="h-4 bg-zinc-800/20 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
};

const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  isStreaming = false, 
  isConversationLoading = false, 
  loadingVariant = 'default', 
  bottomPadding = 120, 
  onResend 
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const prevLoadingRef = useRef(isConversationLoading);
  const [userIsNearBottom, setUserIsNearBottom] = useState(true);
  const [isContentVisible, setIsContentVisible] = useState(!isConversationLoading);
  const [isStaggering, setIsStaggering] = useState(false);
  // Track if user explicitly scrolled up (to prevent auto-scroll during streaming)
  const userScrolledUpRef = useRef(false);

  const padBottom = useMemo(() => Math.max(100, bottomPadding), [bottomPadding]);

  // Detect scroll position — prevent false negatives during streaming
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 150;
      const distanceToBottom = el.scrollHeight - el.clientHeight - el.scrollTop;
      const isNearBottom = distanceToBottom < threshold;
      
      // During streaming, only set to false if user clearly scrolled UP
      // (large distance from bottom). Don't flip for small reflows.
      if (isStreaming) {
        if (distanceToBottom > 500) {
          // User definitely scrolled up
          userScrolledUpRef.current = true;
          setUserIsNearBottom(false);
        }
        // Don't set to true during streaming unless user scrolls back down
        return;
      }
      
      setUserIsNearBottom(isNearBottom);
      if (isNearBottom) {
        userScrolledUpRef.current = false;
      }
    };
    
    // Check initial position
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isStreaming]);

  // Auto-scroll to bottom during streaming or on new messages
  useEffect(() => {
    if (isConversationLoading) return;
    
    const container = scrollerRef.current;
    if (!container) return;

    // During streaming: always scroll to bottom instantly
    if (isStreaming && !userScrolledUpRef.current) {
      container.scrollTop = container.scrollHeight;
      return;
    }

    // After streaming or new messages: scroll to bottom if user is near bottom
    if (userIsNearBottom && !userScrolledUpRef.current) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [messages, isStreaming, userIsNearBottom, isConversationLoading]);

  // Force scroll on new user message
  useEffect(() => {
    if (isConversationLoading) return;
    if (!messages || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last?.role === 'user') {
      userScrolledUpRef.current = false;
      const container = scrollerRef.current;
      if (!container) return;
      // Scroll to bottom immediately when user sends a message
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  }, [messages, isConversationLoading]);

  // Handle loading state transitions
  useEffect(() => {
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isConversationLoading;

    if (isConversationLoading) {
      setIsContentVisible(false);
      setIsStaggering(false);
      return;
    }

    if (wasLoading) {
      setIsStaggering(true);
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsContentVisible(true);
    });

    const timeoutId = window.setTimeout(() => {
      setIsStaggering(false);
    }, 700);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [isConversationLoading, messages.length]);

  const scrollToBottom = useCallback(() => {
    const container = scrollerRef.current;
    if (container) {
      userScrolledUpRef.current = false;
      setUserIsNearBottom(true);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="h-full overflow-y-auto overscroll-contain relative"
      aria-label="Chat messages"
    >
      <div className="w-full px-4 md:px-6 lg:px-8 pb-4" style={{ paddingBottom: padBottom }}>
        {isConversationLoading ? (
          <div className="pt-8">
            <ConversationSkeleton variant={loadingVariant} />
          </div>
        ) : (
          <div className="py-2">
            {messages.map((m, idx) => {
              const isErrorAssistant = m.role === 'assistant' && m.isError;
              let resendHandler: (() => void) | undefined;
              if (isErrorAssistant && onResend) {
                for (let j = idx - 1; j >= 0; j--) {
                  const prev = messages[j];
                  if (prev.role === 'user' && prev.content) {
                    const text = prev.content;
                    resendHandler = () => onResend(text);
                    break;
                  }
                }
              }

              const shouldStagger = isStaggering && idx < 10;
              const delayMs = shouldStagger ? idx * 45 : 0;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: isContentVisible ? 1 : 0, 
                    y: isContentVisible ? 0 : 10 
                  }}
                  transition={{ 
                    duration: 0.3, 
                    delay: delayMs / 1000,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                  data-msg-id={m.id}
                >
                  <MessageBubble message={m} onResend={resendHandler} />
                </motion.div>
              );
            })}
          </div>
        )}
        {/* Anchor element for scrolling — minimal height to avoid scroll offset issues */}
        <div style={{ height: 1 }} />
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {!userIsNearBottom && messages.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            onClick={scrollToBottom}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-default)] shadow-xl text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-hover)] transition-all duration-200 group"
            aria-label="Scroll to bottom"
          >
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
            <span>Scroll to bottom</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatArea;
