import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, DollarSign, CreditCard,
  ArrowUpRight, ArrowDownRight, Activity, ShoppingCart,
  Target, Wallet,
} from 'lucide-react';

// ─── Palette ──────────────────────────────────────────────────────────────────
const PRIMARY   = '#6C5CE7';
const INDIGO    = '#4F46E5';
const TEAL      = '#00CEC9';
const ROSE      = '#f43f5e';
const AMBER     = '#f59e0b';
const EMERALD   = '#10b981';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const revenueData = [
  { month: 'Jan', receita: 42000, despesas: 28000, lucro: 14000 },
  { month: 'Fev', receita: 38000, despesas: 25000, lucro: 13000 },
  { month: 'Mar', receita: 55000, despesas: 31000, lucro: 24000 },
  { month: 'Abr', receita: 47000, despesas: 29000, lucro: 18000 },
  { month: 'Mai', receita: 63000, despesas: 34000, lucro: 29000 },
  { month: 'Jun', receita: 58000, despesas: 32000, lucro: 26000 },
  { month: 'Jul', receita: 71000, despesas: 38000, lucro: 33000 },
  { month: 'Ago', receita: 89000, despesas: 44000, lucro: 45000 },
  { month: 'Set', receita: 76000, despesas: 41000, lucro: 35000 },
  { month: 'Out', receita: 82000, despesas: 43000, lucro: 39000 },
  { month: 'Nov', receita: 94000, despesas: 48000, lucro: 46000 },
  { month: 'Dez', receita: 110000, despesas: 52000, lucro: 58000 },
];

const cashFlowData = [
  { semana: 'S1', entradas: 18000, saidas: 12000 },
  { semana: 'S2', entradas: 22000, saidas: 15000 },
  { semana: 'S3', entradas: 16000, saidas: 18000 },
  { semana: 'S4', entradas: 28000, saidas: 14000 },
  { semana: 'S5', entradas: 24000, saidas: 16000 },
  { semana: 'S6', entradas: 31000, saidas: 20000 },
  { semana: 'S7', entradas: 19000, saidas: 22000 },
  { semana: 'S8', entradas: 35000, saidas: 17000 },
];

const expenseBreakdown = [
  { name: 'Operacional',   value: 38, color: PRIMARY },
  { name: 'Marketing',     value: 22, color: TEAL },
  { name: 'RH',            value: 20, color: AMBER },
  { name: 'Infraestrutura', value: 12, color: ROSE },
  { name: 'Outros',        value: 8,  color: '#a0aec0' },
];

const conversionData = [
  { month: 'Jan', taxa: 3.2 },
  { month: 'Fev', taxa: 3.8 },
  { month: 'Mar', taxa: 4.1 },
  { month: 'Abr', taxa: 3.6 },
  { month: 'Mai', taxa: 4.8 },
  { month: 'Jun', taxa: 5.2 },
  { month: 'Jul', taxa: 5.8 },
  { month: 'Ago', taxa: 6.1 },
  { month: 'Set', taxa: 5.7 },
  { month: 'Out', taxa: 6.4 },
  { month: 'Nov', taxa: 7.0 },
  { month: 'Dez', taxa: 7.8 },
];

const topChannels = [
  { name: 'Vendas Diretas',  value: 45000, growth: 12.4, color: PRIMARY },
  { name: 'E-commerce',      value: 31000, growth: 28.1, color: TEAL },
  { name: 'Parceiros',       value: 18500, growth: -3.2, color: AMBER },
  { name: 'Marketplace',     value: 14000, growth: 41.0, color: EMERALD },
];

