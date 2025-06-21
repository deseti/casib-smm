// backend/auth.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('./supabaseClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendResetPasswordEmail } = require('./emailService');

const router = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Endpoint Registrasi Email (Updated untuk referral)
router.post('/register', async (req, res) => {
  const { email, password, full_name, referral_code } = req.body;
  
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'Email, password, dan nama lengkap dibutuhkan' });
  }
  
  try {
    // Validasi kode referral jika disediakan
    let referrerData = null;
    if (referral_code) {
      const { data: referrer, error: refError } = await supabase
        .from('users')
        .select('id, email, full_name, is_referral_active')
        .eq('referral_code', referral_code)
        .eq('is_referral_active', true)
        .single();

      if (refError || !referrer) {
        return res.status(400).json({ 
          error: 'Kode referral tidak valid atau tidak aktif' 
        });
      }
      referrerData = referrer;
    }

    // Cek apakah email sudah terdaftar
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Data untuk insert user baru
    const userData = {
      email: email,
      password_hash: hashedPassword,
      full_name: full_name,
      referred_by: referral_code || null,
      is_referral_active: true
    };

    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select().single();
      
    if (error) {
      if (error.code === '23505') { 
        return res.status(409).json({ error: 'Email sudah terdaftar.' }); 
      }
      throw error;
    }

    // Generate referral code untuk user baru
    try {
      await supabase.rpc('generate_referral_code_for_user', {
        user_id: data.id
      });
    } catch (refCodeError) {
      console.error('Error generating referral code:', refCodeError);
      // Tidak menggagalkan registrasi jika referral code gagal generate
    }

    let responseMessage = 'Registrasi berhasil!';
    if (referrerData) {
      responseMessage += ` Anda terdaftar melalui referral dari ${referrerData.full_name || referrerData.email}.`;
    }

    res.status(201).json({ 
      message: responseMessage, 
      user: {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        referred_by: data.referred_by
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Gagal membuat user baru' });
  }
});

// Endpoint Login Email (Tidak ada perubahan)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { return res.status(400).json({ error: 'Email dan password dibutuhkan' }); }
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !user) { return res.status(401).json({ error: 'Email atau password salah' }); }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) { return res.status(401).json({ error: 'Email atau password salah' }); }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // <-- Tambahkan role
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({ message: 'Login berhasil', token: token });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
});

// --- PERUBAHAN UTAMA DI SINI ---
// Endpoint Verifikasi Google dengan Logika Account Linking
router.post('/verify-token', async (req, res) => {
  const { token } = req.body;
  if (!token) { return res.status(400).json({ error: 'Token is required' }); }

  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    console.log(`Token Google diverifikasi untuk: ${payload.name}`);

    // Cek apakah user sudah ada berdasarkan google_id
    let { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', payload.sub)
      .single();

    if (!user) {
      // Jika tidak ada, cek berdasarkan email (mungkin user pernah daftar manual)
      console.log(`User Google belum ada, mencari berdasarkan email: ${payload.email}`);
      let { data: userByEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', payload.email)
        .single();
      
      if (userByEmail) {
        // Jika email ditemukan, update user tersebut dengan google_id (linking account)
        console.log('Email ditemukan, menyatukan akun...');
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            google_id: payload.sub,
            full_name: userByEmail.full_name || payload.name, // Ambil nama yang sudah ada atau dari google
            avatar_url: userByEmail.avatar_url || payload.picture,
            last_login_at: new Date()
          })
          .eq('email', payload.email)
          .select()
          .single();
        if (updateError) throw updateError;
        user = updatedUser;
      } else {
        // Jika tidak ada juga, buat user baru
        console.log('User baru, membuat entry di database...');
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            google_id: payload.sub,
            email: payload.email,
            full_name: payload.name,
            avatar_url: payload.picture,
            last_login_at: new Date()
          })
          .select()
          .single();
        if (insertError) throw insertError;
        user = newUser;
      }
    } else {
      // Jika user Google sudah ada, cukup update waktu login terakhirnya
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ last_login_at: new Date() })
        .eq('google_id', payload.sub)
        .select()
        .single();
      if (updateError) throw updateError;
      user = updatedUser;
    }

    console.log('Proses user Google di DB selesai:', user);
    
    // Buat token JWT untuk sesi login Google
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role }, // <-- Tambahkan role
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login Google berhasil',
      token: jwtToken, // Kirim JWT token, bukan google token
    });
  } catch (error) {
    console.error('Error in /verify-token endpoint:', error);
    res.status(500).json({ error: error.message || 'Invalid token or database error' });
  }
});

// Endpoint Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email diperlukan' });
  }

  try {
    // Cek apakah email ada di database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    // Selalu return success message untuk keamanan (tidak expose apakah email ada atau tidak)
    if (!user) {
      return res.status(200).json({ 
        message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' } // Token valid 1 jam
    );

    // Simpan reset token ke database dengan expiry
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        reset_token: resetToken,
        reset_token_expires: new Date(Date.now() + 3600000).toISOString() // 1 jam dari sekarang
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error saving reset token:', updateError);
      return res.status(500).json({ error: 'Gagal memproses permintaan reset password' });
    }    // Kirim email reset password
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    
    // Coba kirim email
    const emailResult = await sendResetPasswordEmail(user.email, resetLink, user.full_name);
    
    if (emailResult.success) {
      console.log('✅ Email reset password berhasil dikirim ke:', user.email);
      res.status(200).json({ 
        message: 'Link reset password telah dikirim ke email Anda. Silakan cek email dan folder spam.'
      });
    } else {
      console.error('❌ Gagal mengirim email:', emailResult.error);
      // Fallback: tampilkan link di console untuk development
      console.log('=== RESET PASSWORD LINK (FALLBACK) ===');
      console.log(`User: ${user.full_name || user.email}`);
      console.log(`Link: ${resetLink}`);
      console.log('=== END RESET LINK ===');
      
      res.status(200).json({ 
        message: 'Link reset password telah diproses. Jika email tidak diterima, silakan hubungi administrator.',
        // Untuk development saja
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
      });
    }

  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses permintaan' });
  }
});

// Endpoint Reset Password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token dan password baru diperlukan' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
  }

  try {
    // Verify reset token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Token tidak valid' });
    }

    // Cek apakah user ada dan token masih valid
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, reset_token, reset_token_expires')
      .eq('id', decoded.id)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    if (user.reset_token !== token) {
      return res.status(400).json({ error: 'Token tidak valid atau sudah digunakan' });
    }

    if (new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ error: 'Token sudah expired. Silakan minta reset password baru.' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ error: 'Gagal mengupdate password' });
    }

    res.status(200).json({ 
      message: 'Password berhasil direset. Silakan login dengan password baru.' 
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Token sudah expired. Silakan minta reset password baru.' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Token tidak valid' });
    }
    
    console.error('Error in reset-password:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat reset password' });
  }
});

module.exports = router;