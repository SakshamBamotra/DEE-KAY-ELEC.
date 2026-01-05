export enum Category {
  TV = 'TV',
  Fridge = 'Fridge',
  WashingMachine = 'Washing Machine',
  AC = 'AC',
  Inverter = 'Inverter',
  Battery = 'Battery',
  WaterFilter = 'Water Filter',
  JuicerMixer = 'Juicer Mixer',
  Transformer = 'Transformer', // Added for Voltas/Stabilizers
  Microwave = 'Microwave Oven',
  WaterHeater = 'Water Heater',
  Other = 'Other'
}

export enum Company {
  Samsung = 'Samsung',
  Voltas = 'Voltas',
  Whirlpool = 'Whirlpool',
  LG = 'LG',
  Daikin = 'Daikin',
  Bajaj = 'Bajaj',
  Usha = 'Usha',
  Sony = 'Sony',
  Kent = 'Kent',
  Philips = 'Philips',
  Luminous = 'Luminous', // Added
  Other = 'Other'
}

export interface ProductSpecs {
  capacity?: string;      // Fridge (L), Washing Machine (Kg), Inverter (VA), Battery (Ah)
  screenSize?: string;    // TV (Inch)
  tonnage?: string;       // AC (Ton)
  type?: string;          // Washing Machine (Semi/Fully)
  loadType?: string;      // Washing Machine (Top/Front)
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  company: Company;
  category: Category;
  price: number;
  stock: number;
  description: string;
  specs?: ProductSpecs;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT'; // IN = Buy, OUT = Sell
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  partyName: string; // Distributor or Customer Name
  date: string;
  note?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  categoryDistribution: { name: string; value: number }[];
}

export type ViewState = 'dashboard' | 'inventory' | 'add-product' | 'ai-analyst' | 'transactions';