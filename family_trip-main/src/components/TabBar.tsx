import React from 'react';
import { CalendarDays, Map, UtensilsCrossed, Wallet, BookOpen } from 'lucide-react';
import { TabType } from '../types';

interface TabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'itinerary' as TabType,
      label: '일정표',
      icon: CalendarDays,
      activeBg: 'bg-rose-600 text-white ring-2 ring-rose-400/60 shadow-md',
      inactiveIcon: 'text-rose-400',
    },
    {
      id: 'map' as TabType,
      label: '지도·지하철',
      icon: Map,
      activeBg: 'bg-blue-600 text-white ring-2 ring-blue-400/60 shadow-md',
      inactiveIcon: 'text-blue-400',
    },
    {
      id: 'gourmet' as TabType,
      label: '맛집·명소',
      icon: UtensilsCrossed,
      activeBg: 'bg-amber-600 text-white ring-2 ring-amber-400/60 shadow-md',
      inactiveIcon: 'text-amber-400',
    },
    {
      id: 'budget' as TabType,
      label: '가계부',
      icon: Wallet,
      activeBg: 'bg-emerald-600 text-white ring-2 ring-emerald-400/60 shadow-md',
      inactiveIcon: 'text-emerald-400',
    },
    {
      id: 'guide' as TabType,
      label: '가이드·AI',
      icon: BookOpen,
      activeBg: 'bg-purple-600 text-white ring-2 ring-purple-400/60 shadow-md',
      inactiveIcon: 'text-purple-400',
    },
  ];

  return (
    <nav className="bg-slate-900 border-t border-slate-800 shadow-md">
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-1.5">
        <div className="grid grid-cols-5 gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all select-none cursor-pointer ${
                  isActive
                    ? `${tab.activeBg} font-bold scale-[1.02]`
                    : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : tab.inactiveIcon}`} />
                </div>
                <span className={`text-[11px] sm:text-xs leading-tight mt-0.5 tracking-tight whitespace-nowrap ${isActive ? 'font-bold text-white' : 'text-slate-200'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
