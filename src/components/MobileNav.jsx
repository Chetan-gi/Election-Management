import React from 'react';
import { LayoutDashboard, Users, Bell, Plus, Shield, PhoneCall } from 'lucide-react';
import { translations } from '../locales/translations';

export default function MobileNav({ 
  activeTab, 
  onSelectTab, 
  onOpenAdd, 
  dueRemindersCount, 
  language,
  user
}) {
  const t = translations[language];
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
      
      {/* 1. Primary Landing Tab */}
      {isAdmin ? (
        <button
          onClick={() => onSelectTab('admin')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'admin' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] tracking-tight">Admin</span>
        </button>
      ) : (
        <button
          onClick={() => onSelectTab('officer')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'officer' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Call/Msg</span>
        </button>
      )}

      {/* 2. Voter Directory */}
      <button
        onClick={() => onSelectTab('contacts')}
        className={`flex flex-col items-center gap-1 transition ${
          activeTab === 'contacts' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] tracking-tight">{t.navContacts}</span>
      </button>

      {/* 3. Center FAB: Add Voter Entry */}
      <button
        onClick={onOpenAdd}
        className="w-12 h-12 -mt-6 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-slate-900 active:scale-95 transition shrink-0"
        title={t.addContact}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 4. Dashboard (Admin) or Reminders (Officer) */}
      {isAdmin ? (
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition ${
            activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">{t.navDashboard}</span>
        </button>
      ) : (
        <button
          onClick={() => onSelectTab('reminders')}
          className={`flex flex-col items-center gap-1 transition relative ${
            activeTab === 'reminders' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {dueRemindersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">{t.navReminders}</span>
        </button>
      )}

    </nav>
  );
}
