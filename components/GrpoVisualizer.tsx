
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GRPOExample, GRPOStep } from '../types';
import { Variable, StatSymbol } from './MathUtils';
import { GRPO_STEPS_ORDER } from '../constants';
import { ArrowUp, ArrowDown, Brain } from 'lucide-react';

interface GrpoVisualizerProps {
  example: GRPOExample;
  currentStep: GRPOStep;
}

export const GrpoVisualizer: React.FC<GrpoVisualizerProps> = ({ example, currentStep }) => {
  const stepIndex = GRPO_STEPS_ORDER.indexOf(currentStep);
  
  // Calculation Logic
  const scores = example.outputs.map(o => o.score);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const std = Math.sqrt(variance) || 1; // prevent div by zero in visualization
  
  const advantages = scores.map(s => (s - mean) / std);

  // Vis States
  const showGroup = stepIndex >= GRPO_STEPS_ORDER.indexOf(GRPOStep.SAMPLING);
  const showScores = stepIndex >= GRPO_STEPS_ORDER.indexOf(GRPOStep.SCORING);
  const showStats = stepIndex >= GRPO_STEPS_ORDER.indexOf(GRPOStep.STATS);
  const showAdvantage = stepIndex >= GRPO_STEPS_ORDER.indexOf(GRPOStep.ADVANTAGE);
  const showUpdate = stepIndex >= GRPO_STEPS_ORDER.indexOf(GRPOStep.UPDATE);

  return (
    <div className="w-full h-full flex flex-col gap-6 p-4 relative overflow-hidden">
      
      {/* Input Section */}
      <div className="flex flex-col gap-2 z-10">
        <div className="flex items-start gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
          <div className="bg-purple-500/20 p-2 rounded-lg">
            <span className="text-purple-400 font-mono font-bold text-xl">x</span>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-wider text-purple-300 mb-1 font-bold">Prompt</h3>
            <p className="text-white text-lg">{example.prompt}</p>
          </div>
        </div>
      </div>

      {/* Group Outputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        <AnimatePresence>
          {showGroup && example.outputs.map((output, idx) => {
            const adv = advantages[idx];
            const isPositive = adv >= 0;
            
            return (
              <motion.div
                key={output.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-500 flex flex-col justify-between
                  ${showUpdate 
                    ? (isPositive ? 'border-green-500/50 bg-green-900/10' : 'border-red-500/50 bg-red-900/10')
                    : 'border-slate-700 bg-slate-800/50'
                  }
                `}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-500 uppercase">Output {idx + 1}</span>
                    {showScores && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-xs font-bold text-yellow-400"
                      >
                        Reward: {output.score}
                      </motion.div>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">{output.text}</p>
                </div>

                {/* Advantage & Update Visuals */}
                {showAdvantage && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-4 pt-3 border-t border-white/5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-slate-400">
                        Advantage (A<sub>{idx+1}</sub>)
                      </div>
                      <div className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {adv > 0 ? '+' : ''}{adv.toFixed(2)}
                      </div>
                    </div>
                    
                    {showUpdate && (
                      <div className={`flex items-center gap-2 mt-2 text-xs font-bold uppercase tracking-wide ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {isPositive ? 'Reinforce' : 'Suppress'}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Stats Panel */}
      <AnimatePresence>
        {showStats && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/90 border-t border-slate-700 p-4 rounded-xl backdrop-blur-md flex flex-col md:flex-row items-center justify-around gap-4"
          >
            {/* Formula */}
            <div className="flex flex-col gap-1">
              <h4 className="text-xs uppercase text-slate-500 font-bold">Group Formula</h4>
              <div className="text-lg font-mono text-white">
                A<sub>i</sub> = (r<sub>i</sub> - <StatSymbol type="mean"/>) / <StatSymbol type="std"/>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden md:block"></div>

            {/* Calculated Stats */}
            <div className="flex gap-8">
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">Mean (<StatSymbol type="mean"/>)</span>
                <span className="text-xl font-mono text-yellow-400">{mean.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-slate-500">Std Dev (<StatSymbol type="std"/>)</span>
                <span className="text-xl font-mono text-yellow-400">{std.toFixed(2)}</span>
              </div>
            </div>
            
            {showUpdate && (
               <div className="bg-blue-900/20 border border-blue-500/30 px-4 py-2 rounded-lg flex items-center gap-3">
                  <Brain className="w-5 h-5 text-blue-400" />
                  <div className="text-xs text-blue-200">
                    Policy <Variable name="π" sub="θ" /> updates based on Group Relative Advantage
                  </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
