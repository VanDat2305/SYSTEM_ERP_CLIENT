<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dịch vụ ihoadon
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Quản lý và theo dõi các dịch vụ đã mua
        </p>
      </div>
        <!-- Company Info -->
      <div v-if="getInfo().name  || getInfo().tax_code" class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <div v-if="getInfo().name " class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <span class="font-medium">{{ getInfo().name  }}</span>
        </div>
        <div v-if="getInfo().tax_code" class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>MST: {{ getInfo().tax_code }}</span>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Dịch vụ hoạt động</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ activeServicesCount }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Tổng gói dịch vụ</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalPackages }}</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredServices.length === 0" class="text-center py-16">
        <div class="mx-auto h-24 w-24 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">Chưa có dịch vụ nào</h3>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Bạn chưa mua dịch vụ nào hoặc không có dịch vụ phù hợp</p>
      </div>

      <!-- Services List -->
      <div v-else class="space-y-8">
        <div v-for="service in filteredServices" :key="service.service_type">
          <!-- Service Header -->
          <div class="flex items-center mb-6">
            <div class="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ service.packages.length }} gói dịch vụ
              </p>
            </div>
          </div>

          <!-- Packages Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div v-for="pkg in service.packages" :key="pkg.order_detail_id"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              
              <!-- Package Header -->
              <div class="p-6 pb-4">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {{ pkg.package_name }}
                    </h3>
                    
                  

                    <div class="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                      {{ formatDate(pkg.start_date) }} - {{ formatDate(pkg.end_date) }}
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <span :class="pkg.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                      <span :class="pkg.is_active ? 'bg-green-400' : 'bg-red-400'" 
                        class="w-2 h-2 rounded-full mr-2"></span>
                      {{ pkg.is_active ? 'Hoạt động' : 'Hết hạn' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Features -->
              <div class="px-6 pb-6">
                <div class="space-y-4">
                  <div v-for="feature in pkg.features.filter(f => f.feature_type === 'quantity')"
                    :key="feature.feature_key"
                    class="border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                    
                    <div class="flex items-center justify-between mb-3">
                      <h4 class="font-semibold text-gray-900 dark:text-white">
                        {{ feature.feature_name }}
                      </h4>
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        {{ feature.unit || 'lượt' }}
                      </span>
                    </div>

                    <!-- Progress Bar -->
                    <div class="mb-3" v-if="feature.feature_key != 'duration'">
                      <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Đã sử dụng: {{ feature.total_quota - feature.remain }}</span>
                        <span>Còn lại: {{ feature.remain }}</span>
                      </div>
                      <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          :style="{ width: `${((feature.total_quota - feature.remain) / feature.total_quota) * 100}%` }">
                        </div>
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ feature.remain }}/{{ feature.total_quota }} ({{ Math.round((feature.remain / feature.total_quota) * 100) }}%)
                      </div>
                    </div>

                    <!-- Action Button -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Số lượng:
                        </label>
                        <input
                          v-if="pkg.is_active && feature.remain > 0"
                          type="number"
                          min="1"
                          :max="feature.remain"
                          v-model.number="featureQuantity[`${pkg.order_detail_id}-${feature.feature_key}`]"
                          class="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          :disabled="loadingUse[`${pkg.order_detail_id}-${feature.feature_key}`]"
                        />
                        <span v-else class="text-sm text-gray-500 dark:text-gray-400">-</span>
                      </div>
                      
                      <button
                        v-if="pkg.is_active && feature.remain > 0"
                        @click="useFeature(pkg.order_detail_id, feature.feature_key)"
                        :disabled="loadingUse[`${pkg.order_detail_id}-${feature.feature_key}`] || !featureQuantity[`${pkg.order_detail_id}-${feature.feature_key}`] || featureQuantity[`${pkg.order_detail_id}-${feature.feature_key}`] < 1"
                        class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors duration-200">
                        <svg v-if="loadingUse[`${pkg.order_detail_id}-${feature.feature_key}`]" 
                          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ loadingUse[`${pkg.order_detail_id}-${feature.feature_key}`] ? 'Đang xử lý...' : 'Xuất' }}
                      </button>
                      <div v-else-if="!pkg.is_active" class="text-sm text-gray-500 dark:text-gray-400">
                        Dịch vụ đã hết hạn
                      </div>
                      <div v-else class="text-sm text-orange-600 dark:text-orange-400">
                        Đã hết số lượng sử dụng
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="error" class="mt-8 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-red-800 dark:text-red-200">{{ error }}</span>
        </div>
      </div>

      <div v-if="successMsg" class="mt-8 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-lg">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-green-800 dark:text-green-200">{{ successMsg }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/plugins/axios-service'
import { useRouter } from 'vue-router'
const router = useRouter()

const services = ref([])
const loading = ref(true)
const error = ref('')
const loadingUse = ref({})
const successMsg = ref('')
const featureQuantity = ref({})

function getToken() {
  return localStorage.getItem('account_token_ihoadon')
}
function getInfo() {
  return JSON.parse(localStorage.getItem('account_info') || '{}')
}

// Initialize quantities for features
function initializeQuantities() {
  filteredServices.value.forEach(service => {
    service.packages.forEach(pkg => {
      pkg.features.forEach(feature => {
        if (feature.feature_type === 'quantity') {
          const key = `${pkg.order_detail_id}-${feature.feature_key}`
          if (!featureQuantity.value[key]) {
            featureQuantity.value[key] = 1
          }
        }
      })
    })
  })
}

// Computed properties for stats
const filteredServices = computed(() =>
  services.value
    .filter(s => s.service_type === 'SER_IHD')
    .map(s => ({
      ...s,
      packages: s.packages.filter(pkg =>
        pkg.features.some(f => f.feature_type === 'quantity')
      )
    }))
    .filter(s => s.packages.length > 0)
)

const activeServicesCount = computed(() => {
  return filteredServices.value.reduce((count, service) => {
    return count + service.packages.filter(pkg => pkg.is_active).length
  }, 0)
})

const totalPackages = computed(() => {
  return filteredServices.value.reduce((count, service) => {
    return count + service.packages.length
  }, 0)
})

const totalRemaining = computed(() => {
  return filteredServices.value.reduce((total, service) => {
    return total + service.packages.reduce((pkgTotal, pkg) => {
      return pkgTotal + pkg.features
        .filter(f => f.feature_type === 'quantity')
        .reduce((featTotal, feat) => featTotal + feat.remain, 0)
    }, 0)
  }, 0)
})

// Format date helper
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

async function fetchServices() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/account/services', {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    services.value = res.data?.data?.services || []
    // Initialize quantities after loading services
    setTimeout(() => {
      initializeQuantities()
    }, 0)
  } catch (err) {
    if (err.response && err.response.status === 401) {
      router.push('/ihoadon/login')
    }
    error.value = err.response?.data?.message || 'Không lấy được danh sách dịch vụ'
  } finally {
    loading.value = false
  }
}

async function useFeature(order_detail_id, feature_key) {
  const key = `${order_detail_id}-${feature_key}`
  const quantity = featureQuantity.value[key] || 1
  
  loadingUse.value[key] = true
  error.value = ''
  successMsg.value = ''
  try {
    await api.post('/quota/use', {
      order_detail_id,
      feature_key,
      amount: quantity
    }, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
    successMsg.value = `Xuất thành công.`
    await fetchServices()
    setTimeout(() => successMsg.value = '', 3000)
  } catch (err) {
    error.value = err.response?.data?.message || 'Lỗi dịch vụ'
  } finally {
    loadingUse.value[key] = false
  }
}

onMounted(fetchServices)
</script>