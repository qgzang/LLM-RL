
import React from 'react';

export const Variable: React.FC<{ name: string; sub?: string; color?: string }> = ({ name, sub, color = 'text-white' }) => (
  <span className={`font-serif italic ${color}`}>
    {name}
    {sub && <sub className="not-italic text-[0.7em] ml-0.5">{sub}</sub>}
  </span>
);

export const SigmoidFunc: React.FC = () => (
  <span className="font-mono text-sm text-indigo-300">σ</span>
);

export const LogProb: React.FC<{ model: 'policy' | 'ref'; output: 'w' | 'l' }> = ({ model, output }) => {
  const modelColor = model === 'policy' ? 'text-blue-400' : 'text-gray-400';
  const outputColor = output === 'w' ? 'text-green-400' : 'text-red-400';
  const modelSymbol = model === 'policy' ? 'θ' : 'ref';
  
  return (
    <span>
      log <Variable name="π" sub={modelSymbol} color={modelColor} />
      (<Variable name="y" sub={output} color={outputColor} /> | <Variable name="x" />)
    </span>
  );
};

export const StatSymbol: React.FC<{ type: 'mean' | 'std' }> = ({ type }) => (
  <span className="font-serif italic text-yellow-400">
    {type === 'mean' ? 'μ' : 'σ'}
  </span>
);

export const ValueSymbol: React.FC = () => (
  <span className="font-serif italic text-pink-400">V</span>
);

export const AdvSymbol: React.FC = () => (
  <span className="font-serif italic text-green-400">A</span>
);

export const TokenLen: React.FC = () => (
  <span className="font-serif italic text-cyan-400">|y|</span>
);

export const ISRatio: React.FC = () => (
  <span className="font-serif italic text-amber-400">ρ<sub className="not-italic text-[0.7em] ml-0.5">t</sub></span>
);

export const WeightSymbol: React.FC = () => (
  <span className="font-serif italic text-fuchsia-400">w<sub>i</sub></span>
);