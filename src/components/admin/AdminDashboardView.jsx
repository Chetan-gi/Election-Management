import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Contact, Tags, Heart, 
  Calendar, ArrowRight, ShieldCheck, TrendingUp,
  Sparkles, CheckCircle2, UserCheck, Phone, MapPin, Eye
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function AdminDashboardView({ 
  contacts = [], 
  officers = [], 
  dueTodayReminders = [], 
  upcomingOccasions = [], 
  language,
  onOpenAddContact 
}) {
  const t = translations[language];

  // Category statistics
  const categoryStats = useMemo(() => {
    const total = contacts.length;
    const supporters = contacts.filter(c => c.category === 'SUPPORTER').length;
    const neutral = contacts.filter(c => c.category === 'NEUTRAL').length;
    const other = contacts.filter(c => c.category === 'OTHER').length;
    return {
      total,
      supporters,
      neutral,
      other,
      supporterPct: total > 0 ? Math.round((supporters / total) * 100) : 0,
      neutralPct: total > 0 ? Math.round((neutral / total) * 100) : 0,
      otherPct: total > 0 ? Math.round((other / total) * 100) : 0
    };
  }, [contacts]);

  // Total contacts created by each officer
  const officerStats = useMemo(() => {
    return officers.map(officer => {
      const count = contacts.filter(c => c.user_id === officer.id).length;
      return {
        ...officer,
        contactsCount: count
      };
    }).sort((a, b) => b.contactsCount - a.contactsCount);
  }, [officers, contacts]);

  // Recent contact entries (last 6)
  const recentContacts = useMemo(() => {
    return [...contacts].slice(0, 6);
  }, [contacts]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner with Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{language === 'hi' ? 'केंद्रीय व्यवस्थापक नियंत्रण कक्ष' : 'Central Election Command Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'hi' ? 'एडमिन डैशबोर्ड एवं विश्लेषण' : 'Admin Operations Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'सभी ऑफिसर्स द्वारा जोड़े गए मतदाताओं, श्रेणियों, जन्मदिन अलर्ट्स और फील्ड प्रविष्टियों की वास्तविक समय निगरानी।'
                : 'Real-time overview of all voter constituents collected across field officers, category distributions, and upcoming occasions.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/officers/create"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-2 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '+ नया ऑफिसर बनाएं' : '+ Create Officer'}</span>
            </Link>

            <button
              onClick={onOpenAddContact}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2 active:scale-95"
            >
              <Contact className="w-4 h-4 text-purple-400" />
              <span>{language === 'hi' ? '+ नया मतदाता जोड़ें' : '+ Add Contact'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Contacts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'कुल मतदाता' : 'Total Contacts'}</span>
            <Contact className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{categoryStats.total}</div>
          <div className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across all wards &amp; villages</span>
          </div>
        </div>

        {/* Total Officers */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'कुल ऑफिसर्स' : 'Total Officers'}</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-300">{officers.length}</div>
          <div className="text-[11px] text-indigo-400 font-semibold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{officers.filter(o => o.is_active).length} Active Field Officers</span>
          </div>
        </div>

        {/* Supporters */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'समर्थक मतदाता' : 'Supporters'}</span>
            <Heart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{categoryStats.supporters}</div>
          <div className="text-[11px] text-emerald-400 font-semibold">
            {categoryStats.supporterPct}% of all contacts
          </div>
        </div>

        {/* Due Reminders Today */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">{language === 'hi' ? 'आज के ग्रीटिंग्स (D-1)' : 'Due Greetings'}</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{dueTodayReminders.length}</div>
          <div className="text-[11px] text-amber-400 font-semibold">
            Birthday &amp; Anniversaries today
          </div>
        </div>
      </div>

      {/* 2-Column Section: Contacts by Officer Breakdown & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Total Contacts Created by Each Officer */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>{language === 'hi' ? 'ऑफिसर अनुसार मतदाता प्रविष्टियां' : 'Contacts by Officer'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'प्रत्येक फील्ड ऑफिसर द्वारा जोड़े गए मतदाताओं की संख्या' : 'Productivity breakdown per field officer'}
              </p>
            </div>
            <Link 
              to="/admin/officers" 
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 pt-2">
            {officerStats.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">No officers registered yet.</div>
            ) : (
              officerStats.slice(0, 5).map((officer) => {
                const pct = categoryStats.total > 0 ? Math.round((officer.contactsCount / categoryStats.total) * 100) : 0;
                return (
                  <div key={officer.id || officer.username} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white truncate">{officer.name}</span>
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">@{officer.username}</span>
                        {!officer.is_active && (
                          <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">Inactive</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{officer.email || 'Field Officer'}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-purple-300">{officer.contactsCount}</div>
                      <div className="text-[10px] text-slate-500 font-semibold">{pct}% of total</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Category Breakdown & Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Tags className="w-4 h-4 text-purple-400" />
                <span>{language === 'hi' ? 'मतदाता श्रेणी वितरण' : 'Category Distribution'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'समर्थक, तटस्थ और अन्य मतदाताओं का अनुपात' : 'Constituent alignment breakdown'}
              </p>
            </div>
            <Link 
              to="/admin/categories" 
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-2">
            {/* Supporter Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Supporter ({categoryStats.supporters})</span>
                </span>
                <span className="text-slate-300">{categoryStats.supporterPct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.supporterPct}%` }}
                />
              </div>
            </div>

            {/* Neutral Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                  <span>Neutral ({categoryStats.neutral})</span>
                </span>
                <span className="text-slate-300">{categoryStats.neutralPct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-sky-600 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.neutralPct}%` }}
                />
              </div>
            </div>

            {/* Other Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Other / Undecided ({categoryStats.other})</span>
                </span>
                <span className="text-slate-300">{categoryStats.otherPct}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-amber-600 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${categoryStats.otherPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2-Column Section: Recent Contact Entries & Upcoming Occasions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Contact Entries (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Contact className="w-4 h-4 text-purple-400" />
                <span>{language === 'hi' ? 'नवीनतम मतदाता प्रविष्टियां' : 'Recent Contact Entries'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'hi' ? 'फील्ड ऑफिसर्स द्वारा हाल ही में दर्ज किए गए मतदाता' : 'Latest constituent entries recorded by officers'}
              </p>
            </div>
            <Link 
              to="/admin/contacts" 
              className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1"
            >
              <span>View All Contacts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80 pt-1">
            {recentContacts.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No contacts entered yet.</div>
            ) : (
              recentContacts.map(contact => (
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
                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5 font-mono">
                      <span>+91 {contact.mobile}</span>
                      <span>•</span>
                      <span className="font-sans">{contact.village || 'Kalyanpur'}, {contact.ward || 'Ward 01'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {contact.dob && (
                      <div className="text-[11px] text-amber-300 font-semibold">🎂 {contact.dob}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Birthdays & Anniversaries (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'आगामी अवसर (D-1)' : 'Upcoming Occasions'}</span>
            </h3>
            <Link 
              to="/admin/reminders" 
              className="text-xs text-amber-400 hover:text-amber-300 font-bold"
            >
              All
            </Link>
          </div>

          <div className="space-y-3 pt-1">
            {upcomingOccasions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No upcoming occasions in the next 14 days.</div>
            ) : (
              upcomingOccasions.slice(0, 5).map((occ, i) => (
                <div key={i} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-white truncate">{occ.contact.fullName}</span>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full">
                      {occ.type === 'BIRTHDAY' ? '🎂 Birthday' : '💍 Anniversary'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{occ.dateFormatted}</span>
                    <span className="text-purple-400 font-bold">{occ.daysLeft === 0 ? 'Today!' : `In ${occ.daysLeft} days`}</span>
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
