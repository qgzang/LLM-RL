export interface DPOExample {
  id: string;
  prompt: string;
  chosen: string;
  rejected: string;
  topic: string;
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
