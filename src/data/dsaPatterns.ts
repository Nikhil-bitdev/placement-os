export interface PatternQuestion {
  id: string
  title: string
  pattern: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  leetcodeUrl: string
}

export interface Pattern {
  name: string
  icon: string
  questions: PatternQuestion[]
}

export const patterns: Pattern[] = [
  {
    name: 'Sliding Window',
    icon: '🪟',
    questions: [
      { id: 'max-avg-subarray', title: 'Maximum Average Subarray I', pattern: 'Sliding Window', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/maximum-average-subarray-i/' },
      { id: 'best-time-stock', title: 'Best Time to Buy and Sell Stock', pattern: 'Sliding Window', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { id: 'longest-substr-no-repeat', title: 'Longest Substring Without Repeating Characters', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { id: 'longest-repeating-replacement', title: 'Longest Repeating Character Replacement', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { id: 'permutation-in-string', title: 'Permutation in String', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutation-in-string/' },
      { id: 'min-size-subarray-sum', title: 'Minimum Size Subarray Sum', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-size-subarray-sum/' },
      { id: 'fruit-into-baskets', title: 'Fruit Into Baskets', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/fruit-into-baskets/' },
      { id: 'find-anagrams', title: 'Find All Anagrams in a String', pattern: 'Sliding Window', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-all-anagrams-in-a-string/' },
      { id: 'min-window-substring', title: 'Minimum Window Substring', pattern: 'Sliding Window', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/minimum-window-substring/' },
      { id: 'sliding-window-max', title: 'Sliding Window Maximum', pattern: 'Sliding Window', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sliding-window-maximum/' },
      { id: 'substring-concatenation', title: 'Substring with Concatenation of All Words', pattern: 'Sliding Window', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/substring-with-concatenation-of-all-words/' },
    ],
  },
  {
    name: 'Two Pointers',
    icon: '👆',
    questions: [
      { id: 'valid-palindrome', title: 'Valid Palindrome', pattern: 'Two Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/' },
      { id: 'merge-sorted-array', title: 'Merge Sorted Array', pattern: 'Two Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/merge-sorted-array/' },
      { id: 'move-zeroes', title: 'Move Zeroes', pattern: 'Two Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/move-zeroes/' },
      { id: 'two-sum-ii', title: 'Two Sum II — Input Array Is Sorted', pattern: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { id: '3sum', title: '3Sum', pattern: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/3sum/' },
      { id: 'container-water', title: 'Container With Most Water', pattern: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/' },
      { id: 'sort-colors', title: 'Sort Colors', pattern: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sort-colors/' },
      { id: 'remove-duplicates-sorted-ii', title: 'Remove Duplicates from Sorted Array II', pattern: 'Two Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/' },
      { id: 'trapping-rain-water', title: 'Trapping Rain Water', pattern: 'Two Pointers', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/trapping-rain-water/' },
      { id: '4sum', title: '4Sum', pattern: 'Two Pointers', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/4sum/' },
    ],
  },
  {
    name: 'Fast & Slow Pointers',
    icon: '🐇',
    questions: [
      { id: 'linked-list-cycle', title: 'Linked List Cycle', pattern: 'Fast & Slow Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle/' },
      { id: 'middle-linked-list', title: 'Middle of the Linked List', pattern: 'Fast & Slow Pointers', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/middle-of-the-linked-list/' },
      { id: 'linked-list-cycle-ii', title: 'Linked List Cycle II', pattern: 'Fast & Slow Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/linked-list-cycle-ii/' },
      { id: 'happy-number', title: 'Happy Number', pattern: 'Fast & Slow Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/happy-number/' },
      { id: 'find-duplicate-number', title: 'Find the Duplicate Number', pattern: 'Fast & Slow Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-the-duplicate-number/' },
      { id: 'palindrome-linked-list', title: 'Palindrome Linked List', pattern: 'Fast & Slow Pointers', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-linked-list/' },
    ],
  },
  {
    name: 'Prefix Sum',
    icon: '📊',
    questions: [
      { id: 'running-sum-1d', title: 'Running Sum of 1D Array', pattern: 'Prefix Sum', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/running-sum-of-1d-array/' },
      { id: 'range-sum-query', title: 'Range Sum Query — Immutable', pattern: 'Prefix Sum', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/range-sum-query-immutable/' },
      { id: 'subarray-sum-equals-k', title: 'Subarray Sum Equals K', pattern: 'Prefix Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/' },
      { id: 'find-pivot-index', title: 'Find Pivot Index', pattern: 'Prefix Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-pivot-index/' },
      { id: 'continuous-subarray-sum', title: 'Continuous Subarray Sum', pattern: 'Prefix Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/continuous-subarray-sum/' },
      { id: 'product-except-self', title: 'Product of Array Except Self', pattern: 'Prefix Sum', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { id: 'count-range-sum', title: 'Count of Range Sum', pattern: 'Prefix Sum', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/count-of-range-sum/' },
    ],
  },
  {
    name: 'Binary Search',
    icon: '🔍',
    questions: [
      { id: 'binary-search', title: 'Binary Search', pattern: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/binary-search/' },
      { id: 'first-bad-version', title: 'First Bad Version', pattern: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/first-bad-version/' },
      { id: 'search-insert-pos', title: 'Search Insert Position', pattern: 'Binary Search', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/search-insert-position/' },
      { id: 'search-rotated-array', title: 'Search in Rotated Sorted Array', pattern: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
      { id: 'find-min-rotated', title: 'Find Minimum in Rotated Sorted Array', pattern: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      { id: 'search-2d-matrix', title: 'Search a 2D Matrix', pattern: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { id: 'koko-bananas', title: 'Koko Eating Bananas', pattern: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/koko-eating-bananas/' },
      { id: 'time-key-value', title: 'Time Based Key-Value Store', pattern: 'Binary Search', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/time-based-key-value-store/' },
      { id: 'median-two-arrays', title: 'Median of Two Sorted Arrays', pattern: 'Binary Search', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
      { id: 'find-mountain', title: 'Find in Mountain Array', pattern: 'Binary Search', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/find-in-mountain-array/' },
      { id: 'split-array-largest', title: 'Split Array Largest Sum', pattern: 'Binary Search', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/split-array-largest-sum/' },
    ],
  },
  {
    name: 'Stack',
    icon: '📚',
    questions: [
      { id: 'valid-parentheses', title: 'Valid Parentheses', pattern: 'Stack', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/' },
      { id: 'min-stack', title: 'Min Stack', pattern: 'Stack', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/min-stack/' },
      { id: 'daily-temperatures', title: 'Daily Temperatures', pattern: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/daily-temperatures/' },
      { id: 'next-greater-element-i', title: 'Next Greater Element I', pattern: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/next-greater-element-i/' },
      { id: 'next-greater-element-ii', title: 'Next Greater Element II', pattern: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/next-greater-element-ii/' },
      { id: 'evaluate-rpn', title: 'Evaluate Reverse Polish Notation', pattern: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
      { id: 'asteroid-collision', title: 'Asteroid Collision', pattern: 'Stack', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/asteroid-collision/' },
      { id: 'largest-rectangle-histogram', title: 'Largest Rectangle in Histogram', pattern: 'Stack', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
      { id: 'remove-k-digits', title: 'Remove K Digits', pattern: 'Stack', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/remove-k-digits/' },
    ],
  },
  {
    name: 'Linked List Reversal',
    icon: '🔗',
    questions: [
      { id: 'reverse-linked-list', title: 'Reverse Linked List', pattern: 'Linked List Reversal', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/' },
      { id: 'reverse-linked-list-ii', title: 'Reverse Linked List II', pattern: 'Linked List Reversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list-ii/' },
      { id: 'reverse-nodes-kgroup', title: 'Reverse Nodes in k-Group', pattern: 'Linked List Reversal', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
      { id: 'reorder-list', title: 'Reorder List', pattern: 'Linked List Reversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/reorder-list/' },
      { id: 'swap-nodes-pairs', title: 'Swap Nodes in Pairs', pattern: 'Linked List Reversal', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/swap-nodes-in-pairs/' },
    ],
  },
  {
    name: 'Trees — DFS',
    icon: '🌳',
    questions: [
      { id: 'max-depth-binary-tree', title: 'Maximum Depth of Binary Tree', pattern: 'Trees — DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { id: 'same-tree', title: 'Same Tree', pattern: 'Trees — DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/same-tree/' },
      { id: 'path-sum', title: 'Path Sum', pattern: 'Trees — DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/path-sum/' },
      { id: 'symmetric-tree', title: 'Symmetric Tree', pattern: 'Trees — DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/symmetric-tree/' },
      { id: 'invert-binary-tree', title: 'Invert Binary Tree', pattern: 'Trees — DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/' },
      { id: 'binary-tree-level-order', title: 'Binary Tree Level Order Traversal', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
      { id: 'binary-tree-right-side', title: 'Binary Tree Right Side View', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
      { id: 'construct-tree-preorder-inorder', title: 'Construct Binary Tree from Preorder and Inorder', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
      { id: 'lca-bst', title: 'Lowest Common Ancestor of a BST', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
      { id: 'validate-bst', title: 'Validate BST', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/' },
      { id: 'kth-smallest-bst', title: 'Kth Smallest Element in a BST', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
      { id: 'diameter-binary-tree', title: 'Diameter of Binary Tree', pattern: 'Trees — DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
      { id: 'binary-tree-max-path-sum', title: 'Binary Tree Maximum Path Sum', pattern: 'Trees — DFS', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
      { id: 'serialize-deserialize-tree', title: 'Serialize and Deserialize Binary Tree', pattern: 'Trees — DFS', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
    ],
  },
  {
    name: 'Trees — BFS',
    icon: '🌲',
    questions: [
      { id: 'avg-levels-binary-tree', title: 'Average of Levels in Binary Tree', pattern: 'Trees — BFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/average-of-levels-in-binary-tree/' },
      { id: 'binary-tree-zigzag', title: 'Binary Tree Zigzag Level Order Traversal', pattern: 'Trees — BFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/' },
      { id: 'populating-next-right', title: 'Populating Next Right Pointers in Each Node', pattern: 'Trees — BFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/populating-next-right-pointers-in-each-node/' },
      { id: 'largest-value-row', title: 'Find Largest Value in Each Tree Row', pattern: 'Trees — BFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/find-largest-value-in-each-tree-row/' },
    ],
  },
  {
    name: 'Heap',
    icon: '⛏️',
    questions: [
      { id: 'kth-largest-stream', title: 'Kth Largest Element in a Stream', pattern: 'Heap', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
      { id: 'kth-largest-array', title: 'Kth Largest Element in an Array', pattern: 'Heap', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
      { id: 'top-k-frequent', title: 'Top K Frequent Elements', pattern: 'Heap', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { id: 'k-closest-points', title: 'K Closest Points to Origin', pattern: 'Heap', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
      { id: 'task-scheduler', title: 'Task Scheduler', pattern: 'Heap', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/task-scheduler/' },
      { id: 'median-data-stream', title: 'Find Median from Data Stream', pattern: 'Heap', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/find-median-from-data-stream/' },
      { id: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', pattern: 'Heap', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
    ],
  },
  {
    name: 'Intervals',
    icon: '📅',
    questions: [
      { id: 'merge-intervals', title: 'Merge Intervals', pattern: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/merge-intervals/' },
      { id: 'insert-interval', title: 'Insert Interval', pattern: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/insert-interval/' },
      { id: 'non-overlapping-intervals', title: 'Non-Overlapping Intervals', pattern: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/non-overlapping-intervals/' },
      { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', pattern: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/meeting-rooms-ii/' },
      { id: 'min-arrows-burst', title: 'Minimum Number of Arrows to Burst Balloons', pattern: 'Intervals', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/' },
      { id: 'employee-free-time', title: 'Employee Free Time', pattern: 'Intervals', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/employee-free-time/' },
    ],
  },
  {
    name: 'Backtracking',
    icon: '🔄',
    questions: [
      { id: 'subsets', title: 'Subsets', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets/' },
      { id: 'subsets-ii', title: 'Subsets II', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/subsets-ii/' },
      { id: 'permutations', title: 'Permutations', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations/' },
      { id: 'permutations-ii', title: 'Permutations II', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/permutations-ii/' },
      { id: 'combination-sum', title: 'Combination Sum', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum/' },
      { id: 'combination-sum-ii', title: 'Combination Sum II', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/combination-sum-ii/' },
      { id: 'letter-combinations-phone', title: 'Letter Combinations of a Phone Number', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
      { id: 'palindrome-partitioning', title: 'Palindrome Partitioning', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/palindrome-partitioning/' },
      { id: 'word-search', title: 'Word Search', pattern: 'Backtracking', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-search/' },
      { id: 'n-queens', title: 'N-Queens', pattern: 'Backtracking', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/n-queens/' },
      { id: 'sudoku-solver', title: 'Sudoku Solver', pattern: 'Backtracking', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/sudoku-solver/' },
    ],
  },
  {
    name: 'Graph — BFS/DFS',
    icon: '🕸️',
    questions: [
      { id: 'number-islands', title: 'Number of Islands', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/' },
      { id: 'max-area-island', title: 'Max Area of Island', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/max-area-of-island/' },
      { id: 'flood-fill', title: 'Flood Fill', pattern: 'Graph — BFS/DFS', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/flood-fill/' },
      { id: 'rotting-oranges', title: 'Rotting Oranges', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/rotting-oranges/' },
      { id: 'pacific-atlantic', title: 'Pacific Atlantic Water Flow', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
      { id: 'clone-graph', title: 'Clone Graph', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/clone-graph/' },
      { id: 'number-provinces', title: 'Number of Provinces', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-provinces/' },
      { id: 'surrounded-regions', title: 'Surrounded Regions', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/surrounded-regions/' },
      { id: 'word-ladder', title: 'Word Ladder', pattern: 'Graph — BFS/DFS', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-ladder/' },
      { id: 'shortest-path-binary', title: 'Shortest Path in Binary Matrix', pattern: 'Graph — BFS/DFS', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/' },
    ],
  },
  {
    name: 'Topological Sort',
    icon: '📋',
    questions: [
      { id: 'course-schedule', title: 'Course Schedule', pattern: 'Topological Sort', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule/' },
      { id: 'course-schedule-ii', title: 'Course Schedule II', pattern: 'Topological Sort', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/course-schedule-ii/' },
      { id: 'alien-dictionary', title: 'Alien Dictionary', pattern: 'Topological Sort', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/alien-dictionary/' },
      { id: 'sequence-reconstruction', title: 'Sequence Reconstruction', pattern: 'Topological Sort', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sequence-reconstruction/' },
    ],
  },
  {
    name: 'Union-Find',
    icon: '🔌',
    questions: [
      { id: 'num-connections', title: 'Number of Connected Components in an Undirected Graph', pattern: 'Union-Find', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
      { id: 'graph-valid-tree', title: 'Graph Valid Tree', pattern: 'Union-Find', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/graph-valid-tree/' },
      { id: 'redundant-connection', title: 'Redundant Connection', pattern: 'Union-Find', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/redundant-connection/' },
      { id: 'accounts-merge', title: 'Accounts Merge', pattern: 'Union-Find', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/accounts-merge/' },
      { id: 'smallest-swap', title: 'Smallest String With Swaps', pattern: 'Union-Find', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/smallest-string-with-swaps/' },
    ],
  },
  {
    name: 'Dynamic Programming — 1D',
    icon: '📈',
    questions: [
      { id: 'climbing-stairs', title: 'Climbing Stairs', pattern: 'Dynamic Programming — 1D', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/' },
      { id: 'house-robber', title: 'House Robber', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber/' },
      { id: 'fibonacci-number', title: 'Fibonacci Number', pattern: 'Dynamic Programming — 1D', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/fibonacci-number/' },
      { id: 'house-robber-ii', title: 'House Robber II', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/house-robber-ii/' },
      { id: 'lis', title: 'Longest Increasing Subsequence', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { id: 'coin-change', title: 'Coin Change', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change/' },
      { id: 'word-break', title: 'Word Break', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/word-break/' },
      { id: 'decode-ways', title: 'Decode Ways', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/decode-ways/' },
      { id: 'jump-game', title: 'Jump Game', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
      { id: 'jump-game-ii', title: 'Jump Game II', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game-ii/' },
      { id: 'max-product-subarray', title: 'Maximum Product Subarray', pattern: 'Dynamic Programming — 1D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-product-subarray/' },
    ],
  },
  {
    name: 'Dynamic Programming — 2D',
    icon: '📉',
    questions: [
      { id: 'unique-paths', title: 'Unique Paths', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/unique-paths/' },
      { id: 'min-path-sum', title: 'Minimum Path Sum', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/minimum-path-sum/' },
      { id: 'lcs', title: 'Longest Common Subsequence', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/longest-common-subsequence/' },
      { id: 'edit-distance', title: 'Edit Distance', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/edit-distance/' },
      { id: 'coin-change-ii', title: 'Coin Change II', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/coin-change-ii/' },
      { id: 'target-sum', title: 'Target Sum', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/target-sum/' },
      { id: 'partition-equal-subset', title: 'Partition Equal Subset Sum', pattern: 'Dynamic Programming — 2D', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
      { id: 'regex-matching', title: 'Regular Expression Matching', pattern: 'Dynamic Programming — 2D', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/regular-expression-matching/' },
      { id: 'burst-balloons', title: 'Burst Balloons', pattern: 'Dynamic Programming — 2D', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/burst-balloons/' },
    ],
  },
  {
    name: 'Greedy',
    icon: '💰',
    questions: [
      { id: 'jump-game-greedy', title: 'Jump Game', pattern: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/jump-game/' },
      { id: 'gas-station', title: 'Gas Station', pattern: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/gas-station/' },
      { id: 'hand-straights', title: 'Hand of Straights', pattern: 'Greedy', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/hand-of-straights/' },
      { id: 'candy', title: 'Candy', pattern: 'Greedy', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/candy/' },
    ],
  },
  {
    name: 'Trie',
    icon: '🌲',
    questions: [
      { id: 'implement-trie', title: 'Implement Trie (Prefix Tree)', pattern: 'Trie', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
      { id: 'design-add-search', title: 'Design Add and Search Words Data Structure', pattern: 'Trie', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
      { id: 'word-search-ii', title: 'Word Search II', pattern: 'Trie', difficulty: 'Hard', leetcodeUrl: 'https://leetcode.com/problems/word-search-ii/' },
      { id: 'replace-words', title: 'Replace Words', pattern: 'Trie', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/replace-words/' },
    ],
  },
  {
    name: 'Bit Manipulation',
    icon: '🔢',
    questions: [
      { id: 'single-number', title: 'Single Number', pattern: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/single-number/' },
      { id: 'number-1-bits', title: 'Number of 1 Bits', pattern: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/number-of-1-bits/' },
      { id: 'counting-bits', title: 'Counting Bits', pattern: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/counting-bits/' },
      { id: 'reverse-bits', title: 'Reverse Bits', pattern: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/reverse-bits/' },
      { id: 'missing-number', title: 'Missing Number', pattern: 'Bit Manipulation', difficulty: 'Easy', leetcodeUrl: 'https://leetcode.com/problems/missing-number/' },
      { id: 'single-number-ii', title: 'Single Number II', pattern: 'Bit Manipulation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/single-number-ii/' },
      { id: 'sum-two-integers', title: 'Sum of Two Integers', pattern: 'Bit Manipulation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/sum-of-two-integers/' },
      { id: 'max-xor', title: 'Maximum XOR of Two Numbers in an Array', pattern: 'Bit Manipulation', difficulty: 'Medium', leetcodeUrl: 'https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/' },
    ],
  },
]

export const allQuestions = patterns.flatMap(p => p.questions)
export const patternNames = patterns.map(p => p.name)
