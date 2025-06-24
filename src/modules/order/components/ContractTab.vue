<template>
    <div class="p-4">
        <div v-if="isLoading" class="py-8 text-center text-gray-500 text-xs">Đang tải dữ liệu hợp đồng...</div>
        <template v-else-if="orderDetail">

            <!-- Contract Information -->
            <fieldset class="p-5 rounded-2xl shadow border border-blue-100 dark:border-gray-700 mb-6">
                <legend
                    class="flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest px-1">
                    <!-- {{ t('contracts.group_contract') }} -->
                    Thông tin hợp đồng
                </legend>
               
                <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                     <div>
                    <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Trạng thái đơn hàng
                        </label>
                    <SelectSearch v-model="orderDetail.order_status" :options="statusOredrOptions" :disabled="true"
                        class="mt-2" />
                </div>
                    <div>
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                            <!-- {{ t('contracts.fields.contract_number') }} -->
                            Số hợp đồng
                        </label>
                        <input type="text" :value="orderDetail.contract_number || '-'" :disabled="true"
                            placeholder="Sinh tự động" class="input-form mt-2 bg-gray-50 dark:bg-gray-700" />
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                            <!-- {{ t('contracts.fields.contract_date') }} -->
                            Ngày hợp đồng
                        </label>
                        <input type="text"
                            :value="orderDetail.contract_date ? formatDate(orderDetail.contract_date) : '-'"
                            :disabled="true" class="input-form mt-2 bg-gray-50 dark:bg-gray-700" />
                    </div>

                    <div>
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-200">
                            <!-- {{ t('contracts.fields.contract_status') }} -->
                            Trạng thái hợp đồng
                        </label>
                        <SelectSearch v-model="orderDetail.contract_status" :options="statusOptions" :disabled="true"
                            class="mt-2" />
                        <!-- <div class="mt-2">
              <span class="px-3 py-2 text-xs rounded-lg font-medium inline-block w-full text-center"
                :class="{
                  'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': orderDetail.contract_status === 'exported',
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': orderDetail.contract_status === 'pending',
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': orderDetail.contract_status === 'cancelled',
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300': !orderDetail.contract_status
                }"
              >
                {{ orderDetail.contract_status || t('contracts.status.unknown') }}
              </span>
            </div> -->
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <!-- Cột trái: xuất file, upload file đã ký -->
                    <div>
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 block">Tệp hợp
                            đồng</label>
                        <!-- Nhóm xuất file (luôn hiển thị nếu quyền xem) -->
                        <div class="flex gap-2 mb-2">
                            <button :disable="!canExport || isSigned || isOrderLocked"
                                class="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="() => exportContractFile('pdf')">
                                <i class="fas fa-file-pdf mr-2"></i> Xuất PDF
                            </button>
                            <button :disable="!canExport || isSigned || isOrderLocked"
                                class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="() => exportContractFile('word')">
                                <i class="fas fa-file-word mr-2"></i> Xuất Word
                            </button>
                        </div>

                        <!-- Nhóm upload file đã ký (chỉ khi chưa ký, có quyền upload, không locked) -->
                        <div v-if="canUploadSigned && !isSigned && !isOrderLocked" class="mb-2 flex gap-2">
                            <input type="file" class="flex-1 text-xs border rounded-lg p-2" accept=".pdf"
                                @change="onUploadSignedFile" :disabled="isSigned" id="signedFileInput" />
                            <button
                                class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="uploadSignedFile" :disabled="isSigned || !isOrderLocked">
                                <i class="fas fa-upload mr-2"></i> Upload file đã ký
                            </button>
                        </div>
                    </div>

                    <!-- Cột phải: tải/xóa file đã ký -->
                    <div>
                        <label class="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 block">Tệp đã xuất/đã
                            ký</label>

                        <!-- Tải file hợp đồng nháp/chính thức (chỉ khi có file) -->
                        <div v-if="orderDetail.contract_file_id" class="mb-2 flex gap-2">
                            <button
                                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="() => downloadFile(orderDetail.contract_file_id)">
                                <i class="fas fa-download mr-2"></i> Tải hợp đồng
                            </button>
                            <button v-if="canDeleteSignedFile && !isOrderLocked"
                                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="confirmDeleteSignedFile">
                                <i class="fas fa-trash-alt mr-2"></i> Xóa file
                            </button>
                        </div>

                        <!-- Tải/xóa file đã ký (chỉ khi có file đã ký, quyền xóa, trạng thái phù hợp) -->
                        <!-- <div v-if="orderDetail.signed_contract_file_id" class="mb-2 flex gap-2">
                            <button
                                class="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                                @click="() => downloadFile(orderDetail.signed_contract_file_id)">
                                <i class="fas fa-file-signature mr-2"></i> Tải file đã ký
                            </button>
                            
                        </div> -->
                    </div>
                </div>

            </fieldset>

        </template>

        <!-- <div v-else class="py-12 text-center">
            <div class="text-gray-400 dark:text-gray-500">
                <i class="fas fa-file-contract text-4xl mb-4"></i>
                <p class="text-sm font-medium">{{ t('contracts.no_data') }}</p>
                <p class="text-xs mt-1">{{ t('contracts.no_data_description') }}</p>
            </div>
        </div> -->
    </div>
    <ConfirmModal :show="showConfirmUploadModal" :close="() => showConfirmUploadModal = false"
        :onConfirm="handleConfirmUpload" type="danger" :closeOnClickOutside="false" :title="t('common.confirm')"
        :message="confirmMessage" :confirmText="t('common.yes')" :cancelText="t('common.no')" />
