import React, { useMemo } from 'react';
import { Tags, Heart, HelpCircle, AlertCircle, Users } from 'lucide-react';
import { translations } from '../../locales/translations';

export default function AdminCategoriesView({ contacts = [], onToggleCategory, language }) {
  const t = translations[language];

  const stats = useMemo(() => {
    const total = contacts.length;
    const supporters = contacts.filter(c => c.category === 'SUPPORTER');
    const neutral = contacts.filter(c => c.category === 'NEUTRAL');
    const other = contacts.filter(c => c.category === 'OTHER');

    return {
      total,
      supporters,
      neutral,
      other,
      supporterPct: total > 0 ? Math.round((supporters.length / total) * 100) : 0,
      neutralPct: total > 0 ? Math.round((neutral.length / total) * 100) : 0,
      otherPct: total > 0 ? Math.round((other.length / total) * 100) : 0,
    };
  }, [contacts]);

  return (
    <div className="space-y-6">
      
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
          <Tags className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'मतदाता संरेखन श्रेणियां' : 'Category Analytics'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          {language === 'hi' ? 'मतदाता श्रेणी विश्लेषण एवं प्रबंधन' : 'Constituent Categories & Alignment'}
        </h2>
        <p className="text-xs text-slate-400">
          {language === 'hi'
            ? 'समर्थक (Supporters), तटस्थ (Neutral) और अन्य (Other) मतदाताओं का प्रतिशत एवं सूची।'
            : 'Track, segment, and toggle campaign alignment categories for all voters.'}
        </p>
      </div>

      {/* 3 Main Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Supporter */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-emerald-400">SUPPORTER</span>
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.supporters.length}</div>
          <div className="text-xs text-emerald-300 font-semibold">{stats.supporterPct}% of total constituents</div>
          <p className="text-[11px] text-slate-400 pt-1">
            Confirmed election supporters committed to voting and community advocacy.
          </p>
        </div>

        {/* Neutral */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-sky-400">NEUTRAL</span>
            <HelpCircle className="w-5 h-5 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.neutral.length}</div>
          <div className="text-xs text-sky-300 font-semibold">{stats.neutralPct}% of total constituents</div>
          <p className="text-[11px] text-slate-400 pt-1">
            Undecided or swinging voters who require targeted canvassing and engagement.
          </p>
        </div>

        {/* Other */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-amber-400">OTHER</span>
            <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.other.length}</div>
          <div className="text-xs text-amber-300 font-semibold">{stats.otherPct}% of total constituents</div>
          <p className="text-[11px] text-slate-400 pt-1">
            Independent, opposition-leaning, or community elders requiring special outreach.
          </p>
        </div>

      </div>

    </div>
  );
}
