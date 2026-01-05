import React, { useState, useCallback, useEffect } from 'react';
import { Tv } from 'lucide-react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import AIAnalyst from './components/AIAnalyst';
import StockActionModal from './components/StockActionModal';
import TransactionHistory from './components/TransactionHistory';
import { Product, ViewState, Transaction } from './types';
import { INITIAL_PRODUCTS } from './constants';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  
  // 1. Initialize State from LocalStorage or Fallback to Initial Data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('electro_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('electro_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Stock Action Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockActionMode, setStockActionMode] = useState<'IN' | 'OUT'>('IN');

  // 2. Save to LocalStorage whenever products or transactions change
  useEffect(() => {
    localStorage.setItem('electro_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('electro_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // CRUD Operations
  const handleAddProduct = useCallback((newProductData: Omit<Product, 'id' | 'lastUpdated'>) => {
    setProducts(prev => {
      // Check for existing product with same Company, Category, Name, and Specs
      const existingIndex = prev.findIndex(p => 
        p.company === newProductData.company &&
        p.category === newProductData.category &&
        p.name.toLowerCase() === newProductData.name.toLowerCase() &&
        JSON.stringify(p.specs || {}) === JSON.stringify(newProductData.specs || {})
      );

      if (existingIndex >= 0) {
        // Update existing stock
        const updatedProducts = [...prev];
        const existingProduct = updatedProducts[existingIndex];
        
        // Update stock
        updatedProducts[existingIndex] = {
          ...existingProduct,
          stock: existingProduct.stock + newProductData.stock,
          price: newProductData.price, // Update price to latest
          lastUpdated: new Date().toISOString()
        };

        // Add Transaction for the "Add" (Buy)
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          productId: existingProduct.id,
          productName: existingProduct.name,
          type: 'IN',
          quantity: newProductData.stock,
          unitPrice: newProductData.price,
          totalAmount: newProductData.stock * newProductData.price,
          partyName: 'Inventory Addition',
          date: new Date().toISOString(),
          note: 'Added via New Product Wizard (Merged)'
        };
        setTransactions(t => [newTransaction, ...t]);

        return updatedProducts;
      } else {
        // Add new product
        const newProduct: Product = {
          ...newProductData,
          id: Date.now().toString(),
          lastUpdated: new Date().toISOString()
        };

        const newTransaction: Transaction = {
          id: Date.now().toString(),
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'IN',
          quantity: newProductData.stock,
          unitPrice: newProductData.price,
          totalAmount: newProductData.stock * newProductData.price,
          partyName: 'Inventory Addition',
          date: new Date().toISOString(),
          note: 'Initial Stock'
        };
        setTransactions(t => [newTransaction, ...t]);

        return [...prev, newProduct];
      }
    });
    setCurrentView('inventory');
  }, []);

  const handleUpdateProduct = useCallback((updatedData: Omit<Product, 'id' | 'lastUpdated'>) => {
    if (!editingProduct) return;
    
    setProducts(prev => prev.map(p => 
      p.id === editingProduct.id 
        ? { ...p, ...updatedData, lastUpdated: new Date().toISOString() } 
        : p
    ));
    setEditingProduct(null);
    setCurrentView('inventory');
  }, [editingProduct]);

  const handleDeleteProduct = useCallback((id: string) => {
    if (window.confirm('Do you really want the product to be removed? This action cannot be undone.')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  const handleEditClick = useCallback((product: Product) => {
    setEditingProduct(product);
    setCurrentView('add-product');
  }, []);

  // Stock Actions
  const openStockModal = useCallback((product: Product, type: 'IN' | 'OUT') => {
    setSelectedProduct(product);
    setStockActionMode(type);
    setStockModalOpen(true);
  }, []);

  const handleStockTransaction = useCallback((data: {
    type: 'IN' | 'OUT';
    quantity: number;
    unitPrice: number;
    partyName: string;
    note: string;
  }) => {
    if (!selectedProduct) return;

    // 1. Update Product Stock
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        const newStock = data.type === 'IN' 
          ? p.stock + data.quantity 
          : Math.max(0, p.stock - data.quantity);
        return { ...p, stock: newStock, lastUpdated: new Date().toISOString() };
      }
      return p;
    }));

    // 2. Add Transaction Record
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      type: data.type,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalAmount: data.quantity * data.unitPrice,
      partyName: data.partyName,
      date: new Date().toISOString(),
      note: data.note
    };

    setTransactions(prev => [newTransaction, ...prev]);
  }, [selectedProduct]);

  // View Navigation
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard products={products} onNavigate={setCurrentView} />;
      case 'inventory':
        return (
            <InventoryList 
                products={products} 
                onDelete={handleDeleteProduct} 
                onEdit={handleEditClick}
                onStockAction={openStockModal}
            />
        );
      case 'add-product':
        return (
          <ProductForm 
            initialData={editingProduct}
            existingProducts={products}
            onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              setEditingProduct(null);
              setCurrentView('inventory');
            }}
          />
        );
      case 'transactions':
        return <TransactionHistory transactions={transactions} />;
      case 'ai-analyst':
        return <AIAnalyst products={products} />;
      default:
        return <Dashboard products={products} onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        currentView={currentView} 
        onNavigate={(view) => {
          if (view !== 'add-product') setEditingProduct(null);
          setCurrentView(view);
        }}
      />

      <main className="flex-1 min-w-0 transition-all duration-300 ease-in-out pb-20 lg:pb-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-800 p-4 flex justify-center items-center sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <Tv className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">DEE KAY ELEC.</span>
            </div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      <BottomNav 
        currentView={currentView} 
        onNavigate={(view) => {
          if (view !== 'add-product') setEditingProduct(null);
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} 
      />

      <StockActionModal 
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        onSubmit={handleStockTransaction}
        product={selectedProduct}
        mode={stockActionMode}
      />
    </div>
  );
}

export default App;