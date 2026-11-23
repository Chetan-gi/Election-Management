import React, { useMemo } from 'react';
import { Bell, MessageSquare, Phone, Calendar } from 'lucide-react';
import { translations } from '../../locales/translations';

export default function OfficerRemindersView({ user, dueTodayReminders = [], language }) {
  const t = translations[language];

  // Restrict due reminders to only this officer's contacts
  const myDueReminders = useMemo(() => {
    return dueTodayReminders.filter(r => 
      r.contact.created_by_user_id === user?.id || r.contact.user_id === user?.id
    );
  }, [dueTodayReminders, user]);

  return (
    <div className="space-y-6">
      
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
          <Bell className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'अवसर रिमाइंडर्स (D-1)' : 'Due Greetings Reminders'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {language === 'hi' ? `आज के देय ग्रीटिंग्स (${myDueReminders.length})` : `Due Today Greetings (${myDueReminders.length})`}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'hi'
            ? 'आपके मतदाताओं के लिए 1 दिन पूर्व प्रातः 09:00 बजे तैयार जन्मदिन एवं वर्षगांठ की शुभकामनाएं।'
            : 'Pre-scheduled birthday and anniversary greetings dispatched 1 day prior at 09:00 AM.'}
        </p>
      </div>

      {myDueReminders.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-500 text-xs">
          {language === 'hi' ? 'आज आपके मतदाताओं में से कोई अवसर देय नहीं है।' : 'No reminders due today among your registered voters.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myDueReminders.map((r, i) => (
            <div key={i} className="bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white truncate">{r.contact.fullName}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    {r.type === 'BIRTHDAY' ? '🎂 Birthday' : '💍 Anniversary'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">+91 {r.contact.mobile}</div>
                <div className="text-xs text-amber-200/80 mt-2 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800 line-clamp-2">
                  "{r.message}"
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <a
                  href={`tel:${r.contact.mobile}`}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 shadow transition flex items-center justify-center"
                  title="Call"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <a
                  href={`https://wa.me/91${r.contact.mobile}?text=${encodeURIComponent(r.message)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow transition flex items-center justify-center"
                  title="Send WhatsApp Greeting"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
