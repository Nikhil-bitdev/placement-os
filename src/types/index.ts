export interface DSAProblem {
  id: string
  name: string
  difficulty: 'easy' | 'medium' | 'hard'
  platform: 'LeetCode' | 'GFG' | 'CodeStudio' | 'Other'
  solutionUrl: string
  companyTags: string[]
}

export interface DSASection {
  id: string
  title: string
  order: number
  problems: DSAProblem[]
}

export interface DSAProblemProgress {
  solved: boolean
  attempts: number
  favorite: boolean
  revisionStatus: 'new' | 'learning' | 'reviewing' | 'mastered'
  notes: string
  timeTaken: number
  completedAt: string | null
}

export type TechCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'tooling'
export type TechStatus = 'not-started' | 'learning' | 'completed'

export interface RoadmapTechResource {
  officialDocs: string
  bestVideo: string
}

export interface RoadmapTech {
  id: string
  name: string
  category: TechCategory
  order: number
  prerequisites: string[]
  isCheckpoint: boolean
  resources: RoadmapTechResource
}

export interface TechProgress {
  status: TechStatus
  hoursSpent: number
  notes: string
  miniProjects: string[]
  mainProject: string
  revisionCount: number
  confidence: 1 | 2 | 3 | 4 | 5
  completionDate: string | null
  estimatedRemainingHours: number
}

export type SectionStats = {
  total: number
  solved: number
  easy: number
  medium: number
  hard: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
}
