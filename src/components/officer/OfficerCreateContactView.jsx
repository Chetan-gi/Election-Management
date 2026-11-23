import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, ArrowLeft, CheckCircle2, AlertCircle, 
  Phone, User, MapPin, Calendar, FileText
} from 'lucide-react';
import { isValidIndianMobile } from '../../utils/phoneUtils';
import { createNormalContact } from '../../services/officerService';
import { translations } from '../../locales/translations';

export default function OfficerCreateContactView({ 
  user, 
  onContactSaved, 
  language 
}) {
  const navigate = useNavigate();
  const t = translations[language];

  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    mobile: '',
    village: 'Kalyanpur',
    ward: 'Ward 01',
    dob: '',
    anniversary: '',
    category: 'NEUTRAL',
    address: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter Full Legal Name of the voter.');
      return;
    }

    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!isValidIndianMobile(cleanMobile)) {
      setErrorMsg('Please enter a valid 10-digit Indian Mobile Number starting with 6, 7, 8, or 9.');
      return;
    }

    setLoading(true);

    try {
      // Create contact: saves strictly to contacts table with created_by_user_id = user.id
      const saved = await createNormalContact({
        fullName: formData.fullName,
        fatherName: formData.fatherName,
        mobile: cleanMobile,
        village: formData.village,
        ward: formData.ward,
        dob: formData.dob,
        anniversary: formData.anniversary,
        category: formData.category,
        address: formData.address,
        notes: formData.notes,
        currentUser: user
      });

      setSuccessMsg(`Voter "${formData.fullName}" successfully recorded!`);
      
      if (onContactSaved) {
        onContactSaved({
          ...formData,
          id: saved?.id || `c-${Date.now()}`,
          mobile: cleanMobile,
          created_by_user_id: user.id,
          user_id: user.id
        });
      }

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

      setTimeout(() => {
        navigate('/officer/contacts');
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || 'Failed to save contact.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Back to Contacts */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/contacts"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? '← मेरे मतदाता पर वापस जाएं' : '← Back to My Contacts'}</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'मतदाता प्रविष्टि' : 'Constituent Data Collection'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? '➕ नया मतदाता दर्ज करें' : 'Add New Voter Contact'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {language === 'hi'
              ? 'यह प्रविष्टि सीधे सक्रिय मतदाता सूची में सुरक्षित रूप से दर्ज होगी और आपके खाते से लिंक रहेगी।'
              : 'Records new constituent details securely in the active campaign voter directory.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'मतदाता का पूरा नाम' : 'Voter Full Name'} <span className="text-rose-400">*</span>
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

            {/* Father's Name */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'पिता / अभिभावक का नाम' : "Father's / Guardian Name"}
              </label>
              <input
                type="text"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                placeholder="e.g. Ram Prasad Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 10-Digit Mobile */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Alignment Category */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                {language === 'hi' ? 'मतदाता श्रेणी (Category)' : 'Alignment Category'} <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="SUPPORTER">Supporter (समर्थक)</option>
                <option value="NEUTRAL">Neutral (तटस्थ)</option>
                <option value="OTHER">Other / Undecided (अन्य)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Village */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'गांव / कस्बा' : 'Village / City'}</label>
              <input
                type="text"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Ward */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'वार्ड / क्षेत्र' : 'Ward / Area'}</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Birthday */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'जन्म तिथि (DOB)' : 'Date of Birth (Optional)'}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Anniversary */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'विवाह वर्षगांठ' : 'Marriage Anniversary (Optional)'}</label>
              <input
                type="date"
                value={formData.anniversary}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'पता / गली' : 'Street Address'}</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="House 12, Main Road"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">{language === 'hi' ? 'फील्ड नोट्स / फीडबैक' : 'Field Feedback & Notes'}</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Interested in clean water initiative; active community member."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              <span>{loading ? 'Saving...' : (language === 'hi' ? 'मतदाता प्रविष्टि सहेजें' : 'Save Voter Entry')}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
