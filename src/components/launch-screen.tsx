'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Zap, Cpu, Shield } from 'lucide-react';

const INIT_KEY = 'lmls_initialized';

const checkingItems = [
  { icon: Cpu, text: 'Initializing productivity engine...' },
  { icon: Zap, text: 'Analyzing task intelligence...' },
  { icon: Shield, text: 'Preparing execution system...' },
];

export function LaunchScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'logo' | 'brand' | 'checking' | 'exit'>('logo');
  const [checkStep, setCheckStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  const doneRef = useRef(false);

  const isFirst = typeof window !== 'undefined' && !localStorage.getItem(INIT_KEY);

  useEffect(() => {
    if (doneRef.current) return;

    const totalDuration = isFirst ? 2800 : 900;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(elapsed / totalDuration, 1);
      setProgress(pct);

      if (pct < 0.25) setPhase('logo');
      else if (pct < 0.5) setPhase('brand');
      else if (pct < 0.9) setPhase('checking');
      else setPhase('exit');

      if (pct >= 1) {
        doneRef.current = true;
        try { localStorage.setItem(INIT_KEY, 'true'); } catch {}
        setTimeout(onDone, 500);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const rafRef = { current: requestAnimationFrame(tick) };

    const stepInterval = setInterval(() => {
      setCheckStep((p) => Math.min(p + 1, checkingItems.length - 1));
    }, isFirst ? 500 : 200);

    const skipT = setTimeout(() => setShowSkip(true), 1000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(stepInterval);
      clearTimeout(skipT);
    };
  }, []);

  const handleSkip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('exit');
    try { localStorage.setItem(INIT_KEY, 'true'); } catch {}
    setTimeout(onDone, 400);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
        style={{ background: '#070A12' }}
        exit={{
          opacity: 0,
          scale: 1.05,
          filter: 'blur(10px)',
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        {/* Subtle animated gradient particles */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-1/3 -left-1/3 h-2/3 w-2/3 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,229,153,0.05) 0%, transparent 70%)' }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-1/3 -right-1/3 h-2/3 w-2/3 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.04) 0%, transparent 70%)' }}
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/3 left-1/2 h-1/4 w-1/4 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 60%)' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          />
        </div>

        {/* Center content */}
        <div className="relative flex flex-col items-center">
          {/* Step 1: Logo reveal */}
          <AnimatePresence mode="wait">
            {phase === 'logo' && (
              <motion.div
                key="logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,229,153,0.15), rgba(0,229,153,0.05))',
                  }}
                  initial={{ opacity: 0, scale: 0.8, filter: 'blur(20px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Brain className="h-10 w-10 text-[#00E599]" />
                </motion.div>
                {/* Breathing glow */}
                <motion.div
                  className="absolute -inset-4 rounded-3xl"
                  style={{ border: '1px solid rgba(0,229,153,0.2)' }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: [
                      '0 0 20px rgba(0,229,153,0.15)',
                      '0 0 45px rgba(0,229,153,0.3)',
                      '0 0 20px rgba(0,229,153,0.15)',
                    ],
                  }}
                  transition={{
                    scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    boxShadow: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 2: Brand text */}
          <AnimatePresence mode="wait">
            {phase === 'brand' && (
              <motion.div
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 flex flex-col items-center"
              >
                <motion.h1
                  className="text-base font-bold tracking-tight text-white"
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0% 0 0)' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  Last-Minute Life Saver
                </motion.h1>
                <motion.p
                  className="mt-2 text-xs text-zinc-500"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  Your AI Execution Partner
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 3: AI initialization sequence */}
          <AnimatePresence>
            {phase === 'checking' && (
              <motion.div
                key="checking"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-10 space-y-3"
              >
                {checkingItems.map((item, i) => {
                  const Icon = item.icon;
                  const isDone = i < checkStep;
                  const isActive = i === checkStep;
                  return (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{
                        opacity: isActive || isDone ? 1 : 0.25,
                        x: isActive || isDone ? 0 : -6,
                      }}
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                      className="flex items-center gap-2.5"
                    >
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        isDone ? 'bg-[#00E599]/15' : isActive ? 'bg-white/[0.04]' : 'bg-transparent'
                      }`}>
                        {isDone ? (
                          <span className="text-[10px] text-[#00E599]">✓</span>
                        ) : (
                          <Icon className={`h-3 w-3 ${isActive ? 'text-[#00E599]' : 'text-zinc-600'}`} />
                        )}
                      </div>
                      <span className={`text-[11px] ${
                        isDone ? 'text-zinc-400' : isActive ? 'text-zinc-300' : 'text-zinc-600'
                      }`}>
                        {item.text}
                      </span>
                      {isActive && (
                        <span className="flex gap-0.5">
                          <span className="h-1 w-1 animate-pulse rounded-full bg-[#00E599]" />
                          <span className="h-1 w-1 animate-pulse rounded-full bg-[#00E599]" style={{ animationDelay: '0.2s' }} />
                          <span className="h-1 w-1 animate-pulse rounded-full bg-[#00E599]" style={{ animationDelay: '0.4s' }} />
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-[28%] w-48">
          <div className="h-0.5 overflow-hidden rounded-full" style={{ background: '#1E293B' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#00E599' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        </div>

        {/* Skip */}
        <AnimatePresence>
          {showSkip && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={handleSkip}
              className="absolute bottom-8 right-8 rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-zinc-500 transition-colors hover:border-white/20 hover:text-zinc-300"
            >
              Skip →
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