</template>

<script setup>
import { ref, watch, onMounted, inject, computed } from 'vue'
import { api } from '@/utils/api'
import config from "@/config/config";
import { useI18n } from 'vue-i18n'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import { notificationService } from '@/services/notification'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { usePermissions } from '@/auth/usePermissions'

const setLoading = inject('setLoading', () => { })
const { hasPermission } = usePermissions()
const { t } = useI18n()
const props = defineProps({
    order: Object, // order object passed from parent
    isActive: Boolean    // truyền vào để chủ động load khi tab hiển thị
})
const showConfirmUploadModal = ref(false)
const confirmMessage = ref('')
const orderDetail = ref(null)
const isLoading = ref(false)
const statusOredrOptions = ref([
    { value: 'draft', label: t('orders.status.draft') },
    { value: 'pending', label: t('orders.status.pending') },
    { value: 'approved', label: t('orders.status.approved') },
    { value: 'processing', label: t('orders.status.processing') },
    { value: 'completed', label: t('orders.status.completed') },
    { value: 'cancelled', label: t('orders.status.cancelled') }
])
const statusOptions = ref([
    { value: 'draft', label: t('contracts.status.draft') },
    { value: 'pending', label: t('contracts.status.pending') },
    { value: 'signed', label: t('contracts.status.signed') }
])

const selectedSignedFile = ref(null) // Dùng để lưu file đã chọn upload



// API wrapper
const fetchOrderDetail = async () => {
    // orderDetail.value = props.order.value || null
    if (!props.order.id) return
    setLoading(true)
    try {
        // Thay bằng gọi axios hoặc fetch của bạn
        const res = await api.get('/orders/' + props.order.id)
        orderDetail.value = res.data.data || null
    } catch (e) {
        orderDetail.value = null
        // Xử lý lỗi ở đây (nếu cần)
    } finally {
        setLoading(false)
    }
}
const isSigned = computed(() => orderDetail.value.contract_status === 'signed')
const isOrderLocked = computed(() => ['cancelled', 'completed'].includes(orderDetail.value.order_status))
const canExport = computed(() => hasPermission('orders.export-contract'))
const canUploadSigned = computed(() => hasPermission('orders.upload-file-signed'))
const canDeleteSignedFile = computed(() => hasPermission('orders.delete-file-signed'))
const confirmDeleteSignedFile = () => {
    showConfirmUploadModal.value = true
    confirmMessage.value = "Bạn có chắc chắn muốn xóa file hợp đồng này không?"
}
const onUploadSignedFile = (event) => {
    
    const fileInput = event.target
    if (!fileInput.files.length) {
        notificationService.error("Vui lòng chọn file để tải lên.")
        return
    }
    const file = fileInput.files[0]
    if (!file) return

    // Kiểm tra định dạng file
    const validTypes = ['application/pdf']
    if (!validTypes.includes(file.type)) {
        notificationService.error("Định dạng file không hợp lệ. Vui lòng chọn file PDF")
        return
    }
}
const handleConfirmUpload = async () => {
    setLoading(true)
    try {
        await api.delete("/orders/" + props.order.id + "/file")
        notificationService.success("Đã xóa file hợp đồng đã ký thành công.")
        // Reload order detail after deletion
        fetchOrderDetail()
        showConfirmUploadModal.value = false
    } catch (e) {
        console.error("Error deleting signed contract file:", e)
        notificationService.error("Không thể xóa file hợp đồng đã ký. Vui lòng thử lại sau.")
    } finally {
        setLoading(false)
    }
}

