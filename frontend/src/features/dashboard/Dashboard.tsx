import React, { useState } from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Wallet, ShoppingBag, Package, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: string;
}

const dataBar = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 500 },
  { name: 'Apr', value: 400 },
  { name: 'May', value: 600 },
  { name: 'Jun', value: 300 },
  { name: 'Jul', value: 700 },
  { name: 'Aug', value: 900 },
  { name: 'Sep', value: 800 },
  { name: 'Oct', value: 600 },
  { name: 'Nov', value: 500 },
  { name: 'Dec', value: 800 },
];

const dataPie = [
  { name: 'New', value: 65 },
  { name: 'Old', value: 35 },
];

interface MetricCardProps {
  title: string;
  amount: string;
  percentage: string;
  isPositive: boolean;
  icon: any;
  colorClass: string;
  bgClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, amount, percentage, isPositive, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-card p-6 rounded-2xl shadow-sm flex items-center gap-6 flex-1 min-w-[250px] transition-transform hover:-translate-y-1 hover:shadow-md duration-300">
    <div className={`w-[84px] h-[84px] rounded-full flex items-center justify-center ${bgClass} shadow-inner`}>
      <Icon size={38} className={colorClass} strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-textMuted text-sm font-medium tracking-wide">{title}</p>
      <h3 className="text-[32px] font-extrabold mt-0 text-text tracking-tight">{amount}</h3>
      <p className="text-sm mt-0.5 font-bold flex items-center gap-1">
        <span className={`${isPositive ? 'text-success' : 'text-danger'} flex items-center`}>
          {isPositive ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>}
          <span className="ml-1">{percentage}</span>
        </span>
        <span className="text-textMuted ml-1 text-xs font-medium font-sans">this month</span>
      </p>
    </div>
  </div>
);

// ─── Product Sell Table ───────────────────────────────────────────────────────
const ProductSellTable = () => {
  const [search, setSearch] = useState('');

  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => (await api.get('/products')).data,
  });

  const filtered = (products ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[22px] font-extrabold text-text tracking-tight">Product Sell</h3>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-4 py-2.5 bg-background rounded-xl text-sm focus:outline-none w-56 border-none placeholder-gray-400 font-semibold"
            />
            <svg className="absolute left-4 top-3 w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select className="bg-background border-none rounded-xl text-sm px-5 py-2.5 text-textMuted font-semibold cursor-pointer focus:ring-0 outline-none">
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-textMuted font-semibold">
          <Loader2 size={20} className="animate-spin text-primary" />
          Carregando produtos...
        </div>
      ) : isError ? (
        <div className="py-16 text-center text-red-400 font-semibold text-sm">
          Erro ao carregar produtos.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-400 font-semibold text-sm">
            {(products ?? []).length === 0 ? 'Nenhum produto adicionado' : 'Nenhum produto encontrado'}
          </p>
        </div>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-textMuted text-sm font-semibold border-b border-gray-100 pb-2 flex lg:table-row mb-2">
              <th className="pb-4 w-[50%] lg:w-auto">Product Name</th>
              <th className="pb-4 text-center hidden lg:table-cell">Stock</th>
              <th className="pb-4 text-center hidden lg:table-cell">Price</th>
              <th className="pb-4 text-center hidden lg:table-cell">Total Sales</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-none flex flex-col lg:table-row hover:bg-gray-50/50 transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-5">
                    <div className="w-[88px] h-[56px] rounded-xl overflow-hidden flex-shrink-0 shadow-sm bg-gray-100 relative group-hover:scale-105 transition-transform">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Package size={22} className="text-white/80" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-text text-[16px]">{p.name}</p>
                      <p className="text-textMuted text-xs mt-1 truncate max-w-[200px] md:max-w-xs font-medium">
                        {p.description || '—'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 text-center hidden lg:table-cell">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-extrabold tracking-wide ${
                    p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                    p.stock > 0  ? 'bg-amber-50 text-amber-700' :
                                   'bg-red-50 text-red-600'
                  }`}>
                    {p.stock === 0 ? 'Sem estoque' : `${p.stock} un.`}
                  </span>
                </td>
                <td className="py-4 text-center font-extrabold text-text text-[15px] hidden lg:table-cell">
                  {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </td>
                <td className="py-4 text-center text-textMuted font-medium hidden lg:table-cell">
                  —
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

export const Dashboard = () => {

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Metrics Cards */}
      <div className="flex flex-wrap gap-6 pt-2">
        <MetricCard 
          title="Earning" 
          amount="$198k" 
          percentage="37.8%" 
          isPositive={true} 
          icon={DollarSign} 
          colorClass="text-[#00ac69]"
          bgClass="bg-[#e4f8f0]"
        />
        <MetricCard 
          title="Balance" 
          amount="$2.4k" 
          percentage="2%" 
          isPositive={false} 
          icon={Wallet} 
          colorClass="text-[#a428ff]"
          bgClass="bg-[#f3e8ff]"
        />
        <MetricCard 
          title="Total Sales" 
          amount="$89k" 
          percentage="11%" 
          isPositive={true} 
          icon={ShoppingBag} 
          colorClass="text-[#ff3b86]"
          bgClass="bg-[#ffe8f0]"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="bg-card p-8 rounded-2xl shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-[22px] font-extrabold text-text tracking-tight">Overview</h3>
              <p className="text-sm text-textMuted font-medium mt-1">Monthly Earning</p>
            </div>
            <select className="bg-background border-none rounded-xl text-sm px-5 py-2.5 text-textMuted font-semibold cursor-pointer shadow-sm focus:ring-0 outline-none">
              <option>Quarterly</option>
            </select>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataBar} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a0a0a0', fontSize: 13, fontWeight: 600}} dy={10} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]}>
                  {dataBar.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Aug' ? '#5A2EE0' : '#f0f0f5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-card p-8 rounded-2xl shadow-sm flex flex-col items-center relative">
          <div className="self-start w-full">
            <h3 className="text-[22px] font-extrabold text-text tracking-tight">Customers</h3>
            <p className="text-sm text-textMuted font-medium mt-1">Customers that buy products</p>
          </div>
          <div className="relative w-full h-[260px] mt-2 bg-white flex justify-center items-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none mt-1">
              <span className="text-[34px] font-extrabold text-text tracking-tight shadow-sm-text">65%</span>
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider text-center leading-tight mt-0.5">Total New<br/>Customers</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  innerRadius={78}
                  outerRadius={108}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                  cornerRadius={10}
                >
                  <Cell fill="url(#colorUv)" />
                  <Cell fill="#f0f0f5" />
                </Pie>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Sell Section */}
      <div className="bg-card p-8 rounded-2xl shadow-sm">
        <ProductSellTable />
      </div>
    </div>
  );
};

export default Dashboard;
