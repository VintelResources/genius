"use client";

import React from 'react';
import { UserProfile } from './types';

interface LeaderboardProps {
  currentUser: UserProfile;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentUser }) => {
  // For now, it only reflects the current user until real multiplayer backend records traffic
  const allUsers = [
    { name: currentUser.name, points: currentUser.points, earnings: currentUser.geniusTokens, avatar: currentUser.avatar, isCurrent: true }
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter">Global <span className="text-indigo-600">Hall of Fame</span></h2>
        <p className="text-slate-400 text-xl font-medium">The top neural miners in the global knowledge economy.</p>
        <p className="text-indigo-500 font-bold mt-4 uppercase tracking-widest text-xs border border-indigo-100 bg-indigo-50 py-2 px-4 rounded-full inline-block">
          Awaiting Global Traffic Registration
        </p>
      </header>

      <div className="bg-white rounded-[3.5rem] border-2 border-slate-50 shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex gap-10">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rank</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scholar</span>
          </div>
          <div className="flex gap-16">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Points</span>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Earnings</span>
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {allUsers.map((user, idx) => (
            <div 
              key={user.name} 
              className={`p-6 flex items-center justify-between transition-all ${user.isCurrent ? 'bg-indigo-50/50 border-l-8 border-l-indigo-600' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-8">
                <span className={`w-8 text-center font-black text-xl ${idx < 3 ? 'text-indigo-600' : 'text-slate-300'}`}>
                  {idx === 0 ? 'ðŸ¥‡' : idx === 1 ? 'ðŸ¥ˆ' : idx === 2 ? 'ðŸ¥‰' : idx + 1}
                </span>
                <div className="flex items-center gap-4">
                  <img src={user.avatar} className="w-12 h-12 rounded-2xl border-2 border-slate-100 shadow-sm" alt="" />
                  <div>
                    <p className="font-black text-slate-800 text-lg leading-tight">{user.name}</p>
                    {user.isCurrent && <span className="text-[8px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-full">You</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-12 text-right">
                <div className="w-20">
                  <p className="font-black text-slate-800">{user.points}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400">Mastery</p>
                </div>
                <div className="w-20">
                  <p className="font-black text-indigo-600">{user.earnings.toFixed(2)} G</p>
                  <p className="text-[8px] font-black uppercase text-slate-400">Minted</p>
                </div>
              </div>
            </div>
          ))}
          {allUsers.length === 1 && (
            <div className="p-12 text-center text-slate-400">
              <p className="font-medium">You are the first pioneer. Invite others to compete!</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 bg-indigo-900 rounded-[3rem] p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black mb-2">Reflective Ecosystem</h3>
            <p className="text-indigo-200 opacity-80 max-w-md">Traffic drops are being recorded. As more users join the ecosystem, their stats will dynamically populate this leaderboard.</p>
          </div>
          <div className="text-6xl">ðŸŒ</div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-transparent opacity-50"></div>
      </div>
    </div>
  );
};

export default Leaderboard;

