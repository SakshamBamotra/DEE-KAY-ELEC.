import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Package, AlertTriangle, Wallet } from 'lucide-react';
import { Product, ViewState, Category } from '../types';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface DashboardProps {
  products: Product[];
  onNavigate: (view: ViewState) => void;
}

// Define the exact display order requested
const CATEGORY_ORDER = [
  Category.TV,
  Category.Fridge,
  Category.WashingMachine,
  Category.AC,
  Category.Inverter,
  Category.Battery,
  Category.WaterFilter,
  Category.JuicerMixer,
  Category.Transformer,
  // Other categories will be appended after these
];

const Dashboard: React.FC<DashboardProps> = ({ products, onNavigate }) => {
  
  const stats = useMemo(() => {
    const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
    const totalValue = products.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);
    const lowStockItems = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);
    
    // Calculate total stock quantity per category
    const catStockMap = new Map<string, number>();
    
    // Initialize map with 0 for all categories to ensure they exist in order
    Object.values(Category).forEach(cat => catStockMap.set(cat, 0));

    products.forEach(p => {
      const current = catStockMap.get(p.category) || 0;
      catStockMap.set(p.category, current + p.stock);
    });

    // Sort based on the predefined CATEGORY_ORDER
    const categoryStock = Array.from(catStockMap.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0) // Only show categories with stock
      .sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a.name as Category);
        const indexB = CATEGORY_ORDER.indexOf(b.name as Category);
        
        // If both are in the priority list, sort by index
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        
        // If A is in list but B isn't, A comes first
        if (indexA !== -1) return -1;
        
        // If B is in list but A isn't, B comes first
        if (indexB !== -1) return 1;
        
        // Otherwise sort alphabetically or keep original order
        return 0; 
      });

    return { totalStock, totalValue, lowStockItems, categoryStock };
  }, [products]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Home</h2>
          <p className="text-slate-500">Inventory Overview</p>
        </div>
        <button 
            onClick={() => onNavigate('add-product')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            + Quick Add
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Items Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
            <p className="text-slate-500 font-medium text-sm mb-1">Total Items</p>
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{stats.totalStock}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
            <Package className="w-6 h-6 text-indigo-600" />
            </div>
        </div>

        {/* Total Value Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
            <p className="text-slate-500 font-medium text-sm mb-1">Total Value</p>
            <h3 className="text-3xl font-bold text-emerald-700 tracking-tight">₹{(stats.totalValue / 100000).toFixed(2)}L</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
            <Wallet className="w-6 h-6 text-emerald-600" />
            </div>
        </div>

        {/* Low Stock Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between cursor-pointer hover:border-amber-200 transition-colors" onClick={() => onNavigate('inventory')}>
            <div>
            <p className="text-slate-500 font-medium text-sm mb-1">Low Stock Alerts</p>
            <h3 className="text-3xl font-bold text-amber-600 tracking-tight">{stats.lowStockItems.length}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
        </div>
      </div>

      {/* Critical Stock Section */}
      {stats.lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <h3 className="text-amber-800 font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Action Required: Reorder List
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stats.lowStockItems.slice(0, 6).map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-amber-100 flex justify-between items-center shadow-sm">
                          <div>
                              <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.company} • {item.category}</p>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                              Only {item.stock} left
                          </span>
                      </div>
                  ))}
                  {stats.lowStockItems.length > 6 && (
                      <button onClick={() => onNavigate('inventory')} className="text-sm font-medium text-amber-700 hover:underline">
                          + {stats.lowStockItems.length - 6} more items...
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* Category Stock Graph */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Stock Quantity by Category</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.categoryStock}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={140} 
                tick={{fontSize: 13, fill: '#475569', fontWeight: 500}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
              />
              <Bar 
                dataKey="value" 
                name="Quantity" 
                fill="#6366f1" 
                radius={[0, 6, 6, 0]} 
                barSize={24}
                label={{ position: 'right', fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;