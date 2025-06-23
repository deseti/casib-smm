// src/pages/HistoryPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  id: number;
  link: string;
  quantity: number;
  status: string;
  total_price: number;
  created_at: string;
  services: {
    name: string;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchOrders = async () => {
    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Gagal mengambil data pesanan');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const syncOrderStatus = async () => {
    const token = localStorage.getItem('jwt_token');
    setIsSyncing(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/sync-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`✅ Sinkronisasi berhasil! ${data.synced_count} pesanan diperbarui`);
        // Refresh data orders setelah sync
        await fetchOrders();
      } else {
        toast.error(`❌ Gagal sinkronisasi: ${data.error}`);
      }
    } catch (err) {
      console.error('Error syncing:', err);
      toast.error('❌ Terjadi kesalahan saat sinkronisasi');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
      case 'in_progress':
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
      case 'canceled':
      case 'refunded':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'complete':
        return 'bg-green-600 hover:bg-green-700';
      case 'processing':
      case 'in_progress':
      case 'pending':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'cancelled':
      case 'canceled':
      case 'refunded':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };
  useEffect(() => {
    fetchOrders();
    
    // Auto-sync setiap 30 detik jika ada pending orders
    const interval = setInterval(() => {
      const hasPendingOrders = orders.some(order => 
        ['pending', 'processing', 'in_progress'].includes(order.status.toLowerCase())
      );
      
      if (hasPendingOrders && !isSyncing) {
        syncOrderStatus();
      }
    }, 30000); // 30 detik
    
    return () => clearInterval(interval);
  }, [orders, isSyncing]);

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <p>Memuat riwayat pesanan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-slate-900 border-slate-800 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Riwayat Pesanan Anda</CardTitle>
          <Button 
            onClick={syncOrderStatus}
            disabled={isSyncing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sinkronisasi...' : 'Sync Status'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Layanan</th>
                <th className="p-4">Jumlah</th>
                <th className="p-4">Harga</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-4">{order.services.name}</td>
                  <td className="p-4">{order.quantity.toLocaleString('id-ID')}</td>
                  <td className="p-4">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <Badge className={`capitalize ${getStatusColor(order.status)} flex items-center gap-1`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}