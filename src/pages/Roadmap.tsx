import roadmapTechs from '../data/roadmap'
import { useRoadmapStore } from '../store/roadmapStore'
import TechCard from '../components/TechCard'

export default function Roadmap() {
  const {
    techProgress, getProgress, updateStatus, updateHours, updateNotes,
    markComplete, updateConfidence, updateEstimatedHours,
  } = useRoadmapStore()

  const nonCheckpoints = roadmapTechs.filter((t) => !t.isCheckpoint)
  const completed = nonCheckpoints.filter((t) => getProgress(t.id).status === 'completed').length
  const learning = nonCheckpoints.filter((t) => getProgress(t.id).status === 'learning').length

  const isTechUnlocked = (tech: typeof roadmapTechs[0]) => {
    if (tech.prerequisites.length === 0) return true
    return tech.prerequisites.every((preqId) => {
      const preq = roadmapTechs.find((t) => t.id === preqId)
      return preq && getProgress(preq.id).status === 'completed'
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Full Stack Roadmap</h1>
        <p className="text-sm text-gray-400 mt-1">
          {completed}/{nonCheckpoints.length} completed • {learning} in progress
        </p>
      </div>

      <div className="relative space-y-3 animate-fade-in-up">
        {roadmapTechs.map((tech, index) => {
          const unlocked = isTechUnlocked(tech)
          const progress = getProgress(tech.id)

          return (
            <div key={tech.id} className="relative" style={{ animationDelay: `${index * 30}ms` }}>
              {index < roadmapTechs.length - 1 && (
                <div className="absolute left-5 top-14 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
              )}
              <TechCard
                tech={tech}
                progress={progress}
                onUpdateStatus={(status) => updateStatus(tech.id, status)}
                onUpdateHours={(hours) => updateHours(tech.id, hours)}
                onUpdateNotes={(notes) => updateNotes(tech.id, notes)}
                onToggleComplete={() => {
                  if (progress.status === 'completed') {
                    updateStatus(tech.id, 'learning')
                  } else {
                    markComplete(tech.id)
                  }
                }}
                onUpdateConfidence={(conf) => updateConfidence(tech.id, conf)}
                onUpdateEstimatedHours={(hours) => updateEstimatedHours(tech.id, hours)}
              />
              {!unlocked && !tech.isCheckpoint && (
                <div className="absolute inset-0 bg-white/40 dark:bg-gray-900/40 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                  <span className="text-xs text-gray-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow">
                    Complete prerequisites first
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
