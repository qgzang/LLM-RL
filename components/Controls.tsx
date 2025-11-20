
import React from 'react';
import { STEPS_ORDER, GRPO_STEPS_ORDER, PPO_STEPS_ORDER, GFPO_STEPS_ORDER, CISPO_STEPS_ORDER, GSPO_STEPS_ORDER } from '../constants';
import { AlgorithmType } from '../types';
import { SkipForward, RotateCcw, Settings2, RefreshCw } from 'lucide-react';

interface ControlsProps {
  algorithm: AlgorithmType;
  currentStep: string; 
  onNext: () => void;
  onReset: () => void;
  onNewScenario: () => void;
  beta: number;
  setBeta: (val: number) => void;
  loading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  algorithm,
  currentStep, 
  onNext, 
  onReset, 
  onNewScenario,
  beta, 
  setBeta,
  loading
}) => {
  let steps: string[];
  let primaryColor: string;
  let primaryBg: string;
  let dotColor: string;

  if (algorithm === 'DPO') {
    steps = STEPS_ORDER as unknown as string[];
    primaryColor = 'blue';
    primaryBg = 'bg-blue-600 hover:bg-blue-500';
    dotColor = 'bg-blue-500';
  } else if (algorithm === 'GRPO') {
    steps = GRPO_STEPS_ORDER as unknown as string[];
    primaryColor = 'purple';
    primaryBg = 'bg-purple-600 hover:bg-purple-500';
    dotColor = 'bg-purple-500';
  } else if (algorithm === 'GSPO') {
    steps = GSPO_STEPS_ORDER as unknown as string[];
    primaryColor = 'fuchsia';
    primaryBg = 'bg-fuchsia-600 hover:bg-fuchsia-500';
    dotColor = 'bg-fuchsia-500';
  } else if (algorithm === 'GFPO') {
    steps = GFPO_STEPS_ORDER as unknown as string[];
    primaryColor = 'cyan';
    primaryBg = 'bg-cyan-600 hover:bg-cyan-500';
    dotColor = 'bg-cyan-500';
  } else if (algorithm === 'CISPO') {
    steps = CISPO_STEPS_ORDER as unknown as string[];
    primaryColor = 'amber';
    primaryBg = 'bg-amber-600 hover:bg-amber-500';
    dotColor = 'bg-amber-500';
  } else {
    // PPO
    steps = PPO_STEPS_ORDER as unknown as string[];
    primaryColor = 'emerald';
    primaryBg = 'bg-emerald-600 hover:bg-emerald-500';
    dotColor = 'bg-emerald-500';
  }
    
  const currentStepIndex = steps.indexOf(currentStep);
  const isFinished = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-6 z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Progress Bar */}
        <div 
          className={`absolute top-0 left-0 h-1 transition-all duration-500 ${
            algorithm === 'DPO' ? 'bg-blue-600' : 
            algorithm === 'GRPO' ? 'bg-purple-600' : 
            algorithm === 'GSPO' ? 'bg-fuchsia-600' :
            algorithm === 'GFPO' ? 'bg-cyan-600' : 
            algorithm === 'CISPO' ? 'bg-amber-600' : 
            'bg-emerald-600'
          }`} 
          style={{ width: `${progress}%` }} 
        />

        {/* Left: Step Indicator */}
        <div className="flex flex-col items-start min-w-[200px]">
           <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Current Step</span>
           <span className="text-white font-mono text-lg flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full animate-pulse ${dotColor}`}></span>
             {currentStep}
           </span>
        </div>

        {/* Center: Primary Controls */}
        <div className="flex items-center gap-3">
           <button 
             onClick={onReset}
             className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
             title="Reset Step"
           >
             <RotateCcw className="w-5 h-5" />
           </button>

           <button 
             onClick={onNext}
             disabled={isFinished || loading}
             className={`
                flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white shadow-lg transition-all
                ${isFinished 
                  ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                  : `${primaryBg} active:scale-95 shadow-${primaryColor}-500/25`}
             `}
           >
             {isFinished ? 'Epoch Complete' : 'Next Step'}
             {!isFinished && <SkipForward className="w-5 h-5 fill-white" />}
           </button>
        </div>

        {/* Right: Hyperparameters & Actions */}
        <div className="flex items-center gap-6">
           {algorithm === 'DPO' && (
             <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                   <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" /> Beta (β)</span>
                   <span className="text-white">{beta.toFixed(2)}</span>
                </div>
                <input 
                  type="range" 
                  min="0.05" 
                  max="1.0" 
                  step="0.05" 
                  value={beta} 
                  onChange={(e) => setBeta(parseFloat(e.target.value))}
                  className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
             </div>
           )}
           
           {algorithm === 'DPO' && <div className="h-8 w-px bg-slate-700 mx-2"></div>}

           <button 
             onClick={onNewScenario}
             disabled={loading}
             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
           >
             {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
             New Data
           </button>
        </div>

      </div>
    </div>
  );
};