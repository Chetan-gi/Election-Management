import React from 'react';
import { X, User, Phone, MapPin, Calendar, Heart, Shield, FileText } from 'lucide-react';
import { translations } from '../locales/translations';

export default function ContactModal({ 
  isOpen, 
  editingContact, 
  formData, 
  onChange, 
  onSave, 
  onClose, 
  language 
}) {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      
      {/* Modal Dialog (Bottom sheet on mobile, centered dialog on desktop) */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto custom-scroll">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {editingContact ? (language === 'hi' ? 'संपर्क संपादित करें' : 'Edit Contact') : (language === 'hi' ? 'नया संपर्क जोड़ें' : 'Add New Voter Contact')}
            </h3>
            <p className="text-[11px] text-slate-400">
              {language === 'hi' ? 'मतदाता संपर्क विवरण दर्ज करें' : 'Enter voluntary voter contact details'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSave} className="space-y-4 text-xs">
          
          {/* Full Name */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Full Legal Name <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input 
                type="text" 
                required
                value={formData.fullName} 
                onChange={e => onChange({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ramesh Kumar Sharma" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          {/* Father / Spouse Name */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Father's / Spouse's Name (Voter Roll ID)</label>
            <input 
              type="text" 
              value={formData.fatherName || ''} 
              onChange={e => onChange({ ...formData, fatherName: e.target.value })}
              placeholder="e.g. Ram Lakhan Sharma" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          {/* 10-Digit Mobile */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              10-Digit Mobile Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs text-indigo-400 font-bold">+91</span>
              <input 
                type="tel" 
                required
                maxLength={10}
                value={formData.mobile} 
                onChange={e => onChange({ ...formData, mobile: e.target.value })}
                placeholder="9876543210" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" 
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Must start with 6, 7, 8, or 9.</p>
          </div>

          {/* Village & Ward */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Village / City <span className="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.village} 
                onChange={e => onChange({ ...formData, village: e.target.value })}
                placeholder="e.g. Kalyanpur" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Polling Ward <span className="text-rose-400">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.ward} 
                onChange={e => onChange({ ...formData, ward: e.target.value })}
                placeholder="e.g. Ward 12" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          {/* DOB & Anniversary */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Date of Birth</label>
              <input 
                type="date" 
                value={formData.dob || ''} 
                onChange={e => onChange({ ...formData, dob: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
            <div>
              <label className="block font-bold text-slate-300 mb-1">Wedding Anniversary</label>
              <input 
                type="date" 
                value={formData.anniversary || ''} 
                onChange={e => onChange({ ...formData, anniversary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>

          {/* 3 Categories Radio Selector */}
          <div>
            <label className="block font-bold text-slate-300 mb-1.5">
              Voter Alignment Category <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'SUPPORTER', label: 'Supporter', color: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-500/20 text-emerald-300' },
                { id: 'NEUTRAL', label: 'Neutral', color: 'peer-checked:border-sky-500 peer-checked:bg-sky-500/20 text-sky-300' },
                { id: 'OTHER', label: 'Other', color: 'peer-checked:border-slate-500 peer-checked:bg-slate-700/40 text-slate-300' }
              ].map(cat => (
                <label key={cat.id} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="catRadio" 
                    value={cat.id} 
                    checked={formData.category === cat.id}
                    onChange={() => onChange({ ...formData, category: cat.id })}
                    className="sr-only peer"
                  />
                  <div className={`p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-center font-bold text-slate-400 transition ${cat.color}`}>
                    {cat.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Residential Address</label>
            <input 
              type="text" 
              value={formData.address || ''} 
              onChange={e => onChange({ ...formData, address: e.target.value })}
              placeholder="House/Plot/Street details" 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Notes / Field Observations</label>
            <textarea 
              rows={2}
              value={formData.notes || ''} 
              onChange={e => onChange({ ...formData, notes: e.target.value })}
              placeholder="Key notes, issues raised, community influence..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition mt-2 active:scale-95"
          >
            {t.saveContact}
          </button>
        </form>

      </div>
    </div>
  );
}
