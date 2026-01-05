import React from 'react';
import { LayoutDashboard, Package, PlusCircle, BrainCircuit, Tv, Settings, LogOut, History } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'All Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'ai-analyst', label: 'AI Analyst', icon: BrainCircuit },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-white h-screen sticky top-0">
        <div className="flex items-center gap-3 p-6 border-b border-slate-700">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">DEE KAY ELEC.</h1>
            <p className="text-xs text-slate-400">Inventory Management</p>
          </div>
        </div>

        <nav className="p-4 space-y-2 mt-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ViewState)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${currentView === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg w-full transition-colors">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
            </button>
            <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg w-full transition-colors mt-1">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
            </button>
        </div>
    </aside>
  );
};

export default Sidebar;