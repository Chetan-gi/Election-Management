import React, { useState, useMemo } from 'react';
import {
  Contact, Search, Filter, Download, Plus, Edit3,
  Trash2, Phone, MessageSquare, Heart, Shield, Users, RefreshCw
} from 'lucide-react';
import { exportContactsToCSV } from '../../utils/exportUtils';
import { translations } from '../../locales/translations';

export default function AdminContactsView({
  contacts = [],
  officers = [],
  onOpenAdd,
  onEditContact,
  onDeleteContact,
  onToggleCategory,
  onRefresh,
  language
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [villageFilter, setVillageFilter] = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [officerFilter, setOfficerFilter] = useState('');

  const t = translations[language];

  // Unique villages & wards for dropdowns
  const villageList = useMemo(() => [...new Set(contacts.map(c => c.village).filter(Boolean))].sort(), [contacts]);
  const wardList = useMemo(() => [...new Set(contacts.map(c => c.ward).filter(Boolean))].sort(), [contacts]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || c.fullName.toLowerCase().includes(q) || c.mobile.includes(q);
      const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
      const matchesVillage = !villageFilter || c.village === villageFilter;
      const matchesWard = !wardFilter || c.ward === wardFilter;
      const matchesOfficer = !officerFilter || c.user_id === officerFilter;
      return matchesSearch && matchesCat && matchesVillage && matchesWard && matchesOfficer;
    });
  }, [contacts, searchQuery, categoryFilter, villageFilter, wardFilter, officerFilter]);

  // Get officer name who entered contact
  const getCreatorOfficer = (contact) => {
    const userId = contact.user_id;
    if (!userId) return 'System / Admin';
    const officer = officers.find(o => o.id === userId);
    return officer ? `${officer.name} (@${officer.username})` : 'Officer';
  };

  return (
    <div className="space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
            <Contact className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'केंद्रीय मतदाता निर्देशिका' : 'Central Voter Directory'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? `सभी मतदाता सूची (${contacts.length})` : `All Voter Contacts (${contacts.length})`}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'सभी ऑफिसर्स एवं एडमिन द्वारा दर्ज किए गए सभी मतदाताओं की केंद्रीय सूची।'
              : 'Master constituent directory across all wards, villages, and field officers.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => exportContactsToCSV(filteredContacts)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ नया मतदाता जोड़ें' : '+ Add Contact'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Strip */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नाम या 10-अंकीय मोबाइल से खोजें...' : 'Search by name or 10-digit mobile...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="SUPPORTER">Supporters</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="OTHER">Other</option>
        </select>

        {/* Village Filter */}
        <select
          value={villageFilter}
          onChange={(e) => setVillageFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="">All Villages</option>
          {villageList.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        {/* Ward Filter */}
        <select
          value={wardFilter}
          onChange={(e) => setWardFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="">All Wards</option>
          {wardList.map(w => <option key={w} value={w}>{w}</option>)}
        </select>

        {/* Officer Filter */}
        <select
          value={officerFilter}
          onChange={(e) => setOfficerFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
        >
          <option value="">All Officers</option>
          {officers.map(o => (
            <option key={o.id} value={o.id}>
              {o.name} (@{o.username})
            </option>
          ))}
        </select>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            No contacts match the selected filters.
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-white truncate">{contact.fullName}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">+91 {contact.mobile}</div>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${contact.category === 'SUPPORTER'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : (contact.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400')
                    }`}>
                    {contact.category}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  {contact.fatherName && <div>S/O: {contact.fatherName}</div>}
                  <div>{[contact.village, contact.ward].filter(Boolean).join(', ') || '—'}</div>
                  {contact.address && <div className="text-slate-500 text-[11px] truncate">{contact.address}</div>}

                  {(contact.dob || contact.anniversary) && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-amber-300">
                      {contact.dob && <span>🎂 {contact.dob}</span>}
                      {contact.anniversary && <span>💍 {contact.anniversary}</span>}
                    </div>
                  )}

                  <div className="pt-2 text-[10px] text-purple-400 font-semibold border-t border-slate-800/80">
                    Entered by: {getCreatorOfficer(contact)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                {/* 1-Tap Category Switcher */}
                <div className="flex gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[9px]">
                  {['SUPPORTER', 'NEUTRAL', 'OTHER'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => onToggleCategory(contact.id, cat)}
                      className={`px-1.5 py-0.5 rounded-lg font-bold transition ${contact.category === cat
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {cat.slice(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Edit & Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditContact(contact)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Edit Contact"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    title="Delete Contact"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
