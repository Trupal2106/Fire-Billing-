import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, RefreshCw, KeyRound, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
  companyName?: string;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, companyName = 'FIRE CARE SAFETY SOLUTION' }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Generate a random 4-digit number captcha
  const generateCaptcha = () => {
    const num = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(num);
    setCaptchaInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (captchaInput.trim() !== captchaCode) {
      setError('Invalid security caption number. Please enter the exact 4-digit number shown.');
      generateCaptcha();
      return;
    }

    // Default accepted credentials or any valid input
    if (username.trim().toLowerCase() === 'admin' && password !== 'admin123') {
      setError('Incorrect password for admin (Default: admin123)');
      return;
    }

    // Save session
    const sessionData = {
      isLoggedIn: true,
      username: username.trim(),
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem('fire_safety_auth_session', JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem('fire_safety_auth_session', JSON.stringify(sessionData));
    }

    onLoginSuccess(username.trim());
  };

  const handleQuickFill = () => {
    setUsername('admin');
    setPassword('admin123');
    setCaptchaInput(captchaCode);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-center items-center p-4 selection:bg-red-500 selection:text-white">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* App Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-600 text-white shadow-xl shadow-red-900/30 mb-3">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            {companyName}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Fire Safety & AMC Billing System • Secure Portal Access
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">User Login</h2>
              <p className="text-xs text-slate-500">Sign in to manage invoices, quotations & GST</p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> System Ready
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Enter username (e.g. admin)"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-red-600 hover:text-red-700 font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-slate-50/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Caption / Security Number (CAPTCHA) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  Security Caption Number
                </label>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                  title="Generate new security code"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Visual Captcha Display Badge */}
                <div className="h-10 px-4 bg-slate-900 text-amber-300 font-mono text-lg font-black tracking-widest rounded-lg flex items-center justify-center select-none shadow-inner border border-slate-800 relative overflow-hidden">
                  <span className="relative z-10 tracking-[0.25em]">{captchaCode}</span>
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:6px_6px]" />
                </div>

                {/* Input for Captcha */}
                <div className="flex-1">
                  <input
                    type="text"
                    required
                    maxLength={4}
                    placeholder="Enter 4-digit code"
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 text-xs font-mono font-bold tracking-wider rounded-lg border border-slate-300 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600 font-medium">Keep me signed in</span>
              </label>

              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Quick Auto-Fill
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Login to Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Info Box */}
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Demo Username: <strong className="text-slate-700">admin</strong></span>
            <span>Password: <strong className="text-slate-700">admin123</strong></span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 mt-6">
          © {new Date().getFullYear()} {companyName} • GST Compliant Billing Software
        </p>
      </div>
    </div>
  );
};
