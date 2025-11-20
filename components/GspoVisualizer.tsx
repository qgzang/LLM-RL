
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GSPOExample, GSPOStep } from '../types';
import { Variable, WeightSymbol } from './MathUtils';
import { GSPO_STEPS_ORDER } from '../constants';
import { BarChart3, ArrowUp, Target } from 'lucide-react';

interface GspoVisualizerProps {
  example: GSPOExample;
  currentStep: GSPOStep;
}

export const GspoVisualizer: React.FC<GspoVisualizerProps> = ({ example, currentStep }) => {
  const stepIndex = GSPO_STEPS_ORDER.indexOf(currentStep);
  
  const showGroup = stepIndex >= GSPO_STEPS_ORDER.indexOf(GSPOStep.SAMPLING);
  const showScores = stepIndex >= GSPO_STEPS_ORDER.indexOf(GSPOStep.SCORING);
  const showWeighting = stepIndex >= GSPO_STEPS_ORDER.indexOf(GSPOStep.WEIGHTING);
  const showUpdate = stepIndex >= GSPO_STEPS_ORDER.indexOf(GSPOStep.UPDATE);

  // Calculate Softmax Weights
  // w_i = exp(score) / sum(exp(score))
  // For visualization, we just use the scores directly for simplicity, 
  // but let's do a pseudo-softmax to make it look realistic but avoid giant exponents.
  // We'll just normalize scores sum to 1 for "probability-like" look.
  const sumScores = example.outputs.reduce((acc, val) => acc + val.score, 0);
  const weights = example.outputs.map(o => o.score / (sumScores || 1));

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 relative overflow-hidden">
      
      {/* Input Section */}
      <div className="flex flex-col gap-2 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-fuchsia-500/20 p-2 rounded-lg">
            <span className="text-fuchsia-400 font-mono font-bold text-xl">x</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-fuchsia-300 mb-1 font-bold">Prompt</h3>
            <p className="text-white text-lg">{example.prompt}</p>
          </div>
        </div>
      </div>

      {/* Group & Weights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <AnimatePresence>
          {showGroup && example.outputs.map((output, idx) => {
            const weight = weights[idx];
            const percent = (weight * 100).toFixed(1);

            return (
              <motion.div
                key={output.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col gap-3
                  ${showUpdate 
                    ? 'border-fuchsia-500/30 bg-fuchsia-900/10'
                    : 'border-slate-700 bg-slate-800/50'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 uppercase">Seq {idx + 1}</span>
                    {showScores && (
                       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-[10px] text-yellow-400 font-bold">
                          R: {output.score}
                       </motion.div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-slate-300 leading-snug">{output.text}</p>

                {/* Weight Bar */}
                {showWeighting && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                     className="mt-2"
                   >
                      <div className="flex justify-between items-end mb-1 text-xs">
                         <div className="flex items-center gap-1 text-fuchsia-300">
                            <WeightSymbol />
                            <span>(Target Prob)</span>
                         </div>
                         <span className="font-mono font-bold text-white">{percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                         <motion.div 
                           initial={{ width: 0 }} animate={{ width: `${percent}%` }}
                           transition={{ duration: 0.8, ease: "easeOut" }}
                           className="h-full bg-fuchsia-500"
                         />
                      </div>
                      {showUpdate && (
                         <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                            <Target className="w-3 h-3 text-fuchsia-400" />
                            <span>Push <Variable name="π" sub="θ" /> to match <WeightSymbol /></span>
                         </div>
                      )}
                   </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Math Panel */}
      <AnimatePresence>
         {showWeighting && (
            <motion.div
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="bg-slate-900/90 border-t border-slate-700 p-4 rounded-xl backdrop-blur-md"
            >
               <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-fuchsia-400" />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">Softmax Weighting</h4>
                        <p className="text-xs text-slate-400">Treating generation as multi-class classification</p>
                     </div>
                  </div>
                  
                  <div className="h-8 w-px bg-slate-700 hidden md:block"></div>

                  <div className="font-mono text-sm text-slate-300 flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                     <WeightSymbol />
                     <span>=</span>
                     <span className="text-fuchsia-300">Softmax</span>
                     <span>(</span>
                     <span className="text-yellow-400">Reward</span>
                     <span>/</span>
                     <span className="text-slate-500">β</span>
                     <span>)</span>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

    </div>
  );
};