import React, { useState, useMemo } from 'react';
import { Search, Edit, Trash2, Layers, Plus, Minus, ArrowLeft, ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import { Product, Category } from '../types';
import { LOW_STOCK_THRESHOLD } from '../constants';

interface InventoryListProps {
  products: Product[];
  onDelete: (id: string) => void;
  onEdit: (product: Product) => void;
  onStockAction: (product: Product, type: 'IN' | 'OUT') => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, onDelete, onEdit, onStockAction }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Group Counts for Main Grid
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(Category).forEach(c => counts[c] = 0);
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // 2. Helper to get the primary spec key based on category
  const getPrimarySpecKey = (category: Category): string => {
    switch (category) {
      case Category.TV: return 'screenSize';
      case Category.AC: return 'tonnage';
      case Category.Fridge: return 'capacity';
      case Category.WashingMachine: return 'type';
      case Category.Inverter: return 'capacity';
      case Category.Battery: return 'capacity';
      case Category.Transformer: return 'capacity';
      default: return '';
    }
  };

  // 3. Filter products for the selected category View
  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(p => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // 4. Extract unique spec values for the "Filter Bar"
  const availableSpecs = useMemo(() => {
    if (!selectedCategory) return [];
    const key = getPrimarySpecKey(selectedCategory);
    if (!key) return [];
    
    const values = new Set<string>();
    categoryProducts.forEach(p => {
      if (p.specs && p.specs[key]) {
        values.add(p.specs[key]);
      }
    });
    return Array.from(values).sort();
  }, [categoryProducts, selectedCategory]);

  // 5. Final Filtered List based on Search AND Spec Filter
  const filteredProducts = useMemo(() => {
    return categoryProducts.filter(p => {
      // Search Filter
      const matchesSearch = searchTerm === '' || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.company.toLowerCase().includes(searchTerm.toLowerCase());

      // Spec Filter
      const specKey = getPrimarySpecKey(p.category);
      const matchesSpec = selectedSpec === null || (p.specs && p.specs[specKey] === selectedSpec);

      return matchesSearch && matchesSpec;
    });
  }, [categoryProducts, searchTerm, selectedSpec]);

  // 6. Group by Company
  const groupedByCompany = useMemo(() => {
    const groups: Record<string, { products: Product[], totalStock: number }> = {};
    
    filteredProducts.forEach(p => {
      if (!groups[p.company]) {
        groups[p.company] = { products: [], totalStock: 0 };
      }
      groups[p.company].products.push(p);
      groups[p.company].totalStock += p.stock;
    });
    
    return groups;
  }, [filteredProducts]);

  // --- WhatsApp Share Function ---
  const handleShare = (p: Product) => {
    const specs = p.specs 
        ? Object.entries(p.specs).map(([k,v]) => `${k}: ${v}`).join(', ') 
        : '';
    
    const text = `*ElectroStock Item Check* ⚡\n\n` +
                 `*Product:* ${p.company} ${p.name}\n` +
                 `*Category:* ${p.category}\n` +
                 `*Price:* ₹${p.price.toLocaleString()}\n` +
                 `*Specs:* ${specs}\n` +
                 `*Description:* ${p.description}\n\n` +
                 `_Visit us for more details!_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- Render Functions ---

  const renderCategoryGrid = () => (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory</h2>
          <p className="text-slate-500">Select a category to view items.</p>
        </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.values(Category).map((cat) => (
          <button
            key={cat}
            onClick={() => {
                setSelectedCategory(cat);
                setSelectedSpec(null);
                setExpandedCompany(null);
                setSearchTerm('');
            }}
            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className={`p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 text-slate-400 group-hover:text-indigo-600 transition-colors`}>
                <Layers className="w-6 h-6" />
              </span>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                {categoryCounts[cat] || 0}
              </span>
            </div>
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700">{cat}</h3>
          </button>
        ))}
      </div>
    </div>
  );

  const renderProductRow = (product: Product) => (
    <div key={product.id} className="bg-white p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
             <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900">{product.name}</span>
                {product.stock <= LOW_STOCK_THRESHOLD && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                        Low Stock
                    </span>
                )}
             </div>
             
             <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="bg-slate-100 px-1.5 py-0.5 rounded">₹{product.price.toLocaleString()}</span>
                {product.specs && Object.entries(product.specs).map(([k, v]) => (
                    v && <span key={k} className="border border-slate-200 px-1.5 py-0.5 rounded">{v}</span>
                ))}
             </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
             {/* Stock Controls */}
             <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button 
                    onClick={() => onStockAction(product, 'OUT')}
                    className="w-10 h-8 flex items-center justify-center bg-white text-rose-600 rounded shadow-sm hover:bg-rose-50 active:scale-95 transition-all"
                    title="Sell (Reduce Quantity)"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-slate-700 text-sm border-x border-slate-200 bg-white h-8 flex items-center justify-center">
                    {product.stock}
                </span>
                <button 
                    onClick={() => onStockAction(product, 'IN')}
                    className="w-10 h-8 flex items-center justify-center bg-white text-emerald-600 rounded shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
                    title="Add Stock"
                >
                    <Plus className="w-4 h-4" />
                </button>
             </div>

             {/* Admin Actions */}
             <div className="flex items-center gap-1">
                <button onClick={() => handleShare(product)} className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Share on WhatsApp">
                    <Share2 className="w-4 h-4" />
                </button>
                <button onClick={() => onEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Details">
                    <Edit className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onDelete(product.id)} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Product from System"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
       </div>
    </div>
  );

  const renderCategoryDetail = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
            onClick={() => setSelectedCategory(null)}
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">{selectedCategory}</h2>
            <p className="text-slate-500 text-sm">{filteredProducts.length} Items found</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search models..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Spec Chips (e.g. 32", 43" for TV) */}
          {availableSpecs.length > 0 && (
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Filter by {getPrimarySpecKey(selectedCategory!).replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedSpec(null)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                            selectedSpec === null 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                        }`}
                    >
                        All
                    </button>
                    {availableSpecs.map(spec => (
                        <button
                            key={spec}
                            onClick={() => setSelectedSpec(spec === selectedSpec ? null : spec)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                selectedSpec === spec 
                                ? 'bg-indigo-600 text-white border-indigo-600' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                            }`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>
            </div>
          )}
      </div>

      {/* Company Groups List */}
      <div className="space-y-3">
        {Object.keys(groupedByCompany).length > 0 ? (
            Object.keys(groupedByCompany).sort().map(company => {
                const isExpanded = expandedCompany === company;
                const { products: companyProducts, totalStock } = groupedByCompany[company];

                return (
                    <div key={company} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <button 
                            onClick={() => setExpandedCompany(isExpanded ? null : company)}
                            className={`w-full flex items-center justify-between p-4 transition-colors ${isExpanded ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                        >
                            <div className="flex items-center gap-3">
                                {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                <span className="font-bold text-slate-800 text-lg">{company}</span>
                                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                    {companyProducts.length} Models
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium">
                                    Total Stock: <span className="text-slate-900 font-bold">{totalStock}</span>
                                </span>
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="border-t border-slate-100">
                                {companyProducts.map(renderProductRow)}
                            </div>
                        )}
                    </div>
                );
            })
        ) : (
            <div className="text-center py-12 text-slate-400">
                No products found matching filters.
            </div>
        )}
      </div>
    </div>
  );

  return selectedCategory ? renderCategoryDetail() : renderCategoryGrid();
};

export default InventoryList;