import type { DSASection } from '../../types'

const advancedGraphs: DSASection = {
  id: '18-advanced-graphs',
  title: 'Advanced Graphs',
  order: 18,
  problems: [
    {
      id: 'advanced-graphs-01',
      name: 'Bellman Ford Algorithm',
      difficulty: 'medium',
      platform: 'GFG',
      solutionUrl: 'https://www.geeksforgeeks.org/bellman-ford-algorithm-dp-23/',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
    },
    {
      id: 'advanced-graphs-02',
      name: 'Floyd Warshall Algorithm',
      difficulty: 'medium',
      platform: 'GFG',
      solutionUrl: 'https://www.geeksforgeeks.org/floyd-warshall-algorithm-dp-16/',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
    },
    {
      id: 'advanced-graphs-03',
      name: 'Kosaraju\'s Algorithm (Strongly Connected Components)',
      difficulty: 'medium',
      platform: 'GFG',
      solutionUrl: 'https://www.geeksforgeeks.org/strongly-connected-components/',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
    },
    {
      id: 'advanced-graphs-04',
      name: 'Tarjan\'s Algorithm (Articulation Points)',
      difficulty: 'hard',
      platform: 'GFG',
      solutionUrl: 'https://www.geeksforgeeks.org/articulation-points-or-cut-vertices-in-a-graph/',
      companyTags: ['Amazon', 'Google'],
    },
    {
      id: 'advanced-graphs-05',
      name: 'Bridges in a Graph (Tarjan)',
      difficulty: 'hard',
      platform: 'LeetCode',
      solutionUrl: 'https://leetcode.com/problems/critical-connections-in-a-network/',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
    },
    {
      id: 'advanced-graphs-06',
      name: 'Minimum Spanning Tree (Prim\'s & Kruskal\'s)',
      difficulty: 'medium',
      platform: 'GFG',
      solutionUrl: 'https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/',
      companyTags: ['Amazon', 'Google', 'Microsoft'],
    },
  ],
}

export default advancedGraphs
