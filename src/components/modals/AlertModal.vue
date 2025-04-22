<template>
    <BaseModal :show="show" :close="close" :size="size" :closeOnClickOutside="closeOnClickOutside">
        
        <!-- Body Slot -->
        <template #body>
            <div class="flex flex-col items-center justify-center text-center p-6">
                <!-- Icon -->
                <div :class="iconWrapperClass">

                    <!-- Danger SVG -->
                    <div v-if="type === 'danger'"
                        class="w-14 h-14 bg-error-400 flex items-center justify-center rounded-full">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <!-- Success SVG -->
                    <div v-if="type === 'success'"
                        class="w-14 h-14 bg-success-400 flex items-center justify-center rounded-full">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <!-- Info SVG -->
                    <div v-if="type === 'info'"
                        class="w-14 h-14 bg-blue-light-400 flex items-center justify-center rounded-full">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    

                    <!-- Warning SVG -->
                    <div v-if="type === 'warning'"
                        class="w-14 h-14 bg-orange-400 flex items-center justify-center rounded-full">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v3m0 3h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                        </svg>
                    </div>


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

// Dynamic classes based on alert type
const iconWrapperClass = computed(() => {
    return {
        danger: 'text-error-600',
        success: ' text-success-600',
        info: 'text-blue-light-600',
        warning: 'text-orange-600',
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
.rounded-full {
    border-radius: 50%;
    /* Tạo hình tròn */
}
</style>