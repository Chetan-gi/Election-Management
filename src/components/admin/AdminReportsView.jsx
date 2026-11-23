import React, { useMemo } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, Award, Layers } from 'lucide-react';

export default function AdminReportsView({ contacts = [], officers = [], language }) {
  // Village-wise distribution
  const villageStats = useMemo(() => {
    const map = {};
    contacts.forEach(c => {
      const v = c.village || 'Other';
      map[v] = (map[v] || 0) + 1;
    });
    return Object.entries(map).map(([village, count]) => ({ village, count }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  // Ward-wise distribution
  const wardStats = useMemo(() => {
    const map = {};
    contacts.forEach(c => {
      const w = c.ward || 'Other';
      map[w] = (map[w] || 0) + 1;
    });
    return Object.entries(map).map(([ward, count]) => ({ ward, count }))
      .sort((a, b) => b.count - a.count);
  }, [contacts]);

  // Officer productivity leaderboard
  const leaderboard = useMemo(() => {
    return officers.map(o => {
      const count = contacts.filter(c => c.created_by_user_id === o.id || c.user_id === o.id).length;
      return { ...o, count };
    }).sort((a, b) => b.count - a.count);
  }, [officers, contacts]);

  return (
    <div className="space-y-6">
      
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analytics &amp; Intelligence</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          Election Field Reports &amp; Coverage
        </h2>
        <p className="text-xs text-slate-400">
          Geographic coverage, voter collection velocity, and officer performance metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Officer Performance Leaderboard */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Officer Productivity Leaderboard</span>
          </h3>
          <div className="space-y-3 pt-1">
            {leaderboard.map((o, index) => (
              <div key={o.id || o.username} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                    index === 0 ? 'bg-amber-400 text-slate-950' : (index === 1 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-extrabold text-sm text-white">{o.name}</div>
                    <div className="text-[10px] font-mono text-purple-400">@{o.username}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-emerald-400">{o.count}</div>
                  <div className="text-[9px] text-slate-500">entries</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Village Coverage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span>Village &amp; City Breakdown</span>
          </h3>
          <div className="space-y-3 pt-1">
            {villageStats.map((item) => (
              <div key={item.village} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-white">{item.village}</span>
                <span className="font-mono text-xs font-black text-purple-300">{item.count} voters</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ward Coverage */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Ward &amp; Area Breakdown</span>
          </h3>
          <div className="space-y-3 pt-1">
            {wardStats.map((item) => (
              <div key={item.ward} className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs text-white">{item.ward}</span>
                <span className="font-mono text-xs font-black text-indigo-300">{item.count} voters</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
