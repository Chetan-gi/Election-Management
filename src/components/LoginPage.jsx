import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, User, Lock, Eye, EyeOff, ShieldCheck, 
  ArrowRight, Zap, Globe, Sparkles, CheckCircle2, Database, Bell,
  KeyRound, X, AlertCircle, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { translations } from '../locales/translations';

export default function LoginPage({ 
  currentUser,
  onLogin, 
  onSignOut,
  language, 
  onToggleLanguage, 
  supabaseStatus 
}) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot / Update Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null); // { type: 'success' | 'error', text: '' }

  const t = translations[language];

  // ============================================================================
  // DIRECT DATABASE LOGIN VERIFICATION & LOGGING
  // ============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = username.trim();
    const cleanUser = cleanInput.replace(/^@/, '').trim();
    const cleanPassword = password.trim();

    if (!cleanUser || !cleanPassword) {
      setErrorMsg(language === 'hi' ? 'कृपया यूजरनेम और पासवर्ड दोनों दर्ज करें।' : 'Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Direct, robust user lookup across username, email, and mobile
      let dbUser = null;

      // 1a. Search by username (case-insensitive)
      const { data: byUsername, error: userErr } = await supabase
        .from('app_users')
        .select('*')
        .ilike('username', cleanUser)
        .limit(1);

      if (byUsername && byUsername.length > 0) {
        dbUser = byUsername[0];
      }

      // 1b. Search by email (if email format)
      if (!dbUser && cleanUser.includes('@')) {
        const { data: byEmail } = await supabase
          .from('app_users')
          .select('*')
          .ilike('email', cleanUser)
          .limit(1);

        if (byEmail && byEmail.length > 0) {
          dbUser = byEmail[0];
        }
      }

      // 1c. Search by 10-digit mobile number
      const digitsOnly = cleanUser.replace(/\D/g, '');
      if (!dbUser && digitsOnly.length >= 10) {
        try {
          const { data: byMobile } = await supabase
            .from('app_users')
            .select('*')
            .eq('mobile_number', digitsOnly)
            .limit(1);

          if (byMobile && byMobile.length > 0) {
            dbUser = byMobile[0];
          }
        } catch (_) {}
      }

      // Case: User not found in app_users
      if (!dbUser) {
        // Check if user is registered in contacts table (voter directory)
        let contactMatch = null;
        try {
          const { data: cData } = await supabase
            .from('contacts')
            .select('full_name, mobile_number')
            .or(`mobile_number.eq.${cleanUser},full_name.ilike.%${cleanUser}%`)
            .limit(1)
            .maybeSingle();
          contactMatch = cData;
        } catch (_) {}

        // Log failed attempt
        try {
          await supabase.from('app_user_login_logs').insert([{
            username: cleanUser,
            status: 'FAILED',
            failure_reason: contactMatch 
              ? 'Contact table member attempted login (No login rights)' 
              : 'User not found in app_users table',
            user_agent: navigator.userAgent
          }]);
        } catch (_) {}

        setLoading(false);
        if (contactMatch) {
          setErrorMsg(language === 'hi' 
            ? `पहुंच अस्वीकृत: "${contactMatch.full_name}" केवल मतदाता सूची में दर्ज हैं। इनके पास सिस्टम लॉगिन का अधिकार नहीं है। केवल अधिकृत अधिकारी ही लॉगिन कर सकते हैं।` 
            : `Access Denied: "${contactMatch.full_name}" is registered in the voter directory only and does not have system login access. Only authorized personnel may log in.`
          );
        } else {
          setErrorMsg(language === 'hi' 
            ? 'पहुंच अस्वीकृत: खाता नहीं मिला। कृपया अपने यूजरनेम अथवा पासवर्ड की पुष्टि करें।' 
            : 'Access Denied: Account not found. Please verify your credentials or contact the administrator.'
          );
        }
        return;
      }

      // Case: User found, but inactive
      if (!dbUser.is_active) {
        try {
          await supabase.from('app_user_login_logs').insert([{
            user_id: dbUser.id,
            username: dbUser.username,
            status: 'FAILED',
            failure_reason: 'Account is inactive/deactivated',
            user_agent: navigator.userAgent
          }]);
        } catch (_) {}

        setLoading(false);
        setErrorMsg(language === 'hi'
          ? `यह ऑफिसर खाता (@${dbUser.username}) वर्तमान में निष्क्रिय (INACTIVE) है। कृपया एडमिन से संपर्क करके इसे सक्रिय (ACTIVE) कराएं।`
          : `This officer account (@${dbUser.username}) is currently INACTIVE. Please contact the administrator to activate it.`
        );
        return;
      }

      // Case: Password verification
      if (dbUser.password === cleanPassword) {
        // Success: Record audit log in Supabase
        try {
          await supabase.from('app_user_login_logs').insert([{
            user_id: dbUser.id,
            username: dbUser.username,
            status: 'SUCCESS',
            user_agent: navigator.userAgent
          }]);
          await supabase.from('app_users').update({ last_login_at: new Date().toISOString() }).eq('id', dbUser.id);
        } catch (_) {}

        setLoading(false);
        const userRole = (dbUser.role || 'OFFICER').trim().toUpperCase();
        const authData = {
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email,
          role: userRole,
          mobile_number: dbUser.mobile_number
        };
        onLogin(authData);
        navigate(userRole === 'ADMIN' ? '/admin/dashboard' : '/officer/dashboard', { replace: true });
      } else {
        // Failure: Record failed audit log in Supabase
        try {
          await supabase.from('app_user_login_logs').insert([{
            user_id: dbUser.id,
            username: dbUser.username,
            status: 'FAILED',
            failure_reason: 'Incorrect password',
            user_agent: navigator.userAgent
          }]);
        } catch (_) {}

        setLoading(false);
        setErrorMsg(language === 'hi' ? 'गलत पासवर्ड। कृपया पुनः प्रयास करें।' : 'Incorrect password. Please try again.');
      }

    } catch (err) {
      console.warn('DB check exception:', err);
      setLoading(false);
      setErrorMsg(language === 'hi' 
        ? 'लॉगिन में त्रुटि। कृपया अपने क्रेडेंशियल्स अथवा नेटवर्क की पुष्टि करें।' 
        : 'Login error. Please verify your credentials or check your connection.'
      );
    }
  };

  // ============================================================================
  // FORGOT / UPDATE PASSWORD DIRECTLY IN SUPABASE DB
  // ============================================================================
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const cleanUser = forgotUsername.trim();
    if (!cleanUser) {
      setForgotStatus({ type: 'error', text: language === 'hi' ? 'कृपया यूजरनेम दर्ज करें।' : 'Please enter your username.' });
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setForgotStatus({ type: 'error', text: language === 'hi' ? 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।' : 'Password must be at least 4 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotStatus({ type: 'error', text: language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खाते।' : 'Passwords do not match.' });
      return;
    }

    setForgotLoading(true);
    setForgotStatus(null);

    try {
      // 1. Try RPC reset_user_password
      const { data: rpcData, error: rpcError } = await supabase.rpc('reset_user_password', {
        p_username: cleanUser,
        p_new_password: newPassword
      });

      if (!rpcError && rpcData) {
        if (rpcData.success) {
          setForgotLoading(false);
          setForgotStatus({ type: 'success', text: language === 'hi' ? 'डेटाबेस में पासवर्ड सफलतापूर्वक अपडेट हो गया! अब आप नए पासवर्ड से लॉगिन कर सकते हैं।' : 'Password updated successfully in database! You can now log in.' });
          setPassword(newPassword);
          setUsername(cleanUser);
          return;
        } else {
          setForgotLoading(false);
          setForgotStatus({ type: 'error', text: rpcData.message });
          return;
        }
      }

      // 2. Direct Table UPDATE Fallback
      const { data: updateData, error: updateError } = await supabase
        .from('app_users')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .or(`username.ilike.${cleanUser},email.ilike.${cleanUser}`)
        .select();

      if (updateError) throw updateError;

      if (updateData && updateData.length > 0) {
        setForgotLoading(false);
        setForgotStatus({ 
          type: 'success', 
          text: language === 'hi' ? 'डेटाबेस में पासवर्ड सफलतापूर्वक अपडेट हो गया!' : 'Password updated successfully in database! You can now log in.' 
        });
        setPassword(newPassword);
        setUsername(cleanUser);
      } else {
        setForgotLoading(false);
        setForgotStatus({ 
          type: 'error', 
          text: language === 'hi' ? 'यह यूजरनेम डेटाबेस में नहीं मिला।' : 'User with this username was not found in database.' 
        });
      }
    } catch (err) {
      setForgotLoading(false);
      setForgotStatus({ 
        type: 'error', 
        text: language === 'hi' ? 'पासवर्ड अपडेट करने में त्रुटि: ' + (err.message || 'डेटाबेस चेक करें') : 'Failed to update password: ' + (err.message || 'Check database table') 
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 relative font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
            {t.appTitle}
          </span>
        </div>

        <button
          onClick={onToggleLanguage}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-200 border border-slate-800 flex items-center gap-1.5 transition shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          <span>{language === 'en' ? 'हिंदी में देखें' : 'View in English'}</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto my-auto py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* Left Hero Column */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Campaign Operations &amp; Voter Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            High-Reliability <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">
              Offline-First Voter Management
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Manage your voluntary voter directory with precision 3-tier alignment categorization, 
            deterministic 1-day-prior birthday &amp; anniversary alerts at 09:00 AM, and real-time cloud sync.
          </p>

          {/* Security & Access Badge */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-xl mx-auto lg:mx-0 text-left flex items-start gap-3 shadow-lg">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white">
                {language === 'hi' ? 'सुरक्षित एवं अधिकृत प्रवेश' : 'Authorized Personnel Access Only'}
              </div>
              <div className="text-slate-400 text-[11px] leading-relaxed">
                {language === 'hi'
                  ? 'यह पोर्टल केवल अधिकृत चुनाव प्रशासकों एवं फील्ड कैंपेन अधिकारियों के उपयोग हेतु सुरक्षित है।'
                  : 'This portal is restricted to authorized election administrators and verified field campaign officers.'}
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-sm text-left">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs mb-2">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Strict 3 Categories</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Supporter &bull; Neutral &bull; Other</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-sm text-left">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs mb-2">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Exact D-1 Reminders</div>
              <div className="text-[10px] text-slate-400 mt-0.5">09:00 AM &bull; 0 duplicates</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-sm text-left">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs mb-2">
                <Database className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-white">Secure Cloud Sync</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Encrypted &bull; Audit Trail</div>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Glassmorphic Login Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 space-y-6">
            
            <div className="text-left space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t.loginTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.loginSubtitle}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Active Session Notification if already authenticated */}
            {currentUser && (
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                    {language === 'hi' ? 'सक्रिय सत्र (Active Session)' : 'Active Session'}
                  </div>
                  <div className="font-bold text-white mt-0.5 truncate max-w-[180px]">
                    {currentUser.name || currentUser.username} <span className="text-[10px] text-slate-400 font-normal">({currentUser.role})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigate(currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/officer/dashboard')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] transition shadow"
                  >
                    {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'} &rarr;
                  </button>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={onSignOut}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl font-bold text-[11px] transition"
                      title="Clear session"
                    >
                      {language === 'hi' ? 'लॉगआउट' : 'Sign Out'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">{t.usernameLabel || "Username"}</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">{t.passwordLabel}</label>
                  <button 
                    type="button"
                    onClick={() => {
                      setForgotUsername(username || 'username');
                      setForgotStatus(null);
                      setNewPassword('');
                      setConfirmPassword('');
                      setIsForgotModalOpen(true);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberSession"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-950"
                />
                <label htmlFor="rememberSession" className="text-[11px] font-semibold text-slate-400 select-none cursor-pointer">
                  {t.rememberMe}
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-95 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying in Database...</span>
                  </>
                ) : (
                  <>
                    <span>{t.signInBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'एन्क्रिप्टेड रोल-बेस्ड प्रमाणीकरण • ऑडिट ट्रेल सुरक्षित' : 'Role-Based Authentication • Monitored Audit Trail'}</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 z-10 pt-4 border-t border-slate-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{supabaseStatus}</span>
        </div>
        <div>Election Contact &amp; Campaign Workspace &bull; v1.0.0</div>
      </footer>

      {/* ============================================================================ */}
      {/* FORGOT PASSWORD / UPDATE PASSWORD MODAL */}
      {/* ============================================================================ */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close button */}
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-[11px] font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Database Password Recovery</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {t.resetPasswordTitle || "Update Password in DB"}
              </h3>
              <p className="text-xs text-slate-400">
                {t.resetPasswordSubtitle || "Update your password directly in the database."}
              </p>
            </div>

            {forgotStatus && (
              <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                forgotStatus.type === 'success' 
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {forgotStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{forgotStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {t.usernameLabel || "Username"}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {t.newPasswordLabel || "New Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  {t.confirmNewPasswordLabel || "Confirm New Password"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating DB...</span>
                    </>
                  ) : (
                    <span>{t.updatePasswordBtn || "Update Password"}</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}