// Watch isActive: mỗi lần vào tab thì reload
watch(() => props.isActive, (show) => {
    if (show) fetchOrderDetail()
})
onMounted(() => {
    if (props.isActive) fetchOrderDetail()
})
// Handle file upload for signed contract
const uploadSignedFile = async () => {
    const fileInput = document.querySelector('#signedFileInput')
    if (!fileInput.files.length) {
        notificationService.error("Vui lòng chọn file để tải lên.")
        return
    }
    const file = fileInput.files[0]
    
    if (!file) return

    // Kiểm tra định dạng file
    const validTypes = ['application/pdf']
    if (!validTypes.includes(file.type)) {
        notificationService.error("Định dạng file không hợp lệ. Vui lòng chọn file PDF")
        return
    }

    setLoading(true)
    try {
        const formData = new FormData()
        formData.append('file', file)

        // Gọi API để tải lên file đã ký
        const res = await api.post("/orders/" + props.order.id + "/upload-file-signed", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        // Cập nhật orderDetail sau khi tải lên thành công
        // orderDetail.value.signed_contract_file_id = res.data.data.file_id
        fetchOrderDetail() // Reload order detail to get updated data
        notificationService.success("Đã tải lên file hợp đồng đã ký thành công.")
    } catch (e) {
        console.error("Error uploading signed contract file:", e)
        notificationService.error("Không thể tải lên file hợp đồng đã ký. Vui lòng thử lại sau.")
    } finally {
        setLoading(false)
    }
}

// Export contract file (PDF/Word)
const exportContractFile = async (type = 'pdf') => {
    if (!canExport.value) {
        notificationService.error("Bạn không có quyền xuất hợp đồng.")
        return
    }
    if (isSigned.value) {
        notificationService.error("Hợp đồng đã được ký, không thể xuất lại.")
        return
    }
    if (isOrderLocked.value) {
        notificationService.error("Trạng thái đơn hàng không cho phép xuất hợp đồng.")
        return
    }

    if (!props.order.id) return
    try {
        setLoading(true)
        const res = await api.post("/orders/" + props.order.id + "/export-contract", { file_type: type })
        window.open(config.api_be + `/file/${res.data.data.file_id}?download=0`, '_blank');
        fetchOrderDetail() // Reload order detail after export
    } catch (e) {
        console.error("Error exporting contract:", e)
    } finally {
        setLoading(false)
    }
}
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

const downloadFile = async (fileId) => {
    if (!fileId) return
    window.open(config.api_be + `/file/${fileId}?download=1`, '_blank');
}
</script>

<style scoped>
.input-form {
    @apply block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs;
}

.input-form:disabled {
    @apply bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed;
}

/* Custom scrollbar for modal content */
.modal-content::-webkit-scrollbar {
    width: 6px;
}

.modal-content::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800;
}

.modal-content::-webkit-scrollbar-thumb {
    @apply bg-gray-400 dark:bg-gray-600 rounded-full;
}

.modal-content::-webkit-scrollbar-thumb:hover {
    @apply bg-gray-500 dark:bg-gray-500;
}
button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>