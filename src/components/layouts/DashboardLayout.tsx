// src/components/layouts/DashboardLayout.tsx

"use client"

import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search, Wallet } from 'lucide-react';
import { useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  onLogout: () => void;
}

export default function DashboardLayout({ onLogout }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleDepositClick = () => {
    navigate('/deposit');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-950">
        <AppSidebar onLogout={onLogout} open={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-4">
                {/* SidebarTrigger hanya tampil di mobile */}
                <button
                  className="text-slate-300 hover:text-white transition-colors md:hidden mr-2"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Buka menu"
                >
                  <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                {/* Search Bar */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    className="w-64 lg:w-80 pl-10 bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="Cari layanan..."
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Deposit Button */}
                <Button 
                  onClick={handleDepositClick}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 hidden sm:flex"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Deposit Saldo
                </Button>

                {/* Mobile Deposit Button */}
                <Button 
                  onClick={handleDepositClick}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white sm:hidden"
                >
                  <Wallet className="w-4 h-4" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative text-slate-300 hover:text-white hover:bg-slate-800">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-950 text-white">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}