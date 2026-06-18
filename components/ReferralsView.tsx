"use client";

import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface ReferralsViewProps {
  profile: UserProfile;
  onRedeemCode: (code: string) => { success: boolean; message: string };
  onSimulateReferral: () => void;
}

const ReferralsView: React.FC<ReferralsViewProps> = ({ profile, onRedeemCode, onSimulateReferral }) => {
  const [codeToRedeem, setCodeToRedeem] = useState('');
  const [redeemResult, setRedeemResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const handleCopyCode = async () => {
    if (profile.referralCode) {
      await navigator.clipboard.writeText(profile.referralCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    if (profile.referralCode) {
      const baseUrl = window.location.origin + window.location.pathname;
      const referralLink = `${baseUrl}?ref=${profile.referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  };

  const handleRedeem = () => {
    if (!codeToRedeem.trim()) return;
    const result = onRedeemCode(codeToRedeem.trim());
    setRedeemResult(result);
    if (result.success) setCodeToRedeem('');
    setTimeout(() => setRedeemResult(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="text-center mb-12">
        <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner">
          ðŸ¤
        </div>
        <p className="text-[10px] font-black tracking-widest uppercase text-indigo-500 mb-4">Grow the Community</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4">Refer and Earn</h2>
        <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
          Invite your friends to Little Genius and you both earn a bonus of 0.0001 Genius Tokens when they join!
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Your Referral Code</p>
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative group">
               <h3 className="text-4xl font-mono font-black text-slate-900 tracking-widest mb-4">
                 {profile.referralCode || 'N/A'}
               </h3>
               <div className="flex gap-2">
                 <button 
                   onClick={handleCopyCode}
                   className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs flex items-center gap-2 font-black uppercase tracking-widest hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-md shadow-indigo-200"
                 >
                   <span>{isCopied ? 'Copied! âœ“' : 'Copy Code ðŸ“‹'}</span>
                 </button>
                 <button 
                   onClick={handleCopyLink}
                   className="bg-white border-2 border-indigo-100 text-indigo-600 px-6 py-2 rounded-xl text-xs flex items-center gap-2 font-black uppercase tracking-widest hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
                 >
                   <span>{isLinkCopied ? 'Link Copied! âœ“' : 'Copy Link ðŸ”—'}</span>
                 </button>
               </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between border-t-2 border-slate-50 pt-8">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Referrals</p>
              <p className="text-3xl font-black text-indigo-600">{profile.referralCount || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
              <p className="text-3xl font-black text-emerald-600">{(profile.referralCount || 0) * 0.0001} G</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          {!profile.referredBy ? (
            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex-1">
              <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 pointer-events-none -mt-4 -mr-4">ðŸŽ</div>
              <h3 className="text-2xl font-black text-white mb-2 relative z-10">Were you invited?</h3>
              <p className="text-slate-400 font-medium mb-8 relative z-10 text-sm">
                Enter your friend's referral code to claim your 0.0001 G welcome bonus.
              </p>
              
              <div className="space-y-4 relative z-10">
                <input
                  type="text"
                  maxLength={6}
                  value={codeToRedeem}
                  onChange={(e) => setCodeToRedeem(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 text-2xl font-mono font-black text-white focus:outline-none focus:border-indigo-400 focus:bg-white/10 transition-all text-center tracking-widest uppercase"
                  placeholder="CODE"
                />
                
                <button
                  onClick={handleRedeem}
                  disabled={codeToRedeem.length < 3}
                  className="w-full bg-indigo-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-400 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                >
                   Redeem Code
                </button>
                {redeemResult && (
                  <p className={`text-center font-bold text-sm bg-black/20 py-2 rounded-xl border ${redeemResult.success ? 'text-emerald-400 border-emerald-500/30' : 'text-rose-400 border-rose-500/30'}`}>
                    {redeemResult.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[3rem] p-8 md:p-10 shadow-xl flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-200 text-emerald-600 rounded-full flex items-center justify-center text-3xl mb-4 shadow-sm">
                ðŸŽ‰
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Welcome Bonus Claimed!</h3>
              <p className="text-sm font-medium text-slate-500">
                You were referred by <span className="font-bold text-emerald-600">{profile.referredBy}</span>. You've successfully received your 0.0001 G bonus.
              </p>
            </div>
          )}

          <div className="bg-amber-50 rounded-3xl p-6 border-2 border-amber-100 relative">
             <p className="text-xs font-bold text-amber-800 mb-3 flex items-center gap-2">
               <span className="text-amber-500">ðŸ§ª</span> 
               Developer Tool
             </p>
             <button 
               onClick={onSimulateReferral}
               className="w-full bg-white border-2 border-amber-200 text-amber-700 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 hover:border-amber-300 transition-all active:scale-95"
             >
               Simulate Someone Using Your Code
             </button>
             <p className="text-[10px] text-amber-600 mt-3 font-medium opacity-80 text-center">
               Since this is a demo environment, click this to simulate a successful referral!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsView;


