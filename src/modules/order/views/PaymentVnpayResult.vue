<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center px-4 py-12">
    <!-- Card -->
    <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-xl">
      <!-- Status Header -->
      <div
        class="py-7 px-8 text-center"
        :class="{
          'bg-gradient-to-r from-green-500 to-emerald-600': result === 'success',
          'bg-gradient-to-r from-red-500 to-rose-600': result !== 'success'
        }"
      >
        <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mb-4">
          <svg v-if="result === 'success'" class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg v-else class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h1 class="text-2xl font-extrabold text-white mb-1">
          {{ result === 'success' ? 'Thanh toán thành công!' : 'Thanh toán không thành công' }}
        </h1>
        <p class="text-white text-opacity-90">
          {{ message }}
        </p>
      </div>

      <!-- Order Details -->
      <div v-if="orderInfo" class="p-7 space-y-4 bg-gray-50 dark:bg-gray-900">
        <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center mb-4">
          <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Thông tin đơn hàng
        </h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-gray-500 dark:text-gray-400">Mã đơn hàng</span>
            <span class="font-medium text-gray-900 dark:text-white">{{ orderInfo.order_code }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-gray-500 dark:text-gray-400">Số tiền</span>
            <span class="font-bold text-lg"
              :class="result === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
              {{ formatCurrency(orderInfo.total_amount) }}
            </span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span class="text-gray-500 dark:text-gray-400">Trạng thái</span>
            <span class="px-2 py-1 rounded-full text-xs font-semibold"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': orderInfo.payment_status === 'paid',
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200': orderInfo.payment_status !== 'paid'
              }"
            >
              {{ orderInfo.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
            </span>
          </div>
          <div v-if="orderInfo.paid_at" class="flex justify-between items-center py-2">
            <span class="text-gray-500 dark:text-gray-400">Thời gian</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">{{ orderInfo.paid_at }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-7 pb-7 bg-gray-50 dark:bg-gray-900">
        <router-link
          to="/payment"
          class="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-xl shadow font-bold text-base text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
        >
          Quay về trang thanh toán
        </router-link>
        <div class="mt-4 text-center">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Cần hỗ trợ? <a href="#" class="text-blue-600 dark:text-blue-400 hover:underline">Liên hệ chúng tôi</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios-basic'

const setLoading = inject('setLoading', () => {})
const route = useRoute()
const result = ref('pending')
const message = ref('')
const orderInfo = ref(null)

function formatCurrency(amount) {
  if (!amount) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND'
}

onMounted(async () => {
  const txnRef = route.query.order_code
  const status = route.query.status
  if (status === 'success') {
    result.value = 'success'
    message.value = 'Thanh toán của bạn đã được ghi nhận. Vui lòng kiểm tra trạng thái đơn hàng bên dưới.'
  } else {
    result.value = 'fail'
    message.value = 'Thanh toán thất bại hoặc bị hủy. Nếu bạn bị trừ tiền, vui lòng liên hệ CSKH.'
  }
  if (txnRef) {
    setLoading(true)
    try {
      const res = await api.get(`/orders/code/${txnRef}`)
      orderInfo.value = res.data.data
    } catch (err) {
      message.value = 'Không lấy được thông tin đơn hàng. Vui lòng liên hệ hỗ trợ.'
    } finally {
      setLoading(false)
    }
  } else {
    message.value = 'Không xác định được mã đơn hàng.'
  }
})
</script>
