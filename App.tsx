import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { INITIAL_EXAMPLE, DEFAULT_BETA, STEPS_ORDER } from './constants';
import { DPOExample, TrainingStep, SimulationState, CalculationResult } from './types';
import { generateDPOScenario } from './services/geminiService';
import { Visualizer } from './components/Visualizer';
import { Controls } from './components/Controls';
import { Settings, Info } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [example, setExample] = useState<DPOExample>(INITIAL_EXAMPLE);
  const [loading, setLoading] = useState(false);
  
  // Simulation Params
  const [beta, setBeta] = useState(DEFAULT_BETA);
  const [stepIndex, setStepIndex] = useState(0);

  // Simulated Model Outputs (Log Probs)
  // In a real scenario, these come from the model. Here we simulate them 
  // to demonstrate the math correctly.
  // We regenerate "random" model states when the example changes.
  const [baseLogProbs, setBaseLogProbs] = useState({
    refChosen: -2.5,
    refRejected: -3.2,
    // Policy starts slightly different from ref
    policyChosen: -2.4,
    policyRejected: -3.3 
  });

  // --- Logic ---

  // Fetch new scenario from Gemini
  const handleNewScenario = async () => {
    setLoading(true);
    try {
      const newExample = await generateDPOScenario();
      setExample(newExample);
      resetSimulation();
      // Randomize new base log probs for variety
      setBaseLogProbs({
        refChosen: -1.5 - Math.random() * 2, // Range -1.5 to -3.5
        refRejected: -2.5 - Math.random() * 3, // Range -2.5 to -5.5 (generally worse)
        policyChosen: -1.5 - Math.random() * 2,
        policyRejected: -2.5 - Math.random() * 3
      });
    } catch (err) {
      alert("Could not generate new scenario. Check API Key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    setStepIndex(0);
  };

  const nextStep = () => {
    if (stepIndex < STEPS_ORDER.length - 1) {
      setStepIndex(prev => prev + 1);
    }
  };

  // --- DPO Math Engine ---
  const currentStep = STEPS_ORDER[stepIndex];

  // Simulate Policy Drift during "Training"
  // If we are at the UPDATE step, we simulate the policy probabilities changing
  // to favor the chosen answer.
  const policyDrift = useMemo(() => {
    if (stepIndex >= STEPS_ORDER.indexOf(TrainingStep.UPDATE)) {
       return { chosen: 0.5, rejected: -0.5 }; // Policy gets better
    }
    return { chosen: 0, rejected: 0 };
  }, [stepIndex]);

  const simState: SimulationState = {
    step: currentStep,
    beta: beta,
    refLogProbChosen: baseLogProbs.refChosen,
    refLogProbRejected: baseLogProbs.refRejected,
    policyLogProbChosen: baseLogProbs.policyChosen + policyDrift.chosen,
    policyLogProbRejected: baseLogProbs.policyRejected + policyDrift.rejected,
    learningRate: 1e-5
  };

  // Calculate DPO Metrics
  const results: CalculationResult = useMemo(() => {
    // 1. Implicit Rewards: r(x,y) = beta * (log_policy - log_ref)
    const rewardChosen = simState.beta * (simState.policyLogProbChosen - simState.refLogProbChosen);
    const rewardRejected = simState.beta * (simState.policyLogProbRejected - simState.refLogProbRejected);
    
    // 2. Margin: reward_chosen - reward_rejected
    const margin = rewardChosen - rewardRejected;
    
    // 3. Sigmoid: 1 / (1 + e^-x)
    const sigmoidResult = 1 / (1 + Math.exp(-margin));
    
    // 4. Loss: -log(sigmoid(margin))
    const loss = -Math.log(sigmoidResult);

    return {
      implicitRewardChosen: rewardChosen,
      implicitRewardRejected: rewardRejected,
      margin,
      sigmoidResult,
      loss
    };
  }, [simState]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 h-16 flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
           <div className="bg-blue-600 p-2 rounded-lg">
             <Settings className="w-5 h-5 text-white" />
           </div>
           <h1 className="font-bold text-lg tracking-tight text-white hidden md:block">DPO <span className="text-slate-500 font-normal">Vis</span></h1>
           <div className="h-6 w-px bg-slate-800 mx-2"></div>
           <span className="text-xs font-mono text-blue-400 bg-blue-950/50 px-2 py-1 rounded border border-blue-900">
             Direct Preference Optimization
           </span>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 uppercase font-bold">Scenario Topic</div>
              <div className="text-sm text-white">{example.topic}</div>
           </div>
           <a href="https://arxiv.org/abs/2305.18290" target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-white transition-colors">
             <Info className="w-5 h-5" />
           </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32 max-w-6xl mx-auto min-h-screen flex flex-col">
        <Visualizer 
          example={example} 
          simState={simState} 
          results={results} 
        />
      </main>

      {/* Footer Controls */}
      <Controls 
        currentStep={currentStep}
        onNext={nextStep}
        onReset={resetSimulation}
        onNewScenario={handleNewScenario}
        beta={beta}
        setBeta={setBeta}
        loading={loading}
      />
    </div>
  );
};

export default App;
