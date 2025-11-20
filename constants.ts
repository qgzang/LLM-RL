
import { TrainingStep, GRPOStep, PPOStep, GFPOStep, CISPOStep, GSPOStep } from './types';

export const STEPS_ORDER = [
  TrainingStep.INPUT,
  TrainingStep.FORWARD_REF,
  TrainingStep.FORWARD_POLICY,
  TrainingStep.REWARD_CALC,
  TrainingStep.LOSS_CALC,
  TrainingStep.BACKWARD,
  TrainingStep.UPDATE
];

export const GRPO_STEPS_ORDER = [
  GRPOStep.INPUT,
  GRPOStep.SAMPLING,
  GRPOStep.SCORING,
  GRPOStep.STATS,
  GRPOStep.ADVANTAGE,
  GRPOStep.UPDATE
];

export const GSPO_STEPS_ORDER = [
  GSPOStep.INPUT,
  GSPOStep.SAMPLING,
  GSPOStep.SCORING,
  GSPOStep.WEIGHTING,
  GSPOStep.UPDATE
];

export const GFPO_STEPS_ORDER = [
  GFPOStep.INPUT,
  GFPOStep.SAMPLING,
  GFPOStep.FILTERING,
  GFPOStep.RANKING,
  GFPOStep.UPDATE
];

export const PPO_STEPS_ORDER = [
  PPOStep.INPUT,
  PPOStep.ROLLOUT,
  PPOStep.EVALUATION,
  PPOStep.ADVANTAGE,
  PPOStep.CLIPPING,
  PPOStep.UPDATE
];

export const CISPO_STEPS_ORDER = [
  CISPOStep.INPUT,
  CISPOStep.SAMPLING,
  CISPOStep.IS_CALC,
  CISPOStep.CLIPPING,
  CISPOStep.UPDATE
];

export const DEFAULT_BETA = 0.1;
export const DEFAULT_LR = 1e-5;

// Paper Citations
export const ALGORITHM_PAPERS = {
  PPO: {
    title: "Proximal Policy Optimization Algorithms",
    authors: "Schulman et al. (OpenAI)",
    year: "2017",
    link: "https://arxiv.org/abs/1707.06347"
  },
  DPO: {
    title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model",
    authors: "Rafailov et al. (Stanford)",
    year: "2023",
    link: "https://arxiv.org/abs/2305.18290"
  },
  GRPO: {
    title: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models",
    authors: "Shao et al. (DeepSeek)",
    year: "2024",
    link: "https://arxiv.org/abs/2402.03300"
  },
  GSPO: {
    title: "Group Sequence Policy Optimization",
    authors: "Xu et al.",
    year: "2024",
    link: "https://arxiv.org/search/?query=Group+Sequence+Policy+Optimization&searchtype=all"
  },
  GFPO: {
    title: "Sample More to Think Less: Group Filtered Policy Optimization for Concise Reasoning",
    authors: "DeepSeek / Research Community",
    year: "2024",
    link: "https://arxiv.org/search/?query=Sample+More+to+Think+Less+Group+Filtered+Policy+Optimization&searchtype=all"
  },
  CISPO: {
    title: "MiniMax-M1: Scaling Test-Time Compute Efficiently with Lightning Attention",
    authors: "MiniMax AI",
    year: "2024",
    link: "https://arxiv.org/search/?query=MiniMax+M1+Scaling+Test-Time+Compute&searchtype=all"
  }
};

// Mock initial data in case API fails or for first load
export const INITIAL_EXAMPLE = {
  id: 'init-1',
  topic: 'Coding',
  prompt: 'Write a Python function to reverse a string.',
  chosen: 'def reverse_string(s):\n    return s[::-1]',
  rejected: 'def reverse_string(s):\n    return s.reverse()'
};

export const INITIAL_GRPO_EXAMPLE = {
  id: 'grpo-1',
  topic: 'Logic',
  prompt: 'If you have a 3 liter jug and a 5 liter jug, how do you measure exactly 4 liters?',
  outputs: [
    { id: 'o1', text: 'Fill the 5L, pour into 3L. 2L left in 5L. Empty 3L. Pour 2L into 3L. Fill 5L, pour 1L into 3L to full. 4L left in 5L.', score: 10 },
    { id: 'o2', text: 'Fill 5L jug completely. Pour out 1 liter roughly. You have 4 liters.', score: 2 },
    { id: 'o3', text: 'Fill the 3L jug. Pour it into the 5L jug. Fill the 3L jug again. Pour until 5L is full. 1L left in 3L. Empty 5L. Pour 1L into 5L. Fill 3L and add to 5L. Total 4L.', score: 9 },
    { id: 'o4', text: 'Just guess until it looks like 4 liters.', score: 1 }
  ]
};

export const INITIAL_GSPO_EXAMPLE = {
  id: 'gspo-1',
  topic: 'Creative Writing',
  prompt: 'Write a haiku about the stars.',
  outputs: [
    { id: 's1', text: 'Diamonds in the dark,\nWatching over sleeping world,\nNight\'s silent guardians.', score: 9 },
    { id: 's2', text: 'Bright lights far away. They look very pretty now. Good night everyone.', score: 3 },
    { id: 's3', text: 'Twinkle twinkle little star,\nHow I wonder what you are,\nUp above the world so high.', score: 5 },
    { id: 's4', text: 'Cosmic dust burns bright,\nAncient light reaches my eyes,\nHistory in sky.', score: 8 }
  ]
};

export const INITIAL_GFPO_EXAMPLE = {
  id: 'gfpo-1',
  topic: 'Math Reasoning',
  prompt: 'Solve for x: 2(x - 3) + 4 = 10',
  outputs: [
    { id: 'g1', text: '2(x-3) = 6 → x-3 = 3 → x = 6', isCorrect: true, length: 12 },
    { id: 'g2', text: 'Expand: 2x - 6 + 4 = 10. 2x - 2 = 10. 2x = 12. x = 6.', isCorrect: true, length: 24 },
    { id: 'g3', text: '2x - 6 + 4 = 10. 2x - 2 = 10. 2x = 8. x = 4.', isCorrect: false, length: 20 },
    { id: 'g4', text: 'The answer is 6.', isCorrect: true, length: 5 },
    { id: 'g5', text: 'First distribute the 2 into the parenthesis to get 2x - 6. Then add 4 to get 2x - 2. Set equal to 10. Add 2 to both sides getting 2x = 12. Divide by 2 getting x = 6.', isCorrect: true, length: 45 }
  ]
};

export const INITIAL_PPO_EXAMPLE = {
  id: 'ppo-1',
  topic: 'Creative Writing',
  prompt: 'Write a haiku about the ocean.',
  response: 'Blue waves crash quietly,\nSand warms my feet on the beach,\nPeace is in the salt.',
  initialReward: 8.2,
  initialValue: 6.5
};

export const INITIAL_CISPO_EXAMPLE = {
  id: 'cispo-1',
  topic: 'General',
  prompt: 'What is the capital of France?',
  response: 'The capital of France is Paris.',
  behaviorLogProb: -0.5
};
