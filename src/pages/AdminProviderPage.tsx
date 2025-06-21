// src/pages/AdminProviderPage.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CloudLightning } from 'lucide-react'; // <-- TAMBAHKAN CloudLightning

export default function AdminProviderPage() {
    const [syncStatus, setSyncStatus] = useState('');
    const [testStatus, setTestStatus] = useState(''); // <-- State baru untuk hasil tes
    const [isTesting, setIsTesting] = useState(false); // <-- State untuk loading tes
    const [isSyncing, setIsSyncing] = useState(false); // <-- State untuk loading sinkronisasi
    const [isSyncingStatus, setIsSyncingStatus] = useState(false); // <-- State untuk loading sinkronisasi status order
    const [syncOrderStatus, setSyncOrderStatus] = useState(''); // <-- State untuk status sinkronisasi order

    const handleSyncServices = async () => {
        setIsSyncing(true);
        setSyncStatus('Memulai sinkronisasi, proses ini mungkin memakan waktu beberapa saat...');
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch('http://localhost:3001/api/admin/sync-services', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Terjadi kesalahan saat sinkronisasi');
            setSyncStatus(`Sinkronisasi Selesai! Pesan: ${data.message} | Jumlah: ${data.synced_count} layanan.`);
        } catch (err: any) {
            setSyncStatus(`Error: ${err.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSyncOrderStatus = async () => {
        setIsSyncingStatus(true);
        setSyncOrderStatus('Memulai sync status order...');
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch('http://localhost:3001/api/orders/sync-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setSyncOrderStatus(JSON.stringify(data, null, 2));
            } else {
                setSyncOrderStatus(`Error: ${data.error || 'Gagal sync status order'}`);
            }
        } catch (err: any) {
            setSyncOrderStatus(`Gagal sync status order: ${err.message}`);
            console.error(err);
        } finally {
            setIsSyncingStatus(false);
        }
    };

    // --- FUNGSI BARU (DIPINDAH DARI DASHBOARD) ---
    const handleTestProvider = async () => {
        setIsTesting(true);
        setTestStatus('Memeriksa koneksi ke provider...');
        const token = localStorage.getItem('jwt_token');
        try {
            const response = await fetch('http://localhost:3001/api/provider/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.error || 'Respon tidak OK');
            
            // Tampilkan hasil dalam format yang mudah dibaca
            setTestStatus(JSON.stringify(data, null, 2));
        } catch (err: any) {
            setTestStatus(`Gagal mengambil data: ${err.message}`);
            console.error(err);
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-950 text-white min-h-screen space-y-8">
            <h1 className="text-3xl font-bold">Manajemen Provider</h1>

            {/* Kartu Sinkronisasi Layanan */}
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Sinkronisasi Layanan</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Klik tombol di bawah untuk mengambil semua data layanan dari CentralSMM dan menyimpannya ke database lokal Anda. Proses ini akan memperbarui harga dan daftar layanan sesuai dengan provider.
                </p>
                <Button onClick={handleSyncServices} disabled={isSyncing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} /> 
                    {isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Layanan Provider'}
                </Button>
                {syncStatus && (
                    <div className="mt-4 text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
                        <p className="font-semibold">Status Sinkronisasi:</p>
                        <pre className="text-left text-xs text-white overflow-x-auto whitespace-pre-wrap">
                            <code>{syncStatus}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* Kartu Sync Status Order (BARU) */}
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Sync Status Order</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Sinkronisasi status semua order pending dengan provider CentralSMM. Gunakan ini untuk memperbarui status order yang sedang diproses.
                </p>
                <Button onClick={handleSyncOrderStatus} disabled={isSyncingStatus} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-400">
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncingStatus ? 'animate-spin' : ''}`} /> 
                    {isSyncingStatus ? 'Menyinkronkan...' : 'Sync Status Order'}
                </Button>
                {syncOrderStatus && (
                    <div className="mt-4 text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
                        <p className="font-semibold">Status Sync Order:</p>
                        <pre className="text-left text-xs text-white overflow-x-auto whitespace-pre-wrap">
                            <code>{syncOrderStatus}</code>
                        </pre>
                    </div>
                )}
            </div>

            {/* Kartu Tes Koneksi */}
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Uji Koneksi Provider</h2>
                <p className="text-sm text-slate-400 mb-4">
                    Gunakan tombol ini untuk memeriksa apakah koneksi ke API CentralSMM berhasil dan untuk melihat saldo Anda di sana.
                </p>
                <Button onClick={handleTestProvider} disabled={isTesting} variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-400">
                    <CloudLightning className={`mr-2 h-4 w-4 ${isTesting ? 'animate-pulse' : ''}`} /> 
                    {isTesting ? 'Menguji...' : 'Test Koneksi (Cek Saldo)'}
                </Button>
                {testStatus && (
                    <div className="mt-4 text-sm text-slate-300 bg-slate-800 p-3 rounded-md">
                        <p className="font-semibold">Hasil Tes Koneksi:</p>
                        <pre className="text-left text-xs text-white overflow-x-auto">
                            <code>{testStatus}</code>
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}