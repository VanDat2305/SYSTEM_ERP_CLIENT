<template>
    <fieldset class="p-4 rounded-xl border shadow border-gray-100 dark:border-gray-800 mb-6">
        <legend class="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 px-1">
            Tổng quan khách hàng
        </legend>
        
        <!-- Loading state với skeleton -->
        <div v-if="summaryLoading" class="animate-pulse">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div v-for="i in 4" :key="i" class="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <div v-for="i in 6" :key="i" class="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg"></div>
            </div>
        </div>
        
        <!-- Error state -->
        <div v-else-if="summaryError" class="text-center py-6">
            <div class="text-red-500 text-xs mb-2">{{ summaryError }}</div>
            <button @click="retryFetchSummary" 
                class="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
                Thử lại
            </button>
        </div>
        
        <!-- Success state -->
        <div v-else class="space-y-4">
            <!-- Metrics chính -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg text-center border border-blue-200/50 dark:border-blue-700/50 hover:shadow-md transition-all duration-200">
                    <div class="text-xs text-blue-600 dark:text-blue-300 font-medium">Tổng số đơn hàng</div>
                    <div class="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                        {{ formatNumber(summary.totalOrders) }}
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg text-center border border-green-200/50 dark:border-green-700/50 hover:shadow-md transition-all duration-200">
                    <div class="text-xs text-green-600 dark:text-green-300 font-medium">Tổng số gói đã mua</div>
                    <div class="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                        {{ formatNumber(summary.totalPackages) }}
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg text-center border border-yellow-200/50 dark:border-yellow-700/50 hover:shadow-md transition-all duration-200">
                    <div class="text-xs text-yellow-600 dark:text-yellow-300 font-medium">Tổng số tiền đã chi</div>
                    <div class="text-xl font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                        {{ summary.totalAmount}}
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-700/30 p-4 rounded-lg text-center border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-200">
                    <div class="text-xs text-gray-600 dark:text-gray-300 font-medium">Lần mua gần nhất</div>
                    <div class="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">
                        {{ summary.lastOrderDate || 'Chưa có' }}
                    </div>
                    <div v-if="summary.lastOrderCode" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        #{{ summary.lastOrderCode }}
                    </div>
                </div>
            </div>
            
            <!-- Metrics phụ - Fixed responsive layout -->
            <div v-if="hasSecondaryMetrics" class="space-y-3">
                <!-- Packages by type với responsive grid tối ưu -->
                <div v-show="summary.packagesByType?.length > 0" 
                     class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    <div v-for="(pkg, index) in summary.packagesByType" :key="pkg.type || index"
                        :class="getPackageTypeColorClass(index)"
                        class="p-4 rounded-lg text-center border hover:shadow-md transition-all duration-200 min-h-[80px] flex flex-col justify-center">
                        <div class="text-xs font-medium mb-1 line-clamp-2" 
                             :class="getPackageTypeLabelClass(index)">
                            {{ pkg.label || 'Loại không xác định' }}
                        </div>
                        <div class="text-2xl font-bold mt-1" 
                             :class="getPackageTypeValueClass(index)">
                            {{ formatNumber(pkg.count) }}
                        </div>
                    </div>
                </div>
                
                <!-- Status metrics với layout cố định -->
                <div class="grid grid-cols-2 gap-3">
                    <!-- Expiring soon -->
                    <div class="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-4 rounded-lg text-center border border-orange-200/50 dark:border-orange-700/50 hover:shadow-md transition-all duration-200">
                        <div class="text-xs text-orange-600 dark:text-orange-300 font-medium">Gói sắp hết hạn</div>
                        <div class="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1 flex items-center justify-center gap-1">
                            {{ formatNumber(summary.expiringSoon) }}
                            <!-- <span v-if="summary.expiringSoon > 0" class="text-base animate-pulse">⚠️</span> -->
                        </div>
                    </div>
                    
                    <!-- Expired -->
                    <div class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-lg text-center border border-red-200/50 dark:border-red-700/50 hover:shadow-md transition-all duration-200">
                        <div class="text-xs text-red-600 dark:text-red-300 font-medium">Gói đã hết hạn</div>
                        <div class="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                            {{ formatNumber(summary.expired) }}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Last updated info -->
            <div class="text-right">
                <div class="text-xs text-gray-400 dark:text-gray-500">
                    Cập nhật lúc: {{ formatDateTime(lastUpdated) }}
                </div>
            </div>
        </div>
    </fieldset>

    <fieldset class="p-4 rounded-xl border shadow border-gray-100 dark:border-gray-800 mb-6">
        <legend class="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 px-1">Danh sách dịch vụ</legend>
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
            <div class="text-xs text-gray-500 mt-2">Đang tải dữ liệu...</div>
        </div>
        
        <!-- Bulk Actions -->
        <div v-if="selectedPackages.length > 0" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-xs font-medium text-blue-700 dark:text-blue-300">
                        Đã chọn {{ selectedPackages.length }} gói
                    </span>
                    <button @click="clearSelection" 
                        class="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline">
                        Bỏ chọn tất cả
                    </button>
                </div>
                
                <div class="flex items-center gap-2">
                    <button @click="bulkRenew" 
                        :disabled="bulkRenewing || !hasRenewableSelected"
                        class="px-4 py-2 text-xs font-medium rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white transition-colors duration-200 flex items-center gap-2">
                        <span v-if="bulkRenewing" class="animate-spin">⏳</span>
                        <span v-else>🔄</span>
                        {{ bulkRenewing ? 'Đang gia hạn...' : `Gia hạn (${renewableSelectedCount})` }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Table content -->
        <div v-else class="overflow-x-auto">
            <table class="w-full text-xs bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th class="p-3 w-8">
                            <input type="checkbox" 
                                :checked="isAllSelected"
                                :indeterminate="isIndeterminate"
                                @change="toggleSelectAll"
                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2">
                        </th>
                        <th class="p-3 font-bold text-left text-gray-700 dark:text-gray-300">Tên gói</th>
                        <th class="p-3 font-bold text-left text-gray-700 dark:text-gray-300">Loại dịch vụ</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Tổng số lượng</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Đã dùng</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Còn lại</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Bắt đầu</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Kết thúc</th>
                        <th class="p-3 font-bold text-center text-gray-700 dark:text-gray-300">Trạng thái</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr v-for="pkg in packages" :key="pkg.id" 
                        :class="[getRowClasses(pkg.status), selectedPackages.includes(pkg.id) ? 'bg-blue-50 dark:bg-blue-900/20' : '']"
                        class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150">
                        <td class="p-3">
                            <input type="checkbox" 
                                :value="pkg.id"
                                v-model="selectedPackages"
                                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2">
                        </td>
                        <td class="p-3 text-left font-medium">{{ pkg.package_name }}</td>
                        <td class="p-3 text-left">
                            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {{ getServiceTypeLabel(pkg.service_type) }}
                            </span>
                        </td>
                        <td class="p-3 text-center font-mono">{{ pkg.total_quota || '-' }}</td>
                        <td class="p-3 text-center font-mono">{{ pkg.used || '-' }}</td>
                        <td class="p-3 text-center font-mono font-semibold" :class="getRemainClass(pkg)">
                            {{ pkg.remain || '-' }}
                        </td>
                        <td class="p-3 text-center">{{ formatDate(pkg.start_date) }}</td>
                        <td class="p-3 text-center">{{ formatDate(pkg.end_date) }}</td>
                        <td class="p-3 text-center">
                            <div class="flex items-center justify-center gap-2">
                                <!-- Status badges -->
                                <span :class="getStatusBadgeClass(pkg.status)" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium">
                                    {{ getStatusLabel(pkg.status) }}
                                </span>
                                
                                <!-- Individual Renew button -->
                                <button
                                    v-if="canRenew(pkg)"
                                    @click="handleRenew(pkg)"
                                    :disabled="renewingPackages.has(pkg.id) || bulkRenewing"
                                    class="px-3 py-1 text-xs rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium transition-colors duration-200 flex items-center gap-1">
                                    <span v-if="renewingPackages.has(pkg.id)" class="animate-spin">⏳</span>
                                    {{ renewingPackages.has(pkg.id) ? 'Đang xử lý...' : 'Gia hạn' }}
                                </button>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Empty state -->
                    <tr v-if="!packages.length">
                        <td colspan="9" class="text-center py-8">
                            <div class="text-gray-400 dark:text-gray-600">
                                <div class="text-4xl mb-2">📦</div>
                                <div>Chưa có gói dịch vụ nào</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.last_page > 1" class="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div class="text-xs text-gray-500 dark:text-gray-400">
                Hiển thị {{ ((pagination.current_page - 1) * pagination.per_page) + 1 }} - 
                {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} 
                trong tổng số {{ pagination.total }} gói
            </div>
            
            <div class="flex items-center gap-2">
                <button :disabled="pagination.current_page === 1" 
                    @click="fetchPackages(pagination.current_page - 1)"
                    class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                    « Trước
                </button>
                
                <div class="flex items-center gap-1">
                    <template v-for="page in getVisiblePages()" :key="page">
                        <button v-if="page !== '...'" 
                            @click="fetchPackages(page)"
                            :class="page === pagination.current_page ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'"
                            class="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200">
                            {{ page }}
                        </button>
                        <span v-else class="px-2 text-gray-400">...</span>
                    </template>
                </div>
                
                <button :disabled="pagination.current_page === pagination.last_page" 
                    @click="fetchPackages(pagination.current_page + 1)"
                    class="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                    Sau »
                </button>
            </div>
        </div>
    </fieldset>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { api } from '@/utils/api'

const props = defineProps({
    customerId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    categorySystem: { type: Object }
})

const emit = defineEmits(['renew', 'bulk-renew'])

// Reactive data
const packages = ref([])
const pagination = ref({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
const isLoading = ref(false)
const summaryLoading = ref(false)
const summaryError = ref('')
const lastUpdated = ref(new Date())
const renewingPackages = ref(new Set())
const selectedPackages = ref([])
const bulkRenewing = ref(false)

const summary = ref({
    totalOrders: 0,
    totalPackages: 0,
    totalAmount: 0,
    lastOrderDate: '',
    lastOrderCode: '',
    packagesByType: [],
    expiringSoon: 0,
    expired: 0
})

const serviceTypeOptions = computed(() => {
    if (!props.categorySystem) return []
    return props.categorySystem.getItemsByTypeCode('service_type').map((item) => ({
        label: item.name,
        value: item.code
    }))
})

// Computed properties for better UX
const hasSecondaryMetrics = computed(() => {
    return (summary.value.packagesByType?.length > 0) || 
           (summary.value.expiringSoon > 0) || 
           (summary.value.expired > 0)
})

// Bulk selection computed properties
const renewablePackages = computed(() => {
    return packages.value.filter(pkg => canRenew(pkg))
})

const selectedRenewablePackages = computed(() => {
    return selectedPackages.value.filter(id => {
        const pkg = packages.value.find(p => p.id === id)
        return pkg && canRenew(pkg)
    })
})

const renewableSelectedCount = computed(() => {
    return selectedRenewablePackages.value.length
})

const hasRenewableSelected = computed(() => {
    return renewableSelectedCount.value > 0
})

const isAllSelected = computed(() => {
    return packages.value.length > 0 && selectedPackages.value.length === packages.value.length
})

const isIndeterminate = computed(() => {
    return selectedPackages.value.length > 0 && selectedPackages.value.length < packages.value.length
})

// Color classes for package types
const packageTypeColors = [
    {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30',
        border: 'border-indigo-200/50 dark:border-indigo-700/50',
        label: 'text-indigo-600 dark:text-indigo-300',
        value: 'text-indigo-700 dark:text-indigo-300'
    },
    {
        bg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30',
        border: 'border-purple-200/50 dark:border-purple-700/50',
        label: 'text-purple-600 dark:text-purple-300',
        value: 'text-purple-700 dark:text-purple-300'
    },
    {
        bg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30',
        border: 'border-pink-200/50 dark:border-pink-700/50',
        label: 'text-pink-600 dark:text-pink-300',
        value: 'text-pink-700 dark:text-pink-300'
    },
    {
        bg: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30',
        border: 'border-cyan-200/50 dark:border-cyan-700/50',
        label: 'text-cyan-600 dark:text-cyan-300',
        value: 'text-cyan-700 dark:text-cyan-300'
    },
    {
        bg: 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30',
        border: 'border-teal-200/50 dark:border-teal-700/50',
        label: 'text-teal-600 dark:text-teal-300',
        value: 'text-teal-700 dark:text-teal-300'
    },
    {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30',
        border: 'border-emerald-200/50 dark:border-emerald-700/50',
        label: 'text-emerald-600 dark:text-emerald-300',
        value: 'text-emerald-700 dark:text-emerald-300'
    }
]

const getPackageTypeColorClass = (index) => {
    const colorSet = packageTypeColors[index % packageTypeColors.length]
    return `${colorSet.bg} ${colorSet.border}`
}

const getPackageTypeLabelClass = (index) => {
    const colorSet = packageTypeColors[index % packageTypeColors.length]
    return colorSet.label
}

const getPackageTypeValueClass = (index) => {
    const colorSet = packageTypeColors[index % packageTypeColors.length]
    return colorSet.value
}

// Utility functions
const formatNumber = (value) => {
    if (!value && value !== 0) return '-'
    return Number(value).toLocaleString('vi-VN')
}

const formatCurrency = (value) => {
    if (!value && value !== 0) return '0₫'
    return Number(value).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('vi-VN')
}

const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('vi-VN')
}

const getServiceTypeLabel = (serviceType) => {
    const option = serviceTypeOptions.value.find(opt => opt.value === serviceType)
    return option?.label || serviceType || 'N/A'
}

const getStatusLabel = (status) => {
    const labels = {
        'active': 'Còn sử dụng',
        'warning': 'Sắp hết',
        'expired': 'Hết hạn',
        'renewed': 'Đã gia hạn'
    }
    return labels[status] || 'Không xác định'
}

const getStatusBadgeClass = (status) => {
    const classes = {
        'active': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'warning': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'expired': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        'renewed': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

const getRowClasses = (status) => {
    const classes = {
        'active': 'bg-green-50/30 dark:bg-green-900/10',
        'warning': 'bg-yellow-50/30 dark:bg-yellow-900/10', 
        'expired': 'bg-red-50/30 dark:bg-red-900/10',
        'renewed': 'bg-gray-50/30 dark:bg-gray-900/10'
    }
    return classes[status] || ''
}

const getRemainClass = (pkg) => {
    if (!pkg.remain || !pkg.total_quota) return ''
    const percentage = (pkg.remain / pkg.total_quota) * 100
    if (percentage <= 10) return 'text-red-600 dark:text-red-400'
    if (percentage <= 30) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
}

const canRenew = (pkg) => {
    return (pkg.status === 'expired' || pkg.status === 'warning') && pkg.status !== 'renewed'
}

const getVisiblePages = () => {
    const current = pagination.value.current_page
    const total = pagination.value.last_page
    const pages = []
    
    if (total <= 7) {
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        pages.push(1)
        if (current > 4) pages.push('...')
        
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)
        
        for (let i = start; i <= end; i++) {
            pages.push(i)
        }
        
        if (current < total - 3) pages.push('...')
        pages.push(total)
    }
    
    return pages
}

// API functions
const fetchSummary = async () => {
    if (!props.customerId) return
    
    summaryLoading.value = true
    summaryError.value = ''
    
    try {
        const res = await api.get(`/customers/${props.customerId}/packages/summary`)
        summary.value = res.data.data || summary.value
        lastUpdated.value = new Date()
    } catch (error) {
        console.error('Error fetching summary:', error)
        summaryError.value = 'Không thể tải dữ liệu tổng quan. Vui lòng thử lại.'
    } finally {
        summaryLoading.value = false
    }
}

const retryFetchSummary = () => {
    fetchSummary()
}

const fetchPackages = async (page = 1) => {
    if (!props.customerId) return
    
    isLoading.value = true
    
    try {
        const res = await api.get(`/customers/${props.customerId}/packages/list`, {
            params: { page, per_page: 10 }
        })
        
        packages.value = res.data.data || []
        pagination.value = res.data.pagination || pagination.value
    } catch (error) {
        console.error('Error fetching packages:', error)
        packages.value = []
    } finally {
        isLoading.value = false
    }
}

const handleRenew = async (pkg) => {
    renewingPackages.value.add(pkg.id)
    
    try {
        emit('renew', pkg)
        // Refresh data after renewal
        await Promise.all([fetchSummary(), fetchPackages(pagination.value.current_page)])
    } catch (error) {
        console.error('Error during renewal:', error)
    } finally {
        renewingPackages.value.delete(pkg.id)
    }
}

// Bulk operations
const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedPackages.value = []
    } else {
        selectedPackages.value = packages.value.map(pkg => pkg.id)
    }
}

const clearSelection = () => {
    selectedPackages.value = []
}

const bulkRenew = async () => {
    if (!hasRenewableSelected.value) return
    
    bulkRenewing.value = true
    
    try {
        const renewableIds = selectedRenewablePackages.value
        const renewablePackagesList = packages.value.filter(pkg => renewableIds.includes(pkg.id))
        
        // Emit bulk renew event
        emit('bulk-renew', renewablePackagesList)
        
        // Refresh data after bulk renewal
        await Promise.all([fetchSummary(), fetchPackages(pagination.value.current_page)])
        
        // Clear selection after successful renewal
        selectedPackages.value = []
        
    } catch (error) {
        console.error('Error during bulk renewal:', error)
    } finally {
        bulkRenewing.value = false
    }
}

// Watchers and lifecycle
watch(() => props.isActive, (isActive) => {
    if (isActive) {
        fetchSummary()
        fetchPackages()
    } else {
        // Clear selection when tab becomes inactive
        selectedPackages.value = []
    }
})

watch(() => packages.value, () => {
    // Remove selected packages that are no longer in the list
    selectedPackages.value = selectedPackages.value.filter(id => 
        packages.value.some(pkg => pkg.id === id)
    )
})

onMounted(() => {
    if (props.isActive) {
        fetchSummary()
        fetchPackages()
    }
})
</script>