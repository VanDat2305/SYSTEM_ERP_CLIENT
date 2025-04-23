<template>
    <BaseModal :show="show" :close="close" :size="size" :closeOnClickOutside="closeOnClickOutside">
        <template #body>
            <div class="flex flex-col items-center justify-center text-center p-6">

                <div class="w-14 h-14 flex items-center justify-center rounded-full" :class="{
                    'bg-error-100': type === 'danger',
                    'bg-success-100': type === 'success',
                    'bg-blue-light-100': type === 'info',
                    'bg-orange-100': type === 'warning',
                }">
                    <component :is="{
                        danger: ErrorIcon,
                        warning: WarningIcon,
                        info: InfoCircleIcon,
                        success: SuccessIcon
                    }[type]" class="notification-icon" :class="iconColorClass" />
                </div>
                <!-- Title -->
                <h2 class="text-xl font-semibold mt-4" :class="titleClass">
                    {{ title }}
                </h2>
                <!-- Description -->
                <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    {{ description }}
                </p>
            </div>
            <div class="flex justify-center">

                <button :class="buttonClass" @click="close">
                    Okay, Got It!
                </button>
            </div>
        </template>

    </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { SuccessIcon, ErrorIcon, WarningIcon, InfoCircleIcon } from '@/icons'

const props = defineProps({
    show: Boolean,
    close: Function,
    size: {
        type: String,
        default: 'lg',
        validator: (v) => ['sm', 'md', 'lg', 'xl', 'full'].includes(v),
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: 'info',
        validator: (v) => ['danger', 'success', 'info', 'warning'].includes(v),
    },
    title: {
        type: String,
        default: 'Alert!',
    },
    description: {
        type: String,
        default: 'This is an alert message.',
    },
})

const iconColorClass = computed(() => {
  return {
    danger: 'text-error-700',
    success: 'text-success-700',
    info: 'text-blue-light-700',
    warning: 'text-orange-700',
  }[props.type]
})


const titleClass = computed(() => {
    return {
        danger: 'text-gray-900',
        success: 'text-gray-900',
        info: 'text-gray-900',
        warning: 'text-gray-900',
    }[props.type]
})

const buttonClass = computed(() => {
    return {
        danger: 'bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg',
        success: 'bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg',
        info: 'bg-blue-light-600 hover:bg-blue-light-700 text-white px-4 py-2 rounded-lg',
        warning: 'bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg',
    }[props.type]
})
</script>

<style scoped>
/* Icon wrapper styling */
.notification-icon {
    width: 2rem;
    height: 2rem;
}

.rounded-full {
    border-radius: 50%;
}
</style>