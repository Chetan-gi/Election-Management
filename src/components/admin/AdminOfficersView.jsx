import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, UserPlus, Search, Eye, EyeOff, Copy, 
  Check, Lock, Edit3, Trash2, Shield, RefreshCw,
  KeyRound, AlertCircle, CheckCircle2, UserCheck, UserX, Phone, Mail
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { updateOfficerDetails } from '../../services/officerService';
import { translations } from '../../locales/translations';

export default function AdminOfficersView({ 
  officers = [], 
  contacts = [], 
  onRefresh, 
  language 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [copiedId, setCopiedId] = useState('');

  // Password Reset Modal State
  const [resetModalOfficer, setResetModalOfficer] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  // Edit Officer Modal State
  const [editModalOfficer, setEditModalOfficer] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', mobile: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [editStatus, setEditStatus] = useState(null);

  const t = translations[language];

  // Filtered officers list
  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      const q = searchQuery.toLowerCase().trim();
      const officerPhone = o.mobile_number || contacts.find(c => c.user_id === o.id)?.mobile;
      const matchesSearch = !q || 
        o.name?.toLowerCase().includes(q) || 
        o.username?.toLowerCase().includes(q) || 
        o.email?.toLowerCase().includes(q) ||
        (officerPhone && officerPhone.includes(q));

      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && o.is_active) || 
        (statusFilter === 'INACTIVE' && !o.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [officers, searchQuery, statusFilter, contacts]);

  // Toggle Password Visibility
  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy Officer Credentials
  const handleCopyCredentials = (officer) => {
    const text = `Election Management Portal Credentials:\nRole: Campaign Field Officer\nName: ${officer.name}\nUsername: ${officer.username}\nPassword: ${officer.password || '******'}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard?.writeText(text);
    setCopiedId(officer.id || officer.username);
    setTimeout(() => setCopiedId(''), 2500);
  };

  // Toggle Active / Inactive
  const handleToggleActive = async (officer) => {
    if (officer.username === 'admin') {
      alert('The root System Administrator cannot be deactivated.');
      return;
    }
    const updatedStatus = !officer.is_active;
    try {
      await updateOfficerDetails(officer.id, { is_active: updatedStatus });
      onRefresh();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setResetStatus({ type: 'error', message: 'Password must be at least 4 characters long.' });
      return;
    }
    setResetLoading(true);
    setResetStatus(null);
    try {
      await updateOfficerDetails(resetModalOfficer.id, { password: newPassword });
      setResetStatus({ type: 'success', message: `Password updated successfully for @${resetModalOfficer.username}` });
      setTimeout(() => {
        setResetModalOfficer(null);
        setNewPassword('');
        setResetStatus(null);
        onRefresh();
      }, 1500);
    } catch (err) {
      setResetStatus({ type: 'error', message: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  // Handle Edit Officer Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditStatus({ type: 'error', message: 'Officer name cannot be empty.' });
      return;
    }
    setEditLoading(true);
    setEditStatus(null);
    try {
      await updateOfficerDetails(editModalOfficer.id, {
        name: editFormData.name,
        email: editFormData.email,
        mobile_number: editFormData.mobile
      });
      setEditStatus({ type: 'success', message: 'Officer details updated successfully!' });
      setTimeout(() => {
        setEditModalOfficer(null);
        setEditStatus(null);
        onRefresh();
      }, 1500);
    } catch (err) {
      setEditStatus({ type: 'error', message: err.message });
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फील्ड ऑफिसर्स प्रबंधन' : 'Officers Management'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'सभी ऑफिसर्स की सूची एवं क्रेडेंशियल्स' : 'Campaign Officers & Credentials'}
          </h2>
          <p className="text-xs text-slate-400">
            {language === 'hi' 
              ? 'यहाँ से आप ऑफिसर्स के पासवर्ड देख सकते हैं, रीसेट कर सकते हैं, और अकाउंट सक्रिय या निष्क्रिय कर सकते हैं।' 
              : 'View officer accounts, copy login credentials, toggle active status, and reset passwords.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/officers/create"
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'hi' ? '+ नया ऑफिसर बनाएं' : '+ Create Officer'}</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'hi' ? 'नाम, यूजरनेम या मोबाइल से खोजें...' : 'Search by name, username or mobile...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-400 font-bold">{language === 'hi' ? 'स्थिति:' : 'Status:'}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="ALL">{language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
            <option value="ACTIVE">{language === 'hi' ? 'सक्रिय (Active)' : 'Active Only'}</option>
            <option value="INACTIVE">{language === 'hi' ? 'निष्क्रिय (Inactive)' : 'Inactive Only'}</option>
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Officer Name &amp; Role</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Voters Added</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No officers match your query.
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer) => {
                  const votersCount = contacts.filter(c => c.created_by_user_id === officer.id || c.user_id === officer.id).length;
                  const isVisible = visiblePasswords[officer.id];
                  const isCopied = copiedId === (officer.id || officer.username);

                  return (
                    <tr key={officer.id || officer.username} className="hover:bg-slate-800/40 transition">
                      
                      {/* Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-sm text-white">{officer.name}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          officer.role === 'ADMIN' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {officer.role}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        @{officer.username}
                      </td>

                      {/* Password with Eye Toggle & Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800 select-all">
                            {isVisible ? (officer.password || '******') : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(officer.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title={isVisible ? 'Hide Password' : 'Show Password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Contact Details (Mobile / Email) */}
                      <td className="py-3.5 px-4 space-y-0.5 text-[11px] text-slate-400">
                        {(() => {
                          const displayMobile = officer.mobile_number || contacts.find(c => c.user_id === officer.id)?.mobile;
                          return (
                            <>
                              {displayMobile && (
                                <div className="flex items-center gap-1 font-mono text-slate-300">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  <span>+91 {displayMobile}</span>
                                </div>
                              )}
                              {officer.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span className="truncate max-w-[140px]">{officer.email}</span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </td>

                      {/* Voters Added Count */}
                      <td className="py-3.5 px-4 font-extrabold text-sm text-purple-300">
                        {votersCount} voters
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(officer)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center gap-1 transition ${
                            officer.is_active 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-rose-500/20 hover:text-rose-300' 
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300'
                          }`}
                          title="Click to toggle status"
                        >
                          {officer.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          <span>{officer.is_active ? 'ACTIVE' : 'INACTIVE'}</span>
                        </button>
                      </td>

                      {/* Actions (Copy credentials, Reset Password, Edit) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Credentials */}
                          <button
                            onClick={() => handleCopyCredentials(officer)}
                            className={`p-2 rounded-xl transition ${
                              isCopied 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title="Copy Login Credentials"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetModalOfficer(officer);
                              setNewPassword('');
                              setResetStatus(null);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-300 transition"
                            title="Reset Password"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditModalOfficer(officer);
                              setEditFormData({
                                name: officer.name || '',
                                email: officer.email || '',
                                mobile: officer.mobile_number || ''
                              });
                              setEditStatus(null);
                            }}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 transition"
                            title="Edit Officer Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. RESET PASSWORD MODAL */}
      {resetModalOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="font-black text-white text-base">
              Reset Password for @{resetModalOfficer.username}
            </h4>
            <p className="text-xs text-slate-400">
              Set a new secure login password for {resetModalOfficer.name}.
            </p>

            {resetStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                resetStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {resetStatus.message}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
                >
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. EDIT OFFICER MODAL */}
      {editModalOfficer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h4 className="font-black text-white text-base">
              Edit Officer: @{editModalOfficer.username}
            </h4>

            {editStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                editStatus.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {editStatus.message}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={editFormData.mobile}
                  onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                  placeholder="10-digit mobile"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  placeholder="officer@election.gov.in"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOfficer(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
