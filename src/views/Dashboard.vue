<template>
  <admin-layout>
    <div class="p-6 max-w-7xl mx-auto font-sans bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <!-- Header Section -->
      <!-- Phần header - sửa lại để hiển thị rõ khoảng thời gian -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-base font-bold text-gray-900 mb-2">Tổng quan</h1>
            <p class="text-xs text-gray-600">
              Dữ liệu từ {{ dateRangeLabel }} | Cập nhật lúc: {{ lastUpdated }}
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="refreshData"
              class="px-3 py-1 bg-blue-600 text-xs text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              Làm mới
            </button>
            <!-- Bộ lọc thời gian chung -->
            <select v-model="selectedPeriod" @change="handlePeriodChange"
              class="px-5 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="7">7 ngày</option>
              <option value="30">30 ngày</option>
              <option value="90">3 tháng</option>
              <option value="365">1 năm</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
            <!-- Date picker khi chọn tùy chỉnh -->
            <div v-if="selectedPeriod === 'custom'" class="flex gap-2">
              <input type="date" v-model="startDate" class="text-xs border rounded p-1 max-w-24">
              <input type="date" v-model="endDate" class="text-xs border rounded p-1 max-w- 24">
            </div>
          </div>
        </div>
      </div>
      <!-- KPI Cards with Enhanced Animation -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div v-for="(kpi, index) in kpis" :key="index"
          class="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
          :class="{ 'animate-pulse': isLoading }">
          <div class="flex items-center justify-between mb-4">
            <div class="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl"
              :style="{ background: kpi.gradient }">
              {{ kpi.icon }}
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500 mb-1 dark:text-gray-400">
                {{ kpi.change }}%
              </div>
              <div class="group relative inline-block">
                <div class="text-xs px-2 py-1 rounded-full transition-colors duration-200 cursor-help" :class="kpi.change > 0 ?
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  aria-label="{{ kpi.change > 0 ? 'Positive change' : 'Negative change' }}">
                  {{ kpi.change > 0 ? '↗' : '↘' }}
                </div>
                <span
                  class="hidden group-hover:block absolute bg-gray-800 text-white text-xs p-1 rounded -top-8 right-0 whitespace-nowrap">
                  {{ kpi.change > 0 ? 'Up' : 'Down' }} {{ Math.abs(kpi.change) }}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900 mb-1">{{ kpi.value }}</h3>
            <p class="text-xs text-gray-600">{{ kpi.label }}</p>
          </div>
        </div>
      </div>

      <!-- Main Charts Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-gray-900">Doanh thu</h2>
            <div class="flex gap-2">
              <button v-for="period in ['Ngày', 'Tuần', 'Tháng']" :key="period" @click="changeRevenuePeriod(period)"
                :class="revenuePeriod === period ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'"
                class="px-3 py-1 rounded-lg text-xs font-medium transition-colors">
                {{ period }}
              </button>
            </div>
          </div>
          <VueApexCharts ref="revenueChart" type="area" height="350" :options="revenueChartOptions"
            :series="revenueChartSeries" />
        </div>

        <!-- Order Status Pie Chart -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-base font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
          <VueApexCharts type="donut" height="300" :options="orderStatusChartOptions"
            :series="orderStatusChartSeries" />
          <div class="mt-4 space-y-2">
            <div v-for="(status, index) in orderStatusLabels" :key="index" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: orderStatusChartOptions.colors[index] }">
                </div>
                <span class="text-xs text-gray-600">{{ status }}</span>
              </div>
              <span class="text-xs font-medium">{{ orderStatusChartSeries[index] }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 mb-10">
        <!-- Top Products Chart -->
        <div class="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-base font-semibold text-gray-900 mb-6">Dịch vụ bán chạy</h2>
          <VueApexCharts ref="topProductsChart" type="bar" height="300" :options="topProductsChartOptions"
            :series="topProductsChartSeries" />
        </div>

        <!-- Customer Growth Chart -->
        <div class="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 class="text-base font-semibold text-gray-900 mb-6">Số lượng khách hàng</h2>
          <!-- <div class="flex items-center gap-3 mb-4">
            <label class="text-xs text-gray-600">Từ tháng</label>
            <input type="month" v-model="customerGrowthStart" class="border rounded px-2 py-1 text-xs" />
            <label class="text-xs text-gray-600">đến tháng</label>
            <input type="month" v-model="customerGrowthEnd" class="border rounded px-2 py-1 text-xs" />
            <button @click="reloadCustomerGrowth"
              class="px-3 py-1 bg-blue-600 text-xs text-white rounded-lg hover:bg-blue-700 transition-colors">
              Xem
            </button>
          </div> -->

          <VueApexCharts ref="customerGrowthChart" type="line" height="300" :options="customerGrowthChartOptions"
            :series="customerGrowthChartSeries" />
        </div>
      </div>

      <!-- Data Tables Section -->
      <div class="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-10">
        <!-- Latest Orders Table -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-gray-900">Đơn hàng mới nhất</h2>
            <router-link to="/orders"
              class="btn text-xs bg-blue-500 py-1 px-4 rounded-full text-gray-100 hover:bg-blue-400 hover:text-gray-200">Xem
              tất cả</router-link>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 rounded-lg">
                  <th class="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">Mã đơn hàng</th>
                  <th class="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">Khách hàng</th>
                  <th class="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">Giá trị</th>
                  <th class="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th class="px-4 py-3 text-left text-xs text-gray-700 uppercase tracking-wider">Ngày tạo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="order in latestOrders" :key="order.order_code" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-4 text-xs font-medium text-gray-900">{{ order.order_code }}</td>
                  <td class="px-4 py-4 text-xs text-gray-700">{{ order.customer }}</td>
                  <td class="px-4 py-4 text-xs text-gray-900">{{ formatCurrency(order.amount) }}</td>
                  <td class="px-4 py-4 text-xs">
                    <span :class="statusClasses[order.status]"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="px-4 py-4 text-xs text-gray-600">{{ order.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Latest Customers Table -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-base font-semibold text-gray-900">Khách hàng mới nhất</h2>
            <router-link to="/customers"
              class="btn text-xs bg-blue-500 py-1 px-4 rounded-full text-gray-100 hover:bg-blue-400 hover:text-gray-200">Xem
              tất cả</router-link>
            <!-- <button class="text-blue-600 hover:text-blue-800 text-xs font-medium">Xem tất cả</button> -->

          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="bg-gray-50 rounded-lg">
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tên khách
                    hàng</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Điện
                    thoại</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ngày đăng
                    ký</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="customer in latestCustomers" :key="customer.id" class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-4 text-xs font-medium text-gray-900">{{ customer.name }}</td>
                  <td class="px-4 py-4 text-xs text-gray-700">{{ customer.email }}</td>
                  <td class="px-4 py-4 text-xs text-gray-700">{{ customer.phone }}</td>
                  <td class="px-4 py-4 text-xs text-gray-600">{{ customer.registeredDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, watch, inject, nextTick, computed } from 'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'

// Inject loading function
const setLoading = inject('setLoading')

// Reactive state
const isLoading = ref(false)
const selectedPeriod = ref(30)
const revenuePeriod = ref('Ngày')
const lastUpdated = ref(new Date().toLocaleString('vi-VN'))
const startDate = ref('')
const endDate = ref('')
const now = new Date()
const year = now.getFullYear()
const month = (now.getMonth() + 1).toString().padStart(2, '0')

// Từ đầu năm (YYYY-01)
const customerGrowthStart = ref(`${year}-01`)
// Đến tháng hiện tại (YYYY-MM)
const customerGrowthEnd = ref(`${year}-${month}`)

const dateRangeLabel = computed(() => {
  if (selectedPeriod.value === 'custom') {
    return `từ ${formatDate(startDate.value)} đến ${formatDate(endDate.value)}`
  }
  return {
    '7': '7 ngày gần nhất',
    '30': '30 ngày gần nhất',
    '90': '3 tháng gần nhất',
    '365': '1 năm gần nhất'
  }[selectedPeriod.value]
})

// Hàm format ngày
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

function handlePeriodChange() {
  if (selectedPeriod.value !== 'custom') {
    fetchDashboardData()
  }
}
watch([startDate, endDate], ([newStart, newEnd]) => {
  if (newStart && newEnd && selectedPeriod.value === 'custom') {
    fetchDashboardData()
  }
})

// KPI Data
const kpis = ref([
  {
    icon: '📦',
    value: '1,247',
    label: 'Tổng đơn hàng',
    change: 12.5,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: '💰',
    value: formatCurrency(125680000),
    label: 'Tổng doanh thu',
    change: 8.2,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: '👥',
    value: '89',
    label: 'Khách hàng mới',
    change: 15.3,
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: '⏰',
    value: '23',
    label: 'Đơn chưa thanh toán',
    change: -5.1,
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  },
  // {
  //   icon: '🔔',
  //   value: '12',
  //   label: 'Dịch vụ sắp hết hạn',
  //   change: -2.8,
  //   gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  // }
])

// Chart configurations
const revenueChartOptions = reactive({
  chart: {
    type: 'area',
    toolbar: { show: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 900
    },
    zoom: { enabled: true },
    foreColor: '#222',
    fontFamily: 'inherit'
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.25,
      gradientToColors: ['#3B82F6', '#10B981'],
      inverseColors: false,
      opacityFrom: 0.5,
      opacityTo: 0.08,
      stops: [0, 100]
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3,
    lineCap: 'round'
  },
  markers: {
    size: 2,
    strokeColors: '#3B82F6',
    strokeWidth: 2,
    hover: { size: 7 }
  },
  colors: ['#3B82F6'],
  xaxis: {
    categories: [],
    labels: {
      style: { fontSize: '12px', fontWeight: 500 },
      rotate: -45,
      trim: true,
      hideOverlappingLabels: true
    },
    axisTicks: { show: false }
  },
  yaxis: {
    min: 0,
    labels: {
      formatter: (value) => formatCurrency(value),
      style: { fontSize: '12px' }
    }
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 5,
    xaxis: { lines: { show: false } }
  },
  tooltip: {
    theme: 'light',
    x: { show: true },
    y: {
      formatter: (val) => formatCurrency(val)
    }
  },
  legend: {
    show: true,
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '2px',
    markers: { radius: 8 }
  },
  responsive: [
    {
      breakpoint: 640,
      options: {
        chart: { height: 240 },
        xaxis: { labels: { rotate: -30, fontSize: '10px' } },
        legend: { fontSize: '10px' }
      }
    }
  ],
  dataLabels: {
    enabled: true, // hiện số trên đỉnh
    formatter: (val) => formatCurrency(val), // gọi hàm format, bạn có thể dùng bất kỳ logic nào
    style: {
      fontSize: '13px',
      fontWeight: 'bold',
      colors: ['#2563eb'] // đổi màu nếu muốn, hoặc dùng màu series mặc định
    },
    offsetY: -8, // đẩy số lên trên đỉnh cho đẹp
    background: {
      enabled: true,
      foreColor: '#fff',
      borderRadius: 6,
      padding: 4,
      opacity: 0.85,
      borderWidth: 1,
      borderColor: '#2563eb'
    }
  }
});


const revenueChartSeries = ref([
  {
    name: 'Doanh thu',
    data: [98500000, 125600000, 89300000, 156700000, 134200000, 178900000, 145600000, 167800000, 189400000, 156700000, 198500000, 234600000]
  }
])

const orderStatusChartOptions = reactive({
  chart: {
    type: 'donut',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  labels: [
    'Đã hoàn tất (completed)',
    'Đang xử lý (processing)',
    'Đã phê duyệt (approved)',
    'Chờ xử lý (pending)',
    'Đã hủy (cancelled)'
  ],
  colors: [
    '#10B981', // completed - xanh lá
    '#3B82F6', // processing - xanh dương
    '#6366F1', // approved - tím nhạt
    '#F59E0B', // pending - vàng cam
    '#EF4444'  // cancelled - đỏ
  ],
  legend: {
    show: false
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Tổng',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151'
          }
        }
      }
    }
  },
  tooltip: {
    theme: 'light',
    y: {
      formatter: (value) => value + ' đơn'
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      }
    }
  }]
})

