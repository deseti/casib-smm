// src/pages/AdminDepositsPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Deposit {
    id: number;
    amount: number;
    unique_amount: number;
    status: string;
    created_at: string;
    users: {
        email: string;
    };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDepositsPage() {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPendingDeposits = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/pending-deposits`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Gagal mengambil data deposit');
            const data = await response.json();
            setDeposits(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingDeposits();
    }, []);

    const handleApprove = async (depositId: number) => {
        if (!confirm('Apakah Anda yakin ingin MENYETUJUI deposit ini?')) return;
        
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/approve-deposit/${depositId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            alert('Deposit berhasil disetujui!');
            fetchPendingDeposits(); // Refresh daftar deposit
        } catch (err: any) {
            alert(`Gagal approve: ${err.message}`);
        }
    };

    // --- FUNGSI BARU UNTUK MENOLAK DEPOSIT ---
    const handleReject = async (depositId: number) => {
        if (!confirm('Apakah Anda yakin ingin MENOLAK deposit ini?')) return;
        
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/reject-deposit/${depositId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            alert('Deposit berhasil ditolak.');
            fetchPendingDeposits(); // Refresh daftar deposit
        } catch (err: any) {
            alert(`Gagal menolak: ${err.message}`);
        }
    };

    if (isLoading) return <p className="text-white">Memuat...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader><CardTitle>Approval Deposit Pending</CardTitle></CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="p-2">Tanggal</th>
                                <th className="p-2">Email User</th>
                                <th className="p-2">Jumlah</th>
                                <th className="p-2">Nominal Unik</th>
                                <th className="p-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deposits.length === 0 ? (
                                <tr><td colSpan={5} className="p-4 text-center text-slate-400">Tidak ada deposit pending.</td></tr>
                            ) : (
                                deposits.map((d) => (
                                    <tr key={d.id} className="border-b border-slate-800">
                                        <td className="p-2">{new Date(d.created_at).toLocaleString('id-ID')}</td>
                                        <td className="p-2">{d.users.email}</td>
                                        <td className="p-2">Rp {Number(d.amount).toLocaleString('id-ID')}</td>
                                        <td className="p-2 font-bold text-yellow-400">Rp {Number(d.unique_amount).toLocaleString('id-ID')}</td>
                                        <td className="p-2 flex gap-2"> {/* <-- Gunakan flexbox untuk menata tombol */}
                                            <Button size="sm" onClick={() => handleApprove(d.id)} className="bg-green-600 hover:bg-green-700">Approve</Button>
                                            {/* --- TOMBOL BARU UNTUK MENOLAK --- */}
                                            <Button size="sm" variant="destructive" onClick={() => handleReject(d.id)}>Tolak</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}