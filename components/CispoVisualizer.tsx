
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CISPOExample, CISPOStep } from '../types';
import { Variable, ISRatio } from './MathUtils';
import { CISPO_STEPS_ORDER } from '../constants';
import { Database, Activity, ArrowRight, Scale } from 'lucide-react';

interface CispoVisualizerProps {
  example: CISPOExample;
  currentStep: CISPOStep;
}

export const CispoVisualizer: React.FC<CispoVisualizerProps> = ({ example, currentStep }) => {
  const stepIndex = CISPO_STEPS_ORDER.indexOf(currentStep);

  const showSampling = stepIndex >= CISPO_STEPS_ORDER.indexOf(CISPOStep.SAMPLING);
  const showIS = stepIndex >= CISPO_STEPS_ORDER.indexOf(CISPOStep.IS_CALC);
  const showClipping = stepIndex >= CISPO_STEPS_ORDER.indexOf(CISPOStep.CLIPPING);
  const showUpdate = stepIndex >= CISPO_STEPS_ORDER.indexOf(CISPOStep.UPDATE);

  // Simulate Current Log Prob (improving over time)
  // If updating, we pretend the current policy has slightly higher prob than behavior
  const currentLogProb = showUpdate ? example.behaviorLogProb + 0.2 : example.behaviorLogProb;
  const probRatio = Math.exp(currentLogProb - example.behaviorLogProb);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 relative overflow-hidden">
      
      {/* Header / Input */}
      <div className="flex flex-col gap-2 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-amber-500/20 p-2 rounded-lg">
            <span className="text-amber-400 font-mono font-bold text-xl">x</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-amber-300 mb-1 font-bold">Prompt</h3>
            <p className="text-white text-lg">{example.prompt}</p>
          </div>
        </div>
      </div>

      {/* Policies Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4 items-start">
         
         {/* Behavior Policy (Old) */}
         <AnimatePresence>
           {showSampling && (
             <motion.div 
               initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
               className="flex flex-col gap-4"
             >
                <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded-lg opacity-70">
                   <Database className="w-6 h-6 text-slate-400" />
                   <div>
                      <div className="text-slate-300 font-bold text-sm uppercase">Behavior Policy (π_old)</div>
                      <div className="text-xs text-slate-500">Frozen / Offline Dataset</div>
                   </div>
                </div>
                
                {/* The Sample */}
                <div className="p-4 rounded-xl border border-slate-600 bg-slate-800/80 relative">
                   <div className="text-xs text-slate-400 mb-2 font-mono">Sampled Response (y)</div>
                   <p className="text-slate-200 text-sm mb-3">{example.response}</p>
                   <div className="flex items-center justify-between text-xs font-mono border-t border-slate-700 pt-2">
                      <span className="text-slate-500">log π_old(y|x)</span>
                      <span className="text-slate-300">{example.behaviorLogProb.toFixed(2)}</span>
                   </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>

         {/* Target Policy (Current) */}
         <AnimatePresence>
           {showIS && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="flex flex-col gap-4"
             >
                <div className="flex items-center gap-3 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                   <Activity className="w-6 h-6 text-amber-400" />
                   <div>
                      <div className="text-amber-400 font-bold text-sm uppercase">Target Policy (π_θ)</div>
                      <div className="text-xs text-amber-200/70">Currently Updating</div>
                   </div>
                </div>

                {/* Calculation Box */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 relative flex flex-col gap-3">
                   <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-200/70">log π_θ(y|x)</span>
                      <span className="text-amber-400 font-bold">{currentLogProb.toFixed(2)}</span>
                   </div>
                   
                   <div className="h-px bg-amber-500/20 w-full"></div>

                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <ISRatio />
                         <span className="text-xs text-slate-400">= π_θ / π_old</span>
                      </div>
                      <span className="text-xl font-mono font-bold text-white">{probRatio.toFixed(3)}</span>
                   </div>
                </div>
             </motion.div>
           )}
         </AnimatePresence>

      </div>

      {/* Clipping / Objective */}
      <AnimatePresence>
        {showClipping && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl backdrop-blur flex flex-col gap-2"
          >
             <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-purple-400" />
                <h4 className="font-bold text-slate-300 text-sm">CISPO Objective (Clipped IS)</h4>
             </div>

             <div className="flex items-center justify-center gap-4 text-sm font-mono bg-slate-950 p-3 rounded border border-slate-800">
                <span className="text-amber-400">E</span>
                <span>[</span>
                <span className="text-purple-400">min</span>
                <span>(</span>
                <span>
                  <ISRatio /> <Variable name="A" color="text-green-400" />
                </span>
                <span>,</span>
                <span className="text-slate-400">clip(</span>
                <ISRatio />
                <span className="text-slate-400">, 1-ε, 1+ε)</span>
                <Variable name="A" color="text-green-400" />
                <span>)</span>
                <span>]</span>
             </div>
             
             {showUpdate && (
               <div className="flex items-center justify-center gap-2 mt-2 text-xs text-green-400 animate-pulse">
                  <ArrowRight className="w-4 h-4" />
                  Performing Gradient Ascent on Target Policy
               </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
