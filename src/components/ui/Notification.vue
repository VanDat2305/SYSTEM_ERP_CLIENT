<template>
    <div class="notification-container">
        <transition-group name="slide" tag="div">
            <div v-for="notification in notifications" :key="notification.id"
                :class="['notification', notification.type]">
                <div class="notification-content">
                    <component :is="iconForType(notification.type)" class="notification-icon" />
                    <span class="notification-message">{{ notification.message }}</span>
                </div>
                <button class="close-button" @click="handleRemoveNotification(notification.id)"
                    aria-label="Close notification">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
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

<style scoped>
.notification-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.notification {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #fff;
    border-radius: 12px;
    padding: 12px 16px;
    min-width: 320px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-left: 6px solid transparent;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    margin-top: 10px;
}

/* Left icon + text */
.notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

/* Icon (left) */
.notification-icon {
    background-color: #e6f9f0;
    /* Light green by default */
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Message */
.notification-message {
    font-size: 14px;
    font-weight: 500;
    color: #1d2939;
    line-height: 1.4;
}

/* Close button */
.close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #98a2b3;
    transition: color 0.2s ease;
}

.close-button:hover {
    color: #475467;
}

/* Border bottom bar */
.notification::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background-color: transparent;
}



.notification.success .notification-icon {
    background-color: #ecfdf3;
    color: #039855;
}

.notification.success::after {
    background-color: #12b76a;
}


.notification.error .notification-icon {
    background-color: #fef3f2;
    color: #d92d20;
}

.notification.error::after {
    background-color: #f04438;
}

.notification.warning .notification-icon {
    background-color: #fffaeb;
    color: #dc6803;
}

.notification.warning::after {
    background-color: #f79009;
}

.notification.info .notification-icon {
    background-color: #eff8ff;
    color: #1570ef;
}

.notification.info::after {
    background-color: #2e90fa;
}

/* Transition */
.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

.notification::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4px;
    width: 100%;
    background-color: currentColor;
    transform: scaleX(1);
    transform-origin: left;
    animation: progress-bar 5s linear forwards;
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
}

@keyframes progress-bar {
    from {
        transform: scaleX(1);
    }

    to {
        transform: scaleX(0);
    }
}
</style>