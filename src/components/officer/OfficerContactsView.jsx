import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Phone, MessageSquare, 
  Edit3, Trash2, PhoneCall, Copy, Check, Filter, Heart
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function OfficerContactsView({ 
  user, 
  contacts = [], 
  onToggleCategory, 
  onEditContact, 
  onDeleteContact, 
  language 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [copiedMobile, setCopiedMobile] = useState('');
  const [outreachTemplate, setOutreachTemplate] = useState('campaign'); // 'campaign' | 'greeting'

  const t = translations[language];

  // Restrict contacts to ONLY those created by this officer
  const myContacts = useMemo(() => {
    return contacts.filter(c => c.created_by_user_id === user?.id || c.user_id === user?.id);
  }, [contacts, user]);

  // Filtered
  const filtered = useMemo(() => {
    return myContacts.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || c.fullName.toLowerCase().includes(q) || c.mobile.includes(q);
      const matchesCat = catFilter === 'ALL' || c.category === catFilter;
      return matchesSearch && matchesCat;
    });
  }, [myContacts, searchQuery, catFilter]);

  // Copy mobile number
  const handleCopyMobile = (mobile) => {
    navigator.clipboard?.writeText(mobile);
    setCopiedMobile(mobile);
    setTimeout(() => setCopiedMobile(''), 2000);
  };

  // Pre-built WhatsApp Message
  const getWhatsAppMessage = (contact) => {
    if (outreachTemplate === 'greeting') {
      return `Namaste ${contact.fullName} ji! Wishing you great health, happiness, and prosperity from your Election Field Support Team.`;
    }
    return `Namaste ${contact.fullName} ji! This is ${user?.name || 'your Campaign Field Officer'}. We are reaching out regarding the upcoming local election development priorities for ${contact.ward || 'your area'}. Please let us know if you need any assistance!`;
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फील्ड मतदाता निर्देशिका' : 'Field Operations Contacts'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? `मेरे मतदाता (${myContacts.length})` : `My Registered Voters (${myContacts.length})`}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi'
              ? 'आपके द्वारा जोड़े गए मतदाता। आप सीधे 1-टैप में कॉल कर सकते हैं या व्हाट्सएप संदेश भेज सकते हैं।'
              : 'Constituents entered by your account. Tap to call directly or send pre-filled WhatsApp campaign messages.'}
          </p>
        </div>

        <Link
          to="/officer/contacts/create"
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>{language === 'hi' ? '+ नया मतदाता जोड़ें' : '+ Add Contact'}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नाम या 10-अंकीय मोबाइल लिखें...' : 'Search by name or 10-digit mobile...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Outreach Template Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">Template:</span>
          <select
            value={outreachTemplate}
            onChange={(e) => setOutreachTemplate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="campaign">Election Vote Appeal</option>
            <option value="greeting">Warm Greeting</option>
          </select>
        </div>

        {/* Category Filter */}
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="SUPPORTER">Supporters</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Voter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 text-xs">
            {myContacts.length === 0 
              ? 'You have not added any voters yet. Tap "+ Add Contact" to get started!' 
              : 'No voters match your search query.'}
          </div>
        ) : (
          filtered.map((contact) => (
            <div 
              key={contact.id} 
              className="p-5 bg-slate-900/90 rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-white truncate">{contact.fullName}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                      <span>+91 {contact.mobile}</span>
                      <button
                        onClick={() => handleCopyMobile(contact.mobile)}
                        className="text-slate-500 hover:text-slate-300"
                        title="Copy Mobile"
                      >
                        {copiedMobile === contact.mobile ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    contact.category === 'SUPPORTER' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : (contact.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'bg-slate-800 text-slate-400')
                  }`}>
                    {contact.category}
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-400 space-y-1">
                  {contact.fatherName && <div>S/O: {contact.fatherName}</div>}
                  <div>{contact.village || 'Kalyanpur'}, {contact.ward || 'Ward 01'}</div>
                  {contact.address && <div className="text-slate-500 text-[11px] truncate">{contact.address}</div>}
                  
                  {(contact.dob || contact.anniversary) && (
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-amber-300">
                      {contact.dob && <span>🎂 {contact.dob}</span>}
                      {contact.anniversary && <span>💍 {contact.anniversary}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* 1-Tap Category Switcher & Direct Call / WhatsApp */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400">{language === 'hi' ? 'श्रेणी बदलें:' : 'Category:'}</span>
                  <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    {['SUPPORTER', 'NEUTRAL', 'OTHER'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => onToggleCategory(contact.id, cat)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                          contact.category === cat 
                            ? 'bg-emerald-600 text-white' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 justify-end">
                  {onEditContact && (
                    <button
                      onClick={() => onEditContact(contact)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-[11px] flex items-center gap-1 transition"
                      title="Edit Voter"
                    >
                      <Edit3 className="w-3 h-3 text-emerald-400" />
                      <span>Edit</span>
                    </button>
                  )}

                  {onDeleteContact && (
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Delete Voter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <a
                    href={`tel:${contact.mobile}`}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                    title="Direct Phone Call"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/91${contact.mobile}?text=${encodeURIComponent(getWhatsAppMessage(contact))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                    title="Send WhatsApp Message"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
