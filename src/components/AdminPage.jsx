import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, UserPlus, Users, KeyRound, Lock,
  CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff,
  Activity, Clock, Laptop, UserCheck, ShieldAlert,
  BarChart3, UserCog, UserMinus, Shield, Zap, ArrowRight,
  Copy, Check, Phone, Search, Trash2, LogOut, Globe, Database,
  FileText, Ban, Layers
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { translations } from '../locales/translations';

export default function AdminPage({
  user,
  contacts = [],
  language,
  onToggleLanguage,
  onSignOut,
  supabaseStatus,
  onOpenTests
}) {
  const t = translations[language];

  const [officers, setOfficers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all_in_one'); // 'all_in_one' | 'create' | 'view_officers' | 'voters_audit' | 'logs'
  const [searchOfficerQuery, setSearchOfficerQuery] = useState('');
  const [searchVoterQuery, setSearchVoterQuery] = useState('');

  // Form State for Creating New Officer
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'OFFICER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState('');
  const [formStatus, setFormStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Promote from contacts table
  const [selectedContactId, setSelectedContactId] = useState('');

  // Reset Password Modal State
  const [resetModalOfficer, setResetModalOfficer] = useState(null);
  const [newOfficerPassword, setNewOfficerPassword] = useState('');
  const [resetStatus, setResetStatus] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch Officers and Logs from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!userError && userData) {
        setOfficers(userData);
      } else {
        setOfficers([
          {
            id: 'admin-id-1',
            name: 'System Administrator',
            username: 'admin',
            password: 'admin123',
            role: 'ADMIN',
            email: 'admin@election.gov.in',
            is_active: true,
            last_login_at: new Date().toISOString()
          },
          {
            id: 'officer-id-1',
            name: 'Campaign Field Officer',
            username: 'username',
            password: 'username123',
            role: 'OFFICER',
            email: 'officer@election.gov.in',
            is_active: true,
            last_login_at: new Date().toISOString()
          }
        ]);
      }

      const { data: logsData, error: logsError } = await supabase
        .from('app_user_login_logs')
        .select('*')
        .order('login_timestamp', { ascending: false })
        .limit(30);

      if (!logsError && logsData) {
        setLogs(logsData);
      }
    } catch (err) {
      console.warn('Admin fetch exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered officers
  const filteredOfficers = useMemo(() => {
    if (!searchOfficerQuery.trim()) return officers;
    const q = searchOfficerQuery.toLowerCase().trim();
    return officers.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.username.toLowerCase().includes(q) ||
      (o.email && o.email.toLowerCase().includes(q))
    );
  }, [officers, searchOfficerQuery]);

  // Filtered voters for audit
  const filteredVoters = useMemo(() => {
    if (!searchVoterQuery.trim()) return contacts;
    const q = searchVoterQuery.toLowerCase().trim();
    return contacts.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.village && c.village.toLowerCase().includes(q))
    );
  }, [contacts, searchVoterQuery]);

  // Handle promote from contacts table
  const handleSelectContactToPromote = (contactId) => {
    setSelectedContactId(contactId);
    const found = contacts.find(c => c.id === contactId);
    if (found) {
      const cleanUser = 'officer_' + found.fullName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) + '_' + found.mobile.slice(-4);
      setFormData({
        name: found.fullName,
        username: cleanUser,
        password: found.mobile.slice(-4) + '123',
        email: `${cleanUser}@election.gov.in`,
        role: 'OFFICER'
      });
    }
  };

  // Create Officer in DB
  const handleCreateOfficer = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.username.trim() || !formData.password) {
      setFormStatus({
        type: 'error',
        message: language === 'hi'
          ? 'कृपया नाम, यूजरनेम और पासवर्ड सभी भरें।'
          : 'Please provide Officer Full Name, Username, and Password.'
      });
      return;
    }

    setSubmitting(true);
    setFormStatus(null);

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('admin_create_officer', {
        p_admin_username: user.username,
        p_name: formData.name.trim(),
        p_username: formData.username.trim().toLowerCase(),
        p_password: formData.password,
        p_email: formData.email.trim() || null,
        p_role: formData.role
      });

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          setFormStatus({
            type: 'success',
            message: language === 'hi'
              ? `नया ऑफिसर "${formData.name}" (@${formData.username}) सफलतापूर्वक बन गया!`
              : `New Officer "${formData.name}" (@${formData.username}) created successfully!`
          });
          setFormData({ name: '', username: '', password: '', email: '', role: 'OFFICER' });
          setSelectedContactId('');
          fetchData();
          setSubmitting(false);
          return;
        } else {
          setFormStatus({ type: 'error', message: rpcData.message });
          setSubmitting(false);
          return;
        }
      }

      const { error: insertError } = await supabase
        .from('app_users')
        .insert([{
          name: formData.name.trim(),
          username: formData.username.trim().toLowerCase(),
          password: formData.password,
          email: formData.email.trim() || null,
          role: formData.role,
          is_active: true
        }]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error(`Username "${formData.username}" is already taken. Please choose another.`);
        }
        throw insertError;
      }

      setFormStatus({
        type: 'success',
        message: language === 'hi'
          ? `नया ऑफिसर "${formData.name}" सफलतापूर्वक बन गया!`
          : `New Officer "${formData.name}" created successfully in database!`
      });
      setFormData({ name: '', username: '', password: '', email: '', role: 'OFFICER' });
      setSelectedContactId('');
      fetchData();
    } catch (err) {
      setFormStatus({
        type: 'error',
        message: err.message || 'Failed to create officer.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Officer Active / Inactive
  const handleToggleActive = async (targetOfficer) => {
    if (targetOfficer.username === 'admin') {
      alert('The root System Administrator cannot be deactivated.');
      return;
    }
    const updatedStatus = !targetOfficer.is_active;
    try {
      await supabase
        .from('app_users')
        .update({ is_active: updatedStatus, updated_at: new Date().toISOString() })
        .eq('id', targetOfficer.id);

      setOfficers(prev => prev.map(o => o.id === targetOfficer.id ? { ...o, is_active: updatedStatus } : o));
    } catch (err) {
      console.warn('Deactivate error:', err);
    }
  };

  // Toggle password visibility for admin view
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy credentials to send to officer
  const handleCopyCredentials = (officer) => {
    const text = `Election Management Login Details:\nRole: Campaign Field Officer\nName: ${officer.name}\nUsername: ${officer.username}\nPassword: ${officer.password || '******'}\nPortal URL: http://localhost:3000`;
    navigator.clipboard?.writeText(text);
    setCopiedId(officer.id || officer.username);
    setTimeout(() => setCopiedId(''), 2500);
  };

  // Reset Password for an Officer
  const handleResetOfficerPassword = async (e) => {
    e.preventDefault();
    if (!newOfficerPassword || newOfficerPassword.length < 4) {
      setResetStatus({ type: 'error', message: 'Password must be at least 4 characters.' });
      return;
    }

    setResetLoading(true);
    setResetStatus(null);

    try {
      const { error } = await supabase
        .from('app_users')
        .update({ password: newOfficerPassword, updated_at: new Date().toISOString() })
        .eq('id', resetModalOfficer.id);

      if (error) throw error;

      setResetStatus({ type: 'success', message: `Password for @${resetModalOfficer.username} updated successfully in DB!` });
      fetchData();
      setTimeout(() => {
        setResetModalOfficer(null);
        setNewOfficerPassword('');
        setResetStatus(null);
      }, 1500);
    } catch (err) {
      setResetStatus({ type: 'error', message: err.message || 'Failed to reset password.' });
    } finally {
      setResetLoading(false);
    }
  };

  const totalOfficers = officers.filter(o => o.role === 'OFFICER').length;
  const activeOfficers = officers.filter(o => o.is_active).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">

      {/* 1. DEDICATED ADMIN STICKY TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/90 backdrop-blur-xl border-b border-purple-500/30 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 font-bold shrink-0">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none">
                  {language === 'hi' ? 'व्यवस्थापक पोर्टल (Admin Portal)' : 'Admin Command Console'}
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ADMIN ONLY
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3 h-3 text-purple-400" />
                <span className="truncate max-w-xs">{supabaseStatus || 'Supabase Connected'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* System Acceptance Tests */}
            {onOpenTests && (
              <button
                onClick={onOpenTests}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
                title="System Acceptance Tests (20 AT Tests)"
              >
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Tests (20)</span>
              </button>
            )}

            {/* Language Switcher */}
            <button
              onClick={onToggleLanguage}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition border border-slate-700 text-slate-200"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Admin Profile & Sign Out */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name || user?.username}
                </span>
                <span className="text-[10px] text-purple-400 font-semibold">Administrator</span>
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

      {/* 2. MAIN ADMIN CONTENT BODY */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">

        {/* Top Hero & Tab Navigation */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-7 border border-purple-500/30 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                <span>{language === 'hi' ? 'ऑफिसर क्रेडेंशियल्स एवं नियंत्रण' : 'Officer Credentials & Control'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {language === 'hi' ? 'फील्ड ऑफिसर्स का प्रबंधन (Admin Hub)' : 'Campaign Officers Management'}
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {language === 'hi'
                  ? 'केवल एडमिन ही नए ऑफिसर्स बना सकता है। मतदाता सूची (contacts) के सदस्य बिना एडमिन अप्रूवल के लॉगिन नहीं कर सकते।'
                  : 'Only Administrators have the authority to provision login credentials for Field Officers.'}
              </p>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 flex items-center gap-2 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'रीफ्रेश करें' : 'Refresh Data'}</span>
            </button>
          </div>

          {/* Quick Tabs Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-800/80 mt-6">
            <button
              onClick={() => setActiveTab('all_in_one')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'all_in_one'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <Zap className="w-4 h-4" />
              <span>{language === 'hi' ? 'ऑफिसर बनाएं एवं देखें (डैशबोर्ड)' : 'Create & View Officers'}</span>
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'create'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'hi' ? '➕ नया ऑफिसर बनाएं' : '➕ Create New Officer'}</span>
            </button>

            <button
              onClick={() => setActiveTab('view_officers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'view_officers'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <Users className="w-4 h-4" />
              <span>{language === 'hi' ? `👥 सभी ऑफिसर्स देखें (${officers.length})` : `👥 View All Officers (${officers.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('voters_audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'voters_audit'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <Layers className="w-4 h-4" />
              <span>{language === 'hi' ? `📋 मतदाता सूची ऑडिट (${contacts.length})` : `📋 Voters Directory (${contacts.length})`}</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${activeTab === 'logs'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-slate-800/60 text-slate-300 hover:text-white'
                }`}
            >
              <Activity className="w-4 h-4" />
              <span>{language === 'hi' ? `📜 लॉगिन लॉग्स (${logs.length})` : `📜 Login Logs (${logs.length})`}</span>
            </button>
          </div>
        </div>

        {/* 3. TABS: CREATE & VIEW OFFICERS */}
        {(activeTab === 'all_in_one' || activeTab === 'create' || activeTab === 'view_officers') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* OPTION 1: CREATE OFFICER FORM */}
            <div className={`${activeTab === 'view_officers' ? 'hidden' : (activeTab === 'create' ? 'lg:col-span-12 max-w-2xl mx-auto' : 'lg:col-span-5')} bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4`}>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'ऑफिसर बनाने का विकल्प' : 'Officer Provisioning'}</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  {language === 'hi' ? '➕ नया ऑफिसर बनाएं' : 'Create New Officer'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi'
                    ? 'ऑफिसर का नाम, यूजरनेम और पासवर्ड भरें। यह सीधे app_users टेबल में सेव होगा।'
                    : 'Enter officer details. Credentials will be saved directly into app_users table.'}
                </p>
              </div>

              {/* Promote contact from directory */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold">
                  <span>{language === 'hi' ? 'या मतदाता सूची से ऑफिसर चुनें:' : 'Or choose from voters directory:'}</span>
                  <span className="text-purple-400">{contacts.length} {language === 'hi' ? 'उपलब्ध' : 'available'}</span>
                </div>
                <select
                  value={selectedContactId}
                  onChange={(e) => handleSelectContactToPromote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{language === 'hi' ? '-- किसी मतदाता को चुनें --' : '-- Choose a contact --'}</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} (+91 {c.mobile}) - {c.category} - {c.village}
                    </option>
                  ))}
                </select>
              </div>

              {formStatus && (
                <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${formStatus.type === 'success'
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  }`}>
                  {formStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{formStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleCreateOfficer} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'ऑफिसर का पूरा नाम' : 'Officer Full Name'} <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Sharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'यूजरनेम (Login ID)' : 'Assigned Username (Login ID)'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold font-mono">@</span>
                    <input
                      type="text"
                      required
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="officer_ramesh"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'प्रारंभिक पासवर्ड' : 'Initial Password'} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. ramesh123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 pr-10 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'ईमेल या संपर्क (वैकल्पिक)' : 'Email (Optional)'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@election.gov.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    {language === 'hi' ? 'रोल' : 'System Role'}
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="OFFICER">{language === 'hi' ? 'फील्ड ऑफिसर (मतदाता डेटा एकत्र करना, कॉल व मैसेज)' : 'Campaign Field Officer (Voter collection, Call & Msg)'}</option>
                    <option value="ADMIN">{language === 'hi' ? 'सिस्टम एडमिन (पूर्ण प्रशासनिक अधिकार)' : 'System Administrator (Full access)'}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition flex items-center justify-center gap-2 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{language === 'hi' ? 'डेटाबेस में सेव हो रहा है...' : 'Saving to Database...'}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{language === 'hi' ? '➕ नया ऑफिसर बनाएं' : 'Create Officer & Grant Login Rights'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* OPTION 2: VIEW ALL OFFICERS DIRECTORY */}
            <div className={`${activeTab === 'create' ? 'hidden' : (activeTab === 'view_officers' ? 'lg:col-span-12' : 'lg:col-span-7')} bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4`}>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold">
                    <Users className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'ऑफिसर्स देखने का विकल्प' : 'Officers Directory'}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {language === 'hi' ? 'सभी ऑफिसर्स की सूची (app_users)' : 'All Registered Officers'}
                  </h3>
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchOfficerQuery}
                    onChange={(e) => setSearchOfficerQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'ऑफिसर खोजें...' : 'Search officer...'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Officers Cards List */}
              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredOfficers.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    {language === 'hi' ? 'कोई ऑफिसर नहीं मिला।' : 'No officers found.'}
                  </div>
                ) : (
                  filteredOfficers.map((officer) => {
                    const isVisible = visiblePasswords[officer.id || officer.username];
                    const isCopied = copiedId === (officer.id || officer.username);

                    return (
                      <div
                        key={officer.id || officer.username}
                        className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${officer.role === 'ADMIN'
                              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                            {officer.name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-white truncate">{officer.name}</span>
                              <span className={`px-2 py-0.2 rounded-full text-[9px] font-black ${officer.role === 'ADMIN'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                {officer.role === 'ADMIN' ? 'Admin' : 'Field Officer'}
                              </span>
                              <span className={`w-2 h-2 rounded-full ${officer.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`} title={officer.is_active ? 'Active' : 'Disabled'}></span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                              <span className="font-mono text-purple-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
                                @{officer.username}
                              </span>

                              {/* Password Show/Hide Toggle */}
                              <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
                                <span>Pass:</span>
                                <span className="text-amber-300 font-bold">
                                  {isVisible ? (officer.password || '••••••') : '••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(officer.id || officer.username)}
                                  className="text-slate-400 hover:text-white"
                                  title="Show/Hide Password"
                                >
                                  {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                              </span>
                            </div>

                            {officer.email && (
                              <div className="text-[11px] text-slate-400 mt-1">{officer.email}</div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => handleCopyCredentials(officer)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1 border border-slate-700"
                            title="Copy credentials"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[11px]">{isCopied ? 'Copied!' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setResetModalOfficer(officer);
                              setNewOfficerPassword('');
                              setResetStatus(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition border border-slate-700"
                          >
                            <span className="text-[11px]">{language === 'hi' ? 'पासवर्ड बदलें' : 'Reset'}</span>
                          </button>

                          {officer.username !== 'admin' && (
                            <button
                              onClick={() => handleToggleActive(officer)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition border ${officer.is_active
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                }`}
                            >
                              <span className="text-[11px]">
                                {officer.is_active
                                  ? (language === 'hi' ? 'बंद करें' : 'Disable')
                                  : (language === 'hi' ? 'चालू करें' : 'Enable')}
                              </span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>
        )}

        {/* 4. TAB: VOTERS DIRECTORY AUDIT (Inspect voter records across officers) */}
        {activeTab === 'voters_audit' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">
                  {language === 'hi' ? 'मतदाता सूची ऑडिट (contacts Table)' : 'Voters Directory Audit'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi'
                    ? 'फील्ड ऑफिसर्स द्वारा एकत्र किए गए सभी मतदाता रिकॉर्ड्स।'
                    : 'Constituent voter entries collected by officers. Note: These members have no login rights.'}
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchVoterQuery}
                  onChange={(e) => setSearchVoterQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'मतदाता खोजें...' : 'Search voter...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Voter Name</th>
                    <th className="py-3 px-3">Mobile</th>
                    <th className="py-3 px-3">Village &amp; Ward</th>
                    <th className="py-3 px-3">Alignment Category</th>
                    <th className="py-3 px-3">Occasions</th>
                    <th className="py-3 px-3 text-right">Login Rights Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredVoters.map((voter) => (
                    <tr key={voter.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 font-bold text-white">
                        <div>{voter.fullName}</div>
                        {voter.fatherName && <div className="text-[10px] text-slate-400 font-normal">S/O: {voter.fatherName}</div>}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        +91 {voter.mobile}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {[voter.village, voter.ward].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${voter.category === 'SUPPORTER'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : (voter.category === 'NEUTRAL' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400')
                          }`}>
                          {voter.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {voter.dob && <span>🎂 {voter.dob} </span>}
                        {voter.anniversary && <span>💍 {voter.anniversary}</span>}
                        {!voter.dob && !voter.anniversary && <span>-</span>}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-semibold">
                          No Login Rights ❌
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. TAB: LOGIN AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">
                  {language === 'hi' ? 'लॉगिन ऑडिट ट्रैल्स' : 'Live Authentication Audit Trails'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi'
                    ? 'सिस्टम में लॉगिन के सभी प्रयास (app_user_login_logs टेबल)।'
                    : 'Real-time log of every user login attempt.'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
                {logs.length} Recent Logs
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider font-sans">
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Username</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Failure Reason</th>
                    <th className="py-3 px-3">Client Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.login_timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {log.username}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-sans ${log.status === 'SUCCESS'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-rose-300">
                        {log.failure_reason || '-'}
                      </td>
                      <td className="py-3 px-3 text-slate-400 truncate max-w-xs font-sans">
                        {log.user_agent || log.ip_address || 'Web Client'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Reset Password Modal */}
      {resetModalOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="font-black text-white text-base">
              {language === 'hi' ? `@${resetModalOfficer.username} का पासवर्ड बदलें` : `Reset Password for @${resetModalOfficer.username}`}
            </h4>
            <p className="text-xs text-slate-400">
              {language === 'hi'
                ? `${resetModalOfficer.name} के लिए नया पासवर्ड दर्ज करें।`
                : `Set a new password for ${resetModalOfficer.name}.`}
            </p>

            {resetStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${resetStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                {resetStatus.message}
              </div>
            )}

            <form onSubmit={handleResetOfficerPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {language === 'hi' ? 'नया पासवर्ड' : 'New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={newOfficerPassword}
                  onChange={(e) => setNewOfficerPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOfficer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
                >
                  {resetLoading ? 'Updating...' : (language === 'hi' ? 'पासवर्ड अपडेट करें' : 'Update Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}