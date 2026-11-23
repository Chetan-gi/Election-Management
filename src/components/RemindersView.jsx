import React from 'react';
import { Bell, Calendar, Phone, Sparkles, CheckCircle2 } from 'lucide-react';
import { translations } from '../locales/translations';

export default function RemindersView({ contacts, language }) {
  const occasionContacts = contacts.filter(c => c.dob || c.anniversary);

  return (
    <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto pb-12 sm:pb-0">
      
      {/* Engine Overview Header */}
      <div className="bg-slate-900/80 backdrop-blur-md p-5 sm:p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Deterministic Engine
            </span>
            <span className="text-xs text-slate-400">Zero Duplicates Guarantee</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1.5">
            Exact 1-Day-Prior Notification Engine
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Automatically calculates and schedules precision notifications for <strong>09:00 AM local time</strong> exactly one calendar day before every birthday or wedding anniversary.
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
          <Bell className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800 shadow-xl overflow-hidden divide-y divide-slate-800/80">
        <div className="p-4 bg-slate-900 text-xs font-bold text-slate-400 flex items-center justify-between">
          <span>Registered Occasion Schedules</span>
          <span>{occasionContacts.length} active schedules</span>
        </div>

        {occasionContacts.map(c => (
          <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/80 transition">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-indigo-400">
                {c.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-extrabold text-white text-sm sm:text-base">{c.fullName}</div>
                <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>📍 {c.village}, {c.ward}</span>
                  {c.dob && <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">🎂 DOB: {c.dob}</span>}
                  {c.anniversary && <span className="bg-slate-800 px-2 py-0.5 rounded text-[11px]">💍 Anniversary: {c.anniversary}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Scheduled @ 09:00 AM D-1</span>
              </span>
              <a 
                href={`tel:${c.mobile}`}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Call voter"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
