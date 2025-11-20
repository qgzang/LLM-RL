
export type AlgorithmType = 'PPO' | 'DPO' | 'GRPO' | 'GSPO' | 'GFPO' | 'CISPO';

export interface DPOExample {
  id: string;
  prompt: string;
  chosen: string;
  rejected: string;
  topic: string;
}

export interface GRPOOutput {
  id: string;
  text: string;
  score: number;
}

export interface GRPOExample {
  id: string;
  topic: string;
  prompt: string;
  outputs: GRPOOutput[];
}

export interface GSPOOutput {
  id: string;
  text: string;
  score: number;
}

export interface GSPOExample {
  id: string;
  topic: string;
  prompt: string;
  outputs: GSPOOutput[];
}

export interface GFPOOutput {
  id: string;
  text: string;
  isCorrect: boolean;
  length: number;
}

export interface GFPOExample {
  id: string;
  topic: string;
  prompt: string;
  outputs: GFPOOutput[];
}

export interface PPOExample {
  id: string;
  topic: string;
  prompt: string;
  response: string;
  initialReward: number;
  initialValue: number;
}

export interface CISPOExample {
  id: string;
  topic: string;
  prompt: string;
  response: string;
  behaviorLogProb: number; // The log prob from the old policy (π_old)
}

export enum TrainingStep {
  INPUT = 'Input',
  FORWARD_REF = 'Forward (Ref)',
  FORWARD_POLICY = 'Forward (Policy)',
  REWARD_CALC = 'Reward & Margin',
  LOSS_CALC = 'Loss Calculation',
  BACKWARD = 'Backward Pass',
  UPDATE = 'Weights Update'
}

export enum GRPOStep {
  INPUT = 'Input',
  SAMPLING = 'Sample Group (G)',
  SCORING = 'Reward Scoring',
  STATS = 'Group Stats',
  ADVANTAGE = 'Advantage Calc',
  UPDATE = 'Policy Update'
}

export enum GSPOStep {
  INPUT = 'Input',
  SAMPLING = 'Sample Group',
  SCORING = 'Reward Scoring',
  WEIGHTING = 'Softmax Weights',
  UPDATE = 'Policy Update'
}

export enum GFPOStep {
  INPUT = 'Input',
  SAMPLING = 'Sample Group',
  FILTERING = 'Filter (Correctness)',
  RANKING = 'Rank (Length)',
  UPDATE = 'Update Policy'
}

export enum PPOStep {
  INPUT = 'Input',
  ROLLOUT = 'Rollout (Actor)',
  EVALUATION = 'Eval (Critic/Reward)',
  ADVANTAGE = 'Advantage (GAE)',
  CLIPPING = 'Clip Loss',
  UPDATE = 'Update All'
}

export enum CISPOStep {
  INPUT = 'Input',
  SAMPLING = 'Offline Sampling',
  IS_CALC = 'IS Weight (ρ)',
  CLIPPING = 'Clip Objective',
  UPDATE = 'Policy Update'
}

export interface SimulationState {
  step: TrainingStep;
  beta: number;
  refLogProbChosen: number;
  refLogProbRejected: number;
  policyLogProbChosen: number;
  policyLogProbRejected: number;
  learningRate: number;
}

export interface CalculationResult {
  implicitRewardChosen: number;
  implicitRewardRejected: number;
  margin: number;
  sigmoidResult: number;
  loss: number;
}