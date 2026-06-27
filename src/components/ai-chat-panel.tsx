'use client';

import { useState, useRef, useEffect } from 'react';
import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react';

const CHAT_HISTORY_KEY = 'lmls_chat_history';

interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

export function AIChatPanel() {
  const chatOpen = useLMLSStore((s) => s.chatOpen);
  const setChatOpen = useLMLSStore((s) => s.setChatOpen);
  const chatMessages = useLMLSStore((s) => s.chatMessages);
  const addChatMessage = useLMLSStore((s) => s.addChatMessage);
  const clearChat = useLMLSStore((s) => s.clearChat);
  const tasks = useLMLSStore((s) => s.tasks);
  const currentFocus = useLMLSStore((s) => s.currentFocus);
  const panicScore = useLMLSStore((s) => s.panicScore);
  const energyLevel = useLMLSStore((s) => s.energyLevel);
  const memory = useLMLSStore((s) => s.memory);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    try {
      const toStore = chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(toStore));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_HISTORY_KEY);
      if (stored && chatMessages.length === 0) {
        const parsed = JSON.parse(stored);
        parsed.forEach((m: { role: string; content: string }) => {
          addChatMessage(m.role as 'user' | 'assistant', m.content);
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    addChatMessage('user', userMsg);
    setIsTyping(true);
    setApiError(false);

    try {
      const active = tasks.filter((t) => t.status !== 'completed');
      const completed = tasks.filter((t) => t.status === 'completed');

      const history = chatMessages
        .filter((m) => m.role !== 'system')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          tasks: active.map((t) => ({
            title: t.title,
            deadline: t.deadline?.toISOString(),
            priority: t.priority,
            progress: t.progress,
            status: t.status,
          })),
          currentFocus,
          panicScore: panicScore?.score ?? null,
          energyLevel,
          memory: {
            completedToday: completed.length,
            missedDeadlines: memory.missedDeadlines,
          },
          history,
        }),
      });

      const data = await res.json();
      addChatMessage('assistant', data.response);
    } catch {
      setApiError(true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    setApiError(false);
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearWithStorage = () => {
    clearChat();
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch {}
  };

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-[420px] overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b] shadow-2xl backdrop-blur-2xl"
          >
              <div className="flex items-center justify-between border-b border-[#27272a] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5">
                  <Bot className="h-4 w-4 text-[#00E599]" />
                </div>
                <div>
                  <span className="text-sm font-medium text-white">LMLS Assistant</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isTyping ? 'bg-[#00E599] animate-pulse' : apiError ? 'bg-[#FBBF24]' : 'bg-[#00E599]'}`} />
                    <span className="text-[10px] text-[#71717a]">
                      {isTyping ? 'Thinking...' : apiError ? 'Offline' : 'Context-aware'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClearWithStorage}
                className="rounded p-1.5 text-[#71717a] transition-colors hover:bg-white/[0.03] hover:text-[#a1a1aa]"
                title="Clear chat"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-[460px] overflow-y-auto px-4 py-3">
              {chatMessages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#00E599]/15 to-[#00E599]/5">
                    <Bot className="h-6 w-6 text-[#00E599]" />
                  </div>
                  <p className="text-sm font-medium text-[#ffffff]/90">I know your tasks and deadlines.</p>
                  <p className="mb-4 text-xs text-[#71717a]">Ask me anything about your workload.</p>
                  <div className="w-full space-y-1.5">
                    {[
                      'What should I do next?',
                      'I am stuck',
                      'I missed my deadline',
                      'Make this easier',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setInput(q)}
                        className="w-full rounded-lg bg-white/[0.03] px-3.5 py-2 text-xs text-[#a1a1aa] transition-colors hover:bg-white/[0.05] hover:text-[#ffffff]/90"
                      >
                        &ldquo;{q}&rdquo;
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#1c1c1f] text-[#ffffff] rounded-br-md'
                        : 'bg-[#18181b] text-[#ffffff] rounded-bl-md border border-[#27272a]'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5">
                      {msg.role === 'user' ? (
                        <User className="h-3 w-3 text-[#71717a]" />
                      ) : (
                        <Bot className="h-3 w-3 text-[#00E599]" />
                      )}
                      <span className="text-[10px] font-medium text-[#71717a]">
                        {msg.role === 'user' ? 'You' : 'LMLS'}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-[13px]">{msg.content}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="mb-3 flex justify-start">
                    <div className="flex items-center gap-3 rounded-2xl rounded-bl-md bg-[#18181b] px-4 py-3 border border-[#27272a]">
                    <div className="flex gap-1.5">
                      <span className="ai-dot h-2 w-2 rounded-full" />
                      <span className="ai-dot h-2 w-2 rounded-full" />
                      <span className="ai-dot h-2 w-2 rounded-full" />
                    </div>
                    <span className="text-[11px] text-[#71717a]">
                      LMLS is analyzing your situation...
                    </span>
                  </div>
                </div>
              )}

              {apiError && !isTyping && (
                <div className="mb-3 flex justify-center">
                  <div className="flex flex-col items-center gap-2 rounded-xl bg-amber-500/10 px-4 py-3 text-center">
                    <p className="text-xs text-[#FBBF24]">
                      AI service temporarily unavailable. Your saved tasks are safe.
                    </p>
                    <button
                      onClick={handleRetry}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 px-3 py-1.5 text-[11px] font-medium text-[#FBBF24] transition-colors hover:bg-amber-500/25"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Retry AI
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-[#27272a] px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask LMLS..."
                  className="min-w-0 flex-1 rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-[#71717a] outline-none ring-1 ring-[#27272a] transition-all focus:ring-[#00E599]/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5 text-[#00E599] transition-all hover:from-[#00E599]/30 hover:to-[#00E599]/10 disabled:opacity-30"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all float-animate ${
          chatOpen
            ? 'bg-[#1c1c1f] text-[#a1a1aa] shadow-zinc-900/50'
            : 'bg-gradient-to-br from-[#00E599]/20 to-[#00E599]/5 text-[#00E599] shadow-[0_0_25px_rgba(0,229,153,0.25)] hover:from-[#00E599]/30 hover:to-[#00E599]/10'
        }`}
      >
        {chatOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </motion.button>
    </>
  );
}
