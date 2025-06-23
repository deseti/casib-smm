// src/pages/AdminMultiProviderPage.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  RefreshCw, 
  TestTube, 
  Edit, 
  Trash2, 
  Cloud,
  AlertCircle,
  CheckCircle,
  RotateCcw
} from 'lucide-react';

interface Provider {
  id: number;
  name: string;
  display_name: string;
  api_url: string;
  api_id?: string;
  api_key: string;
  secret_key?: string;
  api_key_v2?: string;
  user_id?: string;
  token?: string;
  api_format: string;
  auth_method: string;
  markup_percentage: number;
  is_active: boolean;
  sync_services: boolean;
  services_endpoint: string;
  order_endpoint: string;
  status_endpoint: string;
  profile_endpoint: string;
  requests_per_minute: number;
  provider_type?: string;
  country?: string;
  language: string;
  timezone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ProviderFormData {
  name: string;
  display_name: string;
  api_url: string;
  api_id: string;
  api_key: string;
  secret_key: string;
  api_key_v2: string;
  user_id: string;
  token: string;
  api_format: string;
  auth_method: string;
  markup_percentage: number;
  is_active: boolean;
  sync_services: boolean;
  services_endpoint: string;
  order_endpoint: string;
  status_endpoint: string;
  profile_endpoint: string;
  requests_per_minute: number;
  provider_type: string;
  country: string;
  language: string;
  timezone: string;
  notes: string;
}

export default function AdminMultiProviderPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);  const [testResults, setTestResults] = useState<Record<number | string, any>>({});
  const [syncResults, setSyncResults] = useState<Record<number | string, any>>({});
  const [orderSyncResults, setOrderSyncResults] = useState<Record<number | string, any>>({});  const [formData, setFormData] = useState<ProviderFormData>({
    name: '',
    display_name: '',
    api_url: '',
    api_id: '',
    api_key: '',
    secret_key: '',
    api_key_v2: '',
    user_id: '',
    token: '',
    api_format: 'standard',
    auth_method: 'form',
    markup_percentage: 10,
    is_active: true,
    sync_services: true,
    services_endpoint: '/services',
    order_endpoint: '/order',
    status_endpoint: '/status',
    profile_endpoint: '/profile',
    requests_per_minute: 60,
    provider_type: 'SMM Panel',
    country: '',
    language: 'en',
    timezone: '',
    notes: ''
  });

  const token = localStorage.getItem('jwt_token');

  const fetchProviders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setProviders(data);
      } else {
        console.error('Error fetching providers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);
  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      api_url: '',
      api_id: '',
      api_key: '',
      secret_key: '',
      api_key_v2: '',
      user_id: '',
      token: '',
      api_format: 'standard',
      auth_method: 'form',
      markup_percentage: 10,
      is_active: true,
      sync_services: true,
      services_endpoint: '/services',
      order_endpoint: '/order',
      status_endpoint: '/status',
      profile_endpoint: '/profile',
      requests_per_minute: 60,
      provider_type: 'SMM Panel',
      country: '',
      language: 'en',
      timezone: '',
      notes: ''
    });
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setProviders([...providers, data.provider]);
        setIsAddDialogOpen(false);
        resetForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      alert('Failed to add provider');
    }
  };

  const handleEditProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/${editingProvider.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setProviders(providers.map(p => p.id === editingProvider.id ? data.provider : p));
        setIsEditDialogOpen(false);
        setEditingProvider(null);
        resetForm();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Failed to update provider');
    }
  };

  const handleDeleteProvider = async (id: number) => {
    if (!confirm('Are you sure you want to delete this provider? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (response.ok) {
        setProviders(providers.filter(p => p.id !== id));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Failed to delete provider');
    }
  };

  const handleTestProvider = async (id: number) => {
    setTestResults({ ...testResults, [id]: { loading: true } });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/${id}/test`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setTestResults({ ...testResults, [id]: data });    } catch (error) {
      setTestResults({ 
        ...testResults, 
        [id]: { success: false, error: (error as Error).message || 'Unknown error' } 
      });
    }
  };

  const handleSyncProvider = async (id: number) => {
    setSyncResults({ ...syncResults, [id]: { loading: true } });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/${id}/sync-services`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setSyncResults({ ...syncResults, [id]: data });    } catch (error) {
      setSyncResults({ 
        ...syncResults, 
        [id]: { error: (error as Error).message || 'Unknown error' } 
      });
    }
  };
  const handleSyncAllProviders = async () => {
    setSyncResults({ global: { loading: true } });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/sync-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setSyncResults({ ...syncResults, global: data });    } catch (error) {
      setSyncResults({ 
        ...syncResults, 
        global: { error: (error as Error).message || 'Unknown error' } 
      });
    }
  };

  const handleSyncOrders = async (id: number) => {
    setOrderSyncResults({ ...orderSyncResults, [id]: { loading: true } });
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/providers/${id}/sync-orders`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setOrderSyncResults({ ...orderSyncResults, [id]: data });    } catch (error) {
      setOrderSyncResults({ 
        ...orderSyncResults, 
        [id]: { error: (error as Error).message || 'Unknown error' } 
      });
    }
  };
  const openEditDialog = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      display_name: provider.display_name,
      api_url: provider.api_url,
      api_id: provider.api_id || '',
      api_key: provider.api_key,
      secret_key: provider.secret_key || '',
      api_key_v2: provider.api_key_v2 || '',
      user_id: provider.user_id || '',
      token: provider.token || '',
      api_format: provider.api_format,
      auth_method: provider.auth_method,
      markup_percentage: provider.markup_percentage,
      is_active: provider.is_active,
      sync_services: provider.sync_services,
      services_endpoint: provider.services_endpoint,
      order_endpoint: provider.order_endpoint,
      status_endpoint: provider.status_endpoint,
      profile_endpoint: provider.profile_endpoint,
      requests_per_minute: provider.requests_per_minute,
      provider_type: provider.provider_type || '',
      country: provider.country || '',
      language: provider.language,
      timezone: provider.timezone || '',
      notes: provider.notes || ''
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-950 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8" />
          <span className="ml-2">Loading providers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-slate-950 text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Multi Provider Management</h1>
        <div className="flex gap-2">          <Button onClick={handleSyncAllProviders} variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
            <RotateCcw className="mr-2 h-4 w-4" />
            Sync All Providers
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Provider
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Provider</DialogTitle>
              </DialogHeader>              <form onSubmit={handleAddProvider} className="space-y-4 max-h-96 overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-400">Informasi Dasar</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nama Provider (Internal)</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., centralsmm, panelchild"
                        required
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="display_name">Nama Tampilan</Label>
                      <Input
                        id="display_name"
                        value={formData.display_name}
                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                        placeholder="e.g., CentralSMM, PanelChild"
                        required
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="provider_type">Tipe Provider</Label>
                      <Select 
                        value={formData.provider_type} 
                        onValueChange={(value) => setFormData({...formData, provider_type: value})}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue placeholder="Pilih tipe provider" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="SMM Panel">SMM Panel</SelectItem>
                          <SelectItem value="Social Media Service">Social Media Service</SelectItem>
                          <SelectItem value="Instagram Service">Instagram Service</SelectItem>
                          <SelectItem value="TikTok Service">TikTok Service</SelectItem>
                          <SelectItem value="YouTube Service">YouTube Service</SelectItem>
                          <SelectItem value="Multi Platform">Multi Platform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="country">Negara</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        placeholder="e.g., Indonesia, USA"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  </div>
                </div>

                {/* API Configuration */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-400">Konfigurasi API</h3>
                  <div>
                    <Label htmlFor="api_url">URL API</Label>
                    <Input
                      id="api_url"
                      value={formData.api_url}
                      onChange={(e) => setFormData({...formData, api_url: e.target.value})}
                      placeholder="https://api.provider.com/api"
                      required
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api_format">Format API</Label>
                      <Select 
                        value={formData.api_format} 
                        onValueChange={(value) => setFormData({...formData, api_format: value})}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="standard">Standard (API ID + API Key)</SelectItem>
                          <SelectItem value="centralsmm">CentralSMM Format</SelectItem>
                          <SelectItem value="panelchild">PanelChild Format</SelectItem>
                          <SelectItem value="justanother">JustAnother Format</SelectItem>
                          <SelectItem value="token">Token Based</SelectItem>
                          <SelectItem value="custom">Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="auth_method">Metode Auth</Label>
                      <Select 
                        value={formData.auth_method} 
                        onValueChange={(value) => setFormData({...formData, auth_method: value})}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="form">Form Data (POST)</SelectItem>
                          <SelectItem value="header">Header Auth</SelectItem>
                          <SelectItem value="json">JSON Body</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* API Credentials */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-yellow-400">Kredensial API</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api_key">API Key *</Label>
                      <Input
                        id="api_key"
                        value={formData.api_key}
                        onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                        placeholder="Masukkan API Key"
                        required
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="api_id">API ID / User ID</Label>
                      <Input
                        id="api_id"
                        value={formData.api_id}
                        onChange={(e) => setFormData({...formData, api_id: e.target.value})}
                        placeholder="API ID atau User ID"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secret_key">Secret Key</Label>
                      <Input
                        id="secret_key"
                        value={formData.secret_key}
                        onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                        placeholder="Secret Key (opsional)"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="token">Token</Label>
                      <Input
                        id="token"
                        value={formData.token}
                        onChange={(e) => setFormData({...formData, token: e.target.value})}
                        placeholder="Token auth (opsional)"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="api_key_v2">API Key V2</Label>
                    <Input
                      id="api_key_v2"
                      value={formData.api_key_v2}
                      onChange={(e) => setFormData({...formData, api_key_v2: e.target.value})}
                      placeholder="API Key versi 2 (jika ada)"
                      className="bg-slate-800 border-slate-600"
                    />
                  </div>
                </div>

                {/* Business Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-purple-400">Pengaturan Bisnis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="markup_percentage">Markup (%)</Label>
                      <Input
                        id="markup_percentage"
                        type="number"
                        step="0.01"
                        value={formData.markup_percentage}
                        onChange={(e) => setFormData({...formData, markup_percentage: parseFloat(e.target.value)})}
                        placeholder="10.00"
                        required
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="requests_per_minute">Rate Limit (req/min)</Label>
                      <Input
                        id="requests_per_minute"
                        type="number"
                        value={formData.requests_per_minute}
                        onChange={(e) => setFormData({...formData, requests_per_minute: parseInt(e.target.value)})}
                        placeholder="60"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Catatan Admin</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Catatan tambahan tentang provider ini..."
                      className="w-full p-2 bg-slate-800 border border-slate-600 rounded text-white resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Status Settings */}
                <div className="flex gap-4 pt-4 border-t border-slate-700">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <span>Provider Aktif</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.sync_services}
                      onChange={(e) => setFormData({...formData, sync_services: e.target.checked})}
                      className="rounded"
                    />
                    <span>Auto Sync Services</span>
                  </label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit">Tambah Provider</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Global Sync Results */}
      {syncResults.global && (
        <Card className="bg-slate-900 border-slate-700 p-4 mb-6">
          <h3 className="font-semibold mb-2">Global Sync Results</h3>
          {syncResults.global.loading ? (
            <div className="flex items-center">
              <RefreshCw className="animate-spin h-4 w-4 mr-2" />
              <span>Syncing all providers...</span>
            </div>
          ) : (
            <pre className="text-sm text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
              {JSON.stringify(syncResults.global, null, 2)}
            </pre>
          )}
        </Card>
      )}

      {/* Providers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="bg-slate-900 border-slate-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{provider.display_name}</h3>
                <p className="text-sm text-slate-400">{provider.name}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant={provider.is_active ? "default" : "secondary"}>
                  {provider.is_active ? "Active" : "Inactive"}
                </Badge>
                {provider.sync_services && (
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    Auto Sync
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">API URL:</span>
                <span className="truncate max-w-32">{provider.api_url}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Markup:</span>
                <span>{provider.markup_percentage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Created:</span>
                <span>{new Date(provider.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Test Results */}
            {testResults[provider.id] && (
              <div className="mb-4 p-3 bg-slate-800 rounded">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  {testResults[provider.id].loading ? (
                    <RefreshCw className="animate-spin h-3 w-3 mr-1" />
                  ) : testResults[provider.id].success ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1 text-red-400" />
                  )}
                  Connection Test
                </h4>                {!testResults[provider.id].loading && (
                  <div className="text-xs text-slate-300">
                    <p className="mb-1">
                      {testResults[provider.id].success ? 'Connected successfully' : testResults[provider.id].error}
                    </p>
                    {testResults[provider.id].success && testResults[provider.id].balance && (
                      <div className="mt-2 p-2 bg-slate-700 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-yellow-400">💰 Balance:</span>
                          <span className="font-semibold text-green-400">
                            {testResults[provider.id].balance.currency} {testResults[provider.id].balance.balance?.toLocaleString()}
                          </span>
                        </div>
                        {testResults[provider.id].balance.username && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-slate-400">Username:</span>
                            <span>{testResults[provider.id].balance.username}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}            {/* Sync Results */}
            {syncResults[provider.id] && (
              <div className="mb-4 p-3 bg-slate-800 rounded">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  {syncResults[provider.id].loading ? (
                    <RefreshCw className="animate-spin h-3 w-3 mr-1" />
                  ) : syncResults[provider.id].synced_count ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1 text-red-400" />
                  )}
                  Service Sync
                </h4>
                {!syncResults[provider.id].loading && (
                  <p className="text-xs text-slate-300">
                    {syncResults[provider.id].synced_count 
                      ? `Synced ${syncResults[provider.id].synced_count} services`
                      : syncResults[provider.id].error}
                  </p>
                )}
              </div>
            )}

            {/* Order Sync Results */}
            {orderSyncResults[provider.id] && (
              <div className="mb-4 p-3 bg-slate-800 rounded">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  {orderSyncResults[provider.id].loading ? (
                    <RotateCcw className="animate-spin h-3 w-3 mr-1" />
                  ) : orderSyncResults[provider.id].synced_count >= 0 ? (
                    <CheckCircle className="h-3 w-3 mr-1 text-green-400" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1 text-red-400" />
                  )}
                  Order Status Sync
                </h4>
                {!orderSyncResults[provider.id].loading && (
                  <div className="text-xs text-slate-300">
                    {orderSyncResults[provider.id].synced_count >= 0 ? (
                      <div>
                        <p>Updated: {orderSyncResults[provider.id].synced_count} orders</p>
                        <p>Total checked: {orderSyncResults[provider.id].total_orders} orders</p>
                        {orderSyncResults[provider.id].errors && orderSyncResults[provider.id].errors.length > 0 && (
                          <p className="text-red-400 mt-1">Errors: {orderSyncResults[provider.id].errors.length}</p>
                        )}
                      </div>
                    ) : (
                      <p>{orderSyncResults[provider.id].error}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleTestProvider(provider.id)}
                disabled={testResults[provider.id]?.loading}
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              >
                <TestTube className="h-3 w-3 mr-1" />
                Test
              </Button>              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSyncProvider(provider.id)}
                disabled={syncResults[provider.id]?.loading || !provider.is_active}
                className="border-green-500 text-green-400 hover:bg-green-500/10"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Sync
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSyncOrders(provider.id)}
                disabled={orderSyncResults[provider.id]?.loading || !provider.is_active}
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Sync Orders
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditDialog(provider)}
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteProvider(provider.id)}
                className="border-red-500 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {providers.length === 0 && (
        <div className="text-center py-12">
          <Cloud className="h-12 w-12 mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 mb-2">No Providers Found</h3>
          <p className="text-slate-500 mb-4">Get started by adding your first SMM service provider.</p>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Provider
          </Button>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 text-white border-slate-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Provider</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProvider} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Provider Name (Internal)</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., centralsmm"
                  disabled
                  className="bg-slate-700 border-slate-600"
                />
                <p className="text-xs text-slate-500 mt-1">Provider name cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="edit_display_name">Display Name</Label>
                <Input
                  id="edit_display_name"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  placeholder="e.g., CentralSMM"
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_api_url">API URL</Label>
              <Input
                id="edit_api_url"
                value={formData.api_url}
                onChange={(e) => setFormData({...formData, api_url: e.target.value})}
                placeholder="https://api.provider.com/api"
                required
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_api_id">API ID</Label>
                <Input
                  id="edit_api_id"
                  value={formData.api_id}
                  onChange={(e) => setFormData({...formData, api_id: e.target.value})}
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="edit_api_key">API Key</Label>
                <Input
                  id="edit_api_key"
                  value={formData.api_key}
                  onChange={(e) => setFormData({...formData, api_key: e.target.value})}
                  required
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_secret_key">Secret Key (Optional)</Label>
              <Input
                id="edit_secret_key"
                value={formData.secret_key}
                onChange={(e) => setFormData({...formData, secret_key: e.target.value})}
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="edit_markup_percentage">Markup Percentage (%)</Label>
              <Input
                id="edit_markup_percentage"
                type="number"
                step="0.01"
                value={formData.markup_percentage}
                onChange={(e) => setFormData({...formData, markup_percentage: parseFloat(e.target.value)})}
                required
                className="bg-slate-800 border-slate-600"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded"
                />
                <span>Active</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.sync_services}
                  onChange={(e) => setFormData({...formData, sync_services: e.target.checked})}
                  className="rounded"
                />
                <span>Auto Sync Services</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Provider</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
