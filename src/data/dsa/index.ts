import type { DSASection } from '../../types'
import basics from './01-basics'
import sorting from './02-sorting'
import arrays from './03-arrays'
import binarySearch from './04-binary-search'
import strings from './05-strings'
import linkedList from './06-linked-list'
import recursion from './07-recursion'
import bitManipulation from './08-bit-manipulation'
import stackQueue from './09-stack-queue'
import slidingWindow from './10-sliding-window'
import heap from './11-heap'
import greedy from './12-greedy'
import binaryTrees from './13-binary-trees'
import bst from './14-bst'
import graphs from './15-graphs'
import dp from './16-dp'
import tries from './17-tries'
import advancedGraphs from './18-advanced-graphs'
import segmentTrees from './19-segment-trees'
import dsu from './20-dsu'
import lca from './21-lca'
import advancedDp from './22-advanced-dp'
import interviewProblems from './23-interview'

const allSections: DSASection[] = [
  basics, sorting, arrays, binarySearch, strings, linkedList, recursion,
  bitManipulation, stackQueue, slidingWindow, heap, greedy, binaryTrees, bst,
  graphs, dp, tries, advancedGraphs, segmentTrees, dsu, lca, advancedDp, interviewProblems,
].sort((a, b) => a.order - b.order)

export default allSections
