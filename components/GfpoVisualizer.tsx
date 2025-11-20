
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GFPOExample, GFPOStep } from '../types';
import { Variable, TokenLen } from './MathUtils';
import { GFPO_STEPS_ORDER } from '../constants';
import { CheckCircle2, XCircle, ArrowDown, Trophy, Trash2, Filter } from 'lucide-react';

interface GfpoVisualizerProps {
  example: GFPOExample;
  currentStep: GFPOStep;
}

export const GfpoVisualizer: React.FC<GfpoVisualizerProps> = ({ example, currentStep }) => {
  const stepIndex = GFPO_STEPS_ORDER.indexOf(currentStep);
  
  const showGroup = stepIndex >= GFPO_STEPS_ORDER.indexOf(GFPOStep.SAMPLING);
  const isFiltering = stepIndex >= GFPO_STEPS_ORDER.indexOf(GFPOStep.FILTERING);
  const isRanking = stepIndex >= GFPO_STEPS_ORDER.indexOf(GFPOStep.RANKING);
  const isUpdate = stepIndex >= GFPO_STEPS_ORDER.indexOf(GFPOStep.UPDATE);

  // Process Data:
  // 1. Mark correct/incorrect
  // 2. Filter correct only
  // 3. Sort by length ASC
  
  const processedOutputs = [...example.outputs].sort((a, b) => {
     if (!isRanking) return 0; // Maintain original order until ranking step
     
     // If ranking, put incorrect ones at bottom (or hide them), and sort correct by length
     if (a.isCorrect && !b.isCorrect) return -1;
     if (!a.isCorrect && b.isCorrect) return 1;
     if (a.isCorrect && b.isCorrect) return a.length - b.length; // Shortest first
     return 0;
  });

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 relative overflow-hidden">
      
      {/* Input Section */}
      <div className="flex flex-col gap-2 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-cyan-500/20 p-2 rounded-lg">
            <span className="text-cyan-400 font-mono font-bold text-xl">x</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-cyan-300 mb-1 font-bold">Prompt</h3>
            <p className="text-white text-lg">{example.prompt}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Grid */}
      <motion.div layout className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2">
        <AnimatePresence mode='popLayout'>
          {showGroup && processedOutputs.map((output, idx) => {
            const isDimmed = isFiltering && !output.isCorrect;
            const isWinner = isUpdate && output.isCorrect && idx === 0; // Top sorted correct
            
            // Skip rendering incorrect ones during ranking if desired, 
            // but for visualization it's better to show them faded or at bottom.
            // Let's hide incorrect ones during ranking/update to clean up UI.
            if ((isRanking || isUpdate) && !output.isCorrect) return null;

            return (
              <motion.div
                layout
                key={output.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: isDimmed ? 0.3 : 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`relative p-4 rounded-xl border transition-all duration-500 flex items-center gap-4
                  ${isWinner 
                    ? 'border-cyan-400 bg-cyan-900/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' 
                    : isDimmed 
                      ? 'border-red-900/30 bg-red-900/5' 
                      : 'border-slate-700 bg-slate-800/50'
                  }
                `}
              >
                 {/* Rank Badge */}
                 {isRanking && output.isCorrect && (
                    <div className="font-mono font-bold text-slate-500 w-6">
                       #{idx + 1}
                    </div>
                 )}

                 {/* Status Icon */}
                 <div className="shrink-0">
                    {output.isCorrect 
                      ? <CheckCircle2 className={`w-6 h-6 ${isWinner ? 'text-cyan-400' : 'text-green-500'}`} />
                      : <XCircle className="w-6 h-6 text-red-500" />
                    }
                 </div>

                 {/* Content */}
                 <div className="flex-1">
                    <p className={`text-sm leading-snug ${isDimmed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {output.text}
                    </p>
                 </div>

                 {/* Metrics */}
                 <div className="flex flex-col items-end gap-1 min-w-[80px]">
                    <div className={`text-xs font-mono flex items-center gap-1 ${isWinner ? 'text-cyan-300' : 'text-slate-400'}`}>
                       <TokenLen /> 
                       <span>{output.length}</span>
                    </div>
                    {isFiltering && !output.isCorrect && (
                       <span className="text-[10px] text-red-400 uppercase font-bold">Incorrect</span>
                    )}
                    {isWinner && (
                       <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
                          <Trophy className="w-3 h-3" /> Best
                       </span>
                    )}
                 </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Step Context Panel */}
      <AnimatePresence>
         <motion.div 
           key={currentStep}
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-slate-900/90 border-t border-slate-700 p-4 rounded-xl backdrop-blur-md"
         >
            {currentStep === GFPOStep.FILTERING && (
               <div className="flex items-center gap-3 text-red-300">
                  <Filter className="w-5 h-5" />
                  <span className="text-sm">Filtering out incorrect responses (Accuracy check)</span>
               </div>
            )}
            {currentStep === GFPOStep.RANKING && (
               <div className="flex items-center gap-3 text-cyan-300">
                  <ArrowDown className="w-5 h-5" />
                  <span className="text-sm">Sorting correct responses by length (Efficiency check)</span>
               </div>
            )}
            {currentStep === GFPOStep.UPDATE && (
               <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 text-cyan-300">
                     <Trophy className="w-5 h-5" />
                     <span className="text-sm font-bold">Policy Update Goal: Concise Reasoning</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                     Maximize <Variable name="π" sub="θ" />(y<sub>short</sub> | x)
                  </div>
               </div>
            )}
            {currentStep === GFPOStep.SAMPLING && (
               <div className="text-sm text-slate-400">
                  Generating multiple candidate chains of thought...
               </div>
            )}
         </motion.div>
      </AnimatePresence>

    </div>
  );
};