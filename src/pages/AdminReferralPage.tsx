// src/pages/AdminReferralPage.tsx - Halaman admin untuk kelola sistem referral
"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Users, TrendingUp, DollarSign, Check, X, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import toast, { Toaster } from 'react-hot-toast'

// Simple Textarea component
const Textarea = ({ className, ...props }: any) => (
  <textarea 
    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

interface AdminReferralStats {
  total_commissions: number
  total_amount: number
  pending_commissions: number
  pending_amount: number
  approved_commissions: number
  approved_amount: number
}

interface TopReferrer {
  id: string
  email: string
  full_name: string
  referral_code: string
  total_commissions_earned: number
  approved_commissions: number
  pending_commissions: number
  actual_referrals: number
  total_transactions: number
}

interface PendingCommission {
  id: number
  commission_amount: number
  order_amount: number
  created_at: string
  referrer: {
    id: string
    email: string
    full_name: string
    referral_code: string
  }
  referred_user: {
    id: string
    email: string
    full_name: string
  }
  order: {
    id: number
    total_price: number
    created_at: string
    service_id: number
  }
}

export default function AdminReferralPage() {
  const [stats, setStats] = useState<AdminReferralStats | null>(null)
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([])
  const [pendingCommissions, setPendingCommissions] = useState<PendingCommission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedCommission, setSelectedCommission] = useState<PendingCommission | null>(null)
  const [actionNotes, setActionNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch admin referral data
  useEffect(() => {
    fetchAdminReferralData()
    fetchPendingCommissions()
  }, [])

  const fetchAdminReferralData = async () => {
    const token = localStorage.getItem("jwt_token")
    
    try {
      if (!token) {
        throw new Error("Sesi tidak valid, silakan login ulang.")
      }

      const response = await fetch("http://localhost:3001/api/referral/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error("Gagal memuat data referral admin")

      const data = await response.json()
      setStats(data.stats)
      setTopReferrers(data.top_referrers)

    } catch (error) {
      console.error("Error loading admin referral data:", error)
      setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat data referral")
    }
  }

  const fetchPendingCommissions = async () => {
    const token = localStorage.getItem("jwt_token")
    
    try {
      const response = await fetch("http://localhost:3001/api/referral/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) throw new Error("Gagal memuat komisi pending")

      const data = await response.json()
      setPendingCommissions(data)

    } catch (error) {
      console.error("Error loading pending commissions:", error)
      toast.error("Gagal memuat komisi pending")
    } finally {
      setIsLoading(false)
    }
  }

  const approveCommission = async (commissionId: number, addToBalance: boolean = true) => {
    const token = localStorage.getItem("jwt_token")
    setIsProcessing(true)
    
    try {
      const response = await fetch(`http://localhost:3001/api/referral/admin/approve/${commissionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          add_to_balance: addToBalance,
          notes: actionNotes
        })
      })
        if (!response.ok) throw new Error("Gagal approve komisi")

      toast.success(`✅ Komisi berhasil diapprove${addToBalance ? ' dan ditambahkan ke saldo' : ''}`)
      
      // Refresh data
      await fetchPendingCommissions()
      await fetchAdminReferralData()
      
      setSelectedCommission(null)
      setActionNotes("")

    } catch (error) {
      console.error("Error approving commission:", error)
      toast.error("Gagal approve komisi")
    } finally {
      setIsProcessing(false)
    }
  }

  const rejectCommission = async (commissionId: number) => {
    const token = localStorage.getItem("jwt_token")
    setIsProcessing(true)
    
    try {
      const response = await fetch(`http://localhost:3001/api/referral/admin/reject/${commissionId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          notes: actionNotes || 'Ditolak oleh admin'
        })
      })
      
      if (!response.ok) throw new Error("Gagal reject komisi")

      toast.success("❌ Komisi berhasil ditolak")
      
      // Refresh data
      await fetchPendingCommissions()
      await fetchAdminReferralData()
      
      setSelectedCommission(null)
      setActionNotes("")

    } catch (error) {
      console.error("Error rejecting commission:", error)
      toast.error("Gagal reject komisi")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Memuat data referral admin...</p>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-red-400/30 mb-4 backdrop-blur-sm">
            <Users className="w-4 h-4 text-red-300" />
            <span className="text-sm text-red-200 font-medium">Admin Panel</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-200 bg-clip-text text-transparent mb-4 leading-tight">
            Kelola Sistem Referral
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto leading-relaxed">
            Approve, tolak, dan kelola komisi referral dari semua user
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Komisi</p>
                  <p className="text-2xl font-bold text-white">{stats?.total_commissions || 0}</p>
                  <p className="text-emerald-400 text-sm font-medium">
                    Rp {(stats?.total_amount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats?.pending_commissions || 0}</p>
                  <p className="text-yellow-400 text-sm font-medium">
                    Rp {(stats?.pending_amount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-400">{stats?.approved_commissions || 0}</p>
                  <p className="text-green-400 text-sm font-medium">
                    Rp {(stats?.approved_amount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/60 border-gray-700/50">
            <TabsTrigger value="pending" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Komisi Pending ({pendingCommissions.length})
            </TabsTrigger>
            <TabsTrigger value="referrers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Top Referrers ({topReferrers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Komisi Menunggu Approval</CardTitle>
                <CardDescription className="text-gray-400">
                  Review dan approve komisi referral yang masuk
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingCommissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Tidak ada komisi pending</p>
                    <p className="text-sm text-gray-500 mt-2">Semua komisi sudah diproses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCommissions.map((commission) => (
                      <div key={commission.id} className="p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-white" />
                              </div>
                              <div>                                <p className="text-white font-medium">
                                  {commission.referrer?.full_name || commission.referrer?.email}
                                </p>
                                <p className="text-gray-400 text-sm">
                                  Kode: {commission.referrer?.referral_code}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Referral:</p>
                                <p className="text-white">{commission.referred_user?.full_name || commission.referred_user?.email}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Order Amount:</p>
                                <p className="text-white">Rp {commission.order_amount.toLocaleString('id-ID')}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Komisi (5%):</p>
                                <p className="text-emerald-400 font-bold">Rp {commission.commission_amount.toLocaleString('id-ID')}</p>
                              </div>
                            </div>
                            
                            <p className="text-gray-500 text-xs mt-3">
                              {new Date(commission.created_at).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => setSelectedCommission(commission)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrers" className="mt-6">
            <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Top Referrers</CardTitle>
                <CardDescription className="text-gray-400">
                  User dengan komisi referral terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topReferrers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Belum ada data referrer</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topReferrers.map((referrer, index) => (
                      <div key={referrer.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{referrer.full_name || referrer.email}</p>
                            <p className="text-gray-400 text-sm">Kode: {referrer.referral_code}</p>
                            <p className="text-gray-500 text-xs">{referrer.actual_referrals} referrals • {referrer.total_transactions} transaksi</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">
                            Rp {referrer.total_commissions_earned.toLocaleString('id-ID')}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                              Approved: Rp {referrer.approved_commissions.toLocaleString('id-ID')}
                            </Badge>
                            {referrer.pending_commissions > 0 && (
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400 text-xs">
                                Pending: Rp {referrer.pending_commissions.toLocaleString('id-ID')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Review Commission */}
        {selectedCommission && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-800 border-gray-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white">Review Komisi Referral</CardTitle>
                <CardDescription className="text-gray-400">
                  ID: {selectedCommission.id}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Referrer:</p>
                    <p className="text-white font-medium">{selectedCommission.referrer?.full_name || selectedCommission.referrer?.email}</p>
                    <p className="text-gray-300">{selectedCommission.referrer?.email}</p>
                    <p className="text-gray-400">Kode: {selectedCommission.referrer?.referral_code}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Referred User:</p>
                    <p className="text-white font-medium">{selectedCommission.referred_user?.email}</p>
                    <p className="text-gray-300">{selectedCommission.referred_user?.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Order Amount:</p>
                    <p className="text-white font-bold">Rp {selectedCommission.order_amount.toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Komisi (5%):</p>
                    <p className="text-emerald-400 font-bold">Rp {selectedCommission.commission_amount.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 text-sm">Tanggal:</p>
                  <p className="text-white">
                    {new Date(selectedCommission.created_at).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Catatan (Opsional)</Label>
                  <Textarea
                    placeholder="Tambahkan catatan untuk tindakan ini..."
                    value={actionNotes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionNotes(e.target.value)}
                    className="bg-gray-700/50 border-gray-600/50 text-white"
                  />
                </div>
              </CardContent>
              <div className="flex gap-3 p-6 pt-0">
                <Button
                  onClick={() => approveCommission(selectedCommission.id, true)}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve & Add to Balance
                </Button>
                <Button
                  onClick={() => rejectCommission(selectedCommission.id)}
                  disabled={isProcessing}
                  variant="destructive"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => setSelectedCommission(null)}
                  variant="outline"
                  className="px-4"
                >
                  Batal
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
