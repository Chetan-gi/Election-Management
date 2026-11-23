import React from 'react';
import { Phone, MessageSquare, Edit3, Trash2, MapPin, Calendar, Heart } from 'lucide-react';
import { translations } from '../locales/translations';

export default function ContactCard({ 
  contact, 
  language, 
  onToggleCategory, 
  onEdit, 
  onDelete 
}) {
  const t = translations[language];

  // Category Theme Badges
  const isSupporter = contact.category === 'SUPPORTER';
  const isNeutral = contact.category === 'NEUTRAL';
  const isOther = contact.category === 'OTHER';

  const badgeTheme = isSupporter 
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
    : (isNeutral ? 'bg-sky-500/10 text-sky-400 border-sky-500/30' : 'bg-slate-700/40 text-slate-300 border-slate-600/40');

  // Avatar initials
  const initials = contact.fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-800/90 shadow-xl hover:border-slate-700 transition flex flex-col justify-between group">
      
      {/* Top Header: Avatar, Name & Category Badge */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Initials Avatar */}
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-inner ${
              isSupporter ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 
              (isNeutral ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700')
            }`}>
              {initials}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-extrabold text-white truncate leading-tight">
                {contact.fullName}
              </h4>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                <Phone className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span className="font-mono">+91 {contact.mobile.slice(0, 5)} {contact.mobile.slice(5)}</span>
              </div>
            </div>
          </div>

          <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${badgeTheme} flex-shrink-0`}>
            {contact.category}
          </span>
        </div>

        {/* Father / Spouse & Location Details */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
          {contact.fatherName && (
            <div className="text-[11px] text-slate-400 truncate">
              <strong className="text-slate-300">S/O / W/O:</strong> {contact.fatherName}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
            <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span className="truncate">{contact.village}, {contact.ward}</span>
          </div>

          {/* Occasion Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {contact.dob && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300">
                <span>🎂</span>
                <span>{contact.dob}</span>
              </span>
            )}
            {contact.anniversary && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-300">
                <span>💍</span>
                <span>{contact.anniversary}</span>
              </span>
            )}
          </div>

          {contact.notes && (
            <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
              "{contact.notes}"
            </p>
          )}

          <div className="pt-1 text-[9px] text-slate-500 font-semibold flex items-center gap-1">
            <span>🔒 Voter Directory (Constituent Record)</span>
          </div>
        </div>
      </div>

      {/* Card Footer: 1-Tap Category Switcher & Direct Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
        
        {/* 1-Tap Segmented Category Switcher (FR-CAT-03) */}
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-slate-400 text-[10px]">{t.oneTapSwitch}</span>
          <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800">
            <button 
              onClick={() => onToggleCategory(contact.id, 'SUPPORTER')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                isSupporter ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Supp
            </button>
            <button 
              onClick={() => onToggleCategory(contact.id, 'NEUTRAL')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                isNeutral ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Neut
            </button>
            <button 
              onClick={() => onToggleCategory(contact.id, 'OTHER')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                isOther ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Oth
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <a 
              href={`tel:${contact.mobile}`}
              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-700/60 transition" 
              title="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
            <a 
              href={`https://wa.me/91${contact.mobile}`} 
              target="_blank" 
              rel="noreferrer" 
              className="p-2 rounded-xl bg-slate-800 hover:bg-green-500/20 text-slate-300 hover:text-green-400 border border-slate-700/60 transition" 
              title="WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => onEdit(contact)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 border border-slate-700/60 transition" 
              title="Edit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onDelete(contact.id)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition" 
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
