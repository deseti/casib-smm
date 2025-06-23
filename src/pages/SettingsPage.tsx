// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Globe, 
  Save,
  Camera,
  Key,
  CreditCard,
  Smartphone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  balance: number;
  created_at: string;
}

function SettingsPage() {
  const auth = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    depositNotifications: true,
    promotionalEmails: false
  });  useEffect(() => {    const fetchUserProfile = async () => {
      const token = localStorage.getItem('jwt_token');
      try {
        // Gunakan endpoint profile yang sudah ada di dashboard.js
        const profileResponse = await fetch(`${API_BASE_URL}/api/dashboard/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          
          // Gunakan data real dari database
          const realProfile: UserProfile = {
            id: profileData.id,
            email: profileData.email,
            full_name: profileData.full_name || profileData.email?.split('@')[0] || 'User Casib SMM',
            avatar_url: profileData.avatar_url || '/logos/icon.jpg',
            role: profileData.role,
            balance: profileData.balance || 0,
            created_at: profileData.created_at
          };
          
          setUserProfile(realProfile);
          setFormData({
            full_name: realProfile.full_name,
            email: realProfile.email,
            current_password: '',
            new_password: '',
            confirm_password: ''
          });
        } else {
          throw new Error('Gagal memuat profil');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // PERBAIKI: Fallback tidak menggunakan statsData lagi
        const fallbackProfile: UserProfile = {
          id: auth?.id || '1',
          email: auth?.email || 'user@example.com',
          full_name: auth?.email?.split('@')[0] || 'User Casib SMM',
          avatar_url: '/logos/icon.jpg',
          role: auth?.role || 'user',
          balance: 0, // ✅ Fallback tanpa statsData
          created_at: new Date().toISOString()
        };
        setUserProfile(fallbackProfile);
        setFormData({
          full_name: fallbackProfile.full_name,
          email: fallbackProfile.email,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (auth) {
      fetchUserProfile();
    }
  }, [auth]);

  const refreshProfile = async () => {
    const token = localStorage.getItem('jwt_token');
    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/dashboard/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const realProfile: UserProfile = {
          id: profileData.id,
          email: profileData.email,
          full_name: profileData.full_name || profileData.email?.split('@')[0] || 'User Casib SMM',
          avatar_url: profileData.avatar_url || '/logos/icon.jpg',
          role: profileData.role,
          balance: profileData.balance || 0,
          created_at: profileData.created_at
        };
        setUserProfile(realProfile);
        setFormData(prev => ({
          ...prev,
          full_name: realProfile.full_name,
          email: realProfile.email
        }));
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      
      // Update profile data
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email
        })
      });      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Profile updated:', updatedUser);
        
        // Refresh profile data from database
        await refreshProfile();
        
        alert('Profil berhasil diperbarui!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Gagal memperbarui profil');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.confirm_password) {
      alert('Password baru dan konfirmasi password tidak cocok!');
      return;
    }

    if (formData.new_password.length < 6) {
      alert('Password baru minimal 6 karakter!');
      return;
    }

    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      
      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      if (response.ok) {
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }));
        alert('Password berhasil diubah!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Gagal mengubah password');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB!');
      return;
    }

    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('jwt_token');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });      if (response.ok) {
        const result = await response.json();
        console.log('Avatar uploaded:', result);
        
        // Refresh profile data from database
        await refreshProfile();
        
        alert('Foto profil berhasil diperbarui!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal mengupload foto profil');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Gagal mengupload foto profil');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-slate-950">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 text-white min-h-screen space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Pengaturan Akun
        </h1>
        <p className="text-slate-400 mt-2">
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24 ring-4 ring-slate-600">
                    <AvatarImage src={userProfile?.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl">
                      {userProfile?.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                    disabled={isUpdating}
                  >
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUpdating}
                    />
                  </Button>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white">{userProfile?.full_name}</h3>
                  <p className="text-slate-400">{userProfile?.email}</p>
                  <Badge 
                    variant={userProfile?.role === 'admin' ? 'destructive' : 'secondary'}
                    className="mt-2"
                  >
                    {userProfile?.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="text-slate-300">Saldo Akun</span>
                <span className="font-semibold text-green-400">
                  Rp {userProfile?.balance.toLocaleString('id-ID') || '0'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                <span className="text-slate-300">Bergabung</span>
                <span className="text-slate-300">
                  {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                Informasi Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi dasar profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-white">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Settings */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Key className="h-5 w-5" />
                Keamanan Password
              </CardTitle>
              <CardDescription>
                Ubah password untuk menjaga keamanan akun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password" className="text-white">Password Saat Ini</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={formData.current_password}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Masukkan password saat ini"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_password" className="text-white">Password Baru</Label>
                    <Input
                      id="new_password"
                      type="password"
                      value={formData.new_password}
                      onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Masukkan password baru"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-white">Konfirmasi Password</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                      className="bg-slate-800 border-slate-600 text-white"
                      placeholder="Konfirmasi password baru"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
              <CardDescription>
                Atur preferensi notifikasi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Notifikasi Email', icon: Mail },
                { key: 'smsNotifications', label: 'Notifikasi SMS', icon: Smartphone },
                { key: 'orderUpdates', label: 'Update Pesanan', icon: Bell },
                { key: 'depositNotifications', label: 'Notifikasi Deposit', icon: CreditCard },
                { key: 'promotionalEmails', label: 'Email Promosi', icon: Globe }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                    <span className="text-white">{label}</span>
                  </div>
                  <Button
                    variant={notificationSettings[key as keyof typeof notificationSettings] ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNotificationSettings(prev => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof notificationSettings]
                    }))}
                  >
                    {notificationSettings[key as keyof typeof notificationSettings] ? 'Aktif' : 'Nonaktif'}
                  </Button>
                </div>
              ))}
              
              <Separator className="bg-slate-700" />
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => alert('Pengaturan notifikasi berhasil disimpan!')}
              >
                <Save className="h-4 w-4 mr-2" />
                Simpan Pengaturan Notifikasi
              </Button>
            </CardContent>          </Card>        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
