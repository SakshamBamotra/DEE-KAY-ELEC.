import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Save, X, Loader2, ChevronRight, ChevronLeft, PackageCheck } from 'lucide-react';
import { Product, Category, Company, ProductSpecs } from '../types';
import { generateProductDetails } from '../services/geminiService';

interface ProductFormProps {
  initialData?: Product | null;
  existingProducts: Product[];
  onSave: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

// Helper for step titles
const STEP_TITLES = [
  "Select Brand",
  "Select Category",
  "Model Details",
  "Price & Stock"
];

const ProductForm: React.FC<ProductFormProps> = ({ initialData, existingProducts, onSave, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '' as Company | '',
    category: '' as Category | '',
    price: '',
    stock: '',
    description: '',
    specs: {} as ProductSpecs
  });

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        company: initialData.company,
        category: initialData.category,
        price: initialData.price.toString(),
        stock: initialData.stock.toString(),
        description: initialData.description,
        specs: initialData.specs || {}
      });
      setStep(4); // Jump to end if editing
    }
  }, [initialData]);

  // --- Step Logic ---
  
  const handleCompanySelect = (company: Company) => {
    setFormData(prev => ({ ...prev, company }));
    setStep(2);
  };

  const handleCategorySelect = (category: Category) => {
    setFormData(prev => ({ ...prev, category }));
    setStep(3);
  };

  const handleNext = () => {
    // Validation before moving
    if (step === 3 && !formData.name) return; 
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  // --- AI Logic ---

  const handleGenerate = async () => {
    if (!formData.name) return;
    setIsGenerating(true);
    try {
      // Build context string including specs
      let specString = '';
      if (formData.specs.tonnage) specString += ` ${formData.specs.tonnage}`;
      if (formData.specs.capacity) specString += ` ${formData.specs.capacity}`;
      if (formData.specs.screenSize) specString += ` ${formData.specs.screenSize}`;
      if (formData.specs.loadType) specString += ` ${formData.specs.loadType}`;
      
      const fullName = `${formData.company} ${formData.name}${specString}`;
      const details = await generateProductDetails(fullName, formData.category as string);
      setFormData(prev => ({
        ...prev,
        description: details.description,
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Submit ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      company: formData.company as Company,
      category: formData.category as Category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description,
      specs: formData.specs
    });
  };

  // --- Suggestion Logic ---
  
  const suggestedModels = useMemo(() => {
    if (!formData.company || !formData.category) return [];
    return existingProducts
      .filter(p => p.company === formData.company && p.category === formData.category)
      .map(p => p.name)
      .filter((value, index, self) => self.indexOf(value) === index) // Unique names
      .slice(0, 5);
  }, [existingProducts, formData.company, formData.category]);

  // --- Render Steps ---

  const renderStep1 = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.values(Company).map((company) => (
        <button
          key={company}
          type="button"
          onClick={() => handleCompanySelect(company)}
          className={`
            p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center
            ${formData.company === company 
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
              : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-700'}
          `}
        >
          <span className="font-bold text-lg">{company}</span>
        </button>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Object.values(Category).map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => handleCategorySelect(cat)}
          className={`
            p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center
            ${formData.category === cat 
              ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
              : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-700'}
          `}
        >
          <span className="font-medium">{cat}</span>
        </button>
      ))}
    </div>
  );

  const renderStep3 = () => {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg mb-6">
            <span className="text-sm text-indigo-800 font-medium">Adding: </span>
            <span className="font-bold text-indigo-900">{formData.company} &bull; {formData.category}</span>
        </div>

        {/* Dynamic Fields based on Category */}
        
        {/* AC Tonnage */}
        {formData.category === Category.AC && (
           <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Select Tonnage</label>
             <div className="flex flex-wrap gap-3">
               {['0.8 Ton', '1.0 Ton', '1.5 Ton', '2.0 Ton'].map(ton => (
                 <button
                   key={ton}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, tonnage: ton } }))}
                   className={`px-6 py-3 rounded-lg border font-medium transition-colors ${
                     formData.specs.tonnage === ton 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   }`}
                 >
                   {ton}
                 </button>
               ))}
             </div>
           </div>
        )}

        {/* Washing Machine Type & Capacity */}
        {formData.category === Category.WashingMachine && (
            <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Machine Type</label>
                    <div className="flex gap-4">
                        {['Semi-Automatic', 'Fully-Automatic'].map(type => (
                             <button
                             key={type}
                             type="button"
                             onClick={() => setFormData(prev => {
                                 // Reset loadType if user switches to Semi
                                 const newSpecs = { ...prev.specs, type };
                                 if (type === 'Semi-Automatic') delete newSpecs.loadType;
                                 return { ...prev, specs: newSpecs };
                             })}
                             className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                               formData.specs.type === type 
                               ? 'bg-indigo-600 text-white border-indigo-600' 
                               : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                             }`}
                           >
                             {type}
                           </button>
                        ))}
                    </div>
                </div>

                {/* Top Load / Front Load - Only if Fully Automatic */}
                {formData.specs.type === 'Fully-Automatic' && (
                    <div className="space-y-3 animate-fade-in">
                        <label className="text-sm font-semibold text-slate-700">Load Type</label>
                        <div className="flex gap-4">
                            {['Top Load', 'Front Load'].map(load => (
                                <button
                                    key={load}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ 
                                        ...prev, 
                                        specs: { ...prev.specs, loadType: load } 
                                    }))}
                                    className={`flex-1 px-4 py-3 rounded-lg border font-medium transition-colors ${
                                        formData.specs.loadType === load 
                                        ? 'bg-indigo-600 text-white border-indigo-600' 
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                                    }`}
                                >
                                    {load}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Capacity (Kg)</label>
                    <input 
                        type="text"
                        placeholder="e.g., 6.5 Kg, 8 Kg"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.specs.capacity || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }))}
                    />
                </div>
            </div>
        )}

        {/* Fridge Capacity */}
        {formData.category === Category.Fridge && (
            <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Capacity (Liters)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {['190 L', '253 L', '300 L', '500 L'].map(l => (
                        <button key={l} type="button" 
                           onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: l } }))}
                           className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600">
                           {l}
                        </button>
                    ))}
                </div>
                <input 
                    type="text"
                    placeholder="e.g., 253 L"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.specs.capacity || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }))}
                />
            </div>
        )}

        {/* TV Screen Size */}
        {formData.category === Category.TV && (
           <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Screen Size</label>
             <div className="flex flex-wrap gap-3">
               {['32"', '43"', '50"', '55"', '65"'].map(size => (
                 <button
                   key={size}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, screenSize: size } }))}
                   className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                     formData.specs.screenSize === size 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   }`}
                 >
                   {size}
                 </button>
               ))}
             </div>
           </div>
        )}

        {/* Inverter Capacity */}
        {formData.category === Category.Inverter && (
           <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Capacity / Rating</label>
             <div className="flex flex-wrap gap-3">
               {['900 VA', '1100 VA', '1500 VA'].map(cap => (
                 <button
                   key={cap}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: cap } }))}
                   className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                     formData.specs.capacity === cap 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   }`}
                 >
                   {cap}
                 </button>
               ))}
             </div>
             <input 
                type="text"
                placeholder="Custom capacity (e.g. 2 KVA)"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                value={formData.specs.capacity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }))}
            />
           </div>
        )}

        {/* Battery Capacity */}
        {formData.category === Category.Battery && (
           <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Battery Capacity</label>
             <div className="flex flex-wrap gap-3">
               {['150 Ah', '200 Ah', '220 Ah'].map(cap => (
                 <button
                   key={cap}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: cap } }))}
                   className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                     formData.specs.capacity === cap 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   }`}
                 >
                   {cap}
                 </button>
               ))}
             </div>
             <input 
                type="text"
                placeholder="Custom capacity (e.g. 120 Ah)"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                value={formData.specs.capacity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }))}
            />
           </div>
        )}
        
        {/* Transformer/Stabilizer Capacity */}
        {formData.category === Category.Transformer && (
           <div className="space-y-3">
             <label className="text-sm font-semibold text-slate-700">Rating / Use Case</label>
             <div className="flex flex-wrap gap-3">
               {['4 KVA (1.5 Ton AC)', '5 KVA (2 Ton AC)', 'Mainline'].map(cap => (
                 <button
                   key={cap}
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: cap } }))}
                   className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                     formData.specs.capacity === cap 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                   }`}
                 >
                   {cap}
                 </button>
               ))}
             </div>
             <input 
                type="text"
                placeholder="Details (e.g. Copper Wound)"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none mt-2"
                value={formData.specs.capacity || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, specs: { ...prev.specs, capacity: e.target.value } }))}
            />
           </div>
        )}

        {/* Model Name Input */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-sm font-semibold text-slate-700">Model Name / Number</label>
            
            {suggestedModels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs text-slate-400 py-1">Recent:</span>
                    {suggestedModels.map(m => (
                        <button 
                            key={m} 
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, name: m }))}
                            className="text-xs px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full border border-indigo-100">
                            {m}
                        </button>
                    ))}
                </div>
            )}

            <input 
                type="text"
                required
                placeholder="Enter model name (e.g. Neo Series, Bravia XR)"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-6">
       <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Product:</span>
                <span className="font-semibold text-slate-800">{formData.company} {formData.name}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Specs:</span>
                <span className="font-semibold text-slate-800">
                    {[
                        formData.specs.tonnage,
                        formData.specs.capacity,
                        formData.specs.screenSize,
                        formData.specs.type,
                        formData.specs.loadType
                    ].filter(Boolean).join(', ') || 'Standard'}
                </span>
            </div>
       </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Price (₹)</label>
            <input 
                type="number"
                required
                min="0"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            />
        </div>
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Initial Stock</label>
            <input 
                type="number"
                required
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            />
        </div>
      </div>

      <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-700">Description</label>
                <button 
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {isGenerating ? 'Generating...' : 'Auto-Generate'}
                </button>
            </div>
            <textarea
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Product description..."
            />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-24 lg:pb-0">
       <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {initialData ? 'Edit Product' : 'Add New Inventory'}
          </h2>
          <p className="text-slate-500">Step {step} of 4: {STEP_TITLES[step-1]}</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
        <div 
            className="bg-indigo-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 md:p-8 min-h-[400px]">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
            
            <div className="flex-1">
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
            </div>

            <div className="flex justify-between pt-8 mt-4 border-t border-slate-50">
                {step > 1 ? (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                ) : (
                    <div /> // Spacer
                )}

                {step < 4 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={(step === 1 && !formData.company) || (step === 2 && !formData.category)}
                        className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        type="submit"
                        disabled={!formData.price || !formData.stock}
                        className="px-8 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PackageCheck className="w-4 h-4" />
                        {initialData ? 'Update Product' : 'Add to Inventory'}
                    </button>
                )}
            </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;