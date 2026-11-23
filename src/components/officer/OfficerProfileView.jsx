import React from 'react';
import { User, ShieldCheck, Phone, Mail, Calendar, CheckCircle2, Award } from 'lucide-react';
import { translations } from '../../locales/translations';

export default function OfficerProfileView({ user, contacts = [], language }) {
  const t = translations[language];

  const myContactsCount = contacts.filter(c => c.created_by_user_id === user?.id || c.user_id === user?.id).length;
  const myLinkedContact = contacts.find(c => c.user_id === user?.id);
  const myMobile = user?.mobile_number || myLinkedContact?.mobile;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
          <User className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'ऑफिसर प्रोफाइल' : 'Officer Profile'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {language === 'hi' ? 'मेरी खाता जानकारी' : 'My Account & Credentials'}
        </h2>
        <p className="text-xs text-slate-400">
          Official Campaign Field Officer credentials and active assignment details.
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-emerald-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{user?.name}</h3>
            <div className="text-xs font-mono text-emerald-400">@{user?.username}</div>
            <span className="inline-block mt-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              CAMPAIGN FIELD OFFICER
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Account Status</span>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{user?.is_active ? 'Active & Authorized' : 'Inactive'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Voter Entries Recorded</span>
            <div className="flex items-center gap-1.5 text-base font-black text-white">
              <Award className="w-4 h-4 text-amber-400" />
              <span>{myContactsCount} voters</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Official Mobile</span>
            <div className="text-xs font-mono text-slate-200">
              {myMobile ? `+91 ${myMobile}` : 'Registered with Office'}
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Official Email</span>
            <div className="text-xs text-slate-200 truncate">
              {user?.email || `${user?.username}@election.gov.in`}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
