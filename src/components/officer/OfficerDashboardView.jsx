import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Phone, Calendar, Heart, 
  ArrowRight, ShieldCheck, Sparkles, Clock, MessageSquare, PhoneCall
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function OfficerDashboardView({ 
  user, 
  contacts = [], 
  dueTodayReminders = [], 
  upcomingOccasions = [], 
  language 
}) {
  const t = translations[language];

  // Filter contacts to ONLY those created by this officer
  const myContacts = useMemo(() => {
    return contacts.filter(c => c.created_by_user_id === user?.id || c.user_id === user?.id);
  }, [contacts, user]);

  // Officer category counts
  const stats = useMemo(() => {
    const total = myContacts.length;
    const supporters = myContacts.filter(c => c.category === 'SUPPORTER').length;
    const neutral = myContacts.filter(c => c.category === 'NEUTRAL').length;
    const other = myContacts.filter(c => c.category === 'OTHER').length;
    return { total, supporters, neutral, other };
  }, [myContacts]);

  // Filter due reminders from officer's own contacts only
  const myDueReminders = useMemo(() => {
    return dueTodayReminders.filter(r => 
      r.contact.created_by_user_id === user?.id || r.contact.user_id === user?.id
    );
  }, [dueTodayReminders, user]);

  // Filter upcoming occasions from officer's own contacts only
  const myUpcomingOccasions = useMemo(() => {
    return upcomingOccasions.filter(o => 
      o.contact.created_by_user_id === user?.id || o.contact.user_id === user?.id
    );
  }, [upcomingOccasions, user]);

  // Recent entries created by this officer
  const recentEntries = useMemo(() => {
    return [...myContacts].slice(0, 5);
  }, [myContacts]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>{language === 'hi' ? 'फील्ड ऑपरेशन्स डैशबोर्ड' : 'Campaign Field Console'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'hi' ? `नमस्ते, ${user?.name || 'Officer'}` : `Welcome, ${user?.name || 'Officer'}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'आपके द्वारा दर्ज किए गए मतदाताओं का प्रबंधन, त्वरित 1-टैप कॉलिंग और व्हाट्सएप संपर्क।'
                : 'Manage your voluntary voter constituent entries, instant phone dialing, and personalized greeting dispatches.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/officer/contacts/create"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया मतदाता जोड़ें' : '+ Add New Contact'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards (My Contacts Only) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts Created by Logged-in Officer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'मेरे दर्ज मतदाता' : 'My Contacts'}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.total}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            Collected by you
          </div>
        </div>

        {/* Supporters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'समर्थक' : 'Supporters'}</span>
            <Heart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.supporters}</div>
          <div className="text-[11px] text-slate-400">
            {stats.total > 0 ? Math.round((stats.supporters / stats.total) * 100) : 0}% of your list
          </div>
        </div>

        {/* Neutral */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'तटस्थ' : 'Neutral'}</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-sky-400">{stats.neutral}</div>
          <div className="text-[11px] text-slate-400">
            Needs canvassing
          </div>
        </div>

        {/* Due Reminders Today */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'आज के ग्रीटिंग्स (D-1)' : 'Due Greetings'}</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{myDueReminders.length}</div>
          <div className="text-[11px] text-amber-400 font-semibold">
            Ready to dispatch
          </div>
        </div>
      </div>

      {/* 2-Column: Recent Entries & Upcoming Occasions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Contact Entries */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{language === 'hi' ? 'हाल ही में दर्ज मतदाता' : 'Recent Contact Entries'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'आपके द्वारा हाल ही में जोड़े गए मतदाता' : 'Constituents recently recorded by your account'}
              </p>
            </div>
            <Link 
              to="/officer/contacts" 
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 pt-1">
            {recentEntries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No contacts entered by you yet. Click "+ Add New Contact" to record your first voter!
              </div>
            ) : (
              recentEntries.map(contact => (
                <div key={contact.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white truncate">{contact.fullName}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        contact.category === 'SUPPORTER' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : (contact.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400')
                      }`}>
                        {contact.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                      <span>+91 {contact.mobile}</span>
                      <span>•</span>
                      <span className="font-sans">{[contact.village, contact.ward].filter(Boolean).join(', ') || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${contact.mobile}`}
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                      title="Call"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/91${contact.mobile}?text=${encodeURIComponent(`Namaste ${contact.fullName} ji! Greetings from the Campaign Field Office.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow"
                      title="WhatsApp"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Occasions (From Officer's own contacts only) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'आगामी अवसर (D-1)' : 'Upcoming Greetings'}</span>
            </h3>
            <Link 
              to="/officer/reminders" 
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              All
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {myUpcomingOccasions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No upcoming birthdays or anniversaries among your contacts.
              </div>
            ) : (
              myUpcomingOccasions.slice(0, 5).map((occ, i) => (
                <div key={i} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white truncate">{occ.contact.fullName}</span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {occ.type === 'BIRTHDAY' ? '🎂 Birthday' : '💍 Anniversary'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{occ.dateFormatted}</span>
                    <span className="text-emerald-400 font-bold">{occ.daysLeft === 0 ? 'Today!' : `In ${occ.daysLeft} days`}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
