import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Typography, Button, Container, Grid,
  Card, CardContent, Stack, Chip, useScrollTrigger, Slide,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Group as GroupIcon,
  ViewKanban as KanbanIcon,
  BarChart as BarChartIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { Hero195 } from '../../components/ui/hero-195';

// ─── Hide on scroll ────────────────────────────────────────────────────────────
function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

// ─── Feature cards data ─────────────────────────────────────────────────────────
const features = [
  {
    icon: <DashboardIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Dashboard Inteligente',
    desc: 'Visualize todas as métricas essenciais do seu negócio em tempo real e de forma clara.',
    color: 'rgba(108,92,231,0.1)',
  },
  {
    icon: <GroupIcon sx={{ fontSize: 32, color: '#00CEC9' }} />,
    title: 'Gestão de Clientes',
    desc: 'Centralize informações, histórico e dados de contato dos seus clientes em um único lugar.',
    color: 'rgba(0,206,201,0.1)',
  },
  {
    icon: <KanbanIcon sx={{ fontSize: 32, color: '#FDCB6E' }} />,
    title: 'Pipeline Visual',
    desc: 'Acompanhe vendas de ponta a ponta com um kanban simples, drag-and-drop e intuitivo.',
    color: 'rgba(253,203,110,0.12)',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 32, color: '#E17055' }} />,
    title: 'Relatórios & Metas',
    desc: 'Acompanhe desempenho da equipe, taxas de conversão e receita com gráficos detalhados.',
    color: 'rgba(225,112,85,0.1)',
  },
];

// ─── Trust signals ──────────────────────────────────────────────────────────────
const trust = [
  { icon: <SecurityIcon fontSize="small" />, label: 'Dados protegidos' },
  { icon: <LockIcon fontSize="small" />, label: 'Infraestrutura segura' },
  { icon: <CheckCircleIcon fontSize="small" />, label: 'Backup automático' },
  { icon: <BusinessIcon fontSize="small" />, label: 'Controle por empresa' },
];

