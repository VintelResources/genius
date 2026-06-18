"use client";

import React, { useState } from 'react';
import { TOKEN_CONSTANTS } from '../types';
import type { UserProfile, Transaction } from '../types';
import { donateToFoundation } from '../services/Web3Service';

interface FoundationViewProps {
  profile: UserProfile;
  onDonate: (amount: number) => void;
}

const FoundationView: React.FC<FoundationViewProps> = ({ profile, onDonate }) => {
  const [donateAmount, setDonateAmount] = useState<number>(0);
  const [isDonating, setIsDonating] = useState(false);

  const handleDonate = async () => {
    if (donateAmount <= 0) return;
    
    setIsDonating(true);
    try {
      if (profile.isWalletLinked) {
        await donateToFoundation(donateAmount.toString(), true);
      }
      onDonate(donateAmount);
      setDonateAmount(0);
    } catch (e: any) {
      console.error(e);
      alert((e instanceof Error ? e.message : "Donation failed. Please ensure your wallet is connected and you have enough BNB for gas."));
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-12">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          ðŸ›ï¸
        </div>
        <p className="text-[10px] font-black tracking-widest uppercase text-rose-500 mb-4">Give Back to the Community</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">Genius Foundation</h2>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Funds donated here will be used to expand the Genius Foundation Initiatives to help learners across the globe with opportunities such as scholarships.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass rounded-[3rem] p-8 md:p-12 border-2 border-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none -mt-4 -mr-4">ðŸª™</div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Your Available Balance</p>
          <p className="text-4xl font-black text-slate-900 relative z-10">{profile.geniusTokens.toFixed(3)} G</p>
          
          <div className="mt-8 space-y-6 relative z-10">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3">Donation Amount (G)</label>
              <input
                type="number"
                value={donateAmount || ''}
                onChange={(e) => setDonateAmount(Number(e.target.value))}
                min="0.001"
                step="0.001"
                max={profile.geniusTokens}
                className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-xl font-black text-slate-900 focus:outline-none focus:border-rose-400 focus:bg-white transition-all shadow-inner"
                placeholder="0.000"
              />
              {donateAmount > 0 && (
                <p className="text-xs font-bold text-slate-400 mt-3 flex items-center gap-2">
                  <span className="text-emerald-500">â‡„</span> Converts to: <span className="text-emerald-600">{(donateAmount * TOKEN_CONSTANTS.EXCHANGE_RATES.USDC).toFixed(4)} USDT</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map(percent => (
                <button
                  key={percent}
                  onClick={() => setDonateAmount(profile.geniusTokens * (percent / 100))}
                  className="bg-white border-2 border-slate-100 rounded-xl py-2 text-xs font-black text-slate-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                >
                  {percent}%
                </button>
              ))}
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] font-black uppercase text-slate-400">Target Vault (BNB Smart Chain)</p>
                 <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest">
                   âœ… Direct to Vault Verified
                 </span>
               </div>
               <a href="https://bscscan.com/address/0x1405c42c470d5e979cbbb8d0ef207e0e3cd93100" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-slate-600 break-all hover:text-indigo-600 transition-colors flex items-center gap-2 mb-3">
                 0x1405c42c470d5e979cbbb8d0ef207e0e3cd93100 <span className="text-indigo-400">â†—</span>
               </a>
               <div className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                 <span className="text-base">ðŸ”</span>
                 <div>
                   <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Multi-Sig Safe Wallet</p>
                   <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Institutional-Grade Security</p>
                 </div>
               </div>
            </div>

            <button
              onClick={handleDonate}
              disabled={isDonating || donateAmount <= 0 || donateAmount > profile.geniusTokens}
              className="w-full bg-rose-500 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-rose-200 hover:bg-rose-600 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
               {isDonating ? (
                 <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                 </>
               ) : (
                 'Support the Foundation'
               )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent"></div>
          <h3 className="text-2xl font-black mb-6 relative z-10">Where your donation goes</h3>
          <ul className="space-y-6 relative z-10">
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-black">1</div>
              <div>
                <p className="font-bold mb-1">Global Scholarships</p>
                <p className="text-sm text-slate-400 leading-relaxed">Provide financial aid to deserving learners around the world, enabling access to premium education.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-black">2</div>
              <div>
                <p className="font-bold mb-1">Educational Development</p>
                <p className="text-sm text-slate-400 leading-relaxed">Support the creation of new courses, AI tools, and learning materials.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-black">3</div>
              <div>
                <p className="font-bold mb-1">Community Growth</p>
                <p className="text-sm text-slate-400 leading-relaxed">Expand the Genius token ecosystem and its positive impact globally.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FoundationView;



