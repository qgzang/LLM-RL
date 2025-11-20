import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainingStep, DPOExample, SimulationState, CalculationResult } from '../types';
import { Variable, LogProb } from './MathUtils';
import { ArrowRight, Brain, CheckCircle2, XCircle, TrendingDown } from 'lucide-react';
import { STEPS_ORDER } from '../constants';

interface DpoVisualizerProps {
  example: DPOExample;
  simState: SimulationState;
  results: CalculationResult;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

const ModelBox: React.FC<{ type: 'Policy' | 'Reference'; active: boolean; color: string }> = ({ type, active, color }) => (
  <div className={`relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col items-center gap-2 w-40
    ${active ? `${color} bg-opacity-10 bg-white scale-105 shadow-lg shadow-${color.split('-')[1]}-500/20` : 'border-slate-700 bg-slate-800 opacity-50'}`}>
    <Brain className={`w-8 h-8 ${active ? 'animate-pulse' : ''}`} />
    <span className="font-bold text-sm uppercase tracking-wider">{type} Model</span>
    <div className="text-xs opacity-70 font-mono">{type === 'Policy' ? 'π_θ (Trainable)' : 'π_ref (Frozen)'}</div>
  </div>
);

const ResponseCard: React.FC<{ type: 'chosen' | 'rejected'; text: string; active: boolean }> = ({ type, text, active }) => {
  const isChosen = type === 'chosen';
  return (
    <div className={`relative p-4 rounded-xl border transition-all duration-500 w-full md:w-[48%]
      ${active 
        ? (isChosen ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10') 
        : 'border-slate-700 bg-slate-800/50 opacity-40 grayscale'}`}>
      <div className="flex items-center gap-2 mb-2">
        {isChosen ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
        <span className={`font-bold text-xs uppercase ${isChosen ? 'text-green-400' : 'text-red-400'}`}>
          {isChosen ? 'Chosen (y_w)' : 'Rejected (y_l)'}
        </span>
      </div>
      <p className="text-sm font-mono text-slate-300 leading-relaxed line-clamp-3">{text}</p>
    </div>
  );
};

export const DpoVisualizer: React.FC<DpoVisualizerProps> = ({ example, simState, results }) => {
  const stepIndex = STEPS_ORDER.indexOf(simState.step);

  const isRefActive = stepIndex >= STEPS_ORDER.indexOf(TrainingStep.FORWARD_REF);
  const isPolicyActive = stepIndex >= STEPS_ORDER.indexOf(TrainingStep.FORWARD_POLICY);
  const showRewards = stepIndex >= STEPS_ORDER.indexOf(TrainingStep.REWARD_CALC);
  const showLoss = stepIndex >= STEPS_ORDER.indexOf(TrainingStep.LOSS_CALC);
  const isBackward = stepIndex >= STEPS_ORDER.indexOf(TrainingStep.BACKWARD);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 md:p-8 relative overflow-hidden">
      
      {/* Phase 1: Input Data */}
      <div className="flex flex-col gap-4 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <span className="text-indigo-400 font-mono font-bold text-xl">x</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-indigo-300 mb-1 font-bold">Prompt / Input</h3>
            <p className="text-white text-lg">{example.prompt}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-4">
          <ResponseCard type="chosen" text={example.chosen} active={true} />
          <ResponseCard type="rejected" text={example.rejected} active={true} />
        </div>
      </div>

      {/* Phase 2: Models & Processing */}
      <div className="flex justify-center gap-12 my-4 items-stretch min-h-[120px]">
        <ModelBox type="Reference" active={isRefActive} color="border-slate-400 text-slate-200" />
        <ModelBox type="Policy" active={isPolicyActive} color="border-blue-500 text-blue-400" />
      </div>

      {/* Phase 3: Computation Graph */}
      <AnimatePresence mode="wait">
        {showRewards && (
          <motion.div 
            key="math-flow"
            initial="hidden" animate="visible" exit="exit" variants={containerVariants}
            className="bg-slate-900/80 rounded-2xl border border-slate-700 p-6 backdrop-blur-sm"
          >
            {/* Log Probs Row */}
            <div className="grid grid-cols-2 gap-8 mb-8 relative">
               {/* Connecting lines context */}
               <div className="absolute inset-0 flex justify-center pointer-events-none">
                  <div className="w-px bg-slate-800 h-full"></div>
               </div>

               {/* Left: Reference Scores */}
               <div className="flex flex-col gap-2">
                  <h4 className="text-center text-slate-400 text-sm mb-2">Reference Model Scores</h4>
                  <div className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded border border-slate-700">
                    <LogProb model="ref" output="w" />
                    <span className="font-mono">{simState.refLogProbChosen.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded border border-slate-700">
                    <LogProb model="ref" output="l" />
                    <span className="font-mono">{simState.refLogProbRejected.toFixed(2)}</span>
                  </div>
               </div>

               {/* Right: Policy Scores */}
               <div className="flex flex-col gap-2">
                  <h4 className="text-center text-blue-400 text-sm mb-2">Policy Model Scores</h4>
                  <div className={`flex justify-between items-center text-sm p-2 rounded border transition-colors duration-300 ${isBackward ? 'bg-green-900/20 border-green-500/50' : 'bg-slate-800 border-slate-700'}`}>
                    <LogProb model="policy" output="w" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-300">{simState.policyLogProbChosen.toFixed(2)}</span>
                      {isBackward && <TrendingDown className="w-4 h-4 text-green-400 rotate-180" />}
                    </div>
                  </div>
                  <div className={`flex justify-between items-center text-sm p-2 rounded border transition-colors duration-300 ${isBackward ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-800 border-slate-700'}`}>
                    <LogProb model="policy" output="l" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-blue-300">{simState.policyLogProbRejected.toFixed(2)}</span>
                      {isBackward && <TrendingDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
               </div>
            </div>

            {/* Implicit Rewards */}
            <div className="flex justify-center items-center gap-4 mb-6 text-sm font-mono">
                <div className="bg-green-950/40 px-4 py-2 rounded border border-green-900 text-green-200">
                  r<sub>θ</sub>(y<sub>w</sub>) = {results.implicitRewardChosen.toFixed(3)}
                </div>
                <span className="text-slate-500">-</span>
                <div className="bg-red-950/40 px-4 py-2 rounded border border-red-900 text-red-200">
                  r<sub>θ</sub>(y<sub>l</sub>) = {results.implicitRewardRejected.toFixed(3)}
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
                <div className="bg-indigo-950/40 px-4 py-2 rounded border border-indigo-900 text-indigo-200">
                  Margin = {results.margin.toFixed(3)}
                </div>
            </div>

            {/* Loss Calculation */}
            {showLoss && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center pt-4 border-t border-slate-700"
              >
                <div className="flex items-center gap-3 text-xl mb-4">
                  <span className="text-slate-400">L<sub>DPO</sub> = -log σ(</span>
                  <span className="text-indigo-400 font-mono font-bold">{results.margin.toFixed(3)}</span>
                  <span className="text-slate-400">)</span>
                </div>
                
                <div className="flex items-center gap-8">
                   <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col items-center min-w-[120px]">
                      <span className="text-xs uppercase tracking-wider text-slate-400 mb-1">Probability</span>
                      <span className="text-2xl font-mono text-purple-400">{(results.sigmoidResult).toFixed(4)}</span>
                      <span className="text-[10px] text-slate-500">σ(margin)</span>
                   </div>
                   <ArrowRight className="w-6 h-6 text-slate-600" />
                   <div className="bg-slate-800 p-4 rounded-lg border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.1)] flex flex-col items-center min-w-[120px]">
                      <span className="text-xs uppercase tracking-wider text-pink-400 mb-1">Loss</span>
                      <span className="text-3xl font-mono text-pink-500 font-bold">{results.loss.toFixed(4)}</span>
                   </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    
      {/* Gradient Overlay during Backward Pass */}
      <AnimatePresence>
        {isBackward && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }}
             className="absolute inset-0 pointer-events-none flex justify-center items-center z-20"
           >
              <div className="bg-black/60 backdrop-blur-[2px] absolute inset-0" />
              <div className="bg-gradient-to-r from-green-500/20 to-red-500/20 p-8 rounded-2xl border border-white/10 relative z-30 backdrop-blur-md max-w-lg text-center">
                 <h2 className="text-2xl font-bold text-white mb-2">Gradient Update</h2>
                 <p className="text-slate-300 mb-4">
                   The policy model is updated to <span className="text-green-400 font-bold">increase</span> likelihood of the chosen response and <span className="text-red-400 font-bold">decrease</span> likelihood of the rejected response.
                 </p>
                 <div className="flex justify-center gap-4 text-sm font-mono">
                    <div className="text-green-400">∇θ ↑ log π(y_w|x)</div>
                    <div className="text-red-400">∇θ ↓ log π(y_l|x)</div>
                 </div>
              </div>
           </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
