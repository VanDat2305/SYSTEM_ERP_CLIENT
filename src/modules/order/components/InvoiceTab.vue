<template>
  <div class="p-4">
    <div v-if="isLoading" class="py-8 text-center text-gray-500 text-xs">Đang tải dữ liệu hóa đơn...</div>
    <template v-else-if="invoiceDetail">
      <fieldset class="p-5 rounded-2xl shadow border border-yellow-100 dark:border-yellow-700 mb-6">
        <legend
          class="flex items-center gap-1 text-xs font-bold text-yellow-700 dark:text-yellow-300 uppercase tracking-widest px-1">
          Thông tin hóa đơn
        </legend>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Số hóa đơn</label>
            <input type="text" :value="invoiceDetail.invoice_number || '-'" disabled placeholder="Sinh tự động"
              class="input-form mt-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Ngày xuất hóa đơn</label>
            <input type="text"
              :value="invoiceDetail.invoice_exported_at ? formatDate(invoiceDetail.invoice_exported_at) : '-'" disabled
              class="input-form mt-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Trạng thái hóa đơn</label>
            <SelectSearch v-model="invoiceDetail.invoice_status" :options="statusOptions" disabled class="mt-2" />
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <!-- Xuất/Gửi lại hóa đơn -->
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 block">Tệp hóa đơn</label>
            <div class="flex gap-2 mb-2">
              <button :disabled="!canExportInvoice || isOrderUnpaid || isOrderLocked"
                v-if="!invoiceDetail.invoice_file_id && !isInvoiceExported"
                class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                @click="() => exportInvoiceFile('pdf')">
                <i class="fas fa-file-pdf mr-2"></i> Xuất PDF
              </button>
              <button :disabled="!canResendInvoice || !invoiceDetail.invoice_file_id"
                class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                @click="resendInvoiceFile">
                <i class="fas fa-envelope mr-2"></i> Gửi lại hóa đơn
              </button>
            </div>
          </div>
          <!-- Tải hóa đơn -->
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200 mb-2 block">Tải hóa đơn</label>
            <div v-if="invoiceDetail.invoice_file_id" class="mb-2 flex gap-2">
              <button
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                @click="() => downloadFile(invoiceDetail.invoice_file_id)">
                <i class="fas fa-download mr-2"></i> Tải hóa đơn
              </button>
              <button
                class="flex-1 px-4 py-2 bg-yellow-700 hover:bg-yellow-800  text-white text-xs font-medium rounded-lg transition-colors duration-200"
                @click="() => viewFile(invoiceDetail.invoice_file_id)">
                <i class="fas fa-download mr-2"></i> Xem hóa đơn
              </button>
              <button v-if="canDeleteInvoice && !isOrderLocked"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                @click="confirmDeleteInvoiceFile">
                <i class="fas fa-trash-alt mr-2"></i> Xóa hóa đơn
              </button>
            </div>
          </div>
        </div>
      </fieldset>
      <fieldset class="p-4 rounded-xl shadow border border-gray-100 dark:border-gray-800 mb-6">
        <legend class="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 px-1">Thông tin thanh toán
        </legend>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Trạng thái thanh toán</label>
            <SelectSearch v-model="invoiceDetail.payment_status" :options="paymentStatusOption" disabled class="mt-2" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Ngày thanh toán</label>
            <input type="text" :value="invoiceDetail.paid_at ? formatDate(invoiceDetail.paid_at) : '-'" disabled
              class="input-form mt-2 bg-gray-50 dark:bg-gray-700" />
          </div>
          <!-- <div>
            <label class="text-xs font-bold text-gray-700 dark:text-gray-200">Phương thức</label>
            <div class="mt-1 text-xs">{{ invoiceDetail.payment_method || '-' }}</div>
          </div> -->
        </div>
      </fieldset>
      <fieldset class="p-4 rounded-xl border shadow border border-gray-100 dark:border-gray-800 mb-6">
        <legend class="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300 px-1">Lịch sử thanh toán
        </legend>
          <button 
          v-if="!isOrderLocked && hasPermission('orders.export-invoice') && invoiceDetail.payment_status !== 'paid'"
          class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
          @click="() => showPaymentModal = true">
        <span class="text-xs font-medium text-white">Thêm thanh toán</span>
        </button>
        
        <table class="w-full text-xs">
          <thead>
            <tr class="text-center">
              <th class="font-bold p-2">STT</th>
              <th class="font-bold p-2">Ngày</th>
              <th class="font-bold p-2">Số tiền</th>
              <th class="font-bold p-2">Phương thức</th>
              <th class="font-bold p-2">Trạng thái</th>
              <th class="font-bold p-2">Mã giao dịch</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in invoiceDetail.payments" :key="payment.id"
              class="border-t border-gray-200 hover:bg-gray-50 text-center">
              <td class="p-2">{{ index + 1 }}</td>
              <td class="p-2">{{ formatDate(payment.payment_date) }}</td>
              <td class="p-2">{{ formatCurrency(payment.amount_paid) }}</td>
              <td class="p-2">{{ t("invoices.payment_methods."+payment.payment_method) }}</td>
              <td class="p-2">
                <span :class="{
                  'text-green-600': payment.status === 'successful',
                  'text-red-600': payment.status === 'failed',
                  'text-yellow-600': payment.status === 'pending'
                }" class="font-medium">
                  {{ t(`invoices.payment_status.${payment.status}`) }}
                </span>
              </td>
              <td class="p-2">{{ payment.payment_reference || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </fieldset>

    </template>
  </div>
  <ConfirmModal :show="showConfirmDeleteModal" :close="() => showConfirmDeleteModal = false"
    :onConfirm="handleConfirmDelete" type="danger" :closeOnClickOutside="false" :title="t('common.confirm')"
    :message="confirmMessage" :confirmText="t('common.yes')" :cancelText="t('common.no')" />
  <AddPayment
    :show="showPaymentModal"
    :order-id="invoiceDetail?.id || props.order.id"
    :order="invoiceDetail || props.order"
    :onSuccess="fetchInvoiceDetail"
    :onClose="() => showPaymentModal = false"
  />
</template>

<script setup>
import { ref, watch, onMounted, inject, computed } from 'vue'
import { api } from '@/utils/api'
import config from '@/config/config'
import { useI18n } from 'vue-i18n'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import AddPayment from '@/modules/order/components/AddPayment.vue'

const showPaymentModal = ref(false)
const selectedOrderId = ref(null)


const setLoading = inject('setLoading', () => { })
const { hasPermission } = usePermissions()
const { t } = useI18n()

const props = defineProps({
  order: Object,
  isActive: Boolean
})

const invoiceDetail = ref(null)
const isLoading = ref(false)
const statusOptions = ref([
  { value: 'pending', label: t('invoices.status.pending') },
  { value: 'exported', label: t('invoices.status.exported') },
  { value: 'cancelled', label: t('invoices.status.cancelled') }
])
const paymentStatusOption = ref([
  { value: 'unpaid', label: t('invoices.payment_status.unpaid') },
  { value: 'paid', label: t('invoices.payment_status.paid') },
  { value: 'partially_paid', label: t('invoices.payment_status.partially_paid') },
  { value: 'failed', label: t('invoices.payment_status.failed') },
])

const showConfirmDeleteModal = ref(false)
const confirmMessage = ref('')

const fetchInvoiceDetail = async () => {
  if (!props.order.id) return
  setLoading(true)
  try {
    // Gọi API lấy chi tiết hóa đơn (hoặc dùng order nếu đã trả về sẵn)
    const res = await api.get('/orders/' + props.order.id)
    invoiceDetail.value = res.data.data || null
  } catch (e) {
    invoiceDetail.value = null
  } finally {
    setLoading(false)
  }
}
const isOrderLocked = computed(() => ['cancelled', 'completed'].includes(invoiceDetail.value?.order_status))
const isOrderUnpaid = computed(() => invoiceDetail.value?.payment_status !== 'paid')
const isInvoiceExported = computed(() => invoiceDetail.value?.invoice_status === 'exported')
const canExportInvoice = computed(() => hasPermission('orders.export-invoice'))
const canResendInvoice = computed(() => hasPermission('orders.resend-invoice'))
const canDeleteInvoice = computed(() => hasPermission('orders.delete-invoice'))

const confirmDeleteInvoiceFile = () => {
  showConfirmDeleteModal.value = true
  confirmMessage.value = 'Bạn có chắc chắn muốn xóa file hóa đơn này không?'
}
const handleConfirmDelete = async () => {
  setLoading(true)
  try {
    await api.delete('/orders/' + props.order.id + '/invoice-file')
    notificationService.success('Đã xóa hóa đơn thành công.')
    fetchInvoiceDetail()
    showConfirmDeleteModal.value = false
  } catch (e) {
    notificationService.error('Không thể xóa hóa đơn. Vui lòng thử lại sau.')
  } finally {
    setLoading(false)
  }
}

watch(() => props.isActive, (show) => {
  if (show) fetchInvoiceDetail()
})
onMounted(() => {
  if (props.isActive) fetchInvoiceDetail()
})

const exportInvoiceFile = async (type = 'pdf') => {
  console.log(12323);
  
  if (isInvoiceExported.value) {
    notificationService.error('Hóa đơn đã được xuất trước đó.')
    return
  }
  if (!canExportInvoice.value) {
    notificationService.error('Bạn không có quyền xuất hóa đơn.')
    return
  }
  if (isOrderUnpaid.value) {
    notificationService.error('Đơn hàng chưa thanh toán, không thể xuất hóa đơn.')
    return
  }
  if (isOrderLocked.value) {
    notificationService.error('Trạng thái đơn hàng không cho phép xuất hóa đơn.')
    return
  }
  if (!props.order.id) return
  try {
    setLoading(true)
    const res = await api.post('/orders/' + props.order.id + '/export-invoice', { file_type: type })
    window.open(config.api_be + `/file/${res.data.data.invoice_file_id}?download=0`, '_blank')
    fetchInvoiceDetail()
  } catch (e) {
    notificationService.error('Xuất hóa đơn thất bại.')
  } finally {
    setLoading(false)
  }
}

const resendInvoiceFile = async () => {
  if (!canResendInvoice.value) {
    notificationService.error('Bạn không có quyền gửi lại hóa đơn.')
    return
  }
  if (!props.order.id || !invoiceDetail.value?.invoice_file_id) return
  try {
    setLoading(true)
    await api.post('/orders/' + props.order.id + '/resend-invoice')
    notificationService.success('Đã gửi lại hóa đơn thành công.')
  } catch (e) {
    notificationService.error('Gửi lại hóa đơn thất bại.')
  } finally {
    setLoading(false)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
const viewFile = (fileId) => {
  if (!fileId) return
  window.open(config.api_be + `/file/${fileId}`, '_blank')
}
const downloadFile = (fileId) => {
  if (!fileId) return
  window.open(config.api_be + `/file/${fileId}?download=1`, '_blank')
}
const formatCurrency = (amount) => {
  const currency = 'VND'
  return new Intl.NumberFormat('vi', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount || 0)
}
</script>

<style scoped>
.input-form {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs;
}

.input-form:disabled {
  @apply bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed;
}
button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
