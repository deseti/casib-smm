// src/components/layouts/AppSidebar.tsx

"use client"

import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home, 
  List, 
  ShoppingCart, 
  Package, 
  Users,
  History, 
  Wallet, 
  Settings, 
  Bell, 
  User, 
  LogOut, 
  RefreshCw 
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// Definisikan interface yang tepat untuk menuItems
interface MenuItem {
  name: string;
  icon: React.ComponentType<any>;
  url: string;
  title: string;
  badge?: string;
}

// Menu items dengan interface yang benar
const menuItems: MenuItem[] = [
  {
    name: "Dasbor",
    icon: Home,
    url: "/",
    title: "Dasbor",
  },
  {
    name: "Daftar Layanan",
    icon: List,
    url: "/services",
    title: "Daftar Layanan",
  },
  {
    name: "Buat Pesanan",
    icon: ShoppingCart,
    url: "/new-order",
    title: "Buat Pesanan",
  },  {
    name: "Mass Order",
    icon: Package,
    url: "/mass-order",
    title: "Mass Order",
    badge: "NEW"
  },
  {
    name: "Program Referral",
    icon: Users,
    url: "/referral",
    title: "Program Referral",
    badge: "5%"
  },
  {
    name: "Riwayat Pesanan",
    icon: History,
    url: "/history",
    title: "Riwayat Pesanan",
  },
  {
    name: "Deposit Saldo",
    icon: Wallet,
    url: "/deposit",
    title: "Deposit Saldo",
  },
];

const settingsItems: MenuItem[] = [
  { 
    name: "Pengaturan",
    title: "Pengaturan", 
    url: "/settings", 
    icon: Settings 
  },
  { 
    name: "Notifikasi",
    title: "Notifikasi", 
    url: "/notifications", 
    icon: Bell 
  },
];

interface AppSidebarProps {
  className?: string;
  onLogout: () => void;
}

export function AppSidebar({ className, onLogout, ...props }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  return (
    <div style={{ backgroundColor: '#020617' }} className="w-64 h-full border-r border-slate-700/30">
      <Sidebar 
        className={className} 
        {...props}
        style={{ backgroundColor: '#020617' }}
      >
        <div style={{ backgroundColor: '#020617' }} className="flex h-full flex-col text-white">
          {/* Header */}
          <SidebarHeader style={{ backgroundColor: '#020617' }} className="border-b border-slate-700/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg overflow-hidden">
                <img 
                  src="/logos/icon.jpg" 
                  alt="Casib SMM" 
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Casib SMM
                </h1>
                <p className="text-sm text-slate-400">Professional Panel</p>
              </div>
            </div>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent style={{ backgroundColor: '#020617' }} className="flex-1 px-4 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Menu Utama
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          style={{ backgroundColor: isActive ? '#2563eb' : 'transparent' }}
                          className="group relative w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white"
                        >
                          <Link to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium flex-1 text-white">{item.title}</span>
                            {item.badge && (
                              <Badge className="bg-slate-700 text-slate-200 text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Menu Admin */}
            {auth && auth.role === 'admin' && (
              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  PANEL ADMIN
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === '/admin/deposits'}
                        style={{ backgroundColor: location.pathname === '/admin/deposits' ? '#dc2626' : 'transparent' }}
                        className="group w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white"
                      >
                        <Link to="/admin/deposits" className="flex items-center gap-3 w-full">
                          <Wallet className="h-5 w-5" />
                          <span className="text-white">Approval Deposit</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>                    {/* --- TAMBAHKAN MENU BARU DI SINI --- */}
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === '/admin/provider'}
                        style={{ backgroundColor: location.pathname === '/admin/provider' ? '#dc2626' : 'transparent' }}
                        className="group w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white"
                      >
                        <Link to="/admin/provider" className="flex items-center gap-3 w-full">
                          <RefreshCw className="h-5 w-5" />
                          <span className="text-white">Sinkronisasi Provider</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === '/admin/referral'}
                        style={{ backgroundColor: location.pathname === '/admin/referral' ? '#dc2626' : 'transparent' }}
                        className="group w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white"
                      >
                        <Link to="/admin/referral" className="flex items-center gap-3 w-full">
                          <Users className="h-5 w-5" />
                          <span className="text-white">Kelola Referral</span>
                          <Badge className="bg-orange-600 text-white text-xs px-2 py-0.5">
                            Admin
                          </Badge>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* ------------------------------------- */}

                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {/* Settings */}
            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Pengaturan
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {settingsItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          style={{ backgroundColor: isActive ? '#2563eb' : 'transparent' }}
                          className="group w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white"
                        >
                          <Link to={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="font-medium flex-1 text-white">{item.title}</span>
                            {item.badge && (
                              <Badge variant="destructive" className="bg-red-600 text-white text-xs px-2 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter style={{ backgroundColor: '#020617' }} className="border-t border-slate-700/50 p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="group w-full justify-start gap-3 rounded-xl px-4 py-3 text-slate-300 transition-all duration-200 hover:bg-slate-800/80 hover:text-white">
                      <Avatar className="h-10 w-10 ring-2 ring-slate-700 group-hover:ring-slate-600 transition-all">
                        <AvatarImage src="/logos/icon.jpg" alt="Casib" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                          CS
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span className="text-sm font-semibold text-white truncate">Casib Admin</span>
                        <span className="text-xs text-slate-400 truncate">admin@casibsmm.com</span>
                      </div>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>                  <DropdownMenuContent side="top" className="w-64" style={{ backgroundColor: '#1e293b' }}>
                    <DropdownMenuItem 
                      className="gap-3 text-slate-200 hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                      onClick={() => navigate('/settings')}
                    >
                      <User className="h-4 w-4" />
                      <span>Profil Saya</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-3 text-slate-200 hover:bg-slate-700 focus:bg-slate-700 cursor-pointer"
                      onClick={() => navigate('/settings')}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Pengaturan Akun</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator style={{ backgroundColor: '#475569' }} />
                    <DropdownMenuItem
                      onClick={onLogout}
                      className="gap-3 text-red-400 hover:bg-red-600/20 focus:bg-red-600/20 hover:text-red-300"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Keluar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </div>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}