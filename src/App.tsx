// src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google'; // <-- PERUBAHAN 1: Import fungsi logout Google
import LoginPage from './components/auth/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './components/layouts/DashboardLayout';
import ServicesPage from './pages/ServicesPage';
import DashboardHomePage from './pages/DashboardHomePage';
import NewOrderPage from './pages/NewOrderPage';
import MassOrderPage from './pages/MassOrderPage';
import ReferralPage from './pages/ReferralPage';
import HistoryPage from './pages/HistoryPage';
import DepositPage from './pages/DepositPage';
import AdminDepositsPage from './pages/AdminDepositsPage';
import AdminProviderPage from './pages/AdminProviderPage';
import AdminReferralPage from './pages/AdminReferralPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- PERUBAHAN 2: Rapikan kode, kita hanya perlu cek jwt_token ---
    // Karena semua login (email & google) sekarang menghasilkan jwt_token dari backend kita.
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    // --- PERUBAHAN 3: Panggil googleLogout() ---
    googleLogout(); // Beritahu Google untuk mengakhiri sesinya
    localStorage.removeItem('jwt_token'); // Hapus token sesi kita
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center bg-gray-900"><p className="text-white">Loading...</p></div>;
  }

  return (
    <Routes>
      {/* Route untuk reset password - tidak perlu authentication */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {isAuthenticated ? (
        <Route path="/" element={<DashboardLayout onLogout={handleLogout} />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="new-order" element={<NewOrderPage />} />
          <Route path="mass-order" element={<MassOrderPage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="deposit" element={<DepositPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="admin/deposits" element={<AdminDepositsPage />} />
          <Route path="admin/provider" element={<AdminProviderPage />} />
          <Route path="admin/referral" element={<AdminReferralPage />} />
        </Route>
      ) : (
        <Route path="*" element={<LoginPage />} />
      )}
    </Routes>
  );
}