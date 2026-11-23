import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, Bell, User, 
  LogOut, PhoneCall, Database, Menu, X, Globe, ShieldCheck
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function OfficerLayout({ 
  user, 
  onSignOut, 
  language, 
  onToggleLanguage, 
  supabaseStatus,
  dueRemindersCount = 0
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const t = translations[language];

  const navItems = [
    { to: '/officer/dashboard', icon: LayoutDashboard, label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard' },
    { to: '/officer/contacts', icon: Users, label: language === 'hi' ? 'मेरे मतदाता' : 'My Contacts' },
    { to: '/officer/contacts/create', icon: UserPlus, label: language === 'hi' ? 'नया मतदाता जोड़ें' : 'Add Contact' },
    { to: '/officer/reminders', icon: Bell, label: language === 'hi' ? 'रिमाइंडर्स' : 'Reminders', badge: dueRemindersCount },
    { to: '/officer/profile', icon: User, label: language === 'hi' ? 'मेरी प्रोफाइल' : 'My Profile' },
  ];

  const handleLogout = () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans selection:bg-emerald-500 selection:text-white pb-16 lg:pb-0">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* 1. OFFICER SIDEBAR (DESKTOP) */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 border-r border-emerald-500/20 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight text-white leading-tight">Officer Portal</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  FIELD OPERATIONS
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
            {language === 'hi' ? 'फील्ड ऑपरेशन्स' : 'Field Operations'}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition
                ${isActive 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Direct Add Voter Quick Button */}
          <div className="pt-4 px-1">
            <NavLink
              to="/officer/contacts/create"
              onClick={() => setSidebarOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-500/25"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया मतदाता जोड़ें' : '+ Add New Contact'}</span>
            </NavLink>
          </div>
        </div>

        {/* Officer Profile & Logout Bottom Bar */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          <div className="flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <div className="font-extrabold text-white truncate">{user?.name || user?.username}</div>
              <div className="text-[11px] text-emerald-400 font-semibold truncate">@{user?.username}</div>
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
            <Database className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{supabaseStatus || 'Secure Cloud Connected'}</span>
          </div>
        </div>
      </aside>

      {/* 2. OFFICER MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-emerald-500/20 px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Campaign Field Officer:</span>{' '}
              <span className="text-xs font-bold text-white">{user?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button 
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
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

      {/* 3. MOBILE BOTTOM NAVIGATION (FIELD USE) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/30 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        <NavLink
          to="/officer/dashboard"
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </NavLink>

        <NavLink
          to="/officer/contacts"
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Contacts</span>
        </NavLink>

        <NavLink
          to="/officer/contacts/create"
          className="w-12 h-12 -mt-6 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-slate-900 shrink-0 active:scale-95 transition"
        >
          <UserPlus className="w-6 h-6" />
        </NavLink>

        <NavLink
          to="/officer/reminders"
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Reminders</span>
        </NavLink>

        <NavLink
          to="/officer/profile"
          className={({ isActive }) => `flex flex-col items-center gap-1 ${isActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profile</span>
        </NavLink>
      </nav>

    </div>
  );
}
