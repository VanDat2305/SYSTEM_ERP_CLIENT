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

                <!-- Message -->
                <p class="text-gray-600 dark:text-gray-300 mt-2 text-sm">
                    {{ message }}
                </p>
            </div>
        </template>

        <!-- Footer Slot -->
        <template #footer>
            <div class="flex justify-center gap-4">
                <button @click="close" :class="cancelButtonClass">
                    Cancel
                </button>
                <button @click="onConfirm" :class="confirmButtonClass">
                    Confirm
                </button>
            </div>
        </template>
    </BaseModal>
</template>

<script setup>
import { computed } from 'vue';
import BaseModal from './BaseModal.vue';

const props = defineProps({
    show: {
        type: Boolean,
        required: true,
    },
    title: {
        type: String,
        default: 'Confirm Action',
    },
    message: {
        type: String,
        default: 'Are you sure you want to proceed?',
    },
    close: {
        type: Function,
        required: true,
    },
    onConfirm: {
        type: Function,
        required: true,
    },
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
        default: 'warning', // Mặc định là warning để phù hợp với modal xác nhận
        validator: (v) => ['danger', 'success', 'info', 'warning', 'custom'].includes(v),
    },
});

// Dynamic classes based on type
const iconWrapperClass = computed(() => {
    return {
        danger: 'text-red-500',
        success: 'text-green-500',
        info: 'text-blue-500',
        warning: 'text-orange-500',
        custom: 'text-blue-500', // Cho icon ngôi sao
    }[props.type];
});

const titleClass = computed(() => {
    return {
        danger: 'text-gray-900',
        success: 'text-gray-900',
        info: 'text-gray-900',
        warning: 'text-gray-900',
        custom: 'text-gray-900',
    }[props.type];
});

const confirmButtonClass = computed(() => {
    return {
        danger: 'px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600',
        success: 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600',
        info: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600',
        warning: 'px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600',
        custom: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600',
    }[props.type];
});

const cancelButtonClass = computed(() => {
    return 'px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400';
});
</script>

<style scoped>

</style>