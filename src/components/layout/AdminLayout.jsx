import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Contact, Tags, 
  Bell, BarChart3, Settings, LogOut, Shield, Database, 
  Menu, X, Globe, Sparkles, Activity
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function AdminLayout({ 
  user, 
  onSignOut, 
  language, 
  onToggleLanguage, 
  supabaseStatus,
  onOpenTests 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const t = translations[language];

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { to: '/admin/officers', icon: Users, label: language === 'hi' ? 'ऑफिसर्स' : 'Officers' },
    { to: '/admin/contacts', icon: Contact, label: language === 'hi' ? 'सभी मतदाता' : 'All Contacts' },
    { to: '/admin/categories', icon: Tags, label: language === 'hi' ? 'श्रेणियां' : 'Categories' },
    { to: '/admin/reminders', icon: Bell, label: language === 'hi' ? 'रिमाइंडर्स' : 'Reminders' },
    { to: '/admin/reports', icon: BarChart3, label: language === 'hi' ? 'रिपोर्ट्स' : 'Reports' },
    { to: '/admin/settings', icon: Settings, label: language === 'hi' ? 'सेटिंग्स व लॉग्स' : 'Settings & Logs' },
  ];

  const handleLogout = () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 1. ADMIN SIDEBAR */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-purple-500/20 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white leading-tight">Election Admin</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN CONSOLE
                </span>
              </div>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            {language === 'hi' ? 'मुख्य मेनू' : 'Main Menu'}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition
                ${isActive 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
              `}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Quick Create Officer Button */}
          <div className="pt-4 px-1">
            <NavLink
              to="/admin/officers/create"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 font-bold text-xs transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया ऑफिसर बनाएं' : '+ Create Officer'}</span>
            </NavLink>
          </div>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-extrabold text-white truncate">{user?.name || user?.username}</div>
              <div className="text-[11px] text-purple-400 font-semibold truncate">@{user?.username}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 transition shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
            <Database className="w-3 h-3 text-purple-400 shrink-0" />
            <span className="truncate">{supabaseStatus || 'Secure Cloud Connected'}</span>
          </div>
        </div>
      </aside>

      {/* 2. ADMIN MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Welcome,</span>{' '}
              <span className="text-xs font-bold text-white">{user?.name || 'Administrator'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenTests && (
              <button 
                onClick={onOpenTests}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
                title="System Acceptance Tests (20 AT Tests)"
              >
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Tests (20)</span>
              </button>
            )}

            <button 
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="sm:hidden p-1.5 rounded-xl bg-rose-500/10 text-rose-400"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
