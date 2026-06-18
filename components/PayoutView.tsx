"use client";

import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { connectWallet, getPositionNFTMetadata } from '../services/Web3Service';

interface PayoutViewProps {
  profile: UserProfile;
  onUpdateAddress: (address: string) => void;
}

const VAULT_ADDRESS = "0x1fbc6ABD9E88F6dd7bFFb134c866928597a8817E"; // GENIUS Contract

const PayoutView: React.FC<PayoutViewProps> = ({ profile, onUpdateAddress }) => {
  const [loading, setLoading] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [nftImage, setNftImage] = useState<string | null>(null);

  // If the user accidentally saved the vault address as their profile address, clear it out.
  useEffect(() => {
    if (profile.address === VAULT_ADDRESS) {
      onUpdateAddress('');
    }
  }, [profile.address, onUpdateAddress]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const metadata = await getPositionNFTMetadata();
        if (metadata && typeof metadata === "object" && "image" in metadata && metadata.image) {
          setNftImage(metadata.image);
        }
      } catch(e) {
        console.error("Failed to parse metadata", e);
      }
    }
    fetchMetadata();
  }, []);

  const handleConnectWallet = async (walletName: string) => {
    setLoading(true);
    setShowWalletModal(false);
    try {
      const address = await connectWallet();
      onUpdateAddress(address);
    } catch (err: any) {
      alert(`Failed to connect ${walletName}: ` + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const isWalletConnected = profile.address && profile.address !== VAULT_ADDRESS;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-2xl mx-auto px-4 py-12">
      <div className="w-24 h-24 bg-rose-100 rounded-3xl flex items-center justify-center text-5xl mb-8 shadow-inner shadow-rose-200">
        ðŸ¦
      </div>
      
      <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-4">
        Rewards <span className="text-rose-600">Payout</span>
      </h2>
      
      <p className="text-slate-500 font-medium text-lg leading-relaxed mb-8">
        The GENIUS Smart Contract securely handles the GENIUS Position and operates autonomously on the BNB Smart Chain. 
        <strong className="block mt-4 text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 font-bold text-sm">
          Its primary function is to directly payout <span className="uppercase tracking-widest text-emerald-800">deserving learners</span> who meet the following parameters:
          <br /><br />
          ðŸ“š Select an Academic Subject<br />
          ðŸ† Attain a 100% Score on the Exam
        </strong>
      </p>

      {nftImage && (
        <div className="w-full bg-slate-900 rounded-[3rem] p-8 mb-8 shadow-2xl border-4 border-slate-800 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 bottom-0 pointer-events-none"></div>
          <p className="text-slate-300 font-black text-sm uppercase tracking-widest mb-4 z-20 relative">Live Liquidity Backing</p>
          <div className="flex justify-center z-20 relative">
             <img src={nftImage} alt="PancakeSwap V3 NFT" className="w-[250px] object-cover rounded-2xl shadow-indigo-500/20 shadow-2xl border border-white/10" />
          </div>
        </div>
      )}

      <div className="w-full bg-white p-8 rounded-[3rem] shadow-xl border-4 border-slate-50 relative overflow-hidden">
        <label className="flex flex-col sm:flex-row sm:items-center justify-between text-left text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 gap-2">
          <span>Your Receiving Account</span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 w-fit">
            <span className="w-1.5 h-1.5 relative flex items-center justify-center shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            LP Position #812410 Active (BNB Sync)
          </span>
        </label>
        
        {isWalletConnected ? (
           <div className="w-full bg-slate-50 border-2 border-emerald-200 px-6 py-5 rounded-2xl mb-6">
              <p className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-1">Wallet Connected & Verified</p>
              <p className="text-lg font-mono text-slate-900 truncate">{profile.address}</p>
           </div>
        ) : (
           <div className="w-full bg-slate-50 border-2 border-slate-100 px-6 py-5 rounded-2xl mb-6 text-slate-400 font-mono">
              0x... Wallet not connected
           </div>
        )}

        <button 
          onClick={() => setShowWalletModal(true)}
          disabled={loading}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
            isWalletConnected 
              ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-xl hover:bg-emerald-600' 
              : 'bg-rose-600 text-white shadow-rose-200 shadow-xl hover:bg-slate-900 hover:shadow-slate-200'
          }`}
        >
          {loading ? 'Connecting...' : isWalletConnected ? 'Update Web3 Wallet' : 'Connect Web3 Wallet To Receive'}
        </button>

        <p className="text-xs text-slate-400 font-bold mt-6 text-center">
          Tokens are instantly transferred over the blockchain from the Smart Contract ({VAULT_ADDRESS.slice(0,6)}...{VAULT_ADDRESS.slice(-4)}) to your wallet upon completing exam parameters. Ensure you bridge out using the <span className="text-amber-500 font-black">BEP-20 Standard</span> to avoid loss of funds.
        </p>

        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative">
              <button 
                onClick={() => setShowWalletModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                âœ•
              </button>
              <h3 className="text-xl font-black text-slate-900 mb-2">Connect Wallet</h3>
              <p className="text-sm font-medium text-slate-500 mb-6">Select your preferred Web3 provider to receive exam payouts.</p>
              
              <div className="space-y-3">
                <button 
                  onClick={() => handleConnectWallet("MetaMask")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">ðŸ¦Š</div>
                  <span className="font-bold text-slate-700">MetaMask</span>
                </button>
                <button 
                  onClick={() => handleConnectWallet("Coinbase Wallet")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">ðŸ›¡ï¸</div>
                  <span className="font-bold text-slate-700">Coinbase Wallet</span>
                </button>
                <button 
                  onClick={() => handleConnectWallet("Trust Wallet")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">ðŸ”</div>
                  <span className="font-bold text-slate-700">Trust Wallet</span>
                </button>
                <button 
                  onClick={() => handleConnectWallet("Browser Defaut")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-slate-800 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">ðŸŒ</div>
                  <span className="font-bold text-slate-700">Browser Extension</span>
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-6 font-bold uppercase tracking-widest">Supports EIP-1193 Providers</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutView;