const ticketMedioData = months.map((m, i) => ({
  month: m,
  ticket: 180 + Math.round(Math.sin(i * 0.8) * 40 + i * 12),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (v: number) =>
  v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v}`;

const pct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;

// ─── KPI Card ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  sub: string;
  change: number;
  icon: React.ElementType;
  gradient: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, sub, change, icon: Icon, gradient }) => {
  const positive = change >= 0;
  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
      {/* Decorative circle */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: gradient }}
      />
      <div className="flex items-center justify-between">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
          style={{ background: gradient }}
        >
          <Icon size={22} className="text-white" strokeWidth={2} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            positive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {pct(change)}
        </span>
      </div>
      <div>
        <p className="text-textMuted text-sm font-semibold">{title}</p>
        <p className="text-[28px] font-extrabold text-text tracking-tight mt-0.5">{value}</p>
        <p className="text-textMuted text-xs font-medium mt-1">{sub}</p>
      </div>
    </div>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({
  title, subtitle, children,
}: { title: string; subtitle?: string; children?: React.ReactNode }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h3 className="text-[20px] font-extrabold text-text tracking-tight">{title}</h3>
      {subtitle && <p className="text-sm text-textMuted font-medium mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, currency = true }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 text-sm min-w-[140px]">
      <p className="font-bold text-text mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-semibold" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: {currency ? `R$ ${Number(p.value).toLocaleString('pt-BR')}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Period Selector ─────────────────────────────────────────────────────────
const PeriodSelector = ({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) => (
  <div className="flex bg-background rounded-xl p-1 gap-1">
    {['7D', '1M', '3M', '6M', '1A'].map((p) => (
      <button
        key={p}
        onClick={() => onChange(p)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          value === p
            ? 'bg-white text-primary shadow-sm'
            : 'text-textMuted hover:text-text'
        }`}
      >
        {p}
      </button>
    ))}
  </div>
);

// ─── Main Income Page ─────────────────────────────────────────────────────────
export const Income: React.FC = () => {
  const [revPeriod, setRevPeriod] = useState('1A');
  const [cashPeriod, setCashPeriod] = useState('1M');

  const totalReceita  = revenueData.reduce((s, d) => s + d.receita, 0);
  const totalDespesas = revenueData.reduce((s, d) => s + d.despesas, 0);
  const totalLucro    = revenueData.reduce((s, d) => s + d.lucro, 0);
  const margemLucro   = ((totalLucro / totalReceita) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-2">

      {/* ── Page Header ── */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold text-text tracking-tight">Income & Finanças</h2>
          <p className="text-textMuted font-medium mt-1">Controle financeiro completo do seu negócio</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-textMuted font-semibold">Período:</span>
          <select className="bg-card border border-gray-100 rounded-xl text-sm px-4 py-2 text-text font-bold cursor-pointer focus:ring-0 outline-none shadow-sm">
            <option>Ano 2025</option>
            <option>Ano 2024</option>
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          title="Receita Total"
          value={fmt(totalReceita)}
          sub="Acumulado no ano"
          change={18.4}
          icon={DollarSign}
          gradient={`linear-gradient(135deg, ${PRIMARY}, ${INDIGO})`}
        />
        <KpiCard
          title="Despesas Totais"
          value={fmt(totalDespesas)}
          sub="Acumulado no ano"
          change={8.1}
          icon={CreditCard}
          gradient={`linear-gradient(135deg, ${ROSE}, #f97316)`}
        />
        <KpiCard
          title="Lucro Líquido"
          value={fmt(totalLucro)}
          sub={`Margem de ${margemLucro}%`}
          change={31.2}
          icon={TrendingUp}
          gradient={`linear-gradient(135deg, ${EMERALD}, ${TEAL})`}
        />
        <KpiCard
          title="Ticket Médio"
          value="R$ 348"
          sub="Por transação"
          change={5.7}
          icon={ShoppingCart}
          gradient={`linear-gradient(135deg, ${AMBER}, #fb923c)`}
        />
      </div>

      {/* ── Revenue vs Expenses (Area) ── */}
      <div className="bg-card rounded-2xl shadow-sm p-8">
        <SectionHeader
          title="Receita vs Despesas"
          subtitle="Visão anual de receita, despesas e lucro líquido"
        >
          <PeriodSelector value={revPeriod} onChange={setRevPeriod} />
        </SectionHeader>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ROSE} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={ROSE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={EMERALD} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={EMERALD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 13, fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={56} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingTop: 16, fontSize: 13, fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="receita"  name="Receita"   stroke={PRIMARY}  strokeWidth={2.5} fill="url(#gradReceita)"  dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="despesas" name="Despesas"  stroke={ROSE}     strokeWidth={2.5} fill="url(#gradDespesas)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="lucro"    name="Lucro"     stroke={EMERALD}  strokeWidth={2.5} fill="url(#gradLucro)"    dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Cash Flow + Expense Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Cash Flow (Bar) — 3/5 */}
        <div className="bg-card rounded-2xl shadow-sm p-8 lg:col-span-3">
          <SectionHeader
            title="Fluxo de Caixa"
            subtitle="Entradas e saídas semanais"
          >
            <PeriodSelector value={cashPeriod} onChange={setCashPeriod} />
          </SectionHeader>

          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 13, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} width={52} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 12, fontSize: 13, fontWeight: 700 }} />
                <Bar dataKey="entradas" name="Entradas" fill={EMERALD} radius={[6, 6, 0, 0]} />
                <Bar dataKey="saidas"   name="Saídas"   fill={ROSE}    radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cash flow summary row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Entradas', value: 'R$ 193k', color: EMERALD, up: true  },
              { label: 'Total Saídas',   value: 'R$ 134k', color: ROSE,    up: false },
              { label: 'Saldo Líquido',  value: 'R$ 59k',  color: PRIMARY, up: true  },
            ].map((item) => (
              <div key={item.label} className="bg-background rounded-xl p-4 text-center">
                <p className="text-xs text-textMuted font-semibold mb-1">{item.label}</p>
                <p className="text-[18px] font-extrabold" style={{ color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown (Pie) — 2/5 */}
        <div className="bg-card rounded-2xl shadow-sm p-8 lg:col-span-2 flex flex-col">
          <SectionHeader title="Distribuição de Despesas" subtitle="Categorias de custos" />

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {expenseBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value}%`, '']}
                    contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 mt-2">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-sm text-textMuted font-semibold">{item.name}</span>
                </div>
                <span className="text-sm font-extrabold text-text">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conversion Rate + Top Channels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Conversion Rate (Line) — 3/5 */}
        <div className="bg-card rounded-2xl shadow-sm p-8 lg:col-span-3">
          <SectionHeader
            title="Taxa de Conversão"
            subtitle="Evolução mensal da taxa de conversão (%)"
          />
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradConv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor={PRIMARY} />
                    <stop offset="100%" stopColor={TEAL} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 13, fontWeight: 600 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `${v}%`} width={40} />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 text-sm">
                        <p className="font-bold text-text">{label}</p>
                        <p className="font-semibold" style={{ color: PRIMARY }}>Taxa: {payload[0].value}%</p>
                      </div>
                    ) : null
                  }
                />
                <Line
                  type="monotone"
                  dataKey="taxa"
                  name="Conversão"
                  stroke="url(#gradConv)"
                  strokeWidth={3}
                  dot={{ fill: PRIMARY, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: PRIMARY, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* MoM insight */}
          <div className="mt-4 flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-3">
            <Activity size={16} className="text-primary" />
            <p className="text-xs font-bold text-primary">
              Taxa cresceu <span className="text-emerald-600">+143%</span> no ano — de 3.2% para 7.8%
            </p>
          </div>
        </div>

        {/* Top Revenue Channels — 2/5 */}
        <div className="bg-card rounded-2xl shadow-sm p-8 lg:col-span-2 flex flex-col">
          <SectionHeader title="Canais de Receita" subtitle="Performance por canal" />

          <div className="space-y-4 flex-1">
            {topChannels.map((ch) => {
              const maxVal = Math.max(...topChannels.map((c) => c.value));
              const barWidth = (ch.value / maxVal) * 100;
              return (
                <div key={ch.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-text">{ch.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-text">
                        {fmt(ch.value)}
                      </span>
                      <span
                        className={`text-xs font-bold flex items-center gap-0.5 ${
                          ch.growth >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {ch.growth >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(ch.growth)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%`, background: ch.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue total */}
          <div className="mt-6 bg-background rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <span className="text-sm font-bold text-text">Total do Período</span>
            </div>
            <span className="text-lg font-extrabold text-primary">
              {fmt(topChannels.reduce((s, c) => s + c.value, 0))}
            </span>
          </div>
        </div>
      </div>

      {/* ── Ticket Médio (Bar) ── */}
      <div className="bg-card rounded-2xl shadow-sm p-8">
        <SectionHeader
          title="Evolução do Ticket Médio"
          subtitle="Valor médio por transação ao longo do ano"
        >
          <div className="flex items-center gap-2 bg-primary/5 rounded-xl px-4 py-2">
            <Wallet size={16} className="text-primary" />
            <span className="text-sm font-bold text-primary">Atual: R$ 348</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <ArrowUpRight size={12} /> +15.6%
            </span>
          </div>
        </SectionHeader>

        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketMedioData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradTicket" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PRIMARY} stopOpacity={1} />
                  <stop offset="100%" stopColor={INDIGO} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f5" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 13, fontWeight: 600 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a0a0b0', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `R$${v}`} width={56} />
              <Tooltip
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 text-sm">
                      <p className="font-bold text-text">{label}</p>
                      <p className="font-semibold" style={{ color: PRIMARY }}>Ticket: R$ {payload[0].value}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="ticket" name="Ticket Médio" fill="url(#gradTicket)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Goal Progress Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Meta de Receita',    current: 825000, target: 900000, color: PRIMARY },
          { label: 'Meta de Novos Clientes', current: 142, target: 200,    color: TEAL,    suffix: '' },
          { label: 'Redução de Custos',  current: 62,     target: 80,     color: EMERALD, suffix: '%' },
        ].map((g) => {
          const progress = Math.min((g.current / g.target) * 100, 100).toFixed(0);
          const isAmount = g.label === 'Meta de Receita';
          const isCost   = g.label === 'Redução de Custos';
          return (
            <div key={g.label} className="bg-card rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-textMuted">{g.label}</p>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-background" style={{ color: g.color }}>
                  {progress}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-text mb-1">
                {isAmount
                  ? `R$ ${(g.current / 1000).toFixed(0)}k`
                  : isCost
                  ? `${g.current}%`
                  : g.current}
                <span className="text-sm text-textMuted font-semibold ml-1">
                  / {isAmount ? `${(g.target / 1000).toFixed(0)}k` : isCost ? `${g.target}%` : g.target}
                </span>
              </p>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%`, background: g.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default Income;
