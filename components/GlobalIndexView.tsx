"use client";

import React from 'react';
const { useState, useMemo } = React;
import { GKI_2020_DATA, GKIEntry } from '../app/knowledgeData';

const GlobalIndexView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSort, setActiveSort] = useState<keyof GKIEntry>('rank');
  const [activeTab, setActiveTab] = useState<'all' | 'top'>('all');

  const categories = [
    { key: 'value', label: 'Global Score', icon: 'ðŸŒ' },
    { key: 'preUni', label: 'Pre-University', icon: 'ðŸŽ’' },
    { key: 'tvet', label: 'Vocational/TVET', icon: 'ðŸ› ï¸' },
    { key: 'higherEd', label: 'Higher Ed', icon: 'ðŸŽ“' },
    { key: 'rdi', label: 'Research (RDI)', icon: 'ðŸ”¬' },
    { key: 'ict', label: 'ICT Tech', icon: 'ðŸ“±' },
    { key: 'economy', label: 'Economy', icon: 'ðŸ“ˆ' },
    { key: 'env', label: 'Enabling Env', icon: 'ðŸ›¡ï¸' },
  ];

  const filteredData = useMemo(() => {
    let list = GKI_2020_DATA.filter(c => 
      c.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (activeTab === 'top') {
      list = list.filter(c => c.rank <= 10);
    }

    return list.sort((a, b) => {
      if (activeSort === 'rank' || activeSort === 'country') {
        return a[activeSort] > b[activeSort] ? 1 : -1;
      }
      return b[activeSort] > a[activeSort] ? 1 : -1;
    });
  }, [searchTerm, activeSort, activeTab]);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20 max-w-7xl mx-auto">
      <header className="mb-12">
        <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-none">
          Global <span className="text-indigo-600">Knowledge</span> Index.
        </h2>
      </header>

      <div className="bg-white p-4 rounded-[2.5rem] border-2 border-slate-50 shadow-lg mb-8 flex flex-col lg:flex-row gap-6 items-center">
        <input 
          type="text" 
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-50 p-4 rounded-2xl"
        />
      </div>

      <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-left">Rank</th>
                <th className="p-6 text-left">Node</th>
                <th className="p-6 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((entry) => (
                <tr key={entry.country} className="border-b border-slate-50">
                  <td className="p-6">{entry.rank}</td>
                  <td className="p-6 font-black">{entry.country}</td>
                  <td className="p-6 text-center font-black text-indigo-600">{entry.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );
};

export default GlobalIndexView;

