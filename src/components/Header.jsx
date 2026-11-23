import React from 'react';
import { 
  Users, Globe, Sparkles, LogOut, LayoutDashboard, 
  UserCheck, Bell, Database, Shield, PhoneCall
} from 'lucide-react';
import { translations } from '../locales/translations';

export default function Header({ 
  language, 
  onToggleLanguage, 
  supabaseStatus, 
  onOpenTests, 
  onSignOut,
  user,
  activeTab,
  onSelectTab,
  dueRemindersCount = 0
}) {
  const t = translations[language];

  // Role-Based Navigation Configuration
  const navTabs = user?.role === 'ADMIN' ? [
    { id: 'admin', label: 'Admin Page', icon: Shield },
    { id: 'dashboard', label: t.navDashboard, icon: LayoutDashboard },
    { id: 'contacts', label: t.navContacts, icon: UserCheck }
  ] : [
    { id: 'officer', label: t.navOfficer || 'Officer Page (Call/Msg)', icon: PhoneCall },
    { id: 'contacts', label: t.navContacts, icon: UserCheck },
    { id: 'reminders', label: t.navReminders, icon: Bell, badge: dueRemindersCount }
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20 flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-none">
                {t.appTitle}
              </h1>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>v1.0 Ready</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:flex items-center gap-1.5 mt-1 font-medium">
              <Database className="w-3 h-3 text-indigo-400" />
              <span className="truncate max-w-xs">{supabaseStatus}</span>
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Hidden on Mobile, Visible on Desktop/Laptop) */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-2xl border border-slate-700/60 shadow-inner">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition relative ${
                  isActive 
                    ? (tab.id === 'admin' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20' 
                        : (tab.id === 'officer'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'))
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions, Language & Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Switcher */}
          <button 
            onClick={onToggleLanguage}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700/80 text-slate-200 shadow-sm"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs">{language === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Test Suite Trigger */}
          <button 
            onClick={onOpenTests}
            className="hidden md:flex px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/80 items-center gap-1.5 transition shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.runTests}</span>
          </button>

          {/* User Profile Pill & Sign Out */}
          {user && (
            <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-slate-800">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                  {user.name || user.username || user.email?.split('@')[0]}
                </span>
                <span className="text-[10px] font-bold flex items-center justify-end gap-1 mt-0.5">
                  {user.role === 'ADMIN' ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">Admin</span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Field Officer</span>
                  )}
                </span>
              </div>
              
              <button 
                onClick={onSignOut}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 transition flex items-center gap-1.5 text-xs font-bold" 
                title={t.signOut}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.signOut}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
