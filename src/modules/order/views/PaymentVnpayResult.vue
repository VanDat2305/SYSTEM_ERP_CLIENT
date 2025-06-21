<template>
  <div class="mx-auto max-w-2xl py-12 px-4">
    <div class="mb-8 text-center">
      <h1 class="text-3xl font-bold" v-if="result === 'success'">Thanh toán thành công!</h1>
      <h1 class="text-3xl font-bold text-red-600" v-else>Thanh toán thất bại</h1>
      <p class="mt-2 text-gray-500">
        {{ message }}
      </p>
    </div>
    <div v-if="orderInfo" class="bg-white shadow rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">Thông tin đơn hàng</h2>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>Mã đơn hàng:</span>
          <span class="font-bold">{{ orderInfo.order_code }}</span>
        </div>
        <div class="flex justify-between">
          <span>Số tiền:</span>
          <span class="font-bold text-primary">{{ formatCurrency(orderInfo.total_amount) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Trạng thái thanh toán:</span>
          <span :class="orderInfo.payment_status === 'paid' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'">
            {{ orderInfo.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
          </span>
        </div>
        <div class="flex justify-between" v-if="orderInfo.paid_at">
          <span>Thanh toán lúc:</span>
          <span>{{ orderInfo.paid_at }}</span>
        </div>
      </div>
    </div>
    <div class="mt-10 text-center">
      <router-link class="text-blue-600 hover:underline font-medium" to="/payment">Quay về trang thanh toán</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/plugins/axios' // hoặc import axios nếu chưa có instance

const route = useRoute()
const result = ref('pending')
const message = ref('')
const orderInfo = ref(null)

function formatCurrency(amount) {
  if (!amount) return '0'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND'
}

onMounted(async () => {
  const txnRef = route.query.vnp_TxnRef
  const responseCode = route.query.vnp_ResponseCode

  // Xác định trạng thái nhanh (nhưng luôn kiểm tra lại BE)
  if (responseCode === '00') {
    result.value = 'success'
    message.value = 'Thanh toán của bạn đã được ghi nhận. Vui lòng kiểm tra trạng thái đơn hàng bên dưới.'
  } else {
    result.value = 'fail'
    message.value = 'Thanh toán thất bại hoặc bị hủy. Nếu bạn bị trừ tiền, vui lòng liên hệ CSKH.'
  }

  // Gọi API kiểm tra trạng thái đơn hàng thực tế (an toàn)
  if (txnRef) {
    try {
      const res = await api.get(`/orders/code/${txnRef}`)
      orderInfo.value = res.data
    } catch (err) {
      message.value = 'Không lấy được thông tin đơn hàng. Vui lòng liên hệ hỗ trợ.'
    }
  } else {
    message.value = 'Không xác định được mã đơn hàng.'
  }
})
</script>
