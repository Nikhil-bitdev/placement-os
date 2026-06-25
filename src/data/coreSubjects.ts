import type { InterviewQuestion, Topic, CoreSubjectProgress } from '../store/coreSubjectsStore'

export const subjectOrder = ['networks', 'dbms', 'os', 'oops', 'javascript', 'backend', 'system-design', 'devops', 'behavioral'] as const

function q(id: string, question: string, difficulty: 'easy' | 'medium' | 'hard', companies: string[]): InterviewQuestion {
  return { id, question, difficulty, companies, practiced: false, favorited: false, notes: '', revisionStatus: 'new' }
}

function t(id: string, name: string, difficulty: 'easy' | 'medium' | 'hard', freq: 'low' | 'medium' | 'high', time: number,
  questions: InterviewQuestion[] = []): Topic {
  return {
    id, name, status: 'not-started', confidence: 1, revisionCount: 0, estimatedTime: time,
    difficulty, interviewFrequency: freq, notes: '', bookmarked: false,
    interviewQuestions: questions,
  }
}

export const seedSubjects: CoreSubjectProgress[] = [
  {
    id: 'networks', name: 'Computer Networks', icon: '🌐', color: '#3B82F6',
    chaptersCompleted: 0, totalChapters: 8, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 10,
    videoUrl: 'https://www.youtube.com/results?search_query=computer+networks+one+shot+placement',
    topics: [
      t('net-basics', 'Network Types & Topologies', 'easy', 'high', 25),
      t('net-client-server', 'Client-Server & P2P', 'easy', 'medium', 20),
      t('osi-model', 'OSI Model', 'medium', 'high', 35, [
        q('q-osi', 'Explain the 7 layers of the OSI model with examples.', 'medium', ['Amazon', 'Google', 'Microsoft']),
      ]),
      t('tcp-ip-model', 'TCP/IP Model', 'medium', 'high', 30),
      t('http', 'HTTP & HTTPS', 'easy', 'high', 30, [
        q('q-http', 'Explain HTTP request-response cycle with headers.', 'easy', ['Google', 'Meta']),
      ]),
      t('http-methods', 'HTTP Methods & Status Codes', 'easy', 'high', 25),
      t('cookies-sessions', 'Cookies & Sessions', 'easy', 'high', 25, [
        q('q-cookies', 'What is the difference between cookies and sessions?', 'easy', ['Amazon', 'Microsoft']),
      ]),
      t('rest', 'REST & GraphQL', 'medium', 'high', 35, [
        q('q-rest', 'What are RESTful API constraints?', 'medium', ['Google', 'Amazon']),
      ]),
      t('websockets', 'WebSockets', 'medium', 'medium', 25),
      t('dns', 'DNS', 'medium', 'high', 30),
      t('cdn', 'CDN & Proxy', 'medium', 'high', 25),
      t('cors', 'CORS', 'medium', 'medium', 20),
      t('tcp', 'TCP (Three & Four Way Handshake)', 'hard', 'high', 40, [
        q('q-tcp', 'Explain TCP 3-way and 4-way handshake in detail.', 'hard', ['Amazon', 'Google', 'Microsoft', 'Meta']),
      ]),
      t('udp', 'UDP', 'medium', 'medium', 20),
      t('flow-control', 'Flow & Congestion Control', 'hard', 'high', 35),
      t('ipv4', 'IPv4 & IPv6', 'medium', 'medium', 30),
      t('routing', 'Routing Algorithms', 'hard', 'medium', 35),
      t('nat', 'NAT & ICMP', 'medium', 'medium', 20),
      t('arp-switching', 'ARP & Switching', 'medium', 'medium', 25),
      t('tls-ssl', 'TLS & SSL', 'medium', 'high', 30),
      t('firewalls', 'Firewalls & VPN', 'medium', 'medium', 20),
      t('xss-csrf', 'XSS, CSRF & Same-Origin Policy', 'medium', 'high', 30, [
        q('q-xss', 'What is XSS? How do you prevent it?', 'medium', ['Google', 'Atlassian']),
        q('q-csrf', 'Explain CSRF attack and mitigation strategies.', 'medium', ['Amazon', 'Meta']),
      ]),
      t('net-delay', 'Network Delays (Processing, Transmission, Propagation, Queuing)', 'medium', 'medium', 25),
    ],
  },
  {
    id: 'dbms', name: 'Database Management Systems', icon: '🗄', color: '#10B981',
    chaptersCompleted: 0, totalChapters: 8, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 15,
    videoUrl: 'https://www.youtube.com/results?search_query=dbms+one+shot+placement',
    topics: [
      t('db-basics', 'DBMS Basics & Architecture', 'easy', 'high', 25),
      t('er-diagram', 'ER Diagram & Relational Model', 'easy', 'high', 30),
      t('keys', 'Keys & Constraints', 'easy', 'high', 20),
      t('fd', 'Functional Dependency', 'medium', 'medium', 25),
      t('normalization', 'Normalization & BCNF', 'medium', 'high', 35, [
        q('q-norm', 'Explain 1NF, 2NF, 3NF, and BCNF with examples.', 'medium', ['Amazon', 'Google']),
      ]),
      t('transactions', 'Transactions & ACID', 'medium', 'high', 35, [
        q('q-acid', 'Explain ACID properties with a real-world example.', 'medium', ['Google', 'Microsoft', 'Atlassian']),
      ]),
      t('isolation', 'Isolation Levels', 'hard', 'high', 30),
      t('deadlock-db', 'Deadlock & Locks', 'hard', 'medium', 30),
      t('indexing', 'Indexing (Clustered, Non-Clustered, B+ Tree)', 'medium', 'high', 35, [
        q('q-index', 'What is indexing? Explain clustered vs non-clustered.', 'medium', ['Amazon', 'Microsoft']),
      ]),
      t('sql', 'SQL Queries', 'easy', 'high', 40, [
        q('q-sql-join', 'Write SQL for: employees earning more than their managers.', 'medium', ['Amazon', 'Google', 'Meta']),
        q('q-sql-rank', 'Write a query to find the Nth highest salary.', 'medium', ['Microsoft', 'Walmart']),
      ]),
      t('joins', 'Joins', 'medium', 'high', 30),
      t('views', 'Views & Triggers', 'medium', 'medium', 25),
      t('procedures', 'Stored Procedures', 'medium', 'medium', 20),
      t('window-fn', 'Window Functions & CTE', 'hard', 'high', 35),
      t('query-opt', 'Query Optimization', 'hard', 'medium', 30),
      t('mongodb', 'MongoDB Basics', 'easy', 'medium', 25),
      t('cap', 'CAP Theorem', 'medium', 'high', 30, [
        q('q-cap', 'Explain CAP theorem. Can you have all three?', 'medium', ['Amazon', 'Google']),
      ]),
      t('nosql', 'NoSQL vs SQL', 'easy', 'medium', 20),
    ],
  },
  {
    id: 'os', name: 'Operating Systems', icon: '⚙', color: '#F59E0B',
    chaptersCompleted: 0, totalChapters: 8, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 20,
    videoUrl: 'https://www.youtube.com/results?search_query=operating+systems+one+shot+placement',
    topics: [
      t('processes', 'Processes & States', 'easy', 'high', 25, [
        q('q-proc', 'Explain process states with a diagram.', 'easy', ['Google', 'Amazon']),
      ]),
      t('threads', 'Threads & Concurrency', 'medium', 'high', 30),
      t('context-switch', 'Context Switching', 'medium', 'high', 20),
      t('scheduling', 'CPU Scheduling Algorithms', 'medium', 'high', 40, [
        q('q-sched', 'Compare FCFS, SJF, Round Robin, and Priority Scheduling.', 'medium', ['Microsoft', 'Amazon']),
      ]),
      t('sync', 'Synchronization (Mutex, Semaphore)', 'hard', 'high', 40, [
        q('q-mutex', 'What is the difference between mutex and semaphore?', 'medium', ['Google', 'Meta']),
      ]),
      t('pc-problem', 'Producer-Consumer Problem', 'hard', 'high', 35),
      t('rw-problem', 'Readers-Writers Problem', 'hard', 'medium', 30),
      t('dining-phil', 'Dining Philosophers Problem', 'hard', 'medium', 30),
      t('deadlock-os', 'Deadlock & Banker\'s Algorithm', 'hard', 'high', 40, [
        q('q-deadlock', 'What are the four necessary conditions for deadlock?', 'medium', ['Amazon']),
      ]),
      t('paging', 'Paging & Segmentation', 'medium', 'high', 35),
      t('virtual-memory', 'Virtual Memory & Thrashing', 'medium', 'high', 30),
      t('page-replace', 'Page Replacement Algorithms', 'medium', 'medium', 30, [
        q('q-page', 'Explain FIFO, LRU, and Optimal page replacement.', 'medium', ['Microsoft', 'Google']),
      ]),
      t('disk-sched', 'Disk Scheduling', 'medium', 'medium', 25),
      t('file-systems', 'File Systems', 'easy', 'medium', 25),
      t('ipc', 'IPC Mechanisms', 'medium', 'medium', 30),
      t('kernel', 'Kernel & System Calls', 'medium', 'medium', 25),
    ],
  },
  {
    id: 'oops', name: 'OOP Concepts', icon: '🧩', color: '#8B5CF6',
    chaptersCompleted: 0, totalChapters: 6, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 25,
    videoUrl: 'https://www.youtube.com/results?search_query=oops+concepts+one+shot+placement',
    topics: [
      t('classes', 'Classes & Objects', 'easy', 'high', 20),
      t('encapsulation', 'Encapsulation', 'easy', 'high', 20, [
        q('q-encap', 'How does encapsulation differ from abstraction?', 'easy', ['Amazon', 'Google']),
      ]),
      t('abstraction', 'Abstraction', 'easy', 'high', 20),
      t('inheritance', 'Inheritance', 'medium', 'high', 25, [
        q('q-inherit', 'Explain types of inheritance. What is diamond problem?', 'medium', ['Microsoft', 'Meta']),
      ]),
      t('polymorphism', 'Polymorphism (Compile-time & Runtime)', 'medium', 'high', 25),
      t('composition', 'Composition, Aggregation & Association', 'medium', 'medium', 25),
      t('interfaces', 'Interfaces & Abstract Classes', 'medium', 'high', 25),
      t('solid', 'SOLID Principles', 'hard', 'high', 40, [
        q('q-solid', 'Explain each SOLID principle with a code example.', 'hard', ['Amazon', 'Google', 'Microsoft']),
      ]),
      t('design-patterns', 'Design Patterns (Singleton, Factory, Observer)', 'medium', 'high', 35),
      t('exceptions', 'Exception Handling', 'easy', 'medium', 20),
      t('constructors', 'Constructors & Static', 'easy', 'medium', 15),
      t('virtual-fn', 'Virtual Functions & Polymorphism', 'medium', 'medium', 25),
    ],
  },
  {
    id: 'javascript', name: 'JavaScript (Interview)', icon: '🟨', color: '#EAB308',
    chaptersCompleted: 0, totalChapters: 6, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 30,
    videoUrl: 'https://www.youtube.com/results?search_query=javascript+interview+one+shot',
    topics: [
      t('exec-context', 'Execution Context & Call Stack', 'medium', 'high', 30),
      t('event-loop', 'Event Loop (Microtasks & Macrotasks)', 'hard', 'high', 40, [
        q('q-el', 'Explain the JavaScript event loop with a code example.', 'hard', ['Google', 'Meta', 'Amazon']),
      ]),
      t('scope', 'Scope & TDZ', 'medium', 'high', 25),
      t('closures', 'Closures', 'hard', 'high', 35, [
        q('q-closure', 'What is a closure? Give a practical use case.', 'hard', ['Google', 'Amazon', 'Atlassian']),
      ]),
      t('hoisting', 'Hoisting', 'medium', 'high', 25),
      t('this', '"this" Keyword', 'medium', 'high', 30),
      t('prototype', 'Prototype & Prototype Chain', 'medium', 'high', 30),
      t('promises', 'Promises & Async/Await', 'medium', 'high', 35, [
        q('q-promise', 'Explain Promise.all vs Promise.allSettled vs Promise.race.', 'medium', ['Microsoft', 'Meta']),
      ]),
      t('modules', 'Modules (ESM, CommonJS)', 'medium', 'medium', 20),
      t('debounce', 'Debouncing & Throttling', 'medium', 'medium', 25, [
        q('q-debounce', 'Implement a debounce function from scratch.', 'medium', ['Google', 'Amazon']),
      ]),
      t('event-prop', 'Event Bubbling & Capturing', 'medium', 'high', 25),
      t('memory-js', 'Memory Management & Leaks', 'medium', 'medium', 20),
      t('currying', 'Currying & Memoization', 'medium', 'medium', 25),
      t('weakmap', 'WeakMap & WeakSet', 'medium', 'low', 15),
    ],
  },
  {
    id: 'backend', name: 'Backend & Web Concepts', icon: '💻', color: '#06B6D4',
    chaptersCompleted: 0, totalChapters: 5, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 20,
    videoUrl: 'https://www.youtube.com/results?search_query=backend+web+development+one+shot+interview',
    topics: [
      t('rest-api', 'REST API Design', 'medium', 'high', 35, [
        q('q-rest-api', 'Design a RESTful API for a URL shortening service.', 'medium', ['Amazon', 'Google']),
      ]),
      t('jwt', 'JWT & OAuth', 'medium', 'high', 30, [
        q('q-jwt', 'How does JWT authentication work? What are its pros/cons?', 'medium', ['Microsoft', 'Meta']),
      ]),
      t('auth', 'Authentication vs Authorization', 'easy', 'high', 20),
      t('cookies-vs-sessions', 'Cookies vs Sessions vs Tokens', 'medium', 'high', 25),
      t('middleware', 'Middleware', 'medium', 'medium', 20),
      t('validation', 'Input Validation', 'easy', 'medium', 15),
      t('rate-limiting', 'Rate Limiting', 'medium', 'medium', 25),
      t('websockets-backend', 'WebSockets', 'medium', 'medium', 25),
      t('file-upload', 'File Upload', 'easy', 'low', 20),
      t('logging', 'Logging & Error Handling', 'easy', 'medium', 20),
      t('cors-backend', 'CORS', 'medium', 'high', 20),
    ],
  },
  {
    id: 'system-design', name: 'System Design (Beginner)', icon: '🏗', color: '#F43F5E',
    chaptersCompleted: 0, totalChapters: 5, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 5,
    videoUrl: 'https://www.youtube.com/results?search_query=system+design+basics+one+shot+interview',
    topics: [
      t('scalability', 'Scalability (Horizontal vs Vertical)', 'easy', 'high', 30),
      t('load-balancer', 'Load Balancer & Reverse Proxy', 'medium', 'high', 30),
      t('caching', 'Caching (Redis, CDN)', 'medium', 'high', 35, [
        q('q-cache', 'Explain caching strategies: cache-aside, write-through, write-behind.', 'medium', ['Amazon', 'Google']),
      ]),
      t('db-replication', 'Database Replication & Sharding', 'hard', 'high', 40),
      t('message-queue', 'Message Queue (Kafka, RabbitMQ)', 'medium', 'high', 35),
      t('api-gateway', 'API Gateway', 'medium', 'medium', 25),
      t('rate-limit-sd', 'Rate Limiting (Token Bucket, Leaky Bucket)', 'medium', 'medium', 30),
      t('url-shortener', 'Design URL Shortener (tinyurl)', 'hard', 'high', 45, [
        q('q-url', 'Design a URL shortening service like TinyURL.', 'hard', ['Google', 'Amazon']),
      ]),
      t('chat-system', 'Design Chat System', 'hard', 'high', 45),
    ],
  },
  {
    id: 'devops', name: 'DevOps Basics', icon: '☁', color: '#6366F1',
    chaptersCompleted: 0, totalChapters: 4, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 10,
    videoUrl: 'https://www.youtube.com/results?search_query=devops+basics+one+shot+interview',
    topics: [
      t('git', 'Git & GitHub', 'easy', 'high', 25, [
        q('q-git', 'Explain git merge vs rebase. When would you use each?', 'easy', ['Google', 'Microsoft', 'Amazon']),
      ]),
      t('linux', 'Linux Basics (Commands, Permissions, Processes)', 'easy', 'high', 30),
      t('docker', 'Docker (Containers, Images, Dockerfile)', 'medium', 'high', 35),
      t('nginx', 'Nginx (Reverse Proxy, Load Balancing)', 'medium', 'medium', 25),
      t('ci-cd', 'CI/CD Pipelines', 'medium', 'medium', 25),
      t('deployment', 'Deployment Strategies', 'medium', 'medium', 25),
      t('https-devops', 'HTTPS & SSL Certificates', 'easy', 'medium', 20),
      t('env-vars', 'Environment Variables & Configuration', 'easy', 'medium', 15),
    ],
  },
  {
    id: 'behavioral', name: 'HR & Behavioral', icon: '🎤', color: '#EC4899',
    chaptersCompleted: 0, totalChapters: 4, hoursStudied: 0, status: 'not-started', lastStudied: null, interviewReadiness: 50,
    videoUrl: 'https://www.youtube.com/results?search_query=hr+interview+questions+and+answers+placement',
    topics: [
      t('tell-me', 'Tell Me About Yourself', 'easy', 'high', 15),
      t('resume', 'Resume Walkthrough', 'easy', 'high', 15),
      t('projects', 'Projects Discussion', 'easy', 'high', 20),
      t('star', 'STAR Method', 'easy', 'high', 20),
      t('leadership', 'Leadership & Teamwork', 'easy', 'high', 15),
      t('strengths', 'Strengths & Weaknesses', 'easy', 'high', 15),
      t('conflict', 'Conflict Resolution', 'easy', 'medium', 15),
      t('why-company', 'Why This Company?', 'easy', 'high', 15),
    ],
  },
]
