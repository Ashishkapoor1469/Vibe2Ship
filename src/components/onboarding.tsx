'use client';

import { useState } from 'react';
import { useLMLSStore } from '@/lib/store';
import { EnergyProfile } from '@/lib/engine/types';

const energyOptions: { value: EnergyProfile; label: string; desc: string }[] = [
  { value: 'morning-lark', label: 'Morning Lark', desc: 'Peak energy: 6 AM – 12 PM' },
  { value: 'afternoon-bear', label: 'Afternoon Bear', desc: 'Peak energy: 10 AM – 2 PM' },
  { value: 'night-owl', label: 'Night Owl', desc: 'Peak energy: 8 PM – Midnight' },
];

const commonFrictions = ['2pm', '3pm', '4pm', '5pm', '10am', '11am'];

export function Onboarding() {
  const setProfile = useLMLSStore((s) => s.setProfile);
  const onboardingComplete = useLMLSStore((s) => s.onboardingComplete);

  const [energy, setEnergy] = useState<EnergyProfile | null>(null);
  const [frictions, setFrictions] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState('6');
  const [deepWorkPref, setDeepWorkPref] = useState<'morning' | 'afternoon' | 'night' | 'any'>('morning');

  if (onboardingComplete) return null;

  const toggleFriction = (t: string) => {
    setFrictions((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );
  };

  const handleSave = () => {
    if (!energy) return;
    setProfile({
      energyProfile: energy,
      frictionTimes: frictions,
      availableHoursToday: parseInt(availableHours) || 6,
      deepWorkPreference: deepWorkPref,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            🚨 LMLS Setup
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Tell me about your energy so I can schedule smart.
          </p>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase text-zinc-500">
            When are you most productive?
          </label>
          <div className="space-y-2">
            {energyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEnergy(opt.value)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  energy === opt.value
                    ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950'
                    : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                }`}
              >
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {opt.label}
                </div>
                <div className="text-xs text-zinc-500">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-xs font-semibold uppercase text-zinc-500">
            Times when you usually hit a wall
          </label>
          <div className="flex flex-wrap gap-1.5">
            {commonFrictions.map((t) => (
              <button
                key={t}
                onClick={() => toggleFriction(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  frictions.includes(t)
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-zinc-500">
              Hours available today
            </label>
            <input
              type="number"
              min="1"
              max="16"
              value={availableHours}
              onChange={(e) => setAvailableHours(e.target.value)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase text-zinc-500">
              Deep work preference
            </label>
            <select
              value={deepWorkPref}
              onChange={(e) => setDeepWorkPref(e.target.value as typeof deepWorkPref)}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="night">Night</option>
              <option value="any">Any time</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!energy}
          className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {energy ? 'Ready — Start Saving My Time' : 'Select your energy type first'}
        </button>
      </div>
    </div>
  );
}
