<template>
  <fieldset class="p-4 rounded-xl border shadow border-gray-100 dark:border-gray-800 mb-6">
    <legend class="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 px-1">Nhật ký đơn hàng</legend>

    <!-- Form note nhật ký -->
    <form @submit.prevent="submitLog" class="mb-4 flex flex-col gap-2 sm:flex-row items-center">
      <input v-model="logNote" type="text" class="input-form flex-1" placeholder="Nhập ghi chú..." maxlength="255" />
      <input type="file" ref="fileInput" @change="handleFile" class="text-xs" />
      <button type="submit"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg ml-0 sm:ml-2"
        :disabled="isSubmitting">
        <span v-if="isSubmitting">Đang gửi...</span>
        <span v-else>Thêm nhật ký</span>
      </button>
      <p v-if="errors?.note[0]">{{ error?.note[0] }}</p>
      <p v-if="errors?.file[0]">{{ error?.file[0] }}</p>
    </form>

    <!-- Danh sách nhật ký -->
    <div v-if="isLoading" class="text-xs py-8 text-gray-500 text-center">Đang tải nhật ký...</div>
    <table
      class="w-full text-xs bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow border border-gray-200 dark:border-gray-700">
      <thead>
        <tr>
          <th class="p-3 font-bold text-center w-12">STT</th>
          <th class="p-3 font-bold text-center w-32">Thời gian</th>
          <th class="p-3 font-bold text-left w-28">Người thực hiện</th>
          <th class="p-3 font-bold text-center w-24">Hành động</th>
          <th class="p-3 font-bold text-left w-[40%]">Mô tả</th>
          <th class="p-3 font-bold text-center w-20">Tệp</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(log, idx) in logs.data" :key="log.id"
          class="hover:bg-yellow-50 dark:hover:bg-gray-800/60 transition border-b border-gray-100 dark:border-gray-700">
          <td class="p-3 text-center w-12">{{ (logs.current_page - 1) * logs.per_page + idx + 1 }}</td>
          <td class="p-3 text-center w-32 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
          <td class="p-3 text-left font-semibold w-28">{{ log.user_name || '-' }}</td>
          <td class="p-3 text-center w-24">
            <span
              class="inline-block px-2 py-1 text-indigo-600 dark:text-indigo-200 rounded-full text-[11px] font-medium text-left tracking-wider">
              {{ log.action }}
            </span>
          </td>
          <td class="p-3 text-left text-gray-900 dark:text-gray-200 w-[40%] break-words">
            {{ log.note }}
          </td>
          <td class="p-3 text-center w-20">
            <a v-if="log.file_id" :href="fileUrl(log.file_id)" target="_blank"
              class="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 rounded hover:underline hover:bg-blue-200 dark:hover:bg-blue-800/60 transition">Tải
              file</a>
            <span v-else class="text-gray-400 dark:text-gray-500">-</span>
          </td>
        </tr>
        <tr v-if="!logs.data.length">
          <td colspan="6" class="text-center py-6 text-gray-400 dark:text-gray-600">Chưa có nhật ký nào</td>
        </tr>
      </tbody>
    </table>


    <!-- Pagination -->
    <div v-if="logs && logs.last_page > 1" class="flex justify-end items-center gap-2 mt-3">
      <button :disabled="logs.current_page === 1" @click="fetchLogs(logs.current_page - 1)"
        class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">«</button>
      <span class="text-xs font-medium text-gray-600 dark:text-gray-300">
        Trang <b>{{ logs.current_page }}</b>/<b>{{ logs.last_page }}</b>
      </span>
      <button :disabled="logs.current_page === logs.last_page" @click="fetchLogs(logs.current_page + 1)"
        class="px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">»</button>
    </div>

  </fieldset>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { api } from '@/utils/api'
import config from '@/config/config'
import { notificationService } from '@/services/notification'

const props = defineProps({
  orderId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
})
const errors = ref({ note: [], file: [] }) // Lưu lỗi từ server nếu có

const logs = ref({
  data: [],
  current_page: 1,
  per_page: 10,
  last_page: 1,
})
const isLoading = ref(false)
const logNote = ref('')
const fileData = ref(null)
const isSubmitting = ref(false)

const fetchLogs = async (page = 1) => {
  if (!props.orderId) return
  isLoading.value = true
  try {
    const res = await api.get(`/orders/${props.orderId}/logs?page=${page}&page_size=10`)
    logs.value = {
      data: res.data.data.items || [],
      current_page: res.data.data.pagination.current_page || 1,
      per_page: res.data.data.pagination.per_page || 10,
      last_page: res.data.data.pagination.last_page || 1,
    }


  } catch {
    logs.value = { data: [], current_page: 1, per_page: 10, last_page: 1 }
  } finally {
    isLoading.value = false
  }
}

const submitLog = async () => {
  if (!logNote.value && !fileData.value) {
    notificationService.error('Vui lòng nhập ghi chú hoặc chọn file đính kèm!')
    return
  }
  if (logNote.value.length > 255) {
    notificationService.error('Ghi chú không được quá 255 ký tự!')
    return
  }
  if (!logNote.value) {
    notificationService.error('Vui lòng nhập ghi chú!')
    return
  }



  isSubmitting.value = true
  const formData = new FormData()
  formData.append('note', logNote.value)

  if (fileData.value) formData.append('file', fileData.value)

  console.log('Submitting log:', {
    note: logNote.value,
    file: fileData.value ? fileData.value.name : 'No file',
  });


  try {

    await api.post(`/orders/${props.orderId}/logs/note`, formData)
    notificationService.success('Thêm nhật ký thành công!')
    logNote.value = ''
    fileData.value = null
    // Reset file input
    if (fileInput.value) fileInput.value.value = ''
    fetchLogs(1)
  } catch (error) {
    errors.value = error.response?.data?.errors || { note: [], file: [] }
    notificationService.error('Không thể thêm nhật ký. Vui lòng thử lại!')
  } finally {
    isSubmitting.value = false
  }
}

const handleFile = (e) => {
  fileData.value = e.target.files[0] || null
}

const fileInput = ref(null)
const fileUrl = (fileId) => `${config.api_be}/file/${fileId}?download=0`
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('vi-VN')
}

// Tự động load khi active
watch(() => props.isActive, (show) => { if (show) fetchLogs() })
onMounted(() => { if (props.isActive) fetchLogs() })
</script>

<style scoped>
.input-form {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs;
}

.input-form:disabled {
  @apply bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed;
}
</style>
