'use client';

import { useState, useEffect } from 'react';
import { useLMLSStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/header';
import { CommandCenter } from '@/components/command-center';
import { AISituationOverview } from '@/components/ai-situation-overview';
import { SmartTaskCards } from '@/components/smart-task-cards';
import { AtomicTimeline } from '@/components/atomic-timeline';
import { TodayBattlePlan } from '@/components/today-battle-plan';
import { PreparedForYou } from '@/components/prepared-for-you';
import { MemoryInsights } from '@/components/memory-insights';
import { PivotButton } from '@/components/pivot-button';
import { AIChatPanel } from '@/components/ai-chat-panel';
import { RecoveryBanner } from '@/components/recovery-banner';
import { TaskIntelligence } from '@/components/task-intelligence';
import { ResourcesCard } from '@/components/resources-card';
import { PlanReviewDialog } from '@/components/plan-review-dialog';
import { SplashScreen, DashboardShell } from '@/components/splash-screen';

const stagger = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const fadeSlide = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function Toast() {
  const toastMessage = useLMLSStore((s) => s.toastMessage);

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-[#00E599]/20 bg-[#18181b] px-5 py-3 shadow-lg shadow-[#00E599]/10"
        >
          <p className="text-sm font-medium text-[#00E599]">{toastMessage}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const loadFromDB = useLMLSStore((s) => s.loadFromDB);
  const [launchDone, setLaunchDone] = useState(false);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  return (
    <>
      <AnimatePresence>
        {!launchDone && <SplashScreen onDone={() => setLaunchDone(true)} />}
      </AnimatePresence>

      <AnimatePresence>
        {launchDone && (
          <DashboardShell>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Header />
              <RecoveryBanner />

              <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4">
                <motion.div
                  className="mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <CommandCenter />
                </motion.div>

                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-4 lg:grid-cols-3"
                >
                  <motion.div variants={fadeSlide} className="space-y-4 lg:col-span-1">
                    <AISituationOverview />
                    <SmartTaskCards />
                    <TaskIntelligence />
                  </motion.div>

                  <motion.div variants={fadeSlide} className="space-y-4 lg:col-span-1">
                    <AtomicTimeline />
                    <TodayBattlePlan />
                  </motion.div>

                  <motion.div variants={fadeSlide} className="space-y-4 lg:col-span-1">
                    <PreparedForYou />
                    <ResourcesCard />
                    <MemoryInsights />
                    <PivotButton />
                  </motion.div>
                </motion.div>

                <motion.footer
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-8 flex items-center justify-between border-t border-[#27272a] py-4 text-[10px] text-zinc-600"
                >
                  <span>LMLS — The Last-Minute Life Saver</span>
                  <span>Reduce panic. Remove friction. Ship.</span>
                </motion.footer>
              </main>

              <AIChatPanel />
              <PlanReviewDialog />
              <Toast />
            </motion.div>
          </DashboardShell>
        )}
      </AnimatePresence>
    </>
  );
}
