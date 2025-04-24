<template>
    <div class="fixed bottom-5 right-5 z-[99999] flex flex-col gap-3">
      <transition-group name="slide" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="[
            'flex mt-2 items-center justify-between rounded-xl px-4 py-3 min-w-[320px] relative overflow-hidden shadow-md border-l-4 transition-all duration-300',
            notification.type === 'success' ? 'bg-white dark:bg-success-900 text-success-800 dark:text-success-100 border-success-500' :
            notification.type === 'error' ? 'bg-white dark:bg-error-900 text-error-800 dark:text-error-100 border-error-500' :
            notification.type === 'warning' ? 'bg-white dark:bg-warning-900 text-warning-800 dark:text-warning-100 border-warning-500' :
            'bg-white dark:bg-blue-light-900 text-blue-light-800 dark:text-blue-light-100 border-blue-light-500'
          ]"
        >

          <div class="flex items-center gap-3 flex-1">
            <component
              :is="iconForType(notification.type)"
              :class="[
                'p-1.5 rounded-md',
                notification.type === 'success' ? 'bg-success-100 dark:bg-success-800 text-success-600 dark:text-success-200' :
                notification.type === 'error' ? 'bg-error-100 dark:bg-error-800 text-error-600 dark:text-error-200' :
                notification.type === 'warning' ? 'bg-warning-100 dark:bg-warning-800 text-warning-600 dark:text-warning-200' :
                'bg-blue-light-100 dark:bg-blue-light-800 text-blue-light-600 dark:text-blue-light-200'
              ]"
            />
            <span class="text-sm font-medium leading-snug">{{ notification.message }}</span>
          </div>
          <button
            class="ml-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white"
            @click="handleRemoveNotification(notification.id)"
            aria-label="Close notification"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </transition-group>
    </div>
  </template>
  

<script lang="ts">
import { defineComponent } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { SuccessIcon, ErrorIcon, WarningIcon, InfoCircleIcon } from '@/icons'

export default defineComponent({
    name: 'Notification',
    setup() {
        const store = useNotificationStore()
        const notifications = store.notifications

        const iconForType = (type: string) => {
            switch (type) {
                case 'success':
                    return SuccessIcon
                case 'error':
                    return ErrorIcon
                case 'warning':
                    return WarningIcon
                case 'info':
                default:
                    return InfoCircleIcon
            }
        }

        const handleRemoveNotification = (id: string) => {
            store.removeNotification(id)
        }

        return { notifications, iconForType, handleRemoveNotification }
    },
})
</script>

