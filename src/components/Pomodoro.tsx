import { useState, useEffect, useRef } from 'react'

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev > 0) return prev - 1
          setMinutes((m) => (m > 0 ? m - 1 : 0))
          return 59
        })
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isActive])

  useEffect(() => {
    if (minutes === 0 && seconds === 0 && isActive) {
      setIsActive(false)
      alert("Time's up!")
    }
  }, [minutes, seconds, isActive])

  const toggleTimer = () => {
    if (minutes === 0 && seconds === 0) {
      setMinutes(25)
      setSeconds(0)
    }
    setIsActive((a) => !a)
  }

  const resetTimer = () => {
    setIsActive(false)
    setMinutes(25)
    setSeconds(0)
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg flex items-center justify-center text-xl hover:scale-105 transition-transform z-50"
      >
        ⏱
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 glass rounded-2xl p-4 w-56 shadow-xl z-50">
          <div className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={toggleTimer}
              className="px-4 py-1.5 rounded-lg bg-indigo-500 text-white text-sm hover:bg-indigo-600 transition-colors"
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </>
  )
}
