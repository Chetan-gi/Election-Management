import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus, Shield, Lock, Eye, EyeOff, CheckCircle2,
  AlertCircle, ArrowLeft, Copy, Check, Users, Sparkles, Phone, Mail, MapPin
} from 'lucide-react';
import { isValidIndianMobile } from '../../utils/phoneUtils';
import { createOfficerWithContact } from '../../services/officerService';
import { translations } from '../../locales/translations';

export default function AdminCreateOfficerView({
  adminUser,
  contacts = [],
  onOfficerCreated,
  language
}) {
  const navigate = useNavigate();
  const t = translations[language];

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    username: '',
    email: '',
    password: '',
    address: '',
    village: 'Kalyanpur',
    ward: 'Ward 01',
    dob: '',
    photoUrl: '',
    status: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [createdResult, setCreatedResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Promote from existing contact dropdown
  const [selectedContactId, setSelectedContactId] = useState('');

  // Handle contact selection to prefill form
  const handleSelectContactToPromote = (contactId) => {
    setSelectedContactId(contactId);
    if (!contactId) return;

    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      const suggestedUser = contact.fullName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 15);

      const suggestedPass = `${suggestedUser}123`;

      setFormData(prev => ({
        ...prev,
        fullName: contact.fullName,
        mobile: contact.mobile,
        username: `officer_${suggestedUser}`,
        email: `${suggestedUser}@election.gov.in`,
        password: suggestedPass,
        address: contact.address || '',
        village: contact.village || 'Kalyanpur',
        ward: contact.ward || 'Ward 01',
        dob: contact.dob || ''
      }));
    }
  };

  // Generate a random strong password
  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    // Validation
    if (!formData.fullName.trim() || !formData.username.trim() || !formData.password) {
      setStatusMessage({
        type: 'error',
        text: language === 'hi' ? 'कृपया सभी अनिवार्य फ़ील्ड भरें।' : 'Please fill all mandatory fields.'
      });
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!isValidIndianMobile(cleanMobile)) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 10-digit Indian Mobile Number starting with 6, 7, 8, or 9.'
      });
      return;
    }

    setSubmitting(true);

    try {
      // Execute the 3-Step Atomic Officer + Linked Contact Workflow
      const result = await createOfficerWithContact({
        fullName: formData.fullName,
        mobile: cleanMobile,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        village: formData.village,
        ward: formData.ward,
        dob: formData.dob,
        photoUrl: formData.photoUrl,
        status: formData.status,
        adminUser
      });

      setStatusMessage({
        type: 'success',
        text: language === 'hi'
          ? `नया ऑफिसर "${formData.fullName}" (@${formData.username}) सफलतापूर्वक बन गया!`
          : `New Officer "${formData.fullName}" created successfully!`
      });

      setCreatedResult({
        name: formData.fullName,
        username: formData.username,
        password: formData.password,
        mobile: cleanMobile,
        userId: result.userId
      });

      if (onOfficerCreated) onOfficerCreated();

      // Reset form fields
      setFormData({
        fullName: '',
        mobile: '',
        username: '',
        email: '',
        password: '',
        address: '',
        village: 'Kalyanpur',
        ward: 'Ward 01',
        dob: '',
        photoUrl: '',
        status: true
      });
      setSelectedContactId('');

    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Officer creation failed.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Copy created credentials
  const handleCopyNewCredentials = () => {
    if (!createdResult) return;
    const text = `Election Management Portal Credentials:\nRole: Campaign Field Officer\nName: ${createdResult.name}\nUsername: ${createdResult.username}\nPassword: ${createdResult.password}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Back to Officers navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/officers"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? '← सभी ऑफिसर्स पर वापस जाएं' : '← Back to Officers'}</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">

        {/* Card Header */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>{language === 'hi' ? 'ऑफिसर खाता एवं प्रोफाइल निर्माण' : 'Officer Account Provisioning'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? '➕ नया फील्ड ऑफिसर बनाएं' : 'Create New Campaign Officer'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'यह फॉर्म नया फील्ड ऑफिसर खाता और उनकी कार्य प्रोफाइल सुरक्षित रूप से तैयार करता है।'
              : 'Provisions official officer credentials and field assignment securely.'}
          </p>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${statusMessage.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}

        {/* Successfully Created Credentials Box */}
        {createdResult && (
          <div className="p-4 rounded-2xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs space-y-3">
            <div className="font-extrabold text-white flex items-center justify-between">
              <span>📋 Officer Login Credentials Ready</span>
              <button
                onClick={handleCopyNewCredentials}
                className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition text-[11px]"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
            </div>
            <div className="font-mono text-[11px] bg-slate-950/90 p-3 rounded-xl border border-slate-800 space-y-1">
              <div><span className="text-slate-400">Name:</span> {createdResult.name}</div>
              <div><span className="text-slate-400">Username:</span> <span className="text-emerald-400">{createdResult.username}</span></div>
              <div><span className="text-slate-400">Password:</span> <span className="text-amber-300">{createdResult.password}</span></div>
              <div><span className="text-slate-400">Mobile:</span> +91 {createdResult.mobile}</div>
            </div>
          </div>
        )}

        {/* Optional: Promote from existing voter directory */}
        {contacts.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'मौजूदा मतदाता को ऑफिसर बनाएं (ऑप्शनल)' : 'Fast-Track: Promote from Voter Directory (Optional)'}</span>
            </div>
            <select
              value={selectedContactId}
              onChange={(e) => handleSelectContactToPromote(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Choose a contact from directory to auto-fill form --</option>
              {contacts.map(c => (
                <option key={c.id} value={c.id}>
                  {c.fullName} (+91 {c.mobile}) - {c.village || 'Kalyanpur'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* The Officer Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'ऑफिसर का पूरा नाम' : 'Full Name'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Ramesh Chandra Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? '10-अंकीय मोबाइल नंबर' : '10-Digit Mobile Number'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Username / Login ID */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'यूजरनेम (लॉगिन आईडी)' : 'Login Username'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-purple-400 font-mono">@</span>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="officer_ramesh"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'ईमेल आईडी (वैकल्पिक)' : 'Official Email (Optional)'}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer@election.gov.in"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Password with generator & toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-300">
                {language === 'hi' ? 'लॉगिन पासवर्ड' : 'Initial Password'} <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-bold"
              >
                ⚡ Generate Password
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password (e.g. ramesh123)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
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

          {/* Address, Village & Ward */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'गांव / शहर' : 'Village / City'}</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'वार्ड / क्षेत्र' : 'Ward / Area'}</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'जन्म तिथि (DOB)' : 'Date of Birth (Optional)'}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'कार्यालय / आवास का पता' : 'Street Address'}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House 45, Civil Lines"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Officer Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="font-bold text-white text-xs">{language === 'hi' ? 'खाता स्थिति (Officer Status)' : 'Initial Account Status'}</div>
              <div className="text-[11px] text-slate-400">
                {formData.status ? 'Active (Officer can immediately log in)' : 'Inactive (Account locked until enabled)'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: !formData.status })}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${formData.status ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
            >
              {formData.status ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              <span>{submitting ? 'Creating Officer & Linking Contact...' : (language === 'hi' ? 'सुरक्षित ऑफिसर खाता बनाएं' : 'Create & Link Officer Account')}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
