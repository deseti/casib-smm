// src/pages/ReferralPage.tsx - Halaman sistem referral/afiliasi
"use client"

import { useState, useEffect } from "react"
import { Users, Share2, TrendingUp, Gift, Copy, Check, ExternalLink, Wallet, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast, { Toaster } from 'react-hot-toast'

interface ReferralStats {
  referral_code: string | null
  total_referrals: number
  total_commissions_earned: number
  approved_commissions: number
  pending_commissions: number
  actual_referrals: number
  total_transactions: number
}

interface ReferredUser {
  id: string
  email: string
  full_name: string
  created_at: string
  total_orders: number
}

interface ReferralTransaction {
  id: number
  commission_amount: number
  order_amount: number
  status: string
  created_at: string
  users: {
    email: string
    full_name: string
  }
  orders: {
    id: number
    total_price: number
    created_at: string
  }
}

export default function ReferralPage() {  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [recentTransactions, setRecentTransactions] = useState<ReferralTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [copied, setCopied] = useState(false)

  // Fetch referral data
  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    const token = localStorage.getItem("jwt_token")
    setError("")
    
    try {
      if (!token) {
        throw new Error("Sesi tidak valid, silakan login ulang.")
      }

      const response = await fetch("http://localhost:3001/api/referral/my-stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error("Gagal memuat data referral")

      const data = await response.json()
      setStats(data.stats)
      setReferredUsers(data.referred_users)
      setRecentTransactions(data.recent_transactions)

    } catch (error) {
      console.error("Error loading referral data:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data referral")
    } finally {
      setIsLoading(false)
    }
  }

  const generateShareLink = async (platform: string) => {
    const token = localStorage.getItem("jwt_token")
    
    try {
      const response = await fetch("http://localhost:3001/api/referral/share", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ platform })
      })
      
      if (!response.ok) throw new Error("Gagal generate link sharing")

      const data = await response.json()

      if (data.share_url) {
        window.open(data.share_url, '_blank')
      }

      if (platform === 'copy' && data.referral_url) {
        copyToClipboard(data.referral_url)
      }

      return data

    } catch (error) {
      console.error("Error generating share link:", error)
      toast.error("Gagal generate link sharing")
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Link berhasil disalin!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Gagal menyalin link")
    }
  }

  const copyReferralCode = () => {
    if (stats?.referral_code) {
      copyToClipboard(stats.referral_code)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Memuat data referral...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '500px',
            padding: '16px',
          }
        }}
      />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30 mb-4 backdrop-blur-sm">
            <Users className="w-4 h-4 text-purple-300" />
            <span className="text-sm text-purple-200 font-medium">Program Afiliasi</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-200 bg-clip-text text-transparent mb-4 leading-tight">
            Sistem Referral
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Dapatkan komisi 5% dari setiap transaksi teman yang kamu undang!
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
            <div className="text-red-300 text-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
              {error}
            </div>
          </div>
        )}

        {/* Statistik Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Referral</p>
                  <p className="text-2xl font-bold text-white">{stats?.actual_referrals || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Transaksi</p>
                  <p className="text-2xl font-bold text-white">{stats?.total_transactions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Komisi</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    Rp {(stats?.total_commissions_earned || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Komisi Approved</p>
                  <p className="text-2xl font-bold text-green-400">
                    Rp {(stats?.approved_commissions || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code & Share Section */}
        <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-2xl mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-white font-bold">Kode Referral Anda</CardTitle>
                <CardDescription className="text-gray-400">
                  Bagikan kode ini untuk mendapatkan komisi 5%
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referral Code */}
            <div className="space-y-2">
              <Label className="text-white font-semibold">Kode Referral</Label>
              <div className="flex gap-2">
                <Input
                  value={stats?.referral_code || ''}
                  readOnly
                  className="bg-gray-700/50 border-gray-600/50 text-white font-mono text-lg"
                />
                <Button
                  onClick={copyReferralCode}
                  className="bg-purple-600 hover:bg-purple-700 px-4"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-3">
              <Label className="text-white font-semibold">Bagikan ke Platform</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => generateShareLink('whatsapp')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => generateShareLink('telegram')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button
                  onClick={() => generateShareLink('facebook')}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => generateShareLink('copy')}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            {/* Cara Kerja */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30">
              <CardContent className="p-4">
                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Cara Kerja Program Referral
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>✅ Bagikan kode referral atau link ke teman/keluarga</p>
                  <p>✅ Mereka daftar menggunakan kode referral Anda</p>
                  <p>✅ Saat mereka bertransaksi, Anda dapat komisi 5%</p>
                  <p>✅ Komisi akan ditambahkan ke saldo setelah admin approve</p>
                  <p>✅ Tidak ada batas maksimal referral dan komisi!</p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Tabs untuk Referred Users & Transactions */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border-gray-700/50">
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Pengguna Referral ({referredUsers.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Riwayat Komisi ({recentTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Pengguna yang Anda Referral</CardTitle>
                <CardDescription className="text-gray-400">
                  Daftar teman yang mendaftar menggunakan kode referral Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Belum ada yang menggunakan kode referral Anda</p>
                    <p className="text-sm text-gray-500 mt-2">Mulai bagikan kode referral untuk mendapatkan komisi!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">                            <span className="text-white font-bold text-sm">
                              {user.full_name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.full_name || user.email}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                            <p className="text-gray-500 text-xs">
                              Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {user.total_orders} Order
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Riwayat Komisi Referral</CardTitle>
                <CardDescription className="text-gray-400">
                  Komisi yang Anda dapatkan dari transaksi referral
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Belum ada komisi referral</p>
                    <p className="text-sm text-gray-500 mt-2">Komisi akan muncul setelah referral Anda bertransaksi</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              Komisi dari {transaction.users?.full_name || transaction.users?.email}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Order: Rp {transaction.order_amount.toLocaleString('id-ID')}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">
                            +Rp {transaction.commission_amount.toLocaleString('id-ID')}
                          </p>
                          <Badge 
                            variant="outline" 
                            className={
                              transaction.status === 'approved' 
                                ? 'text-green-400 border-green-400'
                                : transaction.status === 'pending'
                                ? 'text-yellow-400 border-yellow-400'
                                : 'text-red-400 border-red-400'
                            }
                          >
                            {transaction.status === 'approved' ? 'Disetujui' :
                             transaction.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
