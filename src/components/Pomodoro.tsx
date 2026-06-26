import { useState, useEffect, useRef } from 'react'

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [isActive, setIsActive] = useState(false)
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
    <div className="card p-6">
      <h2 className="section-title mb-4">Pomodoro Timer</h2>
      <div className="text-4xl font-bold text-center text-[#0F172A] dark:text-white font-mono">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className="flex gap-3 justify-center mt-4">
        <button
          onClick={toggleTimer}
          className="btn-primary text-sm"
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="btn-secondary text-sm"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
