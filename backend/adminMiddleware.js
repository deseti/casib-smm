// backend/adminMiddleware.js
const supabase = require('./supabaseClient');

async function adminOnly(req, res, next) {
    const userId = req.user.id; // Diambil dari authenticateToken middleware

    try {
        const { data, error } = await supabase
            .from('users')
            .select('role')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'User tidak ditemukan.' });
        }

        if (data.role !== 'admin') {
            return res.status(403).json({ error: 'Akses ditolak. Hanya untuk admin.' }); // Forbidden
        }

        next(); // Lanjutkan jika user adalah admin
    } catch(err) {
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = adminOnly;