export default function LandingPage() {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
      <HideOnScroll>
        <AppBar position="fixed" elevation={0}>
          <Toolbar sx={{ px: { xs: 2, md: 4 }, py: 1 }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                background: 'linear-gradient(135deg, #6C5CE7, #8B7CF3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(108,92,231,0.4)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
                CRM<Box component="span" sx={{ color: 'primary.light' }}>Local</Box>
              </Typography>
            </Box>

            {/* Links */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component={Link}
                to="/login"
                sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
              >
                Entrar
              </Button>
              <Button
                variant="contained"
                component="a"
                href="#testar"
                sx={{ px: 3 }}
              >
                Fale Conosco
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      {/* ─── Hero (Hero195 component) ──────────────────────────────────────── */}
      <Hero195 />

      {/* ─── Features Section ─────────────────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Recursos" size="small" sx={{ mb: 2, bgcolor: 'rgba(108,92,231,0.08)', color: 'primary.main', fontWeight: 700 }} />
            <Typography variant="h2"
              sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, letterSpacing: '-1px', mb: 2 }}>
              Tudo que você precisa em um só lugar
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 520, mx: 'auto' }}>
              Um sistema completo sem a complexidade que você não usa.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((f) => (
              <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={f.title}>
                <Card sx={{ height: '100%', p: 1 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 2.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: f.color, mb: 3,
                    }}>
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {f.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ─── Dashboard Preview Section ──────────────────────────────────────── */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, bgcolor: '#F5F6FA' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Visão geral" size="small" sx={{ mb: 2, bgcolor: 'rgba(108,92,231,0.08)', color: 'primary.main', fontWeight: 700 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, letterSpacing: '-1px', mb: 2 }}>
              Veja seu negócio em um único painel
            </Typography>
          </Box>

          {/* Large browser mockup */}
          <Box sx={{
            bgcolor: 'white',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
            mx: 'auto',
            maxWidth: 900,
          }}>
            {/* Chrome bar */}
            <Box sx={{ bgcolor: '#F8F9FE', borderBottom: '1px solid #E5E7EB', px: 2, py: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
              {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                <Box key={c} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c }} />
              ))}
              <Box sx={{ flex: 1, bgcolor: '#EEF0F5', borderRadius: 1, height: 22, mx: 2, maxWidth: 260 }} />
            </Box>

            <Box sx={{ display: 'flex', minHeight: 440, bgcolor: '#F5F6FA' }}>
              {/* Sidebar */}
              <Box sx={{ width: 220, bgcolor: 'white', borderRight: '1px solid #E5E7EB', p: 3, display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Box sx={{ width: 28, height: 28, bgcolor: '#6C5CE7', borderRadius: 1 }} />
                  <Box sx={{ height: 14, width: 80, bgcolor: '#E5E7EB', borderRadius: 1 }} />
                </Box>
                {[
                  ['#6C5CE7', 72, '#2D3436'],
                  ['#E0E0E0', 56, '#CCC'],
                  ['#E0E0E0', 80, '#CCC'],
                  ['#E0E0E0', 48, '#CCC'],
                ].map(([dot, w, text], i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{ width: 18, height: 18, bgcolor: dot, borderRadius: 0.5 }} />
                    <Box sx={{ height: 10, width: w, bgcolor: text, borderRadius: 1 }} />
                  </Box>
                ))}
              </Box>

              {/* Content */}
              <Box sx={{ flex: 1, p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Box sx={{ height: 24, width: 160, bgcolor: '#D1D5DB', borderRadius: 1 }} />
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ height: 28, width: 160, bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 8, display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#D1D5DB' }} />
                  </Box>
                </Box>

                {/* KPI cards */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  {[
                    ['rgba(0,172,105,0.1)', '#00AC69'],
                    ['rgba(100,181,246,0.12)', '#42A5F5'],
                    ['rgba(164,40,255,0.1)', '#A428FF'],
                  ].map(([bg, _accent], i) => (
                    <Box key={i} sx={{ flex: 1, bgcolor: 'white', borderRadius: 2.5, p: 2.5, boxShadow: '0 1px 8px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: bg, mb: 2 }} />
                      <Box sx={{ height: 8, width: 48, bgcolor: '#E5E7EB', borderRadius: 1, mb: 1.5 }} />
                      <Box sx={{ height: 16, width: 100, borderRadius: 1, bgcolor: '#D1D5DB' }} />
                    </Box>
                  ))}
                </Stack>

                {/* Charts row */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  {/* Bar chart */}
                  <Box sx={{
                    flex: 2, bgcolor: 'white', borderRadius: 2.5, p: 2.5,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0',
                  }}>
                    <Box sx={{ height: 10, width: 80, bgcolor: '#E5E7EB', borderRadius: 1, mb: 3 }} />
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 100 }}>
                      {[40, 65, 50, 80, 60, 95, 70].map((h, i) => (
                        <Box key={i} sx={{
                          flex: 1, borderRadius: '4px 4px 0 0',
                          bgcolor: i === 5 ? '#6C5CE7' : i === 3 ? '#8B7CF3' : '#EDE9FF',
                          height: `${h}%`,
                        }} />
                      ))}
                    </Box>
                  </Box>

                  {/* Donut placeholder */}
                  <Box sx={{
                    flex: 1, bgcolor: 'white', borderRadius: 2.5, p: 2.5,
                    boxShadow: '0 1px 8px rgba(0,0,0,0.05)', border: '1px solid #F0F0F0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Box sx={{
                      width: 100, height: 100, borderRadius: '50%',
                      background: 'conic-gradient(#6C5CE7 0% 60%, #8B7CF3 60% 80%, #EDE9FF 80% 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Box sx={{ width: 60, height: 60, borderRadius: '50%', bgcolor: 'white' }} />
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ─── Trust Signals ───────────────────────────────────────────────────── */}
      <Box
        component="section"
        sx={{
          py: 4,
          bgcolor: 'white',
          borderTop: '1px solid #E5E7EB',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 2, sm: 4, md: 6 }}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
          >
            {trust.map((t) => (
              <Stack key={t.label} direction="row" spacing={1} alignItems="center"
                sx={{ color: 'text.secondary', opacity: 0.75, fontWeight: 500 }}>
                <Box sx={{ color: 'primary.main' }}>{t.icon}</Box>
                <Typography variant="body2" fontWeight={600}>{t.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ─── Final CTA ───────────────────────────────────────────────────────── */}
      <Box
        component="section"
        id="testar"
        sx={{
          py: { xs: 12, md: 18 },
          background: 'linear-gradient(160deg, #0A0E1A 0%, #1A1033 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Chip
            label="Comece agora"
            size="small"
            sx={{ mb: 3, bgcolor: 'rgba(108,92,231,0.2)', color: 'primary.light', border: '1px solid rgba(108,92,231,0.4)', fontWeight: 700 }}
          />
          <Typography
            variant="h2"
            sx={{ fontSize: { xs: '2rem', md: '3.25rem' }, color: 'white', letterSpacing: '-1px', mb: 3 }}
          >
            Pronto para organizar<br />seu comercial?
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, mx: 'auto', mb: 6, fontWeight: 400, lineHeight: 1.8 }}>
            Junte-se a dezenas de empresas locais que já transformaram a forma como acompanham clientes e vendas.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/login"
            endIcon={<ArrowForwardIcon />}
            sx={{ py: 2, px: 6, fontSize: '1.05rem' }}
          >
            Criar minha conta gratuita
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 2.5, color: 'rgba(255,255,255,0.3)' }}>
            7 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </Typography>
        </Container>
      </Box>

      {/* ─── Footer ──────────────────────────────────────────────────────────── */}
      <Box component="footer" sx={{ py: 4, bgcolor: '#050810', textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
          © {new Date().getFullYear()} CRMLocal. Todos os direitos reservados.
        </Typography>
      </Box>

    </Box>
  );
}
