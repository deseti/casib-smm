// src/pages/DashboardHomePage.tsx
import { ShoppingCart, TrendingUp, Clock, Wallet } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
                const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`, {
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
        <div className="space-y-6 lg:space-y-8 bg-slate-950 text-white min-h-screen p-2 sm:p-4">
            {/* Bagian Welcome Section */}
            <div className="rounded-2xl sm:rounded-3xl bg-slate-900 p-4 sm:p-8 lg:p-12 shadow-2xl border border-slate-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-50 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Selamat Datang di Dashboard!</h1>
                        <p className="text-slate-300 text-sm sm:text-base max-w-md">Pantau saldo, pesanan, dan statistik layanan SMM kamu di sini.</p>
                    </div>
                    <Button onClick={handleCreateOrder} className="mt-2 sm:mt-0 w-full sm:w-auto">+ Pesan Layanan</Button>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                <div className="rounded-xl bg-slate-800 p-3 sm:p-5 flex flex-col items-center text-center">
                    <Wallet className="w-6 h-6 mb-1 text-emerald-400" />
                    <div className="text-lg sm:text-xl font-bold">Rp {displayStats.balance.toLocaleString()}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Saldo</div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3 sm:p-5 flex flex-col items-center text-center">
                    <ShoppingCart className="w-6 h-6 mb-1 text-blue-400" />
                    <div className="text-lg sm:text-xl font-bold">{displayStats.totalOrders}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Total Pesanan</div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3 sm:p-5 flex flex-col items-center text-center">
                    <Clock className="w-6 h-6 mb-1 text-yellow-400" />
                    <div className="text-lg sm:text-xl font-bold">{displayStats.pendingOrders}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Pending</div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3 sm:p-5 flex flex-col items-center text-center">
                    <TrendingUp className="w-6 h-6 mb-1 text-green-400" />
                    <div className="text-lg sm:text-xl font-bold">{displayStats.successOrders}</div>
                    <div className="text-xs sm:text-sm text-slate-400">Sukses</div>
                </div>
            </div>

            {/* Bagian Aksi Cepat (Tombol Tes Provider dihapus) */}
            <div className="rounded-3xl bg-slate-900 border border-slate-700 p-4 sm:p-8 lg:p-10 shadow-2xl">
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