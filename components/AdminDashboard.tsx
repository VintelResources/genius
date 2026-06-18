"use client";

import React, { useState, useMemo } from 'react';
import { FoundationTreasury, TOKEN_CONSTANTS } from '../types';
import GlobalIndexView from './GlobalIndexView';

interface AdminDashboardProps {
  treasury: FoundationTreasury;
  onUpdateTreasury: (treasury: FoundationTreasury) => void;
  globalLearnerSupply: number;
  globalUserCount: number;
  siteVisits?: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ treasury, onUpdateTreasury, globalLearnerSupply, globalUserCount, siteVisits = 0 }) => {
  const [activeVault, setActiveVault] = useState<keyof FoundationTreasury | null>(null);
  const [adminView, setAdminView] = useState<'treasury' | 'benchmarks' | 'master_vault'>('treasury');
  const [amount, setAmount] = useState<string>('');
  const [logs, setLogs] = useState<{ id: string; action: string; time: string; amount: number }[]>([]);

  const maxSupply = TOKEN_CONSTANTS.MAX_SUPPLY;
  const distribution = TOKEN_CONSTANTS.DISTRIBUTION;

  const networkUtilityIndex = Math.pow(globalUserCount / 1000, 2).toFixed(2);
  const economicValueSim = (parseFloat(networkUtilityIndex) * 1.5).toFixed(2);

  const handleWithdraw = () => {
    if (!activeVault || isNaN(Number(amount)) || Number(amount) <= 0) return;
    const numAmount = Number(amount);
    
    if (treasury[activeVault] < numAmount) {
      alert("Insufficient funds in vault!");
      return;
    }

    const updated: FoundationTreasury = {
      ...treasury,
      operationalWallet: treasury.operationalWallet + numAmount,
      totalWithdrawn: treasury.totalWithdrawn + numAmount,
      [activeVault]: (treasury[activeVault] as number) - numAmount
    };

    onUpdateTreasury(updated);
    setLogs(prev => [{
      id: Math.random().toString(36),
      action: `Treasury Transfer: ${String(activeVault).replace('Vault', '')}`,
      time: new Date().toLocaleTimeString(),
      amount: numAmount
    }, ...prev]);
    setAmount('');
    setActiveVault(null);
  };

  const vaults = useMemo(() => [
    { key: 'ecosystemVault', label: 'Ecosystem Growth', icon: 'ðŸŒ±', color: 'bg-emerald-500', total: maxSupply * distribution.ECOSYSTEM },
    { key: 'partnershipVault', label: 'Strategic Partnerships', icon: 'ðŸ¤', color: 'bg-blue-500', total: maxSupply * distribution.PARTNERSHIPS },
    { key: 'teamVault', label: 'Core Team & Dev', icon: 'ðŸ› ï¸', color: 'bg-amber-500', total: maxSupply * distribution.TEAM },
    { key: 'liquidityVault', label: 'Market Liquidity', icon: 'ðŸŒŠ', color: 'bg-rose-500', total: maxSupply * distribution.LIQUIDITY },
  ], [maxSupply, distribution]);

  const learnerRewardsTotal = maxSupply * distribution.LEARNERS;
  const learnerProgress = (globalLearnerSupply / learnerRewardsTotal) * 100;

  const unlockMasterVault = () => {
    const pw = prompt("SECURITY CHALLENGE: Enter Protocol Master Password:");
    if (pw === "PROTOCOL_SATOSHI_21M") {
      setAdminView('master_vault');
    } else {
      alert("UNAUTHORIZED ACCESS DENIED. Encryption lock active.");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Hosting Authority Platform</span>
            <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Real-time Sync Active
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
            Admin <span className="text-indigo-600">Console.</span> ðŸ›ï¸
          </h2>
          <div className="flex bg-white p-1 rounded-2xl border-2 border-slate-50 shadow-sm mb-6 w-fit">
            <button 
              onClick={() => setAdminView('treasury')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminView === 'treasury' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setAdminView('benchmarks')}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminView === 'benchmarks' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Benchmarks
            </button>
            <button 
              onClick={unlockMasterVault}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminView === 'master_vault' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-indigo-600'}`}
            >
              Master Vault ðŸ”’
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-[2rem] shadow-sm flex flex-col items-center justify-center min-w-[200px] animate-pulse">
           <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Root Access Key</p>
           <p className="text-4xl font-black text-amber-900 font-mono">2025</p>
           <p className="text-[9px] font-bold text-amber-400 mt-2">Authorized Personnel Only</p>
        </div>
      </header>

      {adminView === 'benchmarks' ? (
        <GlobalIndexView />
      ) : adminView === 'master_vault' ? (
        <div className="animate-in zoom-in-95 duration-500">
           <div className="bg-slate-900 rounded-[4rem] p-16 text-white border-4 border-indigo-500/30 shadow-[0_0_100px_rgba(79,70,229,0.2)]">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="text-5xl font-black mb-4 tracking-tighter">PROTOCOL RESERVES</h3>
                  <p className="text-indigo-300 font-bold uppercase tracking-[0.4em] text-xs">Genesis Allocation Vault</p>
                </div>
                <div className="text-right">
                  <span className="bg-indigo-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">Super-Admin Access</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                 {vaults.map(v => (
                   <div key={v.key} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md group hover:bg-white/10 transition-colors">
                      <div className="text-3xl mb-4">{v.icon}</div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</p>
                      <p className="text-2xl font-black text-white">{(treasury[v.key as keyof FoundationTreasury] as number).toLocaleString()} G</p>
                      <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                         <div className={`${v.color} h-full`} style={{ width: `${((treasury[v.key as keyof FoundationTreasury] as number) / v.total) * 100}%` }}></div>
                      </div>
                   </div>
                 ))}
              </div>

              <button 
                onClick={() => setAdminView('treasury')}
                className="w-full py-6 rounded-3xl bg-white text-slate-900 font-black text-xl hover:bg-indigo-400 hover:text-white transition-all shadow-2xl"
              >
                Exit Secure Vault
              </button>
           </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden group border border-white/10">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-xs font-black text-indigo-300 uppercase tracking-[0.3em] mb-4">System Utility & Network Effects</h3>
                    <div className="flex items-end gap-4">
                      <span className="text-7xl md:text-8xl font-black text-white tabular-nums tracking-tighter leading-none">
                        {networkUtilityIndex}
                      </span>
                      <div className="mb-2">
                        <p className="text-2xl font-black text-indigo-400 uppercase tracking-tighter leading-none">Index</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Metcalfe Factor</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <p className="text-4xl font-black text-emerald-400">{globalUserCount.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-1">Active Nodes</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                    <p className="text-4xl font-black text-amber-400">{siteVisits.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-1">Site Visits</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[4rem] p-12 border-2 border-slate-50 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Ops Balance</h3>
                <div className="text-4xl font-black text-indigo-600 mb-2">{treasury.operationalWallet.toLocaleString()} G</div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


