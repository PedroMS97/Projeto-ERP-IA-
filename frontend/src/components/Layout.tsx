import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Users, Briefcase, BarChart, Settings } from 'lucide-react';
import { NavBar } from './ui/tubelight-navbar';

const NAV_ITEMS = [
  { name: 'Dashboard', url: '/dashboard', icon: Home },
  { name: 'Customers', url: '/dashboard/clients', icon: Users },
  { name: 'Pipeline', url: '/dashboard/pipeline', icon: Briefcase },
  { name: 'Income', url: '/dashboard/reports', icon: BarChart },
  { name: 'Promote', url: '/dashboard/settings', icon: Settings },
];

export const Layout = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-text font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-gray-100 flex flex-col shadow-sm z-10">
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Dashboard
            <span className="text-[10px] text-textMuted ml-1 align-top relative top-1">v.01</span>
          </span>
        </div>

        {/* ── Tubelight NavBar (vertical inside sidebar) ── */}
        {/* 
          The NavBar is designed as a horizontal pill bar.
          We render it in a column mode inside the sidebar by wrapping it
          in a relative container and removing the fixed positioning override.
        */}
        <nav className="flex-1 px-4 mt-2">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium relative ${
                    isActive
                      ? 'bg-primary/5 text-primary'
                      : 'text-textMuted hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-6 mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-3 text-text hover:text-danger hover:bg-danger/10 rounded-xl transition-colors font-medium border border-gray-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar with Tubelight NavBar floating centered */}
        <header className="relative h-20 bg-background flex items-center justify-between px-10">
          {/* Left: page title */}
          <h1 className="text-[22px] font-bold">
            Hello {user?.name || 'User'} 👋
          </h1>

          {/* Center: Tubelight NavBar — floats over the header */}
          <NavBar
            items={NAV_ITEMS}
            className="hidden lg:block"
          />

          {/* Right: user avatar */}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-white/50 p-2 rounded-xl transition-colors">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-500 flex items-center justify-center text-white font-bold shadow-md text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-semibold text-sm leading-tight text-text">{user?.name || 'User'}</p>
              <p className="text-xs text-textMuted font-medium">{user?.role || 'Project Manager'}</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-10 pb-10 pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
