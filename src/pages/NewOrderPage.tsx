"use client"

import { useState, useEffect, useMemo } from "react"
import type React from "react"
import { Check, ChevronsUpDown, Package, Search, Sparkles, Hash, LinkIcon, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import toast, { Toaster } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Definisikan struktur data (disesuaikan dengan ServicesPage.tsx)
interface Service {
  id: number // ID internal dari database kita
  provider_service_id?: number // ID asli dari provider (optional untuk kompatibilitas)
  name: string
  category: string // Menambahkan field category seperti di ServicesPage
  price_per_1000: number
  min_order: number
  max_order: number
  description?: string // Optional karena mungkin tidak selalu ada
}

interface GroupedServices {
  [category: string]: Service[]
}

export default function NewOrderPage() {
  // State untuk menyimpan semua data
  const [groupedServices, setGroupedServices] = useState<GroupedServices>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")

  // State untuk input pengguna
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedServiceId, setSelectedServiceId] = useState<string>("")
  const [quantity, setQuantity] = useState("")
  const [link, setLink] = useState("")

  // State untuk combobox
  const [open, setOpen] = useState(false)

  // Mengambil semua data layanan dari backend saat halaman dimuat
  useEffect(() => {
    const fetchAllServices = async () => {
      const token = localStorage.getItem("jwt_token") || localStorage.getItem("google_token")
      setError("") // Reset error state
      try {
        if (!token) {
          throw new Error("Sesi tidak valid, silakan login ulang.")
        }

        const response = await fetch(`${API_BASE_URL}/api/services`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!response.ok) throw new Error("Gagal memuat layanan dari server")

        const data: Service[] = await response.json()

        // Kelompokkan layanan berdasarkan kategori seperti di ServicesPage
        const grouped = data.reduce((acc, service) => {
          if (!acc[service.category]) {
            acc[service.category] = []
          }
          acc[service.category].push(service)
          return acc
        }, {} as GroupedServices)

        setGroupedServices(grouped)
      } catch (error) {
        console.error("Error loading services:", error)
        setError(error instanceof Error ? error.message : "Terjadi kesalahan saat memuat layanan")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllServices()
  }, [])

  // Memoized values untuk efisiensi, hanya dihitung ulang jika ada perubahan
  const categories = useMemo(() => Object.keys(groupedServices), [groupedServices])
  const servicesForCategory = useMemo(
    () => groupedServices[selectedCategory] || [],
    [selectedCategory, groupedServices],
  )
  const selectedService = useMemo(
    () => servicesForCategory.find((s) => s.id.toString() === selectedServiceId),
    [selectedServiceId, servicesForCategory],
  )

  const totalPrice = useMemo(() => {
    if (selectedService && quantity) {
      return (Number.parseInt(quantity) / 1000) * selectedService.price_per_1000
    }
    return 0
  }, [quantity, selectedService])

  // Validasi untuk tombol submit
  const isFormValid = useMemo(() => {
    if (!selectedService || !link || !quantity) return false
    const qty = Number.parseInt(quantity)
    return qty >= selectedService.min_order && qty <= selectedService.max_order
  }, [selectedService, link, quantity])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setSelectedServiceId("") // Reset pilihan layanan saat kategori berubah
    setQuantity("") // Reset jumlah
    setOpen(false) // Tutup combobox setelah memilih
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !link.trim() || !quantity) {
      toast.error('Harap lengkapi semua field yang diperlukan');
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Show loading toast
    const loadingId = toast.loading('🔄 Memproses pesanan Anda...', {
      style: {
        background: '#1f2937',
        color: '#f9fafb',
        border: '1px solid #374151'
      }
    });

    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: selectedService.id,
          link: link.trim(),
          quantity: parseInt(quantity)
        })
      });

      const data = await response.json();
        if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingId);
      toast.success(
        `🎉 Pesanan berhasil dibuat!\n💰 Total: Rp ${data.order?.total_price?.toLocaleString('id-ID') || totalPrice.toLocaleString('id-ID')}\n📋 Order ID: ${data.order?.order_id || 'N/A'}`,
        {
          duration: 5000,
          style: {
            background: '#065f46',
            color: '#ecfdf5',
            border: '1px solid #059669'
          }
        }
      );

      // Reset form
      setLink('');
      setQuantity('');
      setSelectedServiceId(""); // Fixed: use setSelectedServiceId instead of setSelectedService
        // Refresh user data
      await refreshUserData();
      
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss(loadingId);
      toast.error(
        `❌ ${error.message}\n💡 Silakan coba lagi atau hubungi support`,
        {
          duration: 6000,
          style: {
            background: '#7f1d1d',
            color: '#fef2f2',
            border: '1px solid #dc2626'
          }
        }
      );
      
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Tambahkan function untuk refresh saldo user
  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`${API_BASE_URL}/api/dashboard/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update state atau context user jika ada
        console.log('User data refreshed:', data);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 lg:py-12">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{}}
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
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(255,119,198,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative w-full max-w-xs mx-auto sm:max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-400/30 mb-4 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-300" />
            <span className="text-xs sm:text-sm text-indigo-200 font-medium">Buat Pesanan Baru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent mb-3 sm:mb-4 leading-tight">
            Pesan Layanan SMM
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto leading-relaxed px-2">
            Pilih kategori dan layanan yang Anda inginkan untuk meningkatkan media sosial Anda
          </p>
        </div>

        <Card className="bg-gray-800/60 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-gray-900/50 w-full">
          <CardHeader className="pb-4 sm:pb-6">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-white font-bold">
                  Formulir Pemesanan
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1 text-sm sm:text-base">
                  Lengkapi informasi di bawah untuk memulai pesanan Anda
                </CardDescription>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
                <div className="text-red-300 text-sm flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0"></div>
                  {error}
                </div>
              </div>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 sm:space-y-6 lg:space-y-8">
              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-3 bg-gray-700/50 rounded-full backdrop-blur-sm">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-300 text-sm sm:text-base">Memuat layanan...</p>
                  </div>
                </div>
              )}

              {/* Content setelah data dimuat */}
              {!isLoading && !error && (
                <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                  {/* Searchable Combobox untuk Kategori */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="category"
                      className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Search className="w-4 h-4 text-indigo-400" />
                      Kategori Layanan
                    </Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between h-11 sm:h-12 lg:h-14 bg-gray-700/50 border-gray-600/50 text-white hover:bg-gray-600/50 hover:text-white transition-all duration-200 backdrop-blur-sm text-sm sm:text-base font-medium"
                          disabled={categories.length === 0}
                        >
                          <span className="truncate text-left flex-1 pr-2">
                            {selectedCategory
                              ? categories.find((category) => category === selectedCategory)
                              : categories.length === 0
                                ? "Tidak ada kategori tersedia"
                                : "Pilih Kategori Layanan..."}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-800/95 backdrop-blur-xl border-gray-600/50 shadow-2xl"
                        align="start"
                      >
                        <Command className="bg-transparent">
                          <CommandInput
                            placeholder="Cari kategori..."
                            className="h-11 sm:h-12 bg-transparent text-white border-gray-600/50 placeholder:text-gray-500 text-sm sm:text-base"
                          />
                          <CommandList className="max-h-[200px] sm:max-h-[250px] lg:max-h-[300px] overflow-y-auto">
                            <CommandEmpty className="text-gray-400 py-6 text-center text-sm">
                              <div className="flex flex-col items-center gap-2">
                                <Search className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />
                                <p>Kategori tidak ditemukan</p>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  key={category}
                                  value={category}
                                  onSelect={(currentValue) => {
                                    handleCategoryChange(currentValue === selectedCategory ? "" : currentValue)
                                  }}
                                  className="text-white hover:bg-gray-700/50 cursor-pointer py-3 transition-colors duration-150 text-sm sm:text-base"
                                >
                                  <Check
                                    className={cn(
                                      "mr-3 h-4 w-4 text-indigo-400",
                                      selectedCategory === category ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="truncate">{category}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Dropdown Layanan */}
                  <div className="space-y-2 sm:space-y-3">
                    <Label
                      htmlFor="service"
                      className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base"
                    >
                      <Package className="w-4 h-4 text-purple-400" />
                      Pilih Layanan
                    </Label>
                    <Select onValueChange={setSelectedServiceId} value={selectedServiceId} disabled={!selectedCategory}>
                      <SelectTrigger
                        id="service"
                        className="h-11 sm:h-12 lg:h-14 bg-gray-700/50 border-gray-600/50 text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-600/50 text-sm sm:text-base font-medium"
                      >
                        <SelectValue
                          placeholder={!selectedCategory ? "Pilih kategori terlebih dahulu" : "Pilih Layanan"}
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 backdrop-blur-xl text-white border-gray-600/50 shadow-2xl">
                        <SelectGroup>
                          <SelectLabel className="text-gray-400 font-semibold py-2 text-sm">
                            {selectedCategory || "Pilih Kategori Dahulu"}
                          </SelectLabel>
                          {servicesForCategory.map((service) => (
                            <SelectItem
                              key={service.id}
                              value={service.id.toString()}
                              className="py-3 hover:bg-gray-700/50 transition-colors duration-150"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-medium text-sm sm:text-base">{service.name}</span>
                                <span className="text-xs sm:text-sm text-emerald-400 font-medium">
                                  Rp {service.price_per_1000.toLocaleString("id-ID")} / 1000
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Detail Layanan */}
                  {selectedService && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <Card className="bg-gradient-to-br from-gray-700/40 to-gray-800/40 backdrop-blur-sm border-gray-600/40 shadow-xl">
                        <CardContent className="p-4 sm:p-5 lg:p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                              <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-white">Detail Layanan</h3>
                          </div>

                          <div className="space-y-3 text-sm sm:text-base">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">ID Layanan:</span>
                                <span className="text-white font-mono text-sm">{selectedService.id}</span>
                              </div>
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">Provider ID:</span>
                                <span className="text-white font-mono text-sm">
                                  {selectedService.provider_service_id}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">Kategori:</span>
                                <span className="text-indigo-300 font-medium">{selectedService.category}</span>
                              </div>
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">Harga:</span>
                                <span className="text-emerald-400 font-bold">
                                  Rp {selectedService.price_per_1000.toLocaleString("id-ID")}/1k
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">Min Order:</span>
                                <span className="text-green-300 font-bold">
                                  {selectedService.min_order.toLocaleString("id-ID")}
                                </span>
                              </div>
                              <div className="flex justify-between sm:flex-col sm:justify-start">
                                <span className="text-gray-400 font-medium">Max Order:</span>
                                <span className="text-orange-300 font-bold">
                                  {selectedService.max_order.toLocaleString("id-ID")}
                                </span>
                              </div>
                            </div>

                            {selectedService.description && (
                              <div className="mt-4 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-600/30">
                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                                  {selectedService.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Input Form */}
                  <div className="space-y-5 sm:space-y-6">
                    {/* Link Target */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label
                        htmlFor="link"
                        className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base"
                      >
                        <LinkIcon className="w-4 h-4 text-emerald-400" />
                        Link Target
                      </Label>
                      <Input
                        id="link"
                        placeholder="https://www.instagram.com/username/"
                        className="h-11 sm:h-12 lg:h-14 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-200 focus:bg-gray-600/50 focus:border-gray-500/50 text-sm sm:text-base"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        required
                      />
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2 sm:space-y-3">
                      <Label
                        htmlFor="quantity"
                        className="text-white font-semibold flex items-center gap-2 text-sm sm:text-base"
                      >
                        <Hash className="w-4 h-4 text-yellow-400" />
                        <span>Jumlah Pesanan</span>
                      </Label>
                      {selectedService && (
                        <p className="text-xs sm:text-sm text-gray-400 font-medium">
                          Min: {selectedService.min_order.toLocaleString("id-ID")} - Max:{" "}
                          {selectedService.max_order.toLocaleString("id-ID")}
                        </p>
                      )}
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="Masukkan jumlah pesanan"
                        className="h-11 sm:h-12 lg:h-14 bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-500 backdrop-blur-sm transition-all duration-200 focus:bg-gray-600/50 focus:border-gray-500/50 text-sm sm:text-base"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min={selectedService?.min_order}
                        max={selectedService?.max_order}
                        required
                      />
                      {selectedService &&
                        quantity &&
                        (Number.parseInt(quantity) < selectedService.min_order ||
                          Number.parseInt(quantity) > selectedService.max_order) && (
                          <div className="flex items-start gap-2 p-3 sm:p-4 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse flex-shrink-0 mt-1" />
                            <p className="text-red-300 text-sm sm:text-base">
                              Jumlah harus antara {selectedService.min_order.toLocaleString("id-ID")} -{" "}
                              {selectedService.max_order.toLocaleString("id-ID")}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Total Harga */}
                  {totalPrice > 0 && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                      <Card className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30 backdrop-blur-sm shadow-xl">
                        <CardContent className="p-4 sm:p-5 lg:p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-gray-400 text-sm sm:text-base font-medium">Total Pembayaran</p>
                              <p className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent break-all">
                                Rp{" "}
                                {totalPrice.toLocaleString("id-ID", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full shadow-lg">
                              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {/* Error State */}
              {!isLoading && error && (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex flex-col items-center gap-4 p-6 sm:p-8 bg-red-900/30 border border-red-500/50 rounded-2xl backdrop-blur-sm max-w-sm mx-auto">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-red-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-red-300 font-semibold text-sm sm:text-base">Gagal memuat data layanan</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">
                        Silakan refresh halaman atau coba lagi nanti
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4 sm:pt-6">
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 lg:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/25 rounded-xl"
                disabled={!isFormValid}
              >
                <span className="text-center px-2">
                  {!selectedService
                    ? "Pilih Layanan Terlebih Dahulu"
                    : !link
                      ? "Masukkan Link Target"
                      : !quantity
                        ? "Masukkan Jumlah"
                        : !isFormValid
                          ? "Periksa Jumlah Pesanan"
                          : "🚀 Pesan Sekarang"}
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
