<template>
  <div class="mx-auto max-w-4xl px-4 py-8 transition-all duration-300">
    <!-- Header với animation -->
    <div class="mb-10 animate-fade-in">
      <h6 class="text-lg font-bold text-gray-900 dark:text-white md:text-lg">
        Thanh toán đơn hàng
      </h6>
      <p class="mt-3 text-base text-gray-600 dark:text-gray-300">
        Chọn phương thức thanh toán phù hợp với bạn
      </p>
      <div class="mt-4 h-1 w-20 rounded-full bg-primary"></div>
    </div>

    <!-- Order Code Input với card đẹp hơn -->
    <div
      class="mb-8 overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
      <h2 class="mb-5 flex items-center text-base font-semibold text-gray-900 dark:text-white">
        <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        Tra cứu đơn hàng
      </h2>
      <div class="flex flex-col gap-4 md:flex-row">
        <div class="flex-1">
          <div class="relative">
            <input v-model="orderCodeInput" type="text" placeholder="Nhập mã đơn hàng của bạn"
              class="w-full rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-2 text-gray-900 transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
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
        </div>
        <button @click="searchOrder" :disabled="!orderCodeInput.trim() || loadingOrder"
          class="flex items-center
           justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition">
          <span v-if="loadingOrder" class="flex items-center">
            <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Đang tìm...
          </span>
          <span v-else class="flex items-center">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            Tra cứu
          </span>
        </button>
      </div>
    </div>

    <!-- Order Info với thiết kế card chi tiết -->
    <div v-if="orderInfo"
      class="mb-8 overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
      <h2 class="mb-6 flex items-center text-base font-semibold text-gray-900 dark:text-white">
        <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          </path>
        </svg>
        Thông tin đơn hàng
      </h2>
      <div class="space-y-4">
        <div class="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <span class="flex items-center text-gray-600 dark:text-gray-300">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2">
              </path>
            </svg>
            Mã đơn hàng:
          </span>
          <span class="font-medium text-gray-900 dark:text-white">{{ orderInfo.order_code }}</span>
        </div>
        <div class="flex justify-between border-b border-gray-100 pb-3 dark:border-gray-700">
          <span class="flex items-center text-gray-600 dark:text-gray-300">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
              </path>
            </svg>
            Tổng tiền:
          </span>
          <span class="text-base text-gray-600 dark:text-gray-300  font-bold text-primary">{{
            formatCurrency(orderInfo.total_amount) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="flex items-center text-gray-600 dark:text-gray-300">
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
              </path>
            </svg>
            Trạng thái:
          </span>
          <span :class="[
            'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
            orderInfo.payment_status === 'paid'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          ]">
            <svg :class="[
              'mr-1.5 h-2 w-2',
              orderInfo.payment_status === 'paid' ? 'text-green-500 dark:text-green-400' : 'text-yellow-500 dark:text-yellow-400'
            ]" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            {{ orderInfo.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
          </span>
        </div>
        <div v-if="orderInfo.details" class="mt-6">
          <h3 class="mb-3 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
            Chi tiết đơn hàng
          </h3>

          <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Tên gói
                  </th>
                  <th scope="col"
                    class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Số lượng
                  </th>
                  <th scope="col"
                    class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Giá
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-for="(item, index) in orderInfo.details" :key="index"
                  class="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td class="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {{ item.package_name }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500 dark:text-gray-400">
                    {{ item.quantity }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency(item.base_price) }}
                  </td>
                </tr>

                <!-- Tổng cộng -->
                <!-- <tr class="bg-gray-50 font-semibold dark:bg-gray-800/50">
                  <td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white" colspan="3">
                    Tổng cộng
                  </td>
                  <td class="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-primary text-gray-900 dark:text-white">
                    {{ formatCurrency(orderInfo.total_amount) }}
                  </td>
                </tr> -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Method với thiết kế đẹp hơn -->
    <div v-if="orderInfo && orderInfo.payment_status !== 'paid'"
      class="mb-8 overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:bg-gray-800">
      <h2 class="mb-6 flex items-center text-base font-semibold text-gray-900 dark:text-white">
        <svg class="mr-2 h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
        </svg>
        Phương thức thanh toán
      </h2>
      <div class="space-y-4">
        <div
          class="rounded-lg border-2 border-gray-200 p-4 transition-all duration-300 hover:border-primary dark:border-gray-700">
          <div class="flex items-center">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 dark:text-white">Thanh toán qua VNPay</h3>
              <!-- <p class="text-sm text-gray-500 dark:text-gray-400">Hỗ trợ thẻ ATM, Visa, Mastercard, Ví điện tử</p> -->
            </div>
          </div>
        </div>

        <button @click="payVnpay" :disabled="loadingPay"
          class="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-600 to-green-500 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-105 focus:outline-none focus:ring-4 focus:ring-green-400/30 disabled:opacity-70 disabled:cursor-not-allowed">
          <span v-if="loadingPay" class="flex items-center">
            <span class="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Đang xử lý...
          </span>
          <span v-else class="flex items-center">
            <svg class="mr-2 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Thanh toán ngay ({{ formatCurrency(orderInfo.total_amount) }})
          </span>
        </button>
      </div>
    </div>

    <!-- Thông báo với animation -->
    <transition name="fade">
      <div v-if="errorMsg"
        class="mt-6 animate-fade-in rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-400 dark:bg-red-900/30 dark:text-red-200">
        <div class="flex items-center">
          <svg class="mr-3 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="font-medium">Có lỗi xảy ra</h3>
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
            <path fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"></path>
          </svg>
          <div>
            <h3 class="font-medium">Thành công</h3>
            <p class="mt-1 text-sm">{{ successMsg }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
const { t } = useI18n()
import api from '@/plugins/axios-basic';
import { notificationService } from '@/services/notification'

const route = useRoute()
const orderCodeInput = ref('')
const orderInfo = ref(null)
const loadingOrder = ref(false)
const loadingPay = ref(false)

// Hàm lấy order_code từ URL
function getOrderCodeFromUrl() {
  const orderCode = route.query.order_code || route.query.orderCode
  if (orderCode) {
    orderCodeInput.value = orderCode
    return orderCode
  }
  return null
}

// Tự động tìm kiếm khi có order_code trong URL
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

  try {
    const res = await api.get(`/orders/code/${orderCodeInput.value.trim()}`)

    if (!res.data || !res.data.data) {
      throw new Error("Không tìm thấy đơn hàng")
    }

    orderInfo.value = res.data.data
    notificationService.success("Tìm thấy đơn hàng thành công!")
  } catch (err) {
    notificationService.error(`Lỗi khi tìm kiếm đơn hàng: ${err.message}`)
  } finally {
    loadingOrder.value = false
  }
}

async function payVnpay() {
  if (!orderInfo.value) return

  loadingPay.value = true

  try {
    const res = await api.post('/payment/vnpay/initiate', {
      order_code: orderInfo.value.order_code
    })

    if (!res.data) {
      throw new Error('Không tạo được link thanh toán')
    }

    const data = res.data.data
    if (data.payment_url) {
      window.location.href = data.payment_url
    } else {
      notificationService.success("Khởi tạo thanh toán thành công!")
    }
  } catch (err) {
    notificationService.error(`Lỗi thanh toán: ${err.message}`)
  } finally {
    loadingPay.value = false
  }
}
</script>
<style>
/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>