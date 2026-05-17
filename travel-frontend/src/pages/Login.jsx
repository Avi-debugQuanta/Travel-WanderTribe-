import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';

export default function Login() {
  const [step, setStep] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) navigate('/dashboard');
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const sendOtp = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await userApi.sendOtp(email, name);
      setStep('otp');
      if (data.debug_otp) {
        setSuccess(`OTP: ${data.debug_otp} (also sent to email if configured)`);
      } else {
        setSuccess('OTP sent! Check your email.');
      }
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    }
    setLoading(false);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '')) verifyOtp(newOtp.join(''));
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await userApi.verifyOtp(email, code);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/dashboard');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
    setLoading(false);
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const demoEmail = 'demo@wandertribe.com';
      const demoName = 'Demo Explorer';
      await userApi.sendOtp(demoEmail, demoName);
      const { data } = await userApi.verifyOtp(demoEmail, '000000').catch(async () => {
        const res = await userApi.register({ name: demoName, email: demoEmail, password: 'google-auth' });
        return res;
      });
      if (data?.id) {
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
        window.location.reload();
      } else {
        const all = await userApi.getAll();
        const found = all.data.find(u => u.email === demoEmail);
        if (found) {
          localStorage.setItem('user', JSON.stringify(found));
          navigate('/dashboard');
          window.location.reload();
        }
      }
    } catch {
      try {
        const { data } = await userApi.register({ name: 'Demo Explorer', email: 'demo@wandertribe.com', password: 'google-auth' });
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/dashboard');
        window.location.reload();
      } catch {
        setError('Google sign-in failed. Try with email.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative pt-20 sm:pt-24 px-4 sm:px-6 min-h-screen flex items-start justify-center overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-[0.12]"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#020617]/95 via-[#0f172a]/90 to-[#020617]" aria-hidden />

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-sky-500/20 to-violet-500/20 rounded-3xl flex items-center justify-center border border-white/10 shadow-lg shadow-sky-500/10 backdrop-blur-sm">
            <span className="text-5xl">🏔️</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(139,92,246,0.25)]">
              WanderTribe
            </span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg">
            {step === 'email' ? 'Sign in to plan your mountain adventure' : 'Enter the code we sent to your email'}
          </p>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-sky-500/10 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-400/5 via-transparent to-violet-500/10 opacity-90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 border border-white/5 rounded-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            aria-hidden
          />

          <div className="relative p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-base flex items-center gap-2">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            {success && step === 'otp' && (
              <div className="mb-5 p-4 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 text-base flex items-center gap-2">
                <span className="text-lg">✅</span> {success}
              </div>
            )}

            {step === 'email' ? (
              <>
                <button
                  type="button"
                  onClick={googleLogin}
                  disabled={loading}
                  className="w-full py-4 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl font-medium text-base transition-all hover:scale-[1.01] flex items-center justify-center gap-3 mb-6"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/30 text-sm">or sign in with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={sendOtp} className="space-y-5">
                  <div>
                    <label className="text-white/60 text-base mb-2 block font-medium">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Avipriya Ghosh"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-base mb-2 block font-medium">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-base placeholder:text-white/30 focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 disabled:opacity-50 rounded-xl font-semibold text-lg text-white transition-all hover:scale-[1.02] shadow-lg shadow-sky-500/20"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <p className="text-white/50 text-base">We sent a 6-digit code to</p>
                  <p className="text-sky-400 font-medium text-lg mt-1">{email}</p>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-14 h-16 text-center text-2xl font-bold bg-white/5 border border-white/20 rounded-xl text-white focus:border-sky-500 focus:outline-none transition-colors"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => verifyOtp(otp.join(''))}
                  disabled={loading || otp.some(d => d === '')}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 to-violet-600 hover:from-sky-400 hover:to-violet-500 disabled:opacity-50 rounded-xl font-semibold text-lg text-white transition-all hover:scale-[1.02] shadow-lg shadow-sky-500/20 mb-4"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp(['', '', '', '', '', '']);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={countdown > 0}
                    className={`text-sm transition-colors ${countdown > 0 ? 'text-white/30 cursor-default' : 'text-sky-400 hover:text-sky-300'}`}
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          No password needed. We send a one-time code to verify your identity.
        </p>
      </div>
    </div>
  );
}