const orderStatusChartSeries = ref([654, 234, 123, 89])
const orderStatusLabels = ref([
  'Đã hoàn tất',
  'Đang xử lý',
  'Đã phê duyệt',
  'Chờ xử lý',
  'Đã hủy'
])

const topProductsChart = ref(null)
const topProductsChartOptions = reactive({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: {
        position: 'top'
      }
    }
  },
  colors: ['#3B82F6'],
  xaxis: {
    categories: []
  },
  grid: {
    borderColor: '#F3F4F6'
  }
})

const topProductsChartSeries = ref([{
  name: 'Số lượng bán',
  data: [245, 189, 156, 134, 98]
}])
const customerGrowthChart = ref(null)
const customerGrowthChartOptions = reactive({
  chart: {
    type: 'line',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#10B981'],
  xaxis: {
    categories: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
  },
  markers: {
    size: 6,
    strokeWidth: 2,
    strokeColors: ['#fff'],
    fillColors: ['#10B981']
  },
  grid: {
    borderColor: '#F3F4F6'
  }
})

const customerGrowthChartSeries = ref([{
  name: 'Khách hàng mới',
  data: [45, 67, 89, 123, 145, 178]
}])

// Table data
const latestOrders = ref([
  { id: 'DH001', customer: 'Nguyễn Văn A', amount: 2500000, status: 'Hoàn thành', date: '2024-06-28' },
  { id: 'DH002', customer: 'Trần Thị B', amount: 1800000, status: 'Đang xử lý', date: '2024-06-28' },
  { id: 'DH003', customer: 'Lê Văn C', amount: 3200000, status: 'Chờ thanh toán', date: '2024-06-27' },
  { id: 'DH004', customer: 'Phạm Thị D', amount: 1500000, status: 'Hoàn thành', date: '2024-06-27' },
  { id: 'DH005', customer: 'Hoàng Văn E', amount: 2800000, status: 'Đang xử lý', date: '2024-06-26' }
])

const latestCustomers = ref([
  { id: 1, name: 'Nguyễn Thị F', email: 'f.nguyen@email.com', phone: '0901234567', registeredDate: '2024-06-28' },
  { id: 2, name: 'Trần Văn G', email: 'g.tran@email.com', phone: '0912345678', registeredDate: '2024-06-28' },
  { id: 3, name: 'Lê Thị H', email: 'h.le@email.com', phone: '0923456789', registeredDate: '2024-06-27' },
  { id: 4, name: 'Phạm Văn I', email: 'i.pham@email.com', phone: '0934567890', registeredDate: '2024-06-27' },
  { id: 5, name: 'Vũ Thị K', email: 'k.vu@email.com', phone: '0945678901', registeredDate: '2024-06-26' }
])

const statusClasses = reactive({
  'Hoàn thành': 'bg-green-100 text-green-800',
  'Đang xử lý': 'bg-amber-100 text-amber-800',
  'Chờ thanh toán': 'bg-red-100 text-red-800',
  'Đã hủy': 'bg-gray-100 text-gray-800'
})

// Auto refresh interval
let autoRefreshInterval = null
// Thêm hàm xử lý period
function getDateRangeByPeriod(period) {
  const end = new Date();
  let start;
  if (period === 'Ngày') {
    start = new Date();
    start.setDate(end.getDate() - 7); // 8 ngày (bao gồm hôm nay)
  } else if (period === 'Tuần') {
    start = new Date();
    start.setDate(end.getDate() - 27); // 4 tuần gần nhất (28 ngày)
  } else if (period === 'Tháng') {
    start = new Date();
    start.setMonth(end.getMonth() - 11); // 12 tháng
  } else {
    start = new Date();
    start.setDate(end.getDate() - 30); // fallback
  }
  return { start_date: start, end_date: end };
}


async function changeRevenuePeriod(period) {
  revenuePeriod.value = period;
  const { start_date, end_date } = getDateRangeByPeriod(period);
  const data = await fetchRevenueData({
    start_date: start_date.toISOString().split('T')[0],
    end_date: end_date.toISOString().split('T')[0],
    period_type: period.toLowerCase()
  });
  updateCharts(data, null);
}

// Utility functions
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// API functions
async function fetchKPIData(params) {
  try {
    const response = await api.get(`/dashboard/kpi`, { params })
    return response.data.data
  } catch (error) {
    console.error('KPI fetch error:', error)
    return null
  }
}

async function fetchRevenueData(params) {
  try {
    const response = await api.get(`/dashboard/revenue`, { params })
    return response.data.data
  } catch (error) {
    console.error('Revenue fetch error:', error)
    return null
  }
}
async function fetchCustomerGrowth() {
  const start = customerGrowthStart.value + '-01'
  // Đến cuối tháng hiện tại
  const endDateObj = new Date(customerGrowthEnd.value + '-01')
  // Lấy ngày cuối tháng
  endDateObj.setMonth(endDateObj.getMonth() + 1)
  endDateObj.setDate(0)
  const end = endDateObj.toISOString().slice(0, 10)
  try {
    const response = await api.get('/dashboard/customer-growth', {
      params: {
        start_date: start,
        end_date: end
      }
    })
    return response.data.data
  } catch (error) {
    console.error('Customer growth fetch error:', error)
    notificationService.error('Không thể tải dữ liệu tăng trưởng khách hàng')
  }

  // const chartData = res.data
  // customerGrowthChartOptions.xaxis.categories = chartData.categories
  // customerGrowthChartSeries.value = chartData.series
}

async function fetchOrdersData() {
  try {
    const response = await api.get(`/dashboard/orders?limit=5`)
    return response.data.data
  } catch (error) {
    console.error('Orders fetch error:', error)
    return null
  }
}

async function fetchCustomersData() {
  try {
    const response = await api.get(`/dashboard/customers?limit=5`)
    return response.data.data
  } catch (error) {
    console.error('Customers fetch error:', error)
    return null
  }
}

async function fetchAnalyticsData(params) {
  try {
    const response = await api.get(`/dashboard/analytics`, { params })
    return response.data.data
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return null
  }
}
const revenueChart = ref(null)
// Update functions
function updateKPIs(data) {
  if (data && data.kpis) {
    kpis.value = kpis.value.map((kpi, index) => ({
      ...kpi,
      value: data.kpis[index]?.value || kpi.value,
      change: data.kpis[index]?.change === 0 || data.kpis[index]?.change ? data.kpis[index]?.change : kpi.change
    }))
  }
}

function updateCharts(revenueData, analyticsData) {
  if (revenueData) {
    revenueChart.value.updateOptions({
      xaxis: {
        categories: revenueData.categories
      }
    })
    revenueChart.value.updateSeries(revenueData.series)
  }

  if (analyticsData) {
    orderStatusChartSeries.value = analyticsData.orderStatus || orderStatusChartSeries.value
    if (customerGrowthChart.value && analyticsData.customerGrowth) {
      customerGrowthChart.value.updateOptions({
        xaxis: {
          categories: analyticsData.customerGrowth.categories || customerGrowthChartOptions.xaxis.categories
        }
      })
      customerGrowthChartSeries.value = analyticsData.customerGrowth.series || customerGrowthChartSeries.value
    }

    topProductsChartSeries.value = analyticsData.topProductsSeries || topProductsChartSeries.value

    if (topProductsChart.value) {
      topProductsChart.value.updateOptions({
        xaxis: {
          categories: topProductsChartOptions.xaxis.categories
        }
      })
    }

  }
}

function updateTables(ordersData, customersData) {
  if (ordersData && ordersData.orders) {
    latestOrders.value = ordersData.orders
  }
  if (customersData && customersData.customers) {
    latestCustomers.value = customersData.customers
  }
}

// Main functions
async function fetchDashboardData() {
  // Use the injected setLoading function if available, otherwise use local loading
  if (setLoading) {
    setLoading(true)
  } else {
    isLoading.value = true
  }
  const params = {
    period: selectedPeriod.value
  }
  if (selectedPeriod.value === 'custom' && startDate.value && endDate.value) {
    params.start_date = startDate.value
    params.end_date = endDate.value
  }
  const { start_date, end_date } = getDateRangeByPeriod(revenuePeriod.value);
  try {
    const [kpiData, revenueData, ordersData, customersData, analyticsData, customerGrowth] = await Promise.all([
      fetchKPIData(params),
      fetchRevenueData({
        start_date: start_date.toISOString().split('T')[0],
        end_date: end_date.toISOString().split('T')[0],
        period_type: revenuePeriod.value.toLowerCase()
      }),
      fetchOrdersData(params),
      fetchCustomersData(params),
      fetchAnalyticsData(params),
      fetchCustomerGrowth()
    ])

    updateKPIs(kpiData)
    updateCharts(revenueData, analyticsData)
    updateTables(ordersData, customersData)
    updateCharts(null, { customerGrowth: customerGrowth })

    lastUpdated.value = new Date().toLocaleString('vi-VN')
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    notificationService.error('Không thể tải dữ liệu dashboard')
    // showErrorNotification('Không thể tải dữ liệu dashboard')
  } finally {
    if (setLoading) {
      setLoading(false)
    } else {
      isLoading.value = false
    }
  }
}

async function refreshData() {
  await fetchDashboardData()
  notificationService.success('Dữ liệu đã được làm mới')
  // showSuccessNotification('Dữ liệu đã được cập nhật')
}

function setupAutoRefresh() {
  autoRefreshInterval = setInterval(() => {
    fetchDashboardData()
  }, 300000) // 5 minutes
}
function handleResize() {
  nextTick(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

// Lifecycle hooks
onMounted(() => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)

  startDate.value = start.toISOString().split('T')[0]
  endDate.value = end.toISOString().split('T')[0]
  fetchDashboardData()
  setupAutoRefresh()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval)
  }
  window.removeEventListener('resize', handleResize)
})

// Watchers
watch(selectedPeriod, (newPeriod) => {
  fetchDashboardData()
})
</script>