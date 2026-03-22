import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart2, Users, Kanban, Shield, CheckCircle, Zap } from 'lucide-react';
import { Button } from './button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Card, CardContent } from './card';
import { BorderBeam } from './border-beam';

// ─── Dashboard screenshot card ─────────────────────────────────────────────────
const DashboardPreview = () => (
  <div className="w-full bg-white rounded-xl overflow-hidden border border-gray-100 shadow-2xl">
    {/* Browser chrome */}
    <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <span key={c} className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: c }} />
      ))}
      <div className="flex-1 bg-gray-100 rounded h-5 mx-3 max-w-xs text-[10px] text-gray-400 flex items-center px-3 font-mono select-none">
        app.crm.local/dashboard
      </div>
    </div>
    {/* Actual screenshot */}
    <img
      src="/dashboard-original.png"
      alt="CRM Dashboard Preview"
      className="w-full block"
      draggable={false}
    />
  </div>
);

// ─── Feature tabs ──────────────────────────────────────────────────────────────
const tabFeatures = [
  {
    value: 'clientes',
    label: 'Clientes',
    icon: Users,
    title: 'Gestão de Clientes',
    desc: 'Centralize todos os dados dos seus clientes, histórico de contatos, CNPJ, status e muito mais em um único painel organizado.',
    color: 'text-violet-600',
  },
  {
    value: 'pipeline',
    label: 'Pipeline',
    icon: Kanban,
    title: 'Pipeline de Vendas',
    desc: 'Acompanhe cada negociação em tempo real. Visualize em qual etapa cada cliente está e aja rapidamente para fechar mais vendas.',
    color: 'text-amber-600',
  },
  {
    value: 'relatorios',
    label: 'Relatórios',
    icon: BarChart2,
    title: 'Relatórios & Métricas',
    desc: 'Gráficos claros de receita, conversão e crescimento. Tome decisões baseadas em dados reais, não em achismos.',
    color: 'text-emerald-600',
  },
];

// ─── Trust badges ──────────────────────────────────────────────────────────────
const badges = [
  { icon: Shield, text: 'Dados criptografados' },
  { icon: Zap, text: 'Setup em 5 minutos' },
  { icon: CheckCircle, text: '7 dias grátis' },
];

// ─── Hero195 ───────────────────────────────────────────────────────────────────
export function Hero195() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0A0E1A] via-[#12093A] to-[#0A0E1A] pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[140px]" />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* ── Badge ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-violet-300 border border-violet-500/30 bg-violet-500/10 backdrop-blur-sm">
            ✦ Feito para empresas locais brasileiras
          </span>
        </motion.div>

        {/* ── Headline ── */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6"
        >
          Organize vendas.{' '}
          <br className="hidden sm:block" />
          Controle clientes.{' '}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Cresça com previsibilidade.
          </span>
        </motion.h1>

        {/* ── Subheadline ── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-base md:text-lg text-white/55 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          O CRM simples e profissional criado para pequenas e médias empresas.
          Dashboard, clientes, pipeline e relatórios num único lugar.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
        >
          <Button size="lg" asChild className="bg-gradient-to-r from-primary to-indigo-600 hover:from-indigo-600 hover:to-primary shadow-xl shadow-primary/30 text-white font-bold px-8">
            <Link to="/login">
              Começar grátis <ArrowRight className="ml-2" size={18} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="border-white/20 text-white bg-white/5 hover:bg-white/10 backdrop-blur-sm font-bold px-8">
            <a href="#features">Ver recursos</a>
          </Button>
        </motion.div>

        {/* ── Trust badges ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-wrap justify-center gap-5 mb-16"
        >
          {badges.map(({ icon: Icon, text }) => (
            <span key={text} className="flex items-center gap-1.5 text-xs text-white/40 font-semibold">
              <Icon size={14} className="text-emerald-400" />
              {text}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Dashboard card with BorderBeam — full-width with 15% side padding ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative px-4 sm:px-8 lg:px-[10%] mt-0 z-10"
      >
        <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          <DashboardPreview />
          <BorderBeam
            size={300}
            duration={10}
            colorFrom="#6C5CE7"
            colorTo="#00CEC9"
            borderWidth={2}
          />
        </div>
        {/* Glow under card */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/30 blur-3xl rounded-full" />
      </motion.div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-3 gap-6 text-center max-w-lg mx-auto"
        >
          {[
            { value: '+120', label: 'Empresas ativas' },
            { value: '98%', label: 'Satisfação' },
            { value: '<5min', label: 'Para começar' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-extrabold text-white">{s.value}</p>
              <p className="text-xs text-white/40 font-semibold mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Feature Tabs Section ── */}
      <div id="features" className="container mx-auto px-6 max-w-5xl relative z-10 mt-32">
        <div className="text-center mb-12">
          <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold text-violet-300 border border-violet-500/30 bg-violet-500/10 mb-4">
            Recursos
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4">
            Tudo que você precisa,<br />
            <span className="text-white/50">sem o que você não usa.</span>
          </h2>
        </div>

        <Tabs defaultValue="clientes" className="w-full">
          <TabsList className="flex mx-auto w-fit mb-10 bg-white/5 border border-white/10">
            {tabFeatures.map((f) => (
              <TabsTrigger
                key={f.value}
                value={f.value}
                className="text-white/50 data-[state=active]:bg-white/10 data-[state=active]:text-white px-5 py-2"
              >
                <f.icon size={15} className="mr-1.5 inline" />
                {f.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabFeatures.map((f) => (
            <TabsContent key={f.value} value={f.value}>
              <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white">
                <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/10 flex-shrink-0`}>
                    <f.icon size={32} className={f.color} />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold mb-3">{f.title}</h3>
                    <p className="text-white/55 leading-relaxed text-base">{f.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
