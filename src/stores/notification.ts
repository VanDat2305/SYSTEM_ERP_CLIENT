import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 10)
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 3000,
    }
    notifications.value.push(newNotification)

    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }

  const removeNotification = async (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      await nextTick()
    }
  }

  return { notifications, addNotification, removeNotification }
})
