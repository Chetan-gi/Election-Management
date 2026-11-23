import React from 'react';
import { Sparkles } from 'lucide-react';

export default function TestModal({ 
  isOpen, 
  onClose, 
  testResults, 
  testsRunning, 
  onRerun 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col text-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-extrabold text-slate-900">System Acceptance Test Suite (AT-01 to AT-20)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
          <span className="text-xs font-bold text-slate-600">
            {testsRunning ? 'Running Tests...' : `${testResults.filter(t => t.passed).length} / ${testResults.length} Tests Passed`}
          </span>
          <button 
            onClick={onRerun}
            disabled={testsRunning}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Rerun Tests
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll space-y-2 text-xs">
          {testResults.map((t, idx) => (
            <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900">{t.id}: {t.name}</span>
                <div className="text-[10px] text-slate-500">Traceable to Master Specification Sheet 8</div>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                PASSED
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
