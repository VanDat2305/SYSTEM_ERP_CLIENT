<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="mb-10 text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Thanh toán đơn hàng</h1>
        <p class="mt-3 text-base text-gray-600 dark:text-gray-300">Chọn phương thức thanh toán phù hợp với bạn</p>
        <div class="mx-auto mt-4 h-1 w-20 rounded-full bg-primary"></div>
      </div>
      <!-- Input Card -->
      <div class="mb-8 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl transition-all hover:shadow-xl">
        <h2 class="mb-4 flex items-center text-base font-bold text-gray-900 dark:text-white">
          <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          Tra cứu đơn hàng
        </h2>
        <div class="flex flex-col gap-4 md:flex-row">
          <div class="flex-1 relative">
            <input v-model="orderCodeInput" type="text" placeholder="Nhập mã đơn hàng của bạn"
              class="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all" 
              @keyup.enter="searchOrder" />
            <span v-if="orderCodeInput" @click="orderCodeInput = ''"
              class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"></path>
              </svg>
            </span>
          </div>
          <button @click="searchOrder" :disabled="!orderCodeInput.trim() || loadingOrder"
            class="flex items-center justify-center rounded-xl px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
            <span v-if="loadingOrder" class="flex items-center">
              <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
              Đang tìm...
            </span>
            <span v-else class="flex items-center">
              <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Tra cứu
            </span>
          </button>
        </div>
      </div>
      <!-- Order Card -->
      <div v-if="orderInfo" class="mb-8 rounded-2xl bg-white dark:bg-gray-800 p-7 shadow-2xl transition-all hover:shadow-xl">
        <h2 class="mb-5 flex items-center text-base font-bold text-gray-900 dark:text-white">
          <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Thông tin đơn hàng
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
            <span class="text-gray-500 dark:text-gray-400">Mã đơn hàng</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ orderInfo.order_code }}</span>
          </div>
          <div class="flex justify-between border-b border-gray-100 dark:border-gray-700 py-2">
            <span class="text-gray-500 dark:text-gray-400">Tổng tiền</span>
            <span class="text-base font-bold text-primary">{{ formatCurrency(orderInfo.total_amount) }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-500 dark:text-gray-400">Trạng thái</span>
            <span
              :class="[
                'inline-flex items-center rounded-full px-3 py-1 text-sm font-bold',
                orderInfo.payment_status === 'paid'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              ]">
              <svg :class="['mr-1.5 h-2 w-2', orderInfo.payment_status === 'paid' ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400']" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3"/>
              </svg>
              {{ orderInfo.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
            </span>
          </div>
        </div>
        <!-- Details -->
        <div v-if="orderInfo.details" class="mt-6">
          <h3 class="mb-3 flex items-center text-sm font-bold text-gray-700 dark:text-gray-300">Chi tiết đơn hàng</h3>
          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Tên gói</th>
                  <th class="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Số lượng</th>
                  <th class="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Giá</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-for="(item, index) in orderInfo.details" :key="index" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{{ item.package_name }}</td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">{{ item.quantity }}</td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{{ formatCurrency(item.base_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <!-- Payment Method -->
      <div v-if="orderInfo && orderInfo.payment_status !== 'paid'" class="mb-8 rounded-2xl bg-white dark:bg-gray-800 p-7 shadow-2xl">
        <h2 class="mb-6 flex items-center text-base font-bold text-gray-900 dark:text-white">
          <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          Phương thức thanh toán
        </h2>
        <div class="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
          <h3 class="font-bold text-gray-900 dark:text-white">Thanh toán qua VNPay</h3>
        </div>
        <button @click="payVnpay" :disabled="loadingPay"
          class="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 font-bold text-white shadow-lg hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-green-400/30 disabled:opacity-70 disabled:cursor-not-allowed">
          <span v-if="loadingPay" class="flex items-center">
            <span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Đang xử lý...
          </span>
          <span v-else class="flex items-center">
            <svg class="mr-2 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            Thanh toán ngay ({{ formatCurrency(orderInfo.total_amount) }})
          </span>
        </button>
      </div>
      <!-- Notification -->
      <transition name="fade">
        <div v-if="errorMsg"
          class="mt-6 animate-fade-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-400 dark:bg-red-900/30 dark:text-red-200">
          <div class="flex items-center">
            <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="font-bold">Có lỗi xảy ra</h3>
              <p class="mt-1 text-sm">{{ errorMsg }}</p>
            </div>
          </div>
        </div>
      </transition>
      <transition name="fade">
        <div v-if="successMsg"
          class="mt-6 animate-fade-in rounded-lg border-l-4 border-green-500 bg-green-50 p-4 text-green-700 dark:border-green-400 dark:bg-green-900/30 dark:text-green-200">
          <div class="flex items-center">
            <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <div>
              <h3 class="font-bold">Thành công</h3>
              <p class="mt-1 text-sm">{{ successMsg }}</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from '@/plugins/axios-basic';
import { notificationService } from '@/services/notification'

const route = useRoute()
const orderCodeInput = ref('')
const orderInfo = ref(null)
const loadingOrder = ref(false)
const loadingPay = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

// Lấy order_code từ URL
function getOrderCodeFromUrl() {
  const orderCode = route.query.order_code || route.query.orderCode
  if (orderCode) {
    orderCodeInput.value = orderCode
    return orderCode
  }
  return null
}

onMounted(() => {
  const orderCode = getOrderCodeFromUrl()
  if (orderCode) {
    searchOrder()
  }
})

function formatCurrency(amount) {
  if (!amount) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND'
}

async function searchOrder() {
  if (!orderCodeInput.value.trim()) return
  orderInfo.value = null
  loadingOrder.value = true
  errorMsg.value = ''
  try {
    const res = await api.get(`/orders/code/${orderCodeInput.value.trim()}`)
    if (!res.data || !res.data.data) throw new Error("Không tìm thấy đơn hàng")
    orderInfo.value = res.data.data
    notificationService.success("Tìm thấy đơn hàng thành công!")
    // successMsg.value = "Tìm thấy đơn hàng thành công!"
    setTimeout(() => successMsg.value = '', 1500)
  } catch (err) {
    notificationService.error(`Lỗi khi tìm kiếm đơn hàng: ${err.response?.data?.message || err.message}`)
  } finally {
    loadingOrder.value = false
  }
}

async function payVnpay() {
  if (!orderInfo.value) return
  loadingPay.value = true
  errorMsg.value = ''
  try {
    const res = await api.post('/payment/vnpay/initiate', {
      order_code: orderInfo.value.order_code
    })
    if (!res.data) throw new Error('Không tạo được link thanh toán')
    const data = res.data.data
    if (data.payment_url) {
      window.location.href = data.payment_url
    } else {
      successMsg.value = "Khởi tạo thanh toán thành công!"
      setTimeout(() => successMsg.value = '', 1500)
    }
  } catch (err) {
    notificationService.error(`Lỗi thanh toán: ${err.response?.data?.message || err.message}`)
    // errorMsg.value = `Lỗi thanh toán: ${err.message}`
  } finally {
    loadingPay.value = false
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px);}
  to { opacity: 1; transform: translateY(0);}
}
</style>
