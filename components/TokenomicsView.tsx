"use client";

import React from 'react';
import { TOKEN_CONSTANTS } from '../types';

interface TokenomicsViewProps {
  userBalance: number;
  dailyEarned: number;
  globalLearnerSupply: number;
}

const TokenomicsView: React.FC<TokenomicsViewProps> = ({ userBalance, dailyEarned, globalLearnerSupply }) => {
  const currentEpoch = Math.floor(globalLearnerSupply / TOKEN_CONSTANTS.HALVING_INTERVAL) + 1;
  const maxSupply = TOKEN_CONSTANTS.MAX_SUPPLY;
  
  // Distribution calculation
  const distribution = TOKEN_CONSTANTS.DISTRIBUTION;
  const ecosystemData = [
    { label: 'Mining Rewards (Public PoK)', percentage: distribution.LEARNERS, color: 'bg-indigo-600', icon: 'â›ï¸' },
    { label: 'Ecosystem Growth', percentage: distribution.ECOSYSTEM, color: 'bg-emerald-500', icon: 'ðŸŒ±' },
    { label: 'Strategic Partnerships', percentage: distribution.PARTNERSHIPS, color: 'bg-blue-500', icon: 'ðŸ¤' },
    { label: 'Core Team & Development', percentage: distribution.TEAM, color: 'bg-amber-500', icon: 'ðŸ› ï¸' },
    { label: 'Liquidity Pools', percentage: distribution.LIQUIDITY, color: 'bg-rose-500', icon: 'ðŸŒŠ' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-12 pb-20">
      <header className="mb-16">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
          Genius <span className="text-indigo-600">Protocol</span>
        </h2>
        <p className="text-slate-400 text-xl font-medium">Fixed Supply Algorithm. 21,000,000 {TOKEN_CONSTANTS.SYMBOL} Max Cap.</p>
      </header>

      {/* Bitcoin Whitepaper Style Section */}
      <div className="bg-white rounded-[4rem] p-12 border-2 border-slate-100 shadow-2xl relative">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          <div className="flex-1">
             <h3 className="text-3xl font-black text-slate-800 mb-6">1. The Protocol</h3>
             <p className="text-slate-500 font-medium leading-relaxed mb-6">
                LITTLE GENIUS introduces a peer-to-peer knowledge validation protocol. Unlike traditional economies, {TOKEN_CONSTANTS.SYMBOL} is emitted purely through the validation of truth. We call this <strong>Proof of Knowledge (PoK)</strong>.
             </p>
             <h3 className="text-3xl font-black text-slate-800 mb-6">2. Fixed Supply Emission</h3>
             <p className="text-slate-500 font-medium leading-relaxed">
                The total circulation is mathematically capped at 21,000,000 {TOKEN_CONSTANTS.SYMBOL}. Every {TOKEN_CONSTANTS.HALVING_INTERVAL.toLocaleString()} {TOKEN_CONSTANTS.SYMBOL} issued, the mining difficulty remains static but the reward per validation <strong>halves</strong>.
             </p>
          </div>
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 w-full md:w-80 shadow-inner">
             <div className="space-y-6">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Supply</p>
                   <p className="text-2xl font-black text-slate-900">21,000,000 G</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Genesis Block</p>
                   <p className="text-2xl font-black text-indigo-600">Verified 2025</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consensus</p>
                   <p className="text-2xl font-black text-emerald-500">Global Trivia</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Balance Card */}
        <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">My Node Stash</h3>
            <div className="flex items-end gap-4 mb-10">
              <span className="text-7xl font-black text-white">{userBalance.toFixed(4)}</span>
              <span className="text-2xl font-black text-indigo-400 mb-2">{TOKEN_CONSTANTS.SYMBOL}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Current Reward</p>
                <p className="text-2xl font-black text-indigo-400">{(TOKEN_CONSTANTS.INITIAL_REWARDS.QUIZ_CORRECT * Math.pow(0.5, currentEpoch - 1)).toFixed(3)} G</p>
              </div>
              <div className="bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Daily Cap Status</p>
                <p className="text-2xl font-black text-emerald-400">{( (dailyEarned / TOKEN_CONSTANTS.DAILY_CAP) * 100 ).toFixed(0)}% mined</p>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <span className="text-[20rem]">â‚¿</span>
          </div>
        </div>

        {/* Earning Rates Card */}
        <div className="bg-white rounded-[3rem] p-12 border-2 border-slate-50 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Mining Difficulty Adjustment</h3>
            <p className="text-slate-400 text-sm mb-8">Protocol automatically adjusts emission rates based on halving cycles.</p>
          </div>
          
          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <h4 className="text-sm font-black text-slate-800 mb-4 uppercase tracking-widest">Epoch {currentEpoch} Subsidies</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">â›ï¸</span>
                  <span className="text-slate-500 font-bold">Knowledge Validation</span>
                </div>
                <span className="font-black text-indigo-600">{(TOKEN_CONSTANTS.INITIAL_REWARDS.QUIZ_CORRECT * Math.pow(0.5, currentEpoch - 1)).toFixed(4)} G</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">ðŸ†</span>
                  <span className="text-slate-500 font-bold">Protocol Assessment</span>
                </div>
                <span className="font-black text-indigo-600">{(TOKEN_CONSTANTS.INITIAL_REWARDS.ASSESSMENT_PASS * Math.pow(0.5, currentEpoch - 1)).toFixed(4)} G</span>
              </div>
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-xl">ðŸ“š</span>
                  <span className="text-slate-500 font-bold">Pathway Mastery</span>
                </div>
                <span className="font-black text-indigo-600">{(TOKEN_CONSTANTS.INITIAL_REWARDS.MODULE_MASTERED * Math.pow(0.5, currentEpoch - 1)).toFixed(5)} G</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution transparency */}
      <div className="bg-white rounded-[4rem] p-12 border-2 border-slate-50 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-4">
            Allocation Transparency
            <span className="text-sm bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg uppercase font-black">Supply Audit</span>
          </h3>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">
            Directly mirroring the Bitcoin philosophy, {TOKEN_CONSTANTS.SYMBOL} is distributed with full visibility. 50% of all tokens are strictly reserved for the global nodes (learners) mining through PoK.
          </p>
          
          <div className="space-y-8">
            {ecosystemData.map((item, idx) => {
              const totalForCategory = maxSupply * item.percentage;
              return (
                <div key={idx} className="relative group">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <p className="font-black text-slate-800 leading-none">{item.label}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Allocation: {(item.percentage * 100).toFixed(0)}% Cap</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{totalForCategory.toLocaleString()} {TOKEN_CONSTANTS.SYMBOL}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-2xl overflow-hidden border border-slate-50">
                    <div 
                      className={`${item.color} h-full transition-all duration-1000 ease-out shadow-inner`}
                      style={{ width: `${item.percentage * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Liquidity Risks & Locked Liquidity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-rose-50 rounded-[3rem] p-12 border-2 border-rose-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10 text-rose-900">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
              <span className="text-3xl">âš ï¸</span>
              Impermanent Loss
            </h3>
            <p className="font-medium leading-relaxed opacity-80 mb-6">
              As a liquidity provider, if the price of {TOKEN_CONSTANTS.SYMBOL} changes significantly compared to BNB while in the pool, you may experience "impermanent loss".
            </p>
            <p className="font-medium leading-relaxed opacity-80">
              This is the risk of having less value than if you had simply held the assets separately. It's a fundamental mechanic of Automated Market Makers (AMMs) like PancakeSwap.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-[3rem] p-12 border-2 border-emerald-100 shadow-xl relative overflow-hidden">
          <div className="relative z-10 text-emerald-900">
            <h3 className="text-2xl font-black mb-4 flex items-center gap-3">
              <span className="text-3xl">ðŸ”’</span>
              Locked Liquidity
            </h3>
            <p className="font-medium leading-relaxed opacity-80 mb-6">
              Even if the pool is substantial, the public will only trust it if that liquidity is locked. Unlocked liquidity, no matter how large, is often viewed as a potential "rug pull" risk.
            </p>
            <p className="font-medium leading-relaxed opacity-80">
              We ensure our core liquidity is verifiably locked via smart contracts, decentralizing trust and securing the financial foundation of the Genius Protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenomicsView;

