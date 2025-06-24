<template>
    <BaseModal :show="show" :close="handleClose" :size="'sm'" :closeOnClickOutside="false">
        <template #header>
            <div class="text-base font-semibold text-gray-900 dark:text-white">Ghi nhận thanh toán</div>
        </template>
        <template #body>
            <form @submit.prevent="handleSubmit" class="space-y-4 p-2" >
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">Số tiền thanh
                        toán *</label>
                    <input 
                        type="number" 
                        v-model="amount" 
                        class="input-form"
                        :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.amount }"
                        placeholder="Nhập số tiền thực nhận" 
                        @blur="validateAmount"
                        @input="clearError('amount')"
                    />
                    <div v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount }}</div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">Ngày thanh toán *</label>
                    <flat-pickr 
                        v-model="paymentDate"
                        :config="datePickerConfig"
                        @on-change="validatePaymentDate"
                        class="input-form"
                        :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-500': errors.paymentDate }"
                        placeholder='dd/mm/yyyy'
                    />
                    <div v-if="errors.paymentDate" class="text-red-500 text-xs mt-1">{{ errors.paymentDate }}</div>
                </div>
                
                <div class="mb-4">
                    <label class="block text-xs font-bold text-gray-700 dark:text-gray-200 mb-1">Phương thức</label>
                    <select v-model="paymentMethod" class="input-form">
                        <option value="cash">Tiền mặt</option>
                        <option value="bank_transfer">Chuyển khoản</option>
                        <!-- <option value="vnpay">VNPAY</option> -->
                        <!-- <option value="momo">Momo</option> -->
                    </select>
                </div>
                <div v-if="errorMessage" class="text-red-500 text-xs mt-2 p-1">{{ errorMessage }}</div>
                <div class="flex justify-end gap-2 mt-6">
                    <button type="button" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-xs font-medium"
                        @click="handleClose">Hủy</button>
                    <button 
                        type="submit"
                        :disabled="isLoading || !isFormValid"
                        class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-medium"
                    >
                        {{ isLoading ? 'Đang lưu...' : 'Lưu thanh toán' }}
                    </button>
                </div>
            </form>
            
        </template>
    </BaseModal>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { api } from '@/utils/api'
import BaseModal from '@/components/modals/BaseModal.vue'
import flatPickr from 'vue-flatpickr-component'
import 'flatpickr/dist/flatpickr.css'
import { Vietnamese } from 'flatpickr/dist/l10n/vn.js'

const props = defineProps({
    show: Boolean,
    orderId: String,
    onSuccess: Function, // Callback khi ghi nhận thành công
    onClose: Function,   // Callback đóng modal
    order: Object // Thông tin đơn hàng, nếu cần hiển thị thêm thông tin
})

const amount = ref('')
const paymentDate = ref('')
const paymentMethod = ref('cash')
const note = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const errors = ref({})

// Computed để kiểm tra form có hợp lệ không
const isFormValid = computed(() => {
    return amount.value && 
           paymentDate.value && 
           Object.keys(errors.value).length === 0
})

// Config cho flat-pickr
const datePickerConfig = {
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d/m/Y",
    maxDate: 'today',
    altInputClass: "block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-2 px-3",
    locale: Vietnamese,
    allowInput: true,
    disableMobile: true
}

watch(() => props.show, (val) => {
    if (val) resetForm()
})

const resetForm = () => {
    amount.value = ''
    paymentDate.value = ((new Date()).toISOString().slice(0, 10))
    paymentMethod.value = 'cash'
    note.value = ''
    errors.value = {}
    errorMessage.value = ''
}

const clearError = (field) => {
    if (errors.value[field]) {
        delete errors.value[field]
    }
}

const validateAmount = () => {
    clearError('amount')
    
    if (!amount.value) {
        errors.value.amount = 'Số tiền không được để trống'
        return false
    }
    
    const amountNum = parseFloat(amount.value)
    
    if (amountNum <= 0) {
        errors.value.amount = 'Số tiền phải lớn hơn 0'
        return false
    }
    
    // Kiểm tra không vượt quá tổng tiền đơn hàng
    if (props.order && props.order.total_amount) {
        const totalAmount = parseFloat(props.order.total_amount)
        let paidAmount = 0
        
        props.order.payments?.forEach(payment => {
            if (payment.amount_paid && !isNaN(parseFloat(payment.amount_paid)) && payment.status === 'successful') {
                paidAmount = paidAmount +  parseFloat(payment.amount_paid)
            }
        })
        
        const remainingAmount = totalAmount - paidAmount
        
        if (amountNum > remainingAmount) {
            errors.value.amount = `Số tiền không được vượt quá ${remainingAmount.toLocaleString()} VNĐ (số tiền còn lại)`
            return false
        }
    }
    
    return true
}

const validatePaymentDate = () => {
    clearError('paymentDate')
    
    if (!paymentDate.value) {
        errors.value.paymentDate = 'Ngày thanh toán không được để trống'
        return false
    }
    
    const selectedDate = new Date(paymentDate.value)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of today
    
    if (selectedDate > today) {
        errors.value.paymentDate = 'Ngày thanh toán không được sau ngày hiện tại'
        return false
    }
    
    return true
}

const validateForm = () => {
    const isAmountValid = validateAmount()
    const isDateValid = validatePaymentDate()
    
    return isAmountValid && isDateValid
}

const handleClose = () => {
    props.onClose && props.onClose()
}

const handleSubmit = async () => {
    if (!validateForm()) {
        errorMessage.value = 'Vui lòng kiểm tra lại thông tin đã nhập'
        return
    }
    
    if (!props.orderId) {
        errorMessage.value = 'Không tìm thấy thông tin đơn hàng'
        return
    }
    
    isLoading.value = true
    errorMessage.value = ''
    
    try {
        await api.post(`/orders/${props.orderId}/add-payment`, {
            amount_paid: parseFloat(amount.value),
            payment_method: paymentMethod.value,
            payment_date: paymentDate.value,
        })
        
        props.onSuccess && props.onSuccess()
        handleClose()
    } catch (e) {
        console.error('Error adding payment:', e)
        
        // Xử lý lỗi cụ thể từ API nếu có
        if (e.response && e.response.data && e.response.data.message) {
            errorMessage.value = e.response.data.message
        } else {
            errorMessage.value = 'Có lỗi xảy ra khi lưu thanh toán. Vui lòng thử lại.'
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    if (props.show) resetForm()
})
</script>

<style scoped>
.input-form {
  @apply block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-2 px-3;
}

.input-form:disabled {
  @apply bg-gray-100 dark:bg-gray-700 cursor-not-allowed;
}
</style>