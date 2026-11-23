import React, { useState, useMemo } from 'react';
import { 
  Phone, MessageSquare, Send, UserPlus, Users, 
  Search, ShieldCheck, Heart, Sparkles, CheckCircle2, 
  MapPin, Calendar, Clock, AlertCircle, PhoneCall,
  MessageCircle, Copy, Share2, LogOut, Globe, Database,
  LayoutDashboard, Bell, Edit3, Trash2, Filter, ChevronRight
} from 'lucide-react';
import { isValidIndianMobile } from '../utils/phoneUtils';
import { translations } from '../locales/translations';

export default function OfficerPage({ 
  user, 
  contacts, 
  onSaveContact, 
  onToggleCategory, 
  onEditContact,
  onDeleteContact,
  dueTodayReminders = [],
  language,
  onToggleLanguage,
  onSignOut,
  supabaseStatus
}) {
  const t = translations[language];

  // Active View Tabs: 'dialer' | 'add_voter' | 'directory' | 'reminders'
  const [activeTab, setActiveTab] = useState('dialer');

  // Quick Add Voter Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    mobile: '',
    village: 'Kalyanpur',
    ward: 'Ward 12',
    dob: '',
    anniversary: '',
    category: 'NEUTRAL',
    address: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Quick Dialer Search & Outreach
  const [searchQuery, setSearchQuery] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('campaign'); // 'campaign' | 'birthday' | 'anniversary'
  const [copiedMobile, setCopiedMobile] = useState('');

  // Directory Filters
  const [dirSearch, setDirSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [villageFilter, setVillageFilter] = useState('');

  // Filtered contacts for dialer/outreach
  const dialerResults = useMemo(() => {
    if (!searchQuery.trim()) return contacts.slice(0, 10);
    const q = searchQuery.toLowerCase().trim();
    return contacts.filter(c => 
      c.fullName.toLowerCase().includes(q) || 
      c.mobile.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [contacts, searchQuery]);

  // Filtered contacts for Directory tab
  const filteredDirectory = useMemo(() => {
    return contacts.filter(c => {
      const q = dirSearch.toLowerCase().trim();
      const matchSearch = !q || c.fullName.toLowerCase().includes(q) || c.mobile.includes(q);
      const matchCat = catFilter === 'ALL' || c.category === catFilter;
      const matchVillage = !villageFilter || c.village === villageFilter;
      return matchSearch && matchCat && matchVillage;
    });
  }, [contacts, dirSearch, catFilter, villageFilter]);

  const villageList = useMemo(() => [...new Set(contacts.map(c => c.village).filter(Boolean))].sort(), [contacts]);

  // Prebuilt Message Template
  const getPrebuiltMessage = (contact, type) => {
    const name = contact ? contact.fullName : 'साथी';
    if (type === 'birthday') {
      return `सादर प्रणाम ${name} जी! आपके जन्मदिन पर हमारी और पूरी टीम की ओर से हार्दिक शुभकामनाएं! आपके उत्तम स्वास्थ्य, सुख-समृद्धि एवं दीर्घायु की मंगलकामना करते हैं। 💐🎂`;
    }
    if (type === 'anniversary') {
      return `सादर प्रणाम ${name} जी! आपकी वैवाहिक वर्षगांठ के शुभ अवसर पर आपको व आपके परिवार को हार्दिक बधाई एवं ढेरों शुभकामनाएं! 🌸💍`;
    }
    return `सादर प्रणाम ${name} जी! आगामी चुनाव में क्षेत्र के विकास, जनहित एवं सुरक्षा के लिए आपके अमूल्य समर्थन और आशीर्वाद की अपेक्षा है। धन्यवाद! 🗳️🤝`;
  };

  // Submit Voter Entry (Strictly contacts table)
  const handleAddVoter = (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.fullName.trim()) {
      setFormError('Please enter Full Legal Name.');
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!isValidIndianMobile(cleanMobile)) {
      setFormError('Please enter a valid 10-digit Indian Mobile Number starting with 6, 7, 8, or 9.');
      return;
    }

    onSaveContact({
      ...formData,
      mobile: cleanMobile
    });

    setFormSuccess(`Voter "${formData.fullName}" added successfully to contacts directory!`);
    setFormData({
      fullName: '',
      fatherName: '',
      mobile: '',
      village: formData.village,
      ward: formData.ward,
      dob: '',
      anniversary: '',
      category: 'NEUTRAL',
      address: '',
      notes: ''
    });

    setTimeout(() => setFormSuccess(''), 4000);
  };

  // Copy mobile number
  const handleCopyMobile = (mobile) => {
    navigator.clipboard?.writeText(mobile);
    setCopiedMobile(mobile);
    setTimeout(() => setCopiedMobile(''), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8">
      
      {/* 1. DEDICATED OFFICER STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-xl border-b border-emerald-500/30 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 font-bold shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none">
                  {language === 'hi' ? 'फील्ड ऑफिसर कंसोल' : 'Campaign Officer Hub'}
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  FIELD OPERATIONS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="truncate max-w-xs">{supabaseStatus || 'Supabase Connected'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button 
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Officer Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name || user?.username}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">Field Officer</span>
              </div>

              <button 
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 transition flex items-center gap-1.5 text-xs font-bold" 
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'hi' ? 'लॉग आउट' : 'Sign Out'}</span>
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN OFFICER CONTENT BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        
        {/* Officer Header & Tab Switcher */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-6 sm:p-7 border border-emerald-500/30 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'hi' ? 'फील्ड ऑपरेशन्स: मतदाता डेटा संग्रह व संपर्क' : 'Voter Engagement & Data Collection'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {language === 'hi' ? 'कॉलिंग, व्हाट्सएप एवं मतदाता प्रविष्टि हब' : 'Voter Calling, Messaging & Entry Console'}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {language === 'hi' 
                  ? 'यहाँ से आप मतदाताओं को 1-टैप में सीधे फ़ोन कॉल या व्हाट्सएप संदेश भेज सकते हैं, और नए मतदाताओं को जोड़ सकते हैं।' 
                  : 'Fast 1-tap phone calls, WhatsApp messages with templates, and voter constituent data collection.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-right shrink-0">
              <div className="text-[10px] text-slate-400 font-bold uppercase">{language === 'hi' ? 'कुल मतदाता' : 'Total Voters'}</div>
              <div className="text-2xl font-black text-emerald-400">{contacts.length}</div>
            </div>
          </div>

          {/* Officer Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
            <button
              onClick={() => setActiveTab('dialer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'dialer'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{language === 'hi' ? '📞 कॉल एवं व्हाट्सएप हब' : '📞 Calling & WhatsApp Hub'}</span>
            </button>

            <button
              onClick={() => setActiveTab('add_voter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'add_voter'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '➕ नया मतदाता जोड़ें' : '➕ Add Voter Entry'}</span>
            </button>

            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'directory'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'hi' ? `👥 मतदाता सूची (${contacts.length})` : `👥 Voter Directory (${contacts.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition relative ${
                activeTab === 'reminders'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{language === 'hi' ? `🔔 आज के ग्रीटिंग्स (${dueTodayReminders.length})` : `🔔 Due Greetings (${dueTodayReminders.length})`}</span>
              {dueTodayReminders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* 3. TAB 1: CALLING & WHATSAPP HUB */}
        {activeTab === 'dialer' && (
          <div className="space-y-6">
            
            {/* Due Greetings Alert Banner if any */}
            {dueTodayReminders.length > 0 && (
              <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <h4 className="font-black text-sm">
                      {language === 'hi' ? `आज के ${dueTodayReminders.length} अवसर रिमाइंडर्स (D-1)` : `${dueTodayReminders.length} Occasion Reminders Due Today`}
                    </h4>
                    <p className="text-xs text-amber-100">
                      {language === 'hi' ? 'मतदाताओं को जन्मदिन व सालगिरह की शुभकामनाएं तुरंत भेजें।' : 'Dispatch pre-filled WhatsApp greetings with 1 tap.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reminders')}
                  className="px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 text-white font-bold text-xs transition flex items-center gap-1.5 self-start md:self-auto"
                >
                  <span>{language === 'hi' ? 'सभी देखें व भेजें' : 'View & Send All'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <PhoneCall className="w-5 h-5 text-emerald-400" />
                    <span>{language === 'hi' ? 'मतदाता त्वरित कॉलिंग एवं व्हाट्सएप हब' : 'Quick Voter Calling & Outreach'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'hi' ? 'नाम या मोबाइल से तुरंत खोजें और 1-टैप में कॉल या संदेश भेजें।' : 'Search voter by name or mobile and call/message instantly.'}
                  </p>
                </div>

                {/* Quick Search Input */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'नाम या 10-अंकीय मोबाइल लिखें...' : 'Type name or 10-digit mobile...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Template Picker */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'hi' ? 'व्हाट्सएप संदेश टेम्प्लेट चुनें:' : 'Select Message Template:'}
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setMessageTemplate('campaign')}
                    className={`py-2 px-3 rounded-xl border text-center transition ${
                      messageTemplate === 'campaign' 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🗳️ {language === 'hi' ? 'वोट अपील' : 'Vote Appeal'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageTemplate('birthday')}
                    className={`py-2 px-3 rounded-xl border text-center transition ${
                      messageTemplate === 'birthday' 
                        ? 'bg-amber-600 text-white border-amber-500 shadow' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    🎂 {language === 'hi' ? 'जन्मदिन बधाई' : 'Birthday'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessageTemplate('anniversary')}
                    className={`py-2 px-3 rounded-xl border text-center transition ${
                      messageTemplate === 'anniversary' 
                        ? 'bg-rose-600 text-white border-rose-500 shadow' 
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    💍 {language === 'hi' ? 'सालगिरह बधाई' : 'Anniversary'}
                  </button>
                </div>
              </div>

              {/* Voters List for Calling */}
              <div className="space-y-2.5 pt-2 max-h-[480px] overflow-y-auto pr-1">
                {dialerResults.map((contact) => {
                  const messageText = getPrebuiltMessage(contact, messageTemplate);

                  return (
                    <div 
                      key={contact.id}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-white truncate">{contact.fullName}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                            contact.category === 'SUPPORTER' 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : (contact.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-400')
                          }`}>
                            {contact.category}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                          <span>+91 {contact.mobile}</span>
                          <button 
                            onClick={() => handleCopyMobile(contact.mobile)}
                            className="text-[10px] text-emerald-400 hover:underline"
                          >
                            {copiedMobile === contact.mobile ? '✓ Copied' : 'Copy'}
                          </button>
                          <span>&bull;</span>
                          <span className="truncate">{contact.village || 'Kalyanpur'}, {contact.ward || 'Ward 12'}</span>
                        </div>
                      </div>

                      {/* Call & WhatsApp Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <a
                          href={`tel:${contact.mobile}`}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                          title="Direct Call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'कॉल करें' : 'Call'}</span>
                        </a>

                        <a
                          href={`https://wa.me/91${contact.mobile}?text=${encodeURIComponent(messageText)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95"
                          title="WhatsApp Message"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{language === 'hi' ? 'व्हाट्सएप' : 'WhatsApp'}</span>
                        </a>

                        <a
                          href={`sms:${contact.mobile}?body=${encodeURIComponent(messageText)}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                          title="SMS"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}

        {/* 4. TAB 2: ADD VOTER ENTRY (STRICTLY CONTACTS TABLE) */}
        {activeTab === 'add_voter' && (
          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'मतदाता विवरण संग्रह' : 'Voter Data Collection'}</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {language === 'hi' ? '➕ नया मतदाता जोड़ें' : 'Add New Voter Entry'}
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi' 
                  ? 'यह प्रविष्टि सीधे contacts टेबल में सेव होगी। इन मतदाताओं को लॉगिन का अधिकार नहीं मिलता।' 
                  : 'Saves strictly into contacts table. Directory members have NO login permissions.'}
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAddVoter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'मतदाता का पूरा नाम' : 'Full Voter Name'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'पिता / पति का नाम' : 'Father / Spouse Name'}
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="e.g. Mohan Lal Kumar"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? '10-अंकीय मोबाइल नंबर' : '10-Digit Mobile'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-slate-500 font-mono">+91</span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'मतदाता श्रेणी (Category)' : 'Alignment Category'}
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                    {['SUPPORTER', 'NEUTRAL', 'OTHER'].map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-1.5 rounded-lg transition ${
                          formData.category === cat
                            ? (cat === 'SUPPORTER' ? 'bg-emerald-600 text-white shadow' : (cat === 'NEUTRAL' ? 'bg-sky-600 text-white shadow' : 'bg-slate-700 text-white'))
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat === 'SUPPORTER' ? 'समर्थक' : (cat === 'NEUTRAL' ? 'तटस्थ' : 'अन्य')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'गाँव / शहर' : 'Village / City'}</label>
                  <input
                    type="text"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    placeholder="Kalyanpur"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'वार्ड / क्षेत्र' : 'Ward / Area'}</label>
                  <input
                    type="text"
                    value={formData.ward}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    placeholder="Ward 12"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">🎂 {language === 'hi' ? 'जन्मतिथि' : 'Date of Birth'}</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">💍 {language === 'hi' ? 'सालगिरह' : 'Anniversary Date'}</label>
                  <input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'पता / गली' : 'Address / Street'}</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="House 23, Main Road"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'फील्ड फीडबैक / नोट्स' : 'Field Notes'}</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Influential community elder; volunteer for Ward 12."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{language === 'hi' ? 'मतदाता प्रविष्टि सहेजें' : 'Save Voter into contacts Table'}</span>
              </button>
            </form>
          </div>
        )}

        {/* 5. TAB 3: VOTER DIRECTORY (FULL DIRECTORY WITH DIRECT CALL / MSG) */}
        {activeTab === 'directory' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {language === 'hi' ? 'मतदाता निर्देशिका (Directory)' : 'Voters Directory'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi' ? `${filteredDirectory.length} मतदाता उपलब्ध हैं।` : `${filteredDirectory.length} voters match your filters.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={dirSearch}
                    onChange={(e) => setDirSearch(e.target.value)}
                    placeholder={language === 'hi' ? 'खोजें...' : 'Search...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="ALL">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
                  <option value="SUPPORTER">{language === 'hi' ? 'समर्थक' : 'Supporter'}</option>
                  <option value="NEUTRAL">{language === 'hi' ? 'तटस्थ' : 'Neutral'}</option>
                  <option value="OTHER">{language === 'hi' ? 'अन्य' : 'Other'}</option>
                </select>
              </div>
            </div>

            {/* Voter Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {filteredDirectory.map((contact) => (
                <div 
                  key={contact.id} 
                  className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-white truncate">{contact.fullName}</h4>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">+91 {contact.mobile}</div>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        contact.category === 'SUPPORTER' 
                          ? 'bg-emerald-500/20 text-emerald-300' 
                          : (contact.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400')
                      }`}>
                        {contact.category}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
                      {contact.fatherName && <div>S/O: {contact.fatherName}</div>}
                      <div>{contact.village || 'Kalyanpur'}, {contact.ward || 'Ward 12'}</div>
                      {(contact.dob || contact.anniversary) && (
                        <div className="flex items-center gap-2 pt-0.5">
                          {contact.dob && <span>🎂 {contact.dob}</span>}
                          {contact.anniversary && <span>💍 {contact.anniversary}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 1-Tap Category Switcher & Direct Call/WhatsApp */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-slate-400">{language === 'hi' ? 'श्रेणी बदलें:' : 'Switch:'}</span>
                      <div className="flex gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                        {['SUPPORTER', 'NEUTRAL', 'OTHER'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => onToggleCategory(contact.id, cat)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold transition ${
                              contact.category === cat
                                ? (cat === 'SUPPORTER' ? 'bg-emerald-600 text-white' : (cat === 'NEUTRAL' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-white'))
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {cat.slice(0, 4)}
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
                          <span className="hidden sm:inline">Edit</span>
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
                        title="Call"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/91${contact.mobile}?text=${encodeURIComponent(getPrebuiltMessage(contact, 'campaign'))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-[11px] flex items-center gap-1 shadow"
                        title="WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* 6. TAB 4: REMINDERS (D-1 OCCASION GREETINGS) */}
        {activeTab === 'reminders' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <span>{language === 'hi' ? 'आज के देय रिमाइंडर (D-1 Greetings)' : 'Due Today Reminders'}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {language === 'hi' ? 'शुभकामनाएं 1 दिन पूर्व प्रातः 09:00 बजे प्रेषित की जाती हैं।' : 'Occasion greetings scheduled 1 day prior at 09:00 AM.'}
              </p>
            </div>

            {dueTodayReminders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                {language === 'hi' ? 'आज कोई अवसर रिमाइंडर देय नहीं है।' : 'No reminders due today.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {dueTodayReminders.map((r, i) => (
                  <div key={i} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">{r.contact.fullName}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md font-bold">
                          {r.type === 'BIRTHDAY' ? '🎂 Birthday' : '💍 Anniversary'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">+91 {r.contact.mobile}</div>
                      <div className="text-xs text-amber-200/80 mt-1 line-clamp-1 italic">"{r.message}"</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${r.contact.mobile}`}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/91${r.contact.mobile}?text=${encodeURIComponent(r.message)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                        title="Send WhatsApp Greeting"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 7. MOBILE BOTTOM NAV FOR FIELD OFFICERS */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/30 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
        <button
          onClick={() => setActiveTab('dialer')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dialer' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px]">Call/Msg</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'directory' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Voters</span>
        </button>

        <button
          onClick={() => setActiveTab('add_voter')}
          className="w-12 h-12 -mt-6 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-slate-900 shrink-0 active:scale-95 transition"
        >
          <UserPlus className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'reminders' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px]">Greetings</span>
        </button>
      </nav>

    </div>
  );
}