
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PPOExample, PPOStep } from '../types';
import { Variable, ValueSymbol, AdvSymbol } from './MathUtils';
import { PPO_STEPS_ORDER } from '../constants';
import { Brain, Calculator, Scale, ShieldAlert, ArrowRight } from 'lucide-react';

interface PpoVisualizerProps {
  example: PPOExample;
  currentStep: PPOStep;
}

const ModelCard: React.FC<{ title: string; type: string; color: string; active: boolean; subtext: string }> = ({ title, type, color, active, subtext }) => (
  <div className={`p-3 rounded-xl border-2 transition-all duration-500 flex flex-col items-center gap-2 min-w-[120px]
    ${active ? `${color} bg-opacity-10 bg-white scale-105 shadow-lg` : 'border-slate-800 bg-slate-900 opacity-40'}`}>
    <Brain className={`w-6 h-6 ${active ? 'animate-pulse' : ''}`} />
    <div className="text-center">
      <div className="font-bold text-xs uppercase tracking-wider">{title}</div>
      <div className="text-[10px] opacity-70 font-mono">{type}</div>
    </div>
    {active && <div className="text-[10px] font-mono bg-slate-950 px-2 py-1 rounded text-slate-300">{subtext}</div>}
  </div>
);

export const PpoVisualizer: React.FC<PpoVisualizerProps> = ({ example, currentStep }) => {
  const stepIndex = PPO_STEPS_ORDER.indexOf(currentStep);
  
  const isRollout = stepIndex >= PPO_STEPS_ORDER.indexOf(PPOStep.ROLLOUT);
  const isEval = stepIndex >= PPO_STEPS_ORDER.indexOf(PPOStep.EVALUATION);
  const isAdvantage = stepIndex >= PPO_STEPS_ORDER.indexOf(PPOStep.ADVANTAGE);
  const isClipping = stepIndex >= PPO_STEPS_ORDER.indexOf(PPOStep.CLIPPING);
  const isUpdate = stepIndex >= PPO_STEPS_ORDER.indexOf(PPOStep.UPDATE);

  const advantage = example.initialReward - example.initialValue;
  const isPositive = advantage > 0;

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 relative overflow-hidden">
      
      {/* Architecture Header */}
      <div className="grid grid-cols-4 gap-4 mb-2">
        <ModelCard title="Actor" type="π_θ" color="border-blue-500 text-blue-400" active={true} subtext="Generating..." />
        <ModelCard title="Critic" type="V_φ" color="border-pink-500 text-pink-400" active={isEval} subtext="Estimating Value" />
        <ModelCard title="Ref Model" type="π_ref" color="border-slate-500 text-slate-400" active={isRollout} subtext="KL Anchor" />
        <ModelCard title="Reward Mod" type="R" color="border-yellow-500 text-yellow-400" active={isEval} subtext="Scoring" />
      </div>

      {/* Step 1 & 2: Input & Rollout */}
      <div className="flex flex-col gap-4 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
             <span className="text-emerald-400 font-mono font-bold">Input</span>
          </div>
          <div>
            <p className="text-white">{example.prompt}</p>
          </div>
        </div>

        <AnimatePresence>
          {isRollout && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4 bg-blue-900/10 p-4 rounded-xl border border-blue-500/30 ml-8"
            >
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <span className="text-blue-400 font-mono font-bold">Actor</span>
              </div>
              <p className="text-slate-200 font-mono text-sm">{example.response}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 3 & 4: Evaluation & Advantage */}
      <AnimatePresence>
        {isEval && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4"
          >
            {/* Reward Path */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
              <span className="text-xs text-slate-500 uppercase font-bold">Reward Model Output</span>
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-yellow-400" />
                <span className="text-2xl font-mono text-yellow-400">{example.initialReward.toFixed(1)}</span>
              </div>
            </div>
            {/* Critic Path */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
               <span className="text-xs text-slate-500 uppercase font-bold">Critic Estimate (V)</span>
               <div className="flex items-center gap-2">
                 <Calculator className="w-4 h-4 text-pink-400" />
                 <span className="text-2xl font-mono text-pink-400">{example.initialValue.toFixed(1)}</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdvantage && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-600 flex justify-center items-center gap-6"
        >
          <div className="flex flex-col items-center">
             <div className="text-sm text-slate-400 mb-1">Advantage Calculation</div>
             <div className="flex items-center gap-3 font-mono text-lg">
                <span className="text-green-400"><AdvSymbol/></span>
                <span>=</span>
                <span className="text-yellow-400">{example.initialReward.toFixed(1)}</span>
                <span>-</span>
                <span className="text-pink-400">{example.initialValue.toFixed(1)}</span>
                <span>=</span>
                <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {advantage > 0 ? '+' : ''}{advantage.toFixed(1)}
                </span>
             </div>
          </div>
          <div className="h-10 w-px bg-slate-600"></div>
          <div className="text-xs text-slate-300 max-w-[150px]">
             {isPositive 
               ? "The response was better than expected! We should encourage this." 
               : "The response was worse than expected. We should discourage this."}
          </div>
        </motion.div>
      )}

      {/* Step 5: Clipping */}
      {isClipping && (
         <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-500/30 relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <ShieldAlert className="w-24 h-24 text-indigo-500" />
            </div>
            <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-wider mb-4 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" /> PPO Clipping Mechanism
            </h3>
            
            <div className="flex items-center justify-around z-10 relative">
               <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Ratio (π_new / π_old)</span>
                  <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: '50%' }} animate={{ width: '80%' }} 
                        className="h-full bg-blue-500"
                     />
                  </div>
               </div>
               
               <ArrowRight className="w-5 h-5 text-slate-600" />

               <div className="flex flex-col items-center p-3 bg-slate-900 rounded border border-indigo-500/50">
                  <span className="text-xs text-indigo-300 font-mono">Clip(r, 1-ε, 1+ε)</span>
                  <span className="text-lg font-bold text-white">Limited Update</span>
               </div>

               <ArrowRight className="w-5 h-5 text-slate-600" />

               <div className="flex flex-col items-center">
                  <span className="text-xs text-slate-400">Objective</span>
                  <span className="text-sm text-slate-200 font-mono">L_CLIP</span>
               </div>
            </div>
         </motion.div>
      )}

      {/* Step 6: Update */}
      {isUpdate && (
         <motion.div
           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
           className="grid grid-cols-2 gap-4"
         >
             <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg text-center">
                <div className="text-blue-400 font-bold text-sm mb-1">Actor Update</div>
                <div className="text-xs text-blue-200 opacity-80">
                   Maximize clipped advantage
                </div>
             </div>
             <div className="bg-pink-900/20 border border-pink-500/30 p-3 rounded-lg text-center">
                <div className="text-pink-400 font-bold text-sm mb-1">Critic Update</div>
                <div className="text-xs text-pink-200 opacity-80">
                   Minimize prediction error (MSE)
                </div>
             </div>
         </motion.div>
      )}

    </div>
  );
};
