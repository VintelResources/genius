"use client";

import React from 'react';
const { useState, useEffect } = React;
import { TOKEN_CONSTANTS } from '../types';
import type { UserProfile } from '../types';
import { connectWallet, getGeniusBalance } from '../services/Web3Service';

interface GeniusWalletProps {
  profile: UserProfile;
  globalLearnerSupply: number;
  onSwap: (amount: number, asset: 'BTC' | 'ETH' | 'SOL' | 'USDC', direction: 'G_TO_ASSET' | 'ASSET_TO_G') => boolean | void;
  onLinkWallet: (address: string) => void;
  onProfileUpdate?: (updated: Partial<UserProfile>) => void;
}

const GeniusWallet: React.FC<GeniusWalletProps> = ({ profile, globalLearnerSupply, onSwap, onLinkWallet, onProfileUpdate }) => {
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [targetAsset, setTargetAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'USDC'>('USDC');
  const [swapDirection, setSwapDirection] = useState<'G_TO_ASSET' | 'ASSET_TO_G'>('G_TO_ASSET');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncBalance = async () => {
      if (profile.isWalletLinked && profile.address) {
        setIsSyncing(true);
        try {
          const contractBalance = await getGeniusBalance(profile.address);
          if (onProfileUpdate && contractBalance !== profile.geniusTokens) {
            onProfileUpdate({ geniusTokens: contractBalance });
          }
        } catch (e) {
          console.error("Failed to sync balance:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    };
    syncBalance();
  }, [profile.isWalletLinked, profile.address]);

  const currentEpoch = Math.floor(globalLearnerSupply / TOKEN_CONSTANTS.HALVING_INTERVAL) + 1;
  const currentRate = TOKEN_CONSTANTS.EXCHANGE_RATES[targetAsset];
  
  let estimatedOutput = '0.0000';
  if (swapAmount) {
    if (swapDirection === 'G_TO_ASSET') {
      estimatedOutput = (parseFloat(swapAmount) * currentRate).toFixed(targetAsset === 'BTC' ? 8 : 4);
    } else {
      estimatedOutput = (parseFloat(swapAmount) / currentRate).toFixed(4); // Output is G
    }
  }

  const handleExecuteSwap = async () => {
    const amt = parseFloat(swapAmount);
    if (!amt || amt <= 0) return;

    if (swapDirection === 'G_TO_ASSET' && amt > profile.geniusTokens) return;
    if (swapDirection === 'ASSET_TO_G') {
      const balanceMap = {
        'BTC': profile.btcBalance,
        'ETH': profile.ethBalance,
        'SOL': profile.solBalance,
        'USDC': profile.usdcBalance
      };
      if (amt > balanceMap[targetAsset]) return;
    }

    setIsSwapping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = onSwap(amt, targetAsset, swapDirection);
    setIsSwapping(false);
    
    if (success) {
      setSwapAmount('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const getSourceBalance = () => {
    if (swapDirection === 'G_TO_ASSET') return profile.geniusTokens.toFixed(2) + ' G';
    const balanceMap = {
      'BTC': profile.btcBalance.toFixed(8),
      'ETH': profile.ethBalance.toFixed(4),
      'SOL': profile.solBalance.toFixed(4),
      'USDC': profile.usdcBalance.toFixed(2)
    };
    return balanceMap[targetAsset] + ' ' + targetAsset;
  };

  const isSwapDisabled = () => {
    if (isSwapping || !swapAmount) return true;
    const amt = parseFloat(swapAmount);
    if (isNaN(amt) || amt <= 0) return true;
    if (!profile.isWalletLinked && targetAsset === 'USDC') return true;

    if (swapDirection === 'G_TO_ASSET') {
      return amt > profile.geniusTokens;
    } else {
      const balanceMap = {
        'BTC': profile.btcBalance,
        'ETH': profile.ethBalance,
        'SOL': profile.solBalance,
        'USDC': profile.usdcBalance
      };
      return amt > balanceMap[targetAsset];
    }
  };

  const handleConnectWallet = async () => {
    setIsLinking(true);
    try {
      const address = await connectWallet();
      onLinkWallet(address);
    } catch (e: any) {
      alert("Failed to connect wallet: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-700 space-y-8 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter mb-4">The <span className="text-indigo-600">Vault.</span></h2>
          <p className="text-slate-400 text-xl font-medium">Your node's knowledge assets across the <span className="text-indigo-600">BNB Ecosystem</span>.</p>
        </div>
        {!profile.isWalletLinked ? (
          <button 
            onClick={handleConnectWallet}
            disabled={isLinking}
            className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black text-sm shadow-xl hover:bg-slate-900 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {isLinking ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'âš¡'}
            {isLinking ? 'Linking Wallet...' : 'Link Web3 Wallet'}
          </button>
        ) : (
          <div className="bg-indigo-50 px-6 py-4 rounded-[2rem] border border-indigo-100 flex flex-col items-end">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">BNB Identity Linked</span>
            <span className="text-sm font-black text-indigo-900 font-mono truncate max-w-[200px]">{profile.address}</span>
          </div>
        )}
      </header>

      {/* PRIMARY ACTION: ATOMIC BRIDGE (Now at the top) */}
      <section className="bg-slate-900 rounded-[4rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-indigo-500/30">
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center justify-between">
          <div className="max-w-md w-full">
            <div className="flex items-center gap-3 mb-2">
               <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">â›“ï¸</div>
               <h4 className="text-2xl font-black tracking-tight">BNB Native Bridge</h4>
            </div>
            <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">High-Performance Web3 Swap Protocol</p>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Convert your Knowledge Blocks (G) into liquidity across the BNB Smart Chain or external chains. 
            </p>
          </div>

          <div className="w-full lg:max-w-2xl grid md:grid-cols-7 items-center gap-4">
            <div className="md:col-span-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 relative">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                <span>Swap From</span>
                <span>Avail: {getSourceBalance()}</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-transparent text-3xl font-black outline-none w-full placeholder:text-white/10 tabular-nums"
                />
                <span className="font-black text-xl">{swapDirection === 'G_TO_ASSET' ? 'G' : targetAsset}</span>
              </div>
            </div>

            <div className="flex justify-center md:col-span-1">
              <button 
                onClick={() => setSwapDirection(prev => prev === 'G_TO_ASSET' ? 'ASSET_TO_G' : 'G_TO_ASSET')}
                className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 text-xl font-black hover:bg-indigo-500 hover:scale-110 active:scale-95 transition-all"
                title="Reverse Swap Direction"
              >
                â‡„
              </button>
            </div>

            <div className="md:col-span-3 bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
                <span>Swap To</span>
                <div className="flex gap-2">
                  {(['USDC', 'ETH', 'BTC', 'SOL'] as const).map(asset => (
                    <button 
                      key={asset} 
                      onClick={() => setTargetAsset(asset as any)}
                      className={`px-2 py-0.5 rounded-lg text-[9px] font-black transition-colors ${targetAsset === asset ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-slate-400'}`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-3xl font-black tabular-nums">{estimatedOutput}</span>
                <span className="font-black text-indigo-400 text-xl">{swapDirection === 'G_TO_ASSET' ? targetAsset : 'G'}</span>
              </div>
            </div>

            <div className="md:col-span-7 mt-2">
              {!profile.isWalletLinked && targetAsset === 'USDC' ? (
                <div className="bg-amber-500/20 border border-amber-500/50 p-4 rounded-2xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">âš ï¸</span>
                    <div className="text-xs font-bold">
                      <p className="text-amber-200">BNB Smart Chain Link Required</p>
                      <p className="text-amber-400 opacity-80">USDC swaps require a connected Web3 Wallet to ensure regulatory compliance.</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleConnectWallet}
                    disabled={isLinking}
                    className="shrink-0 bg-amber-500 text-slate-900 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-colors disabled:opacity-50"
                  >
                    {isLinking ? 'Linking...' : 'Link Wallet'}
                  </button>
                </div>
              ) : null}
              <button 
                onClick={handleExecuteSwap}
                disabled={isSwapDisabled()}
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                  showSuccess ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white hover:bg-white hover:text-indigo-600'
                }`}
              >
                {isSwapping ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : showSuccess ? (
                  <>âœ¨ Transaction Confirmed!</>
                ) : (
                  <>Execute Bridge Transaction</>
                )}
              </button>
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-[0.2em] mt-4">
                {targetAsset === 'ETH' ? 'âš¡ Native Settlement: Instant & Zero Fees' : 'âš ï¸ Cross-Chain Latency: ~5-10 Minutes Expected'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600 opacity-20 blur-[100px] rounded-full"></div>
        <div className="absolute top-0 right-0 p-12 text-[15rem] opacity-5 pointer-events-none rotate-12">â›“ï¸</div>
      </section>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-8 glass bg-white rounded-[4rem] p-12 md:p-16 text-slate-900 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[400px] border-2 border-slate-50">
           <div className="relative z-10">
              <span className="text-slate-400 font-black text-xs uppercase tracking-[0.4em] block mb-6">Knowledge Node Stash</span>
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-6 mb-12">
                 <div className="flex items-baseline gap-6 mb-4 md:mb-0">
                    <h3 className="text-7xl md:text-[9rem] font-black tracking-tighter tabular-nums leading-none">
                      {isSyncing ? <span className="animate-pulse">...</span> : profile.geniusTokens.toFixed(1)}
                    </h3>
                    <span className="text-3xl font-black text-indigo-600 uppercase tracking-widest">G</span>
                 </div>
                 
                 <div className="bg-gradient-to-r from-amber-100 to-amber-300 p-4 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center justify-center shrink-0 min-w-[200px]">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Vintel Membership</span>
                    <span className="text-xl font-black text-amber-900">
                      {profile.geniusTokens >= 1000 ? 'ðŸ‘‘ Mastermind' : profile.geniusTokens > 100 ? 'ðŸŽ“ Senior Genius' : 'ðŸŒ± Junior Genius'}
                    </span>
                    {profile.geniusTokens >= 1000 && <span className="text-[9px] font-bold text-amber-800 mt-1 uppercase">All Trivia Unlocked!</span>}
                 </div>
              </div>
           </div>
           
           <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-100 pt-12">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol Epoch</p>
                 <p className="text-2xl font-black">{currentEpoch}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Valuation</p>
                 <p className="text-2xl font-black text-emerald-600">${(profile.geniusTokens * 1.00).toFixed(2)}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified Blocks</p>
                 <p className="text-2xl font-black text-indigo-600">{profile.points}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Trust Score</p>
                 <p className={`text-2xl font-black ${profile.isWalletLinked ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {profile.isWalletLinked ? 'VERIFIED' : 'LOCAL'}
                 </p>
              </div>
           </div>
           
           <div className="absolute top-0 right-0 p-12 text-[20rem] opacity-[0.03] pointer-events-none rotate-12">ðŸ’Ž</div>
        </div>

        {/* Secondary Assets */}
        <div className="lg:col-span-4 glass rounded-[4rem] p-10 shadow-xl border-white border-2 space-y-6 flex flex-col justify-between">
           <div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8">Multi-Chain Portfolio</h4>
              <div className="space-y-4">
                  <div className="flex justify-between items-center bg-blue-50 p-6 rounded-3xl border border-blue-100">
                     <div className="flex items-center gap-4">
                        <span className="text-2xl">ðŸ’µ</span>
                        <span className="font-bold text-blue-900 text-lg">USDC</span>
                     </div>
                     <span className="font-black text-blue-600 text-xl">${profile.usdcBalance.toFixed(2)}</span>
                  </div>
                 <div className="flex justify-between items-center bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                    <div className="flex items-center gap-4">
                       <span className="text-2xl">âŸ </span>
                       <span className="font-bold text-indigo-900 text-lg">Ethereum (ETH)</span>
                    </div>
                    <span className="font-black text-indigo-600 text-xl">{profile.ethBalance.toFixed(4)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <span className="text-2xl text-amber-500">â‚¿</span>
                       <span className="font-bold text-slate-700 text-lg">Bitcoin</span>
                    </div>
                    <span className="font-black text-slate-900 text-xl">{profile.btcBalance.toFixed(8)}</span>
                 </div>
                 <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <span className="text-2xl text-purple-500">â—Ž</span>
                       <span className="font-bold text-slate-700 text-lg">Solana</span>
                    </div>
                    <span className="font-black text-slate-900 text-xl">{profile.solBalance.toFixed(4)}</span>
                 </div>
              </div>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                Aggregated Multi-Chain Value Verified on Web3
              </p>
           </div>
        </div>
      </div>

      {/* Transaction Ledger */}
      <div className="glass rounded-[4rem] overflow-hidden border-2 border-white shadow-2xl">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900">Multi-Chain Ledger</h3>
            <div className="flex items-center gap-3">
               <span className="hidden md:inline bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time Block Explorer</span>
               {profile.isWalletLinked && <span className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Protocol Proof Verified</span>}
            </div>
         </div>
         <div className="divide-y divide-slate-50">
            {profile.transactions.map((tx, i) => (
               <div key={i} className="p-8 md:p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-8">
                     <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl shadow-sm ${
                        tx.type === 'DONATE' ? 'bg-rose-50 text-rose-500' :
                        tx.type === 'REFERRAL' ? 'bg-indigo-50 text-indigo-500' :
                        tx.targetAsset === 'ETH' ? 'bg-indigo-50 text-indigo-600' : (tx.type === 'SWAP' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-600')
                     }`}>
                        {tx.type === 'DONATE' ? 'â¤ï¸' : tx.type === 'REFERRAL' ? 'ðŸŽ' : (tx.targetAsset === 'ETH' ? 'âš¡' : (tx.type === 'SWAP' ? 'â›“ï¸' : 'â›ï¸'))}
                     </div>
                     <div>
                        <p className="text-xl font-black text-slate-900 mb-1 leading-none">{tx.description}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-3">
                           <span className="bg-slate-100 px-2 py-0.5 rounded-md font-mono">{tx.id.toUpperCase()}</span>
                           <span>{new Date(tx.timestamp).toLocaleString()}</span>
                        </p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-2xl md:text-4xl font-black ${tx.amount < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {tx.amount < 0 ? '-' : '+'}{Math.abs(tx.amount).toFixed(4)} G
                     </p>
                     {tx.targetAmount && (
                       <p className="text-xs font-black text-slate-500 mt-2 bg-slate-50 px-3 py-1 rounded-lg inline-block">
                          Settled: {tx.targetAmount.toFixed(tx.targetAsset === 'BTC' ? 8 : 4)} {tx.targetAsset}
                       </p>
                     )}
                  </div>
               </div>
            ))}
            {profile.transactions.length === 0 && (
              <div className="p-32 text-center">
                 <div className="text-6xl mb-6 opacity-20 grayscale">â›ï¸</div>
                 <p className="text-slate-300 font-black text-2xl uppercase tracking-widest">No Node Operations Recorded</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default GeniusWallet;



