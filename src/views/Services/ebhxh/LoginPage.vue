<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-2xl shadow">
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập dịch vụ ebhxh</h2>
      <form @submit.prevent="login">
        <div class="mb-4">
          <input v-model="email" type="email" placeholder="Email"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring focus:ring-blue-300" required>
        </div>
        <div class="mb-4">
          <input v-model="password" type="password" placeholder="Mật khẩu"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring focus:ring-blue-300" required>
        </div>
        <button type="submit" :disabled="loading"
          class="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition">
          <span v-if="loading">Đang đăng nhập...</span>
          <span v-else>Đăng nhập</span>
        </button>
      </form>
      <p v-if="error" class="mt-4 text-center text-red-600 dark:text-red-300">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios-service'
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''
  try {
    // Gọi API login (ví dụ /api/account/login)
    const res = await api.post('/account/login', {
      email: email.value,
      password: password.value
    })
    const token = res.data?.data.token || res.data?.data?.access_token
    if (!token) throw new Error('Sai tài khoản hoặc mật khẩu!')
    // Lưu token, rồi chuyển trang dịch vụ
  
    localStorage.setItem('account_token_ebhxh', token)
    localStorage.setItem('account_info',  JSON.stringify(res.data?.data.account || {}))
    
    
    router.push('/ebhxh/my-services')
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng nhập thất bại!'
  } finally {
    loading.value = false
  }
}
</script>
