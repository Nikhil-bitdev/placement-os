import { Play, Pause, RotateCcw } from 'lucide-react'
import { usePomodoroStore } from '../store/pomodoroStore'

const TOTAL_SECONDS = 25 * 60

export default function Pomodoro({ compact }: { compact?: boolean }) {
  const secondsLeft = usePomodoroStore(s => s.secondsLeft)
  const isActive = usePomodoroStore(s => s.isActive)
  const sessions = usePomodoroStore(s => s.sessions)
  const toggle = usePomodoroStore(s => s.toggle)
  const reset = usePomodoroStore(s => s.reset)

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const progress = secondsLeft / TOTAL_SECONDS
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - progress)

  return (
    <div className={`card flex flex-col items-center ${compact ? 'p-4' : 'p-5 h-full'}`}>
      <div className="flex items-center gap-2 self-start mb-2">
        <h2 className={compact ? 'text-sm font-semibold text-[#0F172A] dark:text-white' : 'section-title'}>Pomodoro</h2>
        {sessions > 0 && (
          <span className={`text-[#64748B] font-medium ${compact ? 'text-xs' : 'text-xs'}`}>{sessions} session{sessions > 1 ? 's' : ''} completed</span>
        )}
      </div>

      <div className={`relative ${compact ? 'w-40 h-40' : 'w-52 h-52'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" className="dark:stroke-zinc-700/50" strokeWidth="6" />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={progress < 0.25 ? '#EF4444' : progress < 0.5 ? '#F59E0B' : '#2563EB'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-mono text-[#0F172A] dark:text-white tracking-tight ${compact ? 'text-3xl' : 'text-4xl'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
            <span className={`text-[#64748B] ${compact ? 'text-xs' : 'text-xs mt-1'}`}>
            {isActive ? 'Focus' : secondsLeft < TOTAL_SECONDS ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      <div className={`flex gap-2 ${compact ? 'mt-3' : 'mt-5'}`}>
        <button
          onClick={toggle}
          className={`flex items-center gap-1.5 font-medium rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-colors active:scale-[0.97] ${compact ? 'text-xs px-4 py-2' : 'text-sm px-5 py-2'}`}
        >
          {isActive ? <Pause size={compact ? 14 : 16} /> : <Play size={compact ? 14 : 16} />}
          {isActive ? 'Pause' : secondsLeft < TOTAL_SECONDS ? 'Resume' : 'Start'}
        </button>
        <button
          onClick={reset}
          className={`flex items-center gap-1.5 font-medium rounded-xl bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0] dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors active:scale-[0.97] ${compact ? 'text-xs px-3 py-2' : 'text-sm px-4 py-2'}`}
        >
          <RotateCcw size={compact ? 14 : 16} />
          Reset
        </button>
      </div>
    </div>
  )
}
