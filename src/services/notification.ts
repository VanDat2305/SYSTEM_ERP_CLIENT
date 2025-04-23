import { useNotificationStore } from '@/stores/notification'

export class NotificationService {
  private store = useNotificationStore()

  success(message: string, duration = 3000) {
    this.store.addNotification({ message, type: 'success', duration })
  }

  error(message: string, duration = 3000) {
    this.store.addNotification({ message, type: 'error', duration })
  }

  warning(message: string, duration = 3000) {
    this.store.addNotification({ message, type: 'warning', duration })
  }

  info(message: string, duration = 3000) {
    this.store.addNotification({ message, type: 'info', duration })
  }
}

export const notificationService = new NotificationService()
