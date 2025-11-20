
import React, { useState, useMemo } from 'react';
import { INITIAL_EXAMPLE, INITIAL_GRPO_EXAMPLE, INITIAL_PPO_EXAMPLE, INITIAL_GFPO_EXAMPLE, INITIAL_CISPO_EXAMPLE, INITIAL_GSPO_EXAMPLE, DEFAULT_BETA, STEPS_ORDER, GRPO_STEPS_ORDER, PPO_STEPS_ORDER, GFPO_STEPS_ORDER, CISPO_STEPS_ORDER, GSPO_STEPS_ORDER } from './constants';
import { DPOExample, GRPOExample, PPOExample, GFPOExample, CISPOExample, GSPOExample, AlgorithmType, TrainingStep, GRPOStep, PPOStep, GFPOStep, CISPOStep, GSPOStep, SimulationState, CalculationResult } from './types';
import { generateDPOScenario, generateGRPOScenario, generatePPOScenario, generateGFPOScenario, generateCISPOScenario, generateGSPOScenario } from './services/geminiService';
import { DpoVisualizer } from './components/Visualizer';
import { GrpoVisualizer } from './components/GrpoVisualizer';
import { PpoVisualizer } from './components/PpoVisualizer';
import { GfpoVisualizer } from './components/GfpoVisualizer';
import { CispoVisualizer } from './components/CispoVisualizer';
import { GspoVisualizer } from './components/GspoVisualizer';
import { Controls } from './components/Controls';
import { Settings, Info, Grid2X2, Split, Zap, Filter, Database, BarChart3 } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('PPO');
  
  // DPO State
  const [dpoExample, setDpoExample] = useState<DPOExample>(INITIAL_EXAMPLE);
  const [dpoStepIndex, setDpoStepIndex] = useState(0);

  // GRPO State
  const [grpoExample, setGrpoExample] = useState<GRPOExample>(INITIAL_GRPO_EXAMPLE);
  const [grpoStepIndex, setGrpoStepIndex] = useState(0);

  // GSPO State
  const [gspoExample, setGspoExample] = useState<GSPOExample>(INITIAL_GSPO_EXAMPLE);
  const [gspoStepIndex, setGspoStepIndex] = useState(0);

  // PPO State
  const [ppoExample, setPpoExample] = useState<PPOExample>(INITIAL_PPO_EXAMPLE);
  const [ppoStepIndex, setPpoStepIndex] = useState(0);

  // GFPO State
  const [gfpoExample, setGfpoExample] = useState<GFPOExample>(INITIAL_GFPO_EXAMPLE);
  const [gfpoStepIndex, setGfpoStepIndex] = useState(0);

  // CISPO State
  const [cispoExample, setCispoExample] = useState<CISPOExample>(INITIAL_CISPO_EXAMPLE);
  const [cispoStepIndex, setCispoStepIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [beta, setBeta] = useState(DEFAULT_BETA);

  // Simulated Model Outputs (Log Probs for DPO)
  const [baseLogProbs, setBaseLogProbs] = useState({
    refChosen: -2.5,
    refRejected: -3.2,
    policyChosen: -2.4,
    policyRejected: -3.3 
  });

  // --- Logic ---

  const handleNewScenario = async () => {
    setLoading(true);
    try {
      if (algorithm === 'DPO') {
        const newExample = await generateDPOScenario();
        setDpoExample(newExample);
        setDpoStepIndex(0);
        setBaseLogProbs({
          refChosen: -1.5 - Math.random() * 2,
          refRejected: -2.5 - Math.random() * 3,
          policyChosen: -1.5 - Math.random() * 2,
          policyRejected: -2.5 - Math.random() * 3
        });
      } else if (algorithm === 'GRPO') {
        const newExample = await generateGRPOScenario();
        setGrpoExample(newExample);
        setGrpoStepIndex(0);
      } else if (algorithm === 'GSPO') {
        const newExample = await generateGSPOScenario();
        setGspoExample(newExample);
        setGspoStepIndex(0);
      } else if (algorithm === 'GFPO') {
        const newExample = await generateGFPOScenario();
        setGfpoExample(newExample);
        setGfpoStepIndex(0);
      } else if (algorithm === 'CISPO') {
        const newExample = await generateCISPOScenario();
        setCispoExample(newExample);
        setCispoStepIndex(0);
      } else {
        const newExample = await generatePPOScenario();
        setPpoExample(newExample);
        setPpoStepIndex(0);
      }
    } catch (err) {
      alert("Could not generate new scenario. Check API Key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSimulation = () => {
    if (algorithm === 'DPO') setDpoStepIndex(0);
    else if (algorithm === 'GRPO') setGrpoStepIndex(0);
    else if (algorithm === 'GSPO') setGspoStepIndex(0);
    else if (algorithm === 'GFPO') setGfpoStepIndex(0);
    else if (algorithm === 'CISPO') setCispoStepIndex(0);
    else setPpoStepIndex(0);
  };

  const nextStep = () => {
    if (algorithm === 'DPO') {
      if (dpoStepIndex < STEPS_ORDER.length - 1) setDpoStepIndex(prev => prev + 1);
    } else if (algorithm === 'GRPO') {
      if (grpoStepIndex < GRPO_STEPS_ORDER.length - 1) setGrpoStepIndex(prev => prev + 1);
    } else if (algorithm === 'GSPO') {
      if (gspoStepIndex < GSPO_STEPS_ORDER.length - 1) setGspoStepIndex(prev => prev + 1);
    } else if (algorithm === 'GFPO') {
      if (gfpoStepIndex < GFPO_STEPS_ORDER.length - 1) setGfpoStepIndex(prev => prev + 1);
    } else if (algorithm === 'CISPO') {
      if (cispoStepIndex < CISPO_STEPS_ORDER.length - 1) setCispoStepIndex(prev => prev + 1);
    } else {
      if (ppoStepIndex < PPO_STEPS_ORDER.length - 1) setPpoStepIndex(prev => prev + 1);
    }
  };

  // --- DPO Math Engine ---
  const currentDpoStep = STEPS_ORDER[dpoStepIndex];

  const policyDrift = useMemo(() => {
    if (dpoStepIndex >= STEPS_ORDER.indexOf(TrainingStep.UPDATE)) {
       return { chosen: 0.5, rejected: -0.5 };
    }
    return { chosen: 0, rejected: 0 };
  }, [dpoStepIndex]);

  const dpoSimState: SimulationState = {
    step: currentDpoStep,
    beta: beta,
    refLogProbChosen: baseLogProbs.refChosen,
    refLogProbRejected: baseLogProbs.refRejected,
    policyLogProbChosen: baseLogProbs.policyChosen + policyDrift.chosen,
    policyLogProbRejected: baseLogProbs.policyRejected + policyDrift.rejected,
    learningRate: 1e-5
  };

  const dpoResults: CalculationResult = useMemo(() => {
    const rewardChosen = dpoSimState.beta * (dpoSimState.policyLogProbChosen - dpoSimState.refLogProbChosen);
    const rewardRejected = dpoSimState.beta * (dpoSimState.policyLogProbRejected - dpoSimState.refLogProbRejected);
    const margin = rewardChosen - rewardRejected;
    const sigmoidResult = 1 / (1 + Math.exp(-margin));
    const loss = -Math.log(sigmoidResult);
    return { implicitRewardChosen: rewardChosen, implicitRewardRejected: rewardRejected, margin, sigmoidResult, loss };
  }, [dpoSimState]);

  // --- Step Logic ---
  const currentGrpoStep = GRPO_STEPS_ORDER[grpoStepIndex];
  const currentGspoStep = GSPO_STEPS_ORDER[gspoStepIndex];
  const currentPpoStep = PPO_STEPS_ORDER[ppoStepIndex];
  const currentGfpoStep = GFPO_STEPS_ORDER[gfpoStepIndex];
  const currentCispoStep = CISPO_STEPS_ORDER[cispoStepIndex];

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 h-16 flex items-center px-4 md:px-6 justify-between">
        <div className="flex items-center gap-3">
           <div className="bg-blue-600 p-2 rounded-lg">
             <Settings className="w-5 h-5 text-white" />
           </div>
           <h1 className="font-bold text-lg tracking-tight text-white hidden md:block">LLM <span className="text-slate-500 font-normal">Trainer</span></h1>
           <div className="h-6 w-px bg-slate-800 mx-2"></div>
           
           {/* Algo Switcher */}
           <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800 overflow-x-auto max-w-[60vw] md:max-w-none scrollbar-hide">
              <button 
                onClick={() => setAlgorithm('PPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'PPO' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Zap className="w-3 h-3" /> PPO
              </button>
              <button 
                onClick={() => setAlgorithm('DPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'DPO' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Split className="w-3 h-3" /> DPO
              </button>
              <button 
                onClick={() => setAlgorithm('GRPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'GRPO' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid2X2 className="w-3 h-3" /> GRPO
              </button>
              <button 
                onClick={() => setAlgorithm('GSPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'GSPO' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <BarChart3 className="w-3 h-3" /> GSPO
              </button>
              <button 
                onClick={() => setAlgorithm('GFPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'GFPO' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Filter className="w-3 h-3" /> GFPO
              </button>
              <button 
                onClick={() => setAlgorithm('CISPO')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all flex items-center gap-2 whitespace-nowrap ${algorithm === 'CISPO' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Database className="w-3 h-3" /> CISPO
              </button>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500 uppercase font-bold">Scenario Topic</div>
              <div className="text-sm text-white">
                {algorithm === 'DPO' ? dpoExample.topic : 
                 algorithm === 'GRPO' ? grpoExample.topic : 
                 algorithm === 'GSPO' ? gspoExample.topic :
                 algorithm === 'GFPO' ? gfpoExample.topic : 
                 algorithm === 'CISPO' ? cispoExample.topic :
                 ppoExample.topic}
              </div>
           </div>
           <a 
            href={algorithm === 'DPO' ? "https://arxiv.org/abs/2305.18290" : algorithm === 'GRPO' ? "https://arxiv.org/html/2402.03300v1" : "https://arxiv.org/abs/1707.06347"} 
            target="_blank" 
            rel="noreferrer" 
            className="p-2 text-slate-400 hover:text-white transition-colors"
           >
             <Info className="w-5 h-5" />
           </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-32 max-w-6xl mx-auto min-h-screen flex flex-col">
        {algorithm === 'DPO' && (
          <DpoVisualizer 
            example={dpoExample} 
            simState={dpoSimState} 
            results={dpoResults} 
          />
        )}
        {algorithm === 'GRPO' && (
          <GrpoVisualizer
            example={grpoExample}
            currentStep={currentGrpoStep}
          />
        )}
        {algorithm === 'GSPO' && (
          <GspoVisualizer
            example={gspoExample}
            currentStep={currentGspoStep}
          />
        )}
        {algorithm === 'PPO' && (
          <PpoVisualizer
            example={ppoExample}
            currentStep={currentPpoStep}
          />
        )}
        {algorithm === 'GFPO' && (
          <GfpoVisualizer
            example={gfpoExample}
            currentStep={currentGfpoStep}
          />
        )}
        {algorithm === 'CISPO' && (
          <CispoVisualizer
            example={cispoExample}
            currentStep={currentCispoStep}
          />
        )}
      </main>

      {/* Footer Controls */}
      <Controls 
        algorithm={algorithm}
        currentStep={
          algorithm === 'DPO' ? currentDpoStep : 
          algorithm === 'GRPO' ? currentGrpoStep : 
          algorithm === 'GSPO' ? currentGspoStep :
          algorithm === 'GFPO' ? currentGfpoStep : 
          algorithm === 'CISPO' ? currentCispoStep : 
          currentPpoStep
        }
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