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
        </div>
        <div class="flex justify-center gap-4">
          <button @click="close" class="btn-cancel">
            {{ cancelText }}
          </button>
          <button @click="onConfirm" :class="confirmButtonClass">
            {{ confirmText }}
          </button>
        </div>
      </template>

    </BaseModal>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import BaseModal from './BaseModal.vue';
  import { SuccessIcon, ErrorIcon, WarningIcon, InfoCircleIcon } from '@/icons';
  
  const props = defineProps({
    show: Boolean,
    title: { type: String, default: 'Confirm Action' },
    message: { type: String, default: 'Are you sure you want to proceed?' },
    close: Function,
    onConfirm: Function,
    size: { type: String, default: 'lg' },
    closeOnClickOutside: { type: Boolean, default: true },
    type: {
      type: String,
      default: 'warning',
      validator: (v) => ['danger', 'success', 'info', 'warning', 'custom'].includes(v),
    },
    confirmText: { type: String, default: 'Confirm' },
    cancelText: { type: String, default: 'Cancel' },
  });
  
  // Map icon component
  const iconComponent = computed(() => ({
    danger: ErrorIcon,
    warning: WarningIcon,
    info: InfoCircleIcon,
    success: SuccessIcon,
    custom: InfoCircleIcon,
  }[props.type]));
  
  // Icon color
  const iconColorClass = computed(() => ({
    danger: 'text-error-700',
    success: 'text-success-700',
    info: 'text-blue-light-700',
    warning: 'text-orange-700',
    custom: 'text-blue-700',
  }[props.type]));
  
  // Icon wrapper background color
  const iconWrapperClass = computed(() => ({
    danger: 'bg-error-100',
    success: 'bg-success-100',
    info: 'bg-blue-light-100',
    warning: 'bg-orange-100',
    custom: 'bg-gray-100',
  }[props.type]));
  
  // Confirm button style
  const confirmButtonClass = computed(() => ({
    danger: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600',
    success: 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600',
    info: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600',
    warning: 'px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600',
    custom: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600',
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
  