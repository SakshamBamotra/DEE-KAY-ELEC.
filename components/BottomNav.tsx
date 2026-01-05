import React from 'react';
import { LayoutDashboard, Package, PlusCircle, BrainCircuit, History } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'inventory', label: 'Items', icon: Package },
    { id: 'add-product', label: 'Add', icon: PlusCircle },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'ai-analyst', label: 'AI', icon: BrainCircuit },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 lg:hidden z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform ${
                isActive ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? 'bg-indigo-50' : ''}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;