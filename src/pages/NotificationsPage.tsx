// src/pages/NotificationsPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Search,
  Filter,
  Check,
  Trash2
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  user_id: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('jwt_token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error('Failed to fetch notifications');
          // Fallback to empty array instead of mock data
          setNotifications([]);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        // Fallback to empty array instead of mock data
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'read' && notification.read) ||
                         (filterType === 'unread' && !notification.read);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        // Remove from state immediately
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    const variants = {
      success: 'bg-green-500/10 text-green-400 border-green-500/20',
      warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      error: 'bg-red-500/10 text-red-400 border-red-500/20',
      info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    return variants[type as keyof typeof variants] || variants.info;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat notifikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Notifikasi
          </h1>
          <p className="text-slate-400 mt-2">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead}
            variant="outline" 
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
          >
            <Check className="h-4 w-4 mr-2" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari notifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'unread', 'read'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={filterType === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(filter)}
                  className={filterType === filter ? "bg-blue-600" : "border-slate-600"}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {filter === 'all' ? 'Semua' : filter === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="bg-slate-900 border-slate-700">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {searchTerm || filterType !== 'all' ? 'Tidak ada notifikasi yang cocok' : 'Belum ada notifikasi'}
              </h3>
              <p className="text-slate-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Coba ubah filter atau kata kunci pencarian'
                  : 'Notifikasi akan muncul di sini ketika ada aktivitas'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`bg-slate-900 border-slate-700 transition-all duration-200 hover:bg-slate-800/50 ${
                !notification.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-slate-300 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <Badge className={`text-xs ${getNotificationBadge(notification.type)}`}>
                            {notification.type}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(notification.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredNotifications.length > 0 && (
        <div className="text-center pt-6">
          <p className="text-slate-400 text-sm">
            Menampilkan {filteredNotifications.length} dari {notifications.length} notifikasi
          </p>
        </div>
      )}
    </div>
  );
}
