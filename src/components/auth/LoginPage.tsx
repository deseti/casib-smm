// src/components/auth/LoginPage.tsx

import { useState, useEffect } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');  const [referralCode, setReferralCode] = useState('');
  const [referralValidation, setReferralValidation] = useState<{
    isValid: boolean | null;
    referrerName: string;
    message: string;
  }>({ isValid: null, referrerName: '', message: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  // Auto-detect referral code dari URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode.toUpperCase());
      setIsLogin(false); // Switch ke register mode jika ada referral code
      validateReferralCode(refCode.toUpperCase());
    }
  }, []);

  // Validasi kode referral
  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralValidation({ isValid: null, referrerName: '', message: '' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/referral/validate-code?code=${code.trim()}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        setReferralValidation({
          isValid: true,
          referrerName: data.referrer_name,
          message: `Kode valid! Dari ${data.referrer_name}`
        });
      } else {
        setReferralValidation({
          isValid: false,
          referrerName: '',
          message: data.message || 'Kode referral tidak valid'
        });
      }
    } catch (error) {
      console.error('Error validating referral code:', error);
      setReferralValidation({
        isValid: false,
        referrerName: '',
        message: 'Error validating referral code'
      });
    }
  };
  // Handle perubahan kode referral dengan debounce
  const handleReferralCodeChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setReferralCode(upperValue);
    
    // Clear previous validation
    setReferralValidation({ isValid: null, referrerName: '', message: '' });
    
    // Validate setelah 1 detik tidak ada perubahan
    setTimeout(() => {
      validateReferralCode(upperValue);
    }, 1000);
  };

  // Fungsi ini akan dipanggil setelah login Google berhasil
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log("Login Google Berhasil, mengirim token ke backend...");
    const idToken = credentialResponse.credential;

    try {
      const response = await fetch('http://localhost:3001/auth/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Hapus token google lama jika ada
      localStorage.removeItem('google_token');
      // Simpan token sesi (JWT) dari backend kita
      localStorage.setItem('jwt_token', data.token);
      window.location.reload();

    } catch (error: any) {
      setError(`Login Gagal: ${error.message}`);
    }
  };

  const handleGoogleError = () => {
    console.error("Login Google Gagal");
    setError("Login dengan Google gagal. Silakan coba lagi.");
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        const response = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // Jika berhasil, simpan token dan refresh
        localStorage.setItem('jwt_token', data.token);
        window.location.reload();

    } catch (error: any) {
        setError(`Login Gagal: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};
    const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:3001/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      // Jika ada reset link (development mode), tampilkan
      if (data.resetLink) {
        setSuccess(`${data.message}\n\nDevelopment Mode - Reset Link:\n${data.resetLink}`);
      } else {
        setSuccess(data.message);
      }
      
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      setError(`Reset Password Gagal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        const registerData: any = { 
          email, 
          password,
          full_name: fullName 
        };
        
        // Tambahkan referral code jika ada
        if (referralCode.trim()) {
          registerData.referral_code = referralCode.trim();
        }

        const response = await fetch('http://localhost:3001/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        setSuccess('Registrasi berhasil! Silakan masuk.');
        setIsLogin(true);
        // Reset form
        setEmail('');
        setPassword('');
        setFullName('');
        setReferralCode('');
    } catch (error: any) {
        setError(`Registrasi Gagal: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo dan Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src="/logos/icon.jpg" 
              alt="Casib SMM" 
              className="w-20 h-20 rounded-2xl shadow-2xl border-4 border-white/20"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Casib SMM</h1>
          <p className="text-slate-300">Platform SMM Panel Terdepan</p>
        </div>        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                isLogin 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Masuk
            </button>
            <button
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                !isLogin 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Daftar
            </button>
          </div>

          {/* Referral Code Info */}
          {!isLogin && referralCode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🎁</span>
                </div>
                <div>
                  <p className="text-white font-medium">Kode Referral Terdeteksi!</p>
                  <p className="text-purple-200 text-sm">
                    Kode: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                  <p className="text-purple-300 text-xs mt-1">
                    Daftar sekarang dan dapatkan bonus dari teman yang mengundang Anda!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Google Login */}
          <div className="mb-6">
            <div className="bg-white rounded-lg p-2">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                theme="outline"
                size="large"
                width="100%"
              />
            </div>
          </div>

          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-white/20"></div>
            <span className="px-4 text-slate-300 text-sm">atau</span>
            <div className="flex-1 h-px bg-white/20"></div>
          </div>

          {/* Forgot Password Modal/Form */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Reset Password</h3>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="resetEmail" className="text-white mb-2 block font-medium">
                      Email
                    </Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Masukkan email Anda"
                      className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail('');
                        setError('');
                      }}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Mengirim...
                        </div>
                      ) : (
                        'Kirim Link Reset'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}          {/* Email Form */}
          <form onSubmit={isLogin ? handleEmailLogin : handleEmailRegister} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contoh@email.com"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                required
              />
            </div>

            {/* Field Nama Lengkap - hanya tampil saat register */}
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="text-white mb-2 block font-medium">
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="password" className="text-white mb-2 block font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                required
              />
            </div>            {/* Field Kode Referral - hanya tampil saat register */}
            {!isLogin && (
              <div>
                <Label htmlFor="referralCode" className="text-white mb-2 block font-medium">
                  Kode Referral <span className="text-slate-400 text-sm">(Opsional)</span>
                </Label>
                <Input
                  id="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => handleReferralCodeChange(e.target.value)}
                  placeholder="Masukkan kode referral (jika ada)"
                  className={`bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:ring-blue-400/20 ${
                    referralValidation.isValid === true ? 'border-green-400 focus:border-green-400' :
                    referralValidation.isValid === false ? 'border-red-400 focus:border-red-400' :
                    'focus:border-blue-400'
                  }`}
                />
                
                {/* Validation Message */}
                {referralValidation.message && (
                  <p className={`text-xs mt-1 ${
                    referralValidation.isValid ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {referralValidation.message}
                  </p>
                )}
                
                {!referralValidation.message && (
                  <p className="text-slate-400 text-xs mt-1">
                    Punya kode referral dari teman? Masukkan di sini untuk mendapatkan bonus!
                  </p>
                )}
              </div>
            )}

            {/* Lupa Password Link - hanya tampil saat login */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Lupa Password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}            {success && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-200 text-sm whitespace-pre-line">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Memproses...
                </div>
              ) : (
                isLogin ? 'Masuk' : 'Daftar Akun'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-400 hover:text-blue-300 ml-1 font-medium"
              >
                {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm">
            © 2025 Casib SMM. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}