export const GROUP_TITLES = ['Know the game', 'Read the cards', 'Make the play'] as const

export type GroupTitle = (typeof GROUP_TITLES)[number]

export const RUN_QUIZ_IDS = [
  'who-wins',
  'name-the-hand',
  'rules-quiz',
  'open-or-fold',
  'best-possible-hand',
  'outs-and-odds',
  'read-the-player',
] as const

export type RunQuizId = (typeof RUN_QUIZ_IDS)[number]

export type QuizId = RunQuizId | 'rankings'
