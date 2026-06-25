interface ProgressBarProps {
  value: number
  className?: string
  animated?: boolean
}

export default function ProgressBar({ value, className = '', animated = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 ${
          animated ? 'transition-all duration-500 ease-out' : ''
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
