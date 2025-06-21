const supabase = require('./supabaseClient');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads', 'avatars');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('File harus berupa gambar!'), false);
    }
  }
});

// Update user profile
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { full_name, email } = req.body;

    console.log('=== UPDATE PROFILE ===');
    console.log('User ID:', userId);
    console.log('Data to update:', { full_name, email });

    // Validate input
    if (!full_name || !email) {
      console.log('Validation failed: Missing full_name or email');
      return res.status(400).json({ error: 'Nama lengkap dan email harus diisi' });
    }

    // Check if email already exists for other users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing email:', checkError);
    }

    if (existingUser) {
      console.log('Email already exists for another user');
      return res.status(400).json({ error: 'Email sudah digunakan oleh user lain' });
    }

    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update({ 
        full_name: full_name,
        email: email,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile in database:', error);
      return res.status(500).json({ error: 'Gagal memperbarui profil: ' + error.message });
    }

    console.log('Profile updated successfully in database:', data);

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      full_name: data.full_name,
      email: data.email
    });
  } catch (error) {
    console.error('Error in updateProfile function:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

// Change password
async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Password saat ini dan password baru harus diisi' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    // Get current user data
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Password saat ini salah' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(new_password, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({ error: 'Gagal mengubah password' });
    }

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ error: 'Server error' });
  }
}

// Upload avatar
async function uploadAvatar(req, res) {
  try {
    const userId = req.user.id;

    console.log('Uploading avatar for user:', userId);
    console.log('File received:', req.file);

    if (!req.file) {
      return res.status(400).json({ error: 'File gambar harus diupload' });
    }

    // Generate avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user avatar in database
    const { data, error } = await supabase
      .from('users')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating avatar:', error);
      // Delete uploaded file if database update fails
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: 'Gagal menyimpan foto profil: ' + error.message });
    }

    console.log('Avatar updated successfully:', data);

    res.json({
      success: true,
      message: 'Foto profil berhasil diperbarui',
      avatar_url: avatarUrl
    });
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

module.exports = {
  updateProfile,
  changePassword,
  uploadAvatar,
  upload
};