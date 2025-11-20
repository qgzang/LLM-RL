import { TrainingStep } from './types';

export const STEPS_ORDER = [
  TrainingStep.INPUT,
  TrainingStep.FORWARD_REF,
  TrainingStep.FORWARD_POLICY,
  TrainingStep.REWARD_CALC,
  TrainingStep.LOSS_CALC,
  TrainingStep.BACKWARD,
  TrainingStep.UPDATE
];

export const DEFAULT_BETA = 0.1;
export const DEFAULT_LR = 1e-5;

// Mock initial data in case API fails or for first load
export const INITIAL_EXAMPLE = {
  id: 'init-1',
  topic: 'Coding',
  prompt: 'Write a Python function to reverse a string.',
  chosen: 'def reverse_string(s):\n    return s[::-1]',
  rejected: 'def reverse_string(s):\n    return s.reverse()'
};
