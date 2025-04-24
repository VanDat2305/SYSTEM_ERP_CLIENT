<template>
    <BaseModal :show="show" :close="close" :size="size" :closeOnClickOutside="closeOnClickOutside">
        <template #body>
            <div class="flex flex-col items-center justify-center text-center p-6">
                <!-- Icon wrapper -->
                <div class="w-14 h-14 flex items-center justify-center rounded-full" :class="bgClass">
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

            <!-- Action button -->
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
        validator: v => ['sm', 'md', 'lg', 'xl', 'full'].includes(v),
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true,
    },
    type: {
        type: String,
        default: 'info',
        validator: v => ['danger', 'success', 'info', 'warning'].includes(v),
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

// Màu nền icon wrapper
const bgClass = computed(() => {
    return {
        danger: 'bg-red-100 dark:bg-red-800',
        success: 'bg-green-100 dark:bg-green-800',
        info: 'bg-blue-100 dark:bg-blue-800',
        warning: 'bg-yellow-100 dark:bg-yellow-800',
    }[props.type]
})

// Màu của icon
const iconColorClass = computed(() => {
    return {
        danger: 'text-red-600 dark:text-red-200',
        success: 'text-green-600 dark:text-green-200',
        info: 'text-blue-600 dark:text-blue-200',
        warning: 'text-yellow-600 dark:text-yellow-200',
    }[props.type]
})

// Màu tiêu đề
const titleClass = computed(() => {
    return 'text-gray-900 dark:text-white'
})

// Màu nút
const buttonClass = computed(() => {
    return {
        danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg',
        success: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg',
        info: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg',
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