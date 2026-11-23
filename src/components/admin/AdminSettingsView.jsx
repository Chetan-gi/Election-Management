import React, { useState, useEffect } from 'react';
import { Settings, Activity, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

export default function AdminSettingsView({ onOpenTests, supabaseStatus, language }) {
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data, error } = await supabase
        .from('app_user_login_logs')
        .select('*')
        .order('login_timestamp', { ascending: false })
        .limit(30);

      if (!error && data) {
        setLogs(data);
      }
    } catch (err) {
      console.warn('Error fetching login logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
          <Settings className="w-3.5 h-3.5" />
          <span>Governance &amp; Audit Logs</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white">
          System Settings &amp; Security Logs
        </h2>
        <p className="text-xs text-slate-400">
          Real-time authentication audit logs and system security history.
        </p>
      </div>

      {/* Diagnostics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Cloud Network Status</div>
            <div className="text-sm font-extrabold text-white mt-1">{supabaseStatus}</div>
          </div>
          <Database className="w-6 h-6 text-purple-400" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">System Diagnostics</div>
            <div className="text-xs text-slate-300 mt-1">Automated Diagnostics &amp; Functional Health Checks</div>
          </div>
          <button
            onClick={onOpenTests}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow"
          >
            Run Tests
          </button>
        </div>
      </div>

      {/* Authentication Audit Logs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Login Audit Trail (app_user_login_logs)</span>
          </h3>
          <button
            onClick={fetchLogs}
            disabled={loadingLogs}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Username</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Failure Reason</th>
                <th className="py-3 px-3">IP / Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-sans">
                    No login logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(log.login_timestamp).toLocaleString('en-IN', { hour12: false })}
                    </td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">
                      @{log.username}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-rose-400 font-sans">
                      {log.failure_reason || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 truncate max-w-xs font-sans text-[11px]">
                      {log.ip_address || 'Web Client'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
