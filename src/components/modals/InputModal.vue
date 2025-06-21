<template>
  <BaseModal :show="show" :close="close" :size="size" :closeOnClickOutside="closeOnClickOutside">
    <!-- Body -->
    <template #body>
      <div class="flex flex-col items-center justify-center text-center p-6">
        <!-- Icon Wrapper -->
        <div
          class="w-14 h-14 flex items-center justify-center rounded-full"
          :class="iconWrapperClass"
        >
          <component
            :is="iconComponent"
            class="notification-icon"
            :class="iconColorClass"
          />
        </div>

        <!-- Title -->
        <h2 class="text-xl font-semibold mt-4 text-gray-900 dark:text-gray-300">
          {{ title }}
        </h2>

        <!-- Message -->
        <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          {{ message }}
        </p>

        <!-- Input Field -->
        <div class="w-full mt-4">
          <label v-if="inputLabel" class="text-center block text-left text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ inputLabel }}
          </label>
          <input
            v-model="inputValue"
            :type="inputType"
            :placeholder="inputPlaceholder"
            :required="inputRequired"
            class="w-full border text-xs px-3 py-2 border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-200 dark:bg-gray-600 dark:text-white"
          />
          <p v-if="errorMessage" class="text-red-500 text-xs mt-1 text-left">
            {{ errorMessage }}
          </p>
        </div>
      </div>
      <div class="flex justify-center gap-4 mb-5">
        <button @click="close" class="btn-cancel text-xs">
          {{ cancelText }}
        </button>
        <button @click="handleConfirm" class="text-xs" :class="confirmButtonClass" :disabled="isConfirmDisabled">
          {{ confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import { SuccessIcon, ErrorIcon, WarningIcon, InfoCircleIcon } from '@/icons';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  show: Boolean,
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Please provide additional information:' },
  close: Function,
  onConfirm: { type: Function, default: () => {} },
  size: { type: String, default: 'lg' },
  closeOnClickOutside: { type: Boolean, default: true },
  type: {
    type: String,
    default: 'warning',
    validator: (v) => ['danger', 'success', 'info', 'warning', 'custom'].includes(v),
  },
  confirmText: { type: String, default: 'Xác nhận' },
  cancelText: { type: String, default: 'Hủy' },
  // Input related props
  inputLabel: { type: String, default: '' },
  inputPlaceholder: { type: String, default: '' },
  inputType: { type: String, default: 'text' },
  inputRequired: { type: Boolean, default: false },
  inputValidator: { type: Function, default: () => true },
  initialValue: { type: String, default: '' }
});

const emit = defineEmits(['update:show', 'confirm']);

const inputValue = ref(props.initialValue);
const errorMessage = ref('');

watch(() => props.show, (newVal) => {
  if (newVal) {
    inputValue.value = props.initialValue;
    errorMessage.value = '';
  }
});

const isConfirmDisabled = computed(() => {
  return props.inputRequired && !inputValue.value.trim();
});

const handleConfirm = () => {
  if (props.inputRequired && !inputValue.value.trim()) {
    errorMessage.value = 'This field is required';
    return;
  }

  if (typeof props.inputValidator !== 'function') {
    
    props.onConfirm(inputValue.value);
    return;
  }
  
  if (!props.inputValidator(inputValue.value)) {
    errorMessage.value = 'Giá trị nhập không hợp lệ';
    return;
  }
  
  props.onConfirm(inputValue.value);
  props.close();
};

// Icon and styling computed properties (same as ConfirmModal)
const iconComponent = computed(() => ({
  danger: ErrorIcon,
  warning: WarningIcon,
  info: InfoCircleIcon,
  success: SuccessIcon,
  custom: InfoCircleIcon,
}[props.type]));

const iconColorClass = computed(() => ({
  danger: 'text-error-700',
  success: 'text-success-700',
  info: 'text-blue-light-700',
  warning: 'text-orange-700',
  custom: 'text-blue-700',
}[props.type]));

const iconWrapperClass = computed(() => ({
  danger: 'bg-error-100',
  success: 'bg-success-100',
  info: 'bg-blue-light-100',
  warning: 'bg-orange-100',
  custom: 'bg-gray-100',
}[props.type]));

const confirmButtonClass = computed(() => ({
  danger: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-300',
  success: 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300',
  info: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300',
  warning: 'px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-orange-300',
  custom: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300',
}[props.type]));
</script>

<style scoped>
.notification-icon {
  width: 2rem;
  height: 2rem;
}
.btn-cancel {
  @apply px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400;
}
</style>