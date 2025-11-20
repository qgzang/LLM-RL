import React from 'react';
import { STEPS_ORDER } from '../constants';
import { TrainingStep } from '../types';
import { Play, SkipForward, RotateCcw, Settings2, RefreshCw } from 'lucide-react';

interface ControlsProps {
  currentStep: TrainingStep;
  onNext: () => void;
  onReset: () => void;
  onNewScenario: () => void;
  beta: number;
  setBeta: (val: number) => void;
  loading: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  currentStep, 
  onNext, 
  onReset, 
  onNewScenario,
  beta, 
  setBeta,
  loading
}) => {
  const currentStepIndex = STEPS_ORDER.indexOf(currentStep);
  const isFinished = currentStepIndex === STEPS_ORDER.length - 1;
  const progress = ((currentStepIndex + 1) / STEPS_ORDER.length) * 100;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 p-6 z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />

        {/* Left: Step Indicator */}
        <div className="flex flex-col items-start min-w-[200px]">
           <span className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Current Step</span>
           <span className="text-white font-mono text-lg flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
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
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95'}
             `}
           >
             {isFinished ? 'Epoch Complete' : 'Next Step'}
             {!isFinished && <SkipForward className="w-5 h-5 fill-white" />}
           </button>
        </div>

        {/* Right: Hyperparameters & Actions */}
        <div className="flex items-center gap-6">
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

           <div className="h-8 w-px bg-slate-700 mx-2"></div>

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
