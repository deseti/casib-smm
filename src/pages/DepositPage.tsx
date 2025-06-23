// src/pages/DepositPage.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  email: string;
}

interface DepositInstruction {
  id: number;
  unique_amount: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function DepositPage() {
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [instruction, setInstruction] = useState<DepositInstruction | null>(null);

    // --- GANTI DENGAN INFORMASI ASLI MILIKMU ---
    const paymentDetails = {
        bca: "706-056-5516 (a/n SAKURI)",
        dana: "085781616133 (a/n SAKURI)",
        whatsappNumber: "6285781616133"
    };

    const handleCreateDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) {
            setError('Masukkan jumlah deposit yang valid.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
            if (!token) throw new Error('Sesi tidak valid.');
            const response = await fetch(`${API_BASE_URL}/api/deposits/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: Number(amount) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setInstruction(data.deposit);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsappSupport = () => {
        const token = localStorage.getItem('jwt_token') || localStorage.getItem('google_token');
        const userEmail = token ? (jwtDecode(token) as DecodedToken).email : 'Email tidak ditemukan';
        const depositId = instruction?.id || 'ID tidak ada';
        const message = `Halo Admin Casib SMM,\n\nSaya mengalami kendala saat deposit.\n\nID Deposit: ${depositId}\nEmail Akun: ${userEmail}\n\nMohon bantuannya. Terima kasih.`;
        const whatsappUrl = `https://wa.me/${paymentDetails.whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    if (!instruction) {
        return (
            <Card className="max-w-md mx-auto bg-slate-900 border-slate-800 text-white">
                <CardHeader>
                    <CardTitle>Deposit Saldo</CardTitle>
                    <CardDescription>Masukkan jumlah saldo yang ingin Anda depositkan.</CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateDeposit}>
                    <CardContent>
                        <Label htmlFor="amount">Jumlah Deposit (Rp)</Label>
                        <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Minimal Rp 10.000" className="bg-slate-800 border-slate-700 mt-2" />
                    </CardContent>
                    <CardFooter className="flex flex-col items-stretch gap-2">
                        <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {isLoading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                        </Button>
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    </CardFooter>
                </form>
            </Card>
        );
    }
    
    return (
        <Card className="max-w-2xl mx-auto bg-slate-900 border-slate-800 text-white">
            <CardHeader>
                <CardTitle>Selesaikan Pembayaran Anda</CardTitle>
                <CardDescription>ID Deposit Anda adalah #{instruction.id}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-6 rounded-lg bg-slate-800 text-center space-y-2">
                    <p className="text-sm text-slate-400">Silakan transfer dengan jumlah yang TEPAT</p>
                    <p className="text-4xl font-bold text-yellow-400 tracking-wider">Rp {instruction.unique_amount.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-slate-500">Jumlah ini sudah termasuk kode unik untuk verifikasi otomatis.</p>
                </div>
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Tujuan Transfer:</h3>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                        <img src="/logos/bca.png" alt="Logo BCA" className="w-16 h-auto" />
                        <p className="font-mono">{paymentDetails.bca}</p>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50">
                        <img src="/logos/dana.png" alt="Logo DANA" className="w-16 h-auto" />
                        <p className="font-mono">{paymentDetails.dana}</p>
                    </div>
                    {/* --- TAMBAHKAN BAGIAN QRIS DI SINI --- */}
                    <div className="text-center">
                      <div className="bg-white p-2 rounded-md inline-block">
                        <img src="/logos/qris.png" alt="Kode QRIS" className="w-48 h-48" />
                      </div>
                      
                      {/* Tambahkan tombol download di bawah QRIS */}
                      <div className="mt-4">
                        <a 
                          href="/logos/qris.png" 
                          download="QRIS-CasibSMM.png"
                          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download QRIS
                        </a>
                      </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                 <p className="text-center text-xs text-slate-400">
                    Saldo akan bertambah secara otomatis setelah pembayaran diverifikasi oleh admin (5-30 menit pada jam kerja).
                </p>
                <Button variant="outline" onClick={handleWhatsappSupport} className="w-full border-green-600 text-green-500 hover:bg-green-600/10 hover:text-green-400">
                    Hubungi Bantuan via WhatsApp (Jika ada kendala)
                </Button>
            </CardFooter>
        </Card>
    );
}