import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Search, Calendar } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Transaction History</h2>
          <p className="text-slate-500">Track revenue and inventory logs.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Mobile View - List */}
        <div className="lg:hidden divide-y divide-slate-100">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((tx) => {
              // Logic: OUT = Sold (Money In/Green), IN = Restock (Neutral/Grey)
              const isSale = tx.type === 'OUT';
              
              return (
                <div key={tx.id} className="p-4 flex gap-4">
                  <div className={`p-2.5 rounded-xl h-fit flex-shrink-0 ${
                      isSale ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}>
                     {isSale ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-800 truncate pr-2">{tx.productName}</h4>
                      <span className={`text-sm font-bold whitespace-nowrap ${
                          isSale ? 'text-emerald-600' : 'text-slate-600'
                      }`}>
                        {isSale ? '+' : ''}₹{tx.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                           <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                               isSale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                           }`}>
                               {isSale ? 'SOLD' : 'ADDED STOCK'} • {tx.quantity} units
                           </span>
                           <span className="text-xs">@ ₹{tx.unitPrice}/ea</span>
                      </div>
                      <p className="text-slate-600 truncate">{tx.partyName || (isSale ? 'Cash Sale' : 'Inventory Update')}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()} • {new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400">No transactions recorded yet.</div>
          )}
        </div>

        {/* Desktop View - Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Party Details</th>
                <th className="px-6 py-4 text-right">Qty</th>
                <th className="px-6 py-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((tx) => {
                  const isSale = tx.type === 'OUT';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{new Date(tx.date).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-400">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              isSale ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                              {isSale ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                              {isSale ? 'SOLD' : 'ADDED'}
                          </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                          {tx.productName}
                      </td>
                      <td className="px-6 py-4">
                          <div className="text-slate-900 font-medium">{tx.partyName || '-'}</div>
                          {tx.note && <div className="text-xs text-slate-400 truncate max-w-[200px]">{tx.note}</div>}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                          {tx.quantity}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isSale ? 'text-emerald-600' : 'text-slate-700'}`}>
                          {isSale ? '+' : ''}₹{tx.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;