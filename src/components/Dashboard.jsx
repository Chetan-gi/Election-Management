import React from 'react';
import { 
  Bell, Phone, CheckCircle2, UserCheck, Scale, Users2, 
  Calendar, ChevronRight, TrendingUp, Sparkles, MessageSquare
} from 'lucide-react';
import { translations } from '../locales/translations';

export default function Dashboard({ 
  stats, 
  dueTodayReminders, 
  upcomingOccasions, 
  language, 
  onFilterCategory 
}) {
  const t = translations[language];

  // Voter Distribution percentages
  const total = stats.total || 1;
  const supporterPct = Math.round((stats.supporters / total) * 100);
  const neutralPct = Math.round((stats.neutral / total) * 100);
  const otherPct = Math.round((stats.other / total) * 100);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in max-w-7xl mx-auto pb-12 sm:pb-0">
      
      {/* 1. Reminders Due Today (D-1 Precision Notification Banner) */}
      {dueTodayReminders.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 sm:p-7 text-white shadow-2xl shadow-orange-500/20 border border-white/20">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full flex items-center gap-2 border border-white/20">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>{t.remindersDueToday}</span>
              </span>
              <span className="text-xs font-bold text-white/90 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                23 Nov 2026 &bull; 09:00 AM Dispatch
              </span>
            </div>

            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white mt-2">
              {dueTodayReminders.length} {t.remindersSubtitle}
            </h3>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueTodayReminders.map((r, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950/30 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/15 hover:bg-slate-950/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-extrabold text-white truncate">{r.contact.fullName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                        {r.type === 'BIRTHDAY' ? '🎂 Birthday' : '💍 Anniversary'}
                      </span>
                    </div>
                    <div className="text-amber-100 text-xs font-medium mt-1 truncate">{r.message}</div>
                    <div className="text-[11px] text-white/70 mt-0.5">📍 {r.contact.village}, {r.contact.ward}</div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <a 
                      href={`tel:${r.contact.mobile}`}
                      className="px-3 py-2 bg-white text-orange-600 rounded-xl font-bold flex items-center gap-1.5 shadow-md hover:bg-slate-100 active:scale-95 transition text-xs"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                    <a 
                      href={`https://wa.me/91${r.contact.mobile}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md transition"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Key Metrics Cards (Responsive 4-Col on Laptop, 2-Col on Mobile) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Total Contacts */}
        <div className="bg-slate-900/60 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.totalContacts}
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">{stats.total}</div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.activeInDirectory}</span>
            </div>
          </div>
          {/* Progress Distribution Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div style={{ width: `${supporterPct}%` }} className="bg-emerald-500 h-full" title="Supporters"></div>
            <div style={{ width: `${neutralPct}%` }} className="bg-sky-500 h-full" title="Neutral"></div>
            <div style={{ width: `${otherPct}%` }} className="bg-slate-500 h-full" title="Other"></div>
          </div>
        </div>

        {/* Confirmed Supporters */}
        <div 
          onClick={() => onFilterCategory('SUPPORTER')}
          className="bg-gradient-to-br from-emerald-950/40 to-slate-900/60 backdrop-blur-md border border-emerald-500/30 hover:border-emerald-500/60 rounded-3xl p-4 sm:p-5 cursor-pointer transition-all shadow-xl hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-1 ring-emerald-500/30">
              <UserCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {supporterPct}%
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 tracking-tight">{stats.supporters}</div>
            <h4 className="text-xs font-bold text-slate-300 mt-1 truncate">
              {t.catSupporters}
            </h4>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
            <span>{t.filterCategory}</span>
          </div>
        </div>

        {/* Neutral Contacts */}
        <div 
          onClick={() => onFilterCategory('NEUTRAL')}
          className="bg-gradient-to-br from-sky-950/40 to-slate-900/60 backdrop-blur-md border border-sky-500/30 hover:border-sky-500/60 rounded-3xl p-4 sm:p-5 cursor-pointer transition-all shadow-xl hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center ring-1 ring-sky-500/30">
              <Scale className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
              {neutralPct}%
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-4xl font-black text-sky-400 tracking-tight">{stats.neutral}</div>
            <h4 className="text-xs font-bold text-slate-300 mt-1 truncate">
              {t.catNeutral}
            </h4>
          </div>
          <div className="text-[11px] text-sky-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
            <span>{t.filterCategory}</span>
          </div>
        </div>

        {/* Other Contacts */}
        <div 
          onClick={() => onFilterCategory('OTHER')}
          className="bg-gradient-to-br from-slate-900/70 to-slate-900/40 backdrop-blur-md border border-slate-700 hover:border-slate-600 rounded-3xl p-4 sm:p-5 cursor-pointer transition-all shadow-xl hover:-translate-y-0.5 group"
        >
          <div className="flex items-center justify-between">
            <span className="w-9 h-9 rounded-2xl bg-slate-700/50 text-slate-300 flex items-center justify-center ring-1 ring-slate-600">
              <Users2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              {otherPct}%
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-4xl font-black text-slate-200 tracking-tight">{stats.other}</div>
            <h4 className="text-xs font-bold text-slate-300 mt-1 truncate">
              {t.catOther}
            </h4>
          </div>
          <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
            <span>{t.filterCategory}</span>
          </div>
        </div>

      </div>

      {/* 3. Upcoming Occasions Timeline (Next 30 Days) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{t.upcomingOccasions}</span>
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
            {upcomingOccasions.length} events
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto custom-scroll pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {upcomingOccasions.map((item, idx) => (
            <div 
              key={idx} 
              className="flex-shrink-0 w-60 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-md hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                  item.days === 1 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                    : (item.days === 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-800 text-slate-400 border-slate-700')
                }`}>
                  {item.days === 0 ? 'Today!' : (item.days === 1 ? 'Tomorrow!' : `In ${item.days} days`)}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{item.date}</span>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{item.type === 'DOB' ? '🎂' : '💍'}</span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{item.contact.fullName}</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 truncate">
                  <span>📍 {item.contact.village}, {item.contact.ward}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
