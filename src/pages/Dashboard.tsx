import { useState, useEffect, useMemo } from 'react'
import allSections from '../data/dsa'
import roadmapTechs from '../data/roadmap'
import { useDSAStore } from '../store/dsaStore'
import { useRoadmapStore } from '../store/roadmapStore'
import ProgressBar from '../components/ProgressBar'

const quotes = [
  "Code is like humor. When you have to explain it, it's bad. – Cory House",
  'First, solve the problem. Then, write the code. – John Johnson',
  "Experience is the name everyone gives to their mistakes. – Oscar Wilde",
  'In order to be irreplaceable, one must always be different. – Coco Chanel',
  'Java is to JavaScript what car is to carpet. – Chris Heilmann',
  'The best way to predict the future is to invent it. – Alan Kay',
  'Simplicity is the soul of efficiency. – Austin Freeman',
  'Make it work, make it right, make it fast. – Kent Beck',
  'Programming is the art of telling another human what one wants the computer to do. – Donald Knuth',
  'Any fool can write code that a computer can understand. Good programmers write code that humans can understand. – Martin Fowler',
  'Premature optimization is the root of all evil. – Donald Knuth',
  'The only way to learn a new programming language is by writing programs in it. – Dennis Ritchie',
  'Talk is cheap. Show me the code. – Linus Torvalds',
  'Programs must be written for people to read, and only incidentally for machines to execute. – Harold Abelson',
  'Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live. – John Woods',
  'Debugging is twice as hard as writing the code in the first place. – Brian Kernighan',
  'The function of good software is to make the complex appear to be simple. – Grady Booch',
  'Without requirements or design, programming is the art of adding bugs to an empty text file. – Louis Srygley',
  'Walking on water and developing software from a specification are easy if both are frozen. – Edward V. Berard',
  'It works on my machine. – Every developer ever',
]

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function getDaysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getDefaultCountdown(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
}

export default function Dashboard() {
  const { getSectionStats } = useDSAStore()
  const { getProgress } = useRoadmapStore()

  const [quoteIndex, setQuoteIndex] = useState(0)
  const [countdownDate, setCountdownDate] = useState(() => {
    return localStorage.getItem('placement-os-countdown') || getDefaultCountdown()
  })

  useEffect(() => {
    localStorage.setItem('placement-os-countdown', countdownDate)
  }, [countdownDate])

  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * quotes.length))
  }, [])

  const greeting = getGreeting()

  const dsaStats = useMemo(() => {
    let totalSolved = 0, totalProblems = 0
    let easy = 0, medium = 0, hard = 0
    let easySolved = 0, mediumSolved = 0, hardSolved = 0
    for (const section of allSections) {
      const stats = getSectionStats(section.id)
      totalSolved += stats.solved
      totalProblems += stats.total
      easy += stats.easy
      medium += stats.medium
      hard += stats.hard
      easySolved += stats.easySolved
      mediumSolved += stats.mediumSolved
      hardSolved += stats.hardSolved
    }
    return { totalSolved, totalProblems, easy, medium, hard, easySolved, mediumSolved, hardSolved }
  }, [getSectionStats])

  const roadmapStats = useMemo(() => {
    const nonCheckpoints = roadmapTechs.filter((t) => !t.isCheckpoint)
    const completed = nonCheckpoints.filter((t) => getProgress(t.id).status === 'completed').length
    return { completed, total: nonCheckpoints.length }
  }, [getProgress])

  const daysLeft = getDaysUntil(countdownDate)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-8 lg:col-span-2">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-gray-100">
            {greeting}, Placement Seeker
          </h1>
          <p className="text-sm text-stone-500 dark:text-gray-400 mt-2 italic">
            &ldquo;{quotes[quoteIndex]}&rdquo;
          </p>
        </div>

        <div className="glass rounded-2xl p-8 lg:col-span-1">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-gray-100">
            Placement Countdown
          </h2>
          <p className="text-3xl font-bold text-indigo-500 mt-2">
            {daysLeft}{' '}
            <span className="text-base font-normal text-stone-400">days</span>
          </p>
          <p className="text-xs text-stone-400 mt-1">until Placement Season</p>
          <input
            type="date"
            value={countdownDate}
            onChange={(e) => setCountdownDate(e.target.value)}
            className="mt-3 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-stone-200 dark:border-gray-700 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-gray-100">
            DSA Progress
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {dsaStats.totalSolved}/{dsaStats.totalProblems} problems solved
          </p>
          <ProgressBar
            value={dsaStats.totalProblems > 0 ? (dsaStats.totalSolved / dsaStats.totalProblems) * 100 : 0}
            className="mt-3"
          />
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-green-500">
              E {dsaStats.easySolved}/{dsaStats.easy}
            </span>
            <span className="text-yellow-500">
              M {dsaStats.mediumSolved}/{dsaStats.medium}
            </span>
            <span className="text-red-500">
              H {dsaStats.hardSolved}/{dsaStats.hard}
            </span>
          </div>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-gray-100">
            Roadmap Progress
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {roadmapStats.completed}/{roadmapStats.total} technologies completed
          </p>
          <ProgressBar
            value={roadmapStats.total > 0 ? (roadmapStats.completed / roadmapStats.total) * 100 : 0}
            className="mt-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          "Today's Progress",
          'Weekly Goal',
          'Monthly Goal',
          'XP / Level',
          'Total Study Hours',
        ].map((title, index) => (
          <div
            key={title}
            style={{ animationDelay: `${index * 40}ms` }}
            className="glass rounded-2xl p-8 opacity-60 grayscale animate-fade-in-up"
          >
            <h3 className="text-sm font-medium text-stone-500 dark:text-gray-400">
              {title}
            </h3>
            <p className="text-xs text-stone-400 mt-4">Coming Soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
