<template>
    <transition name="modal-fade">
        <div v-if="show" class="fixed inset-0 z-[99999] flex items-center justify-center bg-black bg-opacity-80 overlay"
            @click.self="handleOverlayClick" >
            <div :class="[
                'relative bg-white dark:bg-gray-900 shadow-2xl w-full p-0 overflow-hidden modal-content',
                sizeClass,
                size === 'full' ? 'rounded-none h-full' : 'rounded-2xl max-h-[90vh]'
            ]">
                <!-- Close Button -->
                <button @click="close" class="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl z-10">
                    ×
                </button>

                <!-- Header Slot -->
                <div v-if="$slots.header" class="px-6 py-4">
                    <slot name="header" />
                </div>

                <!-- Body Slot -->
                <div class="px-6 py-4 overflow-y-auto max-h-[60vh] modal-content">
                    <slot name="body" />
                </div>

                <!-- Footer Slot -->
                <div v-if="$slots.footer" class=" px-6 py-4 gap-2">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    show: Boolean,
    close: Function,
    size: {
        type: String,
        default: 'md',
        validator: (v) => ['sm', 'md', 'lg', 'xl', 'full'].includes(v)
    },
    closeOnClickOutside: {
        type: Boolean,
        default: true
    }
})

const sizeClass = computed(() => {
    return {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
        full: 'w-full'
    }[props.size]
})
const handleOverlayClick = () => {
  if (props.closeOnClickOutside) {
    props.close()
  }
}
</script>

<style scoped>
.overlay {
    background: linear-gradient(135deg, rgba(173, 216, 230, 0.5), rgba(220, 248, 220, 0.3), rgba(255, 182, 193, 0.3));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); /* For Safari support */
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
    opacity: 1;
    transform: translateY(0) scale(1);
}
</style>