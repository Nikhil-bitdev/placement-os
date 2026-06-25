import type { DSASection } from '../../types'
import basics from './01-basics'

const allSections: DSASection[] = [
  basics,
].sort((a, b) => a.order - b.order)

export default allSections
