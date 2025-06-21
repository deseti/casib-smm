"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  Filter,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Zap,
  TrendingUp,
  Star,
} from "lucide-react"

// Definisikan tipe data untuk satu layanan
interface Service {
  id: number
  name: string
  category: string
  price_per_1000: number
  min_order: number
  max_order: number
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Ambil token dari localStorage untuk autentikasi
        const token = localStorage.getItem("jwt_token") || localStorage.getItem("google_token")
        if (!token) {
          throw new Error("Sesi tidak valid, silakan login ulang.")
        }

        const response = await fetch("http://localhost:3001/api/services", {
          headers: {
            // Lampirkan token untuk autentikasi
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error("Gagal mengambil data layanan")
        }
        const data = await response.json()
        setServices(data)

        // Expand all categories by default
        const categories = [...new Set(data.map((service: Service) => service.category))] as string[]
        setExpandedCategories(new Set(categories))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Filter services based on search term and selected category
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  // Group services by category
  const groupedServices = filteredServices.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  // Pagination logic
  const totalItems = filteredServices.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  // Group current page services by category
  const currentGroupedServices = currentServices.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  // Get unique categories
  const categories = [...new Set(services.map((service) => service.category))]

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const ServiceCard = ({ service }: { service: Service }) => (
    <Card className="group relative overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-500 border-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-xl hover:scale-[1.02] hover:-translate-y-1">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="absolute inset-[1px] rounded-lg bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

      <div className="relative z-10">
        <CardHeader className="pb-3 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-sm font-bold text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text line-clamp-2 group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300">
              {service.name}
            </CardTitle>
            <Badge className="shrink-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/30 hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300">
              <Zap className="w-3 h-3 mr-1" />
              {service.id}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-gray-300">Harga per 1000</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Rp {Number(service.price_per_1000).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="group/stat p-3 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
              <div className="text-xs text-gray-500 mb-1 group-hover/stat:text-purple-400 transition-colors">
                Min Order
              </div>
              <div className="font-bold text-gray-100 group-hover/stat:text-white transition-colors">
                {service.min_order.toLocaleString("id-ID")}
              </div>
            </div>
            <div className="group/stat p-3 rounded-lg bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-xs text-gray-500 mb-1 group-hover/stat:text-blue-400 transition-colors">
                Max Order
              </div>
              <div className="font-bold text-gray-100 group-hover/stat:text-white transition-colors">
                {service.max_order.toLocaleString("id-ID")}
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )

  const ServiceListItem = ({ service }: { service: Service }) => (
    <Card className="group relative overflow-hidden hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-300 border-0 bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl hover:scale-[1.01]">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <CardContent className="relative z-10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <Badge className="shrink-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/30">
                <Zap className="w-3 h-3 mr-1" />
                {service.id}
              </Badge>
              <h3 className="font-bold text-gray-100 truncate group-hover:text-white transition-colors">
                {service.name}
              </h3>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Min:</span>
                <span className="font-medium">{service.min_order.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Max:</span>
                <span className="font-medium">{service.max_order.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="font-bold text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Rp {Number(service.price_per_1000).toLocaleString("id-ID")}
            </div>
            <div className="text-xs text-gray-500">per 1000</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PaginationComponent = () => {
    const getPageNumbers = () => {
      const pages = []
      const maxVisible = 5

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        } else if (currentPage >= totalPages - 2) {
          pages.push(1)
          pages.push("...")
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push("...")
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i)
          }
          pages.push("...")
          pages.push(totalPages)
        }
      }

      return pages
    }

    return (
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mt-12 p-6 rounded-2xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50">
        <div className="flex items-center gap-2 text-sm">
          <Star className="w-4 h-4 text-purple-400" />
          <span className="text-gray-300">
            Menampilkan{" "}
            <span className="font-bold text-white">
              {startIndex + 1}-{Math.min(endIndex, totalItems)}
            </span>{" "}
            dari <span className="font-bold text-purple-400">{totalItems}</span> layanan
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/50 hover:text-white disabled:opacity-30 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page as number)}
                    className={
                      currentPage === page
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25"
                        : "border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/50 hover:text-white transition-all duration-300"
                    }
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="border-gray-600 bg-gray-800/50 text-gray-300 hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-blue-600/20 hover:border-purple-500/50 hover:text-white disabled:opacity-30 transition-all duration-300"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="h-10 w-80 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-8 w-32 bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-12 flex-1 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-12 w-48 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl animate-pulse"></div>
                <div className="h-12 w-32 bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-xl animate-pulse"></div>
              </div>
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card
                  key={i}
                  className="border-0 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl overflow-hidden"
                >
                  <CardHeader className="space-y-3">
                    <div className="h-4 w-3/4 bg-gradient-to-r from-gray-700 to-gray-600 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gradient-to-r from-purple-800/50 to-blue-800/50 rounded-full animate-pulse ml-auto"></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="h-16 w-full bg-gradient-to-r from-green-800/30 to-emerald-800/30 rounded-lg animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg animate-pulse"></div>
                      <div className="h-16 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg animate-pulse"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-0 bg-gradient-to-br from-red-900/20 via-gray-900/90 to-red-900/20 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10"></div>
            <CardContent className="relative z-10 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 flex items-center justify-center">
                <Filter className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Terjadi Kesalahan</h3>
              <p className="text-gray-300">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  Pusat Layanan SMM
                </h1>
                <p className="text-gray-400 text-sm lg:text-base">Temukan solusi pemasaran media sosial yang hebat</p>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/30 px-4 py-2 text-sm font-semibold">
                <Star className="w-4 h-4 mr-2" />
                {totalItems} Layanan Premium
              </Badge>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search services, categories, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-0 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl text-gray-100 placeholder-gray-500 focus:bg-gray-800/70 focus:ring-2 focus:ring-purple-500/50 rounded-xl transition-all duration-300"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 h-12 border-0 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:bg-gray-800/70 transition-all duration-300 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category}
                  </option>
                ))}
              </select>

              <div className="flex border-0 rounded-xl overflow-hidden bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-xl p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-lg border-0 transition-all duration-300 ${
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-lg border-0 transition-all duration-300 ${
                    viewMode === "list"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/50"
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Services by Category */}
          {Object.keys(currentGroupedServices).length === 0 ? (
            <Card className="border-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                  <Filter className="h-10 w-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-200 mb-2">No Services Found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Try adjusting your search terms or category filters to discover more services
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(currentGroupedServices).map(([category, categoryServices]) => (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-3 text-xl font-bold text-gray-200 hover:text-white p-0 h-auto hover:bg-transparent group transition-all duration-300"
                    >
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 group-hover:from-purple-600/30 group-hover:to-blue-600/30 transition-all duration-300">
                        {expandedCategories.has(category) ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                      {category}
                    </Button>
                    <Badge className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 border-purple-500/30 px-3 py-1">
                      {categoryServices.length} services
                    </Badge>
                  </div>

                  {expandedCategories.has(category) && (
                    <div
                      className={
                        viewMode === "grid"
                          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                          : "space-y-4"
                      }
                    >
                      {categoryServices.map((service) =>
                        viewMode === "grid" ? (
                          <ServiceCard key={service.id} service={service} />
                        ) : (
                          <ServiceListItem key={service.id} service={service} />
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && <PaginationComponent />}
        </div>
      </div>
    </div>
  )
}
