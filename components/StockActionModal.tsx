import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Banknote, Users, Truck, Check } from 'lucide-react';
import { Product } from '../types';

interface StockActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: 'IN' | 'OUT';
    quantity: number;
    unitPrice: number;
    partyName: string;
    note: string;
  }) => void;
  product: Product | null;
  mode: 'IN' | 'OUT'; // IN = Buy, OUT = Sell
}

const StockActionModal: React.FC<StockActionModalProps> = ({ isOpen, onClose, onSubmit, product, mode }) => {
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [partyName, setPartyName] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && product) {
      setQuantity(1);
      setUnitPrice(product.price); // Default to current price
      setPartyName('');
      setNote('');
    }
  }, [isOpen, product, mode]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: mode,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      partyName,
      note
    });
    onClose();
  };

  const isBuy = mode === 'IN';
  const quickQuantities = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className={`p-6 border-b ${isBuy ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isBuy ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                {isBuy ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isBuy ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {isBuy ? 'Restock Item' : 'Product Sold'}
                </h3>
                <p className={`text-sm ${isBuy ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {product.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quantity Section */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">
              Select Quantity to {isBuy ? 'Add' : 'Remove'}
            </label>
            
            {/* Quick Select Buttons */}
            <div className="flex gap-2">
                {quickQuantities.map(num => (
                    <button
                        key={num}
                        type="button"
                        onClick={() => setQuantity(num)}
                        disabled={!isBuy && product.stock < num}
                        className={`flex-1 h-10 rounded-lg font-bold text-sm transition-all border
                            ${quantity === num 
                                ? (isBuy ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600')
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }
                            disabled:opacity-30 disabled:cursor-not-allowed
                        `}
                    >
                        {num}
                    </button>
                ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
                <input
                    type="number"
                    min="1"
                    max={!isBuy ? product.stock : undefined}
                    required
                    placeholder="Custom Amount"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-semibold"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                />
                {!isBuy && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        Stock: {product.stock}
                    </span>
                )}
            </div>
          </div>

          {/* Collapsible Details (Price/Party) - Simplified view */}
          <div className="pt-2 border-t border-slate-100 space-y-4">
              
              {/* Price inputs only for Restocking (Buy) */}
              {isBuy && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Cost / Unit
                        </label>
                        <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full pl-6 pr-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 text-sm"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                        />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1">Total Cost</label>
                         <div className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 font-bold text-sm">
                            ₹{(quantity * unitPrice).toLocaleString()}
                         </div>
                    </div>
                  </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                {isBuy ? 'Distributor (Optional)' : 'Customer Name (Optional)'}
                </label>
                <input
                    type="text"
                    placeholder="Name or Phone..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-indigo-500 text-sm"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl text-white font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isBuy 
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
            }`}
          >
            <Check className="w-5 h-5" />
            {isBuy ? 'Add Stock' : 'Mark as Sold'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StockActionModal;