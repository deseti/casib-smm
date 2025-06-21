// src/pages/DashboardHomePage.tsx
import { ShoppingCart, TrendingUp, Clock, Wallet } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Interface untuk statistik
interface Stats {
    balance: number;
    totalOrders: number;
    pendingOrders: number;
    successOrders: number;
}

export default function DashboardHomePage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('jwt_token');
            try {
                const response = await fetch('http://localhost:3001/api/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Gagal memuat statistik');
                const data = await response.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleCreateOrder = () => {
        navigate('/new-order');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg">Memuat data dasbor...</p>
                </div>
            </div>
        );
    }

    const displayStats = stats || { balance: 0, totalOrders: 0, pendingOrders: 0, successOrders: 0 };

    return (
        <div className="space-y-6 lg:space-y-8 bg-slate-950 text-white min-h-screen p-4">
            {/* Bagian Welcome Section */}
            <div className="rounded-3xl bg-slate-900 p-8 lg:p-12 shadow-2xl border border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-50"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
                <div className="relative z-10"><div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6"><div className="text-center lg:text-left"><h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">Selamat Datang di Casib SMM</h1><p className="text-slate-300 text-lg lg:text-xl max-w-2xl leading-relaxed">Platform SMM Panel terdepan untuk mengelola layanan media sosial Anda dengan efisien dan profesional.</p></div><div className="flex justify-center lg:justify-end"><img src="/logos/icon.jpg" alt="Casib SMM" className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl shadow-2xl border-2 border-slate-600/50 object-cover"/></div></div></div>
            </div>

            {/* Bagian Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"><div className="group rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"><div className="flex items-center justify-between mb-4"><TrendingUp className="h-8 w-8 text-blue-400" /><div className="text-blue-400 text-sm font-medium bg-blue-500/20 px-2 py-1 rounded-full">Total</div></div><h3 className="font-semibold text-blue-200 text-sm mb-2">Total Pesanan</h3><p className="text-3xl lg:text-4xl font-bold text-white">{displayStats.totalOrders}</p></div><div className="group rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"><div className="flex items-center justify-between mb-4"><ShoppingCart className="h-8 w-8 text-green-400" /><div className="text-green-400 text-sm font-medium bg-green-500/20 px-2 py-1 rounded-full">Selesai</div></div><h3 className="font-semibold text-green-200 text-sm mb-2">Pesanan Selesai</h3><p className="text-3xl lg:text-4xl font-bold text-white">{displayStats.successOrders}</p></div><div className="group rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"><div className="flex items-center justify-between mb-4"><Clock className="h-8 w-8 text-yellow-400" /><div className="text-yellow-400 text-sm font-medium bg-yellow-500/20 px-2 py-1 rounded-full">Pending</div></div><h3 className="font-semibold text-yellow-200 text-sm mb-2">Pesanan Pending</h3><p className="text-3xl lg:text-4xl font-bold text-white">{displayStats.pendingOrders}</p></div><div className="group rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"><div className="flex items-center justify-between mb-4"><Wallet className="h-8 w-8 text-purple-400" /><div className="text-purple-400 text-sm font-medium bg-purple-500/20 px-2 py-1 rounded-full">Saldo</div></div><h3 className="font-semibold text-purple-200 text-sm mb-2">Saldo</h3><p className="text-2xl lg:text-3xl font-bold text-white">Rp {displayStats.balance.toLocaleString('id-ID')}</p></div></div>

            {/* Bagian Aksi Cepat (Tombol Tes Provider dihapus) */}
            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-8 lg:p-10 shadow-2xl">
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 text-center lg:text-left">Aksi Cepat</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Button onClick={handleCreateOrder} className="h-auto p-6 lg:p-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-left justify-start gap-4 transition-all duration-200 hover:shadow-xl hover:scale-105 rounded-2xl">
                        <div className="flex flex-col gap-2 w-full"><div className="flex items-center gap-3"><ShoppingCart className="h-6 w-6" /><span className="font-bold text-lg">Buat Pesanan</span></div><span className="text-sm opacity-80">Pesan layanan baru dengan mudah</span></div>
                    </Button>
                </div>
            </div>
        </div>
    );
}