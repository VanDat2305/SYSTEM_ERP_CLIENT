import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/team'
import { api } from "@/utils/api";

export const useUserStore = defineStore('listUser', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!currentUser.value)

  const fetchUsers = async (): Promise<User[]> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/users')
      
      if (response.data.status) {
        users.value = response.data.data || response.data.users || []
        return users.value
      } else {
        throw new Error(response.data.message || 'Failed to fetch users')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch users'
      throw err
    } finally {
      loading.value = false
    }
  }

  // const fetchCurrentUser = async (): Promise<User> => {
  //   try {
  //     loading.value = true
  //     error.value = null
      
  //     const response = await api.get('/auth/me')
      
  //     if (response.data.status) {
  //       currentUser.value = response.data.data || response.data.user
  //       return currentUser.value
  //     } else {
  //       throw new Error(response.data.message || 'Failed to fetch current user')
  //     }
  //   } catch (err: any) {
  //     error.value = err.response?.data?.message || err.message || 'Failed to fetch current user'
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }

  // const login = async (credentials: { email: string; password: string }): Promise<User> => {
  //   try {
  //     loading.value = true
  //     error.value = null
      
  //     const response = await api.post('/auth/login', credentials)
      
  //     if (response.data.status) {
  //       // Store auth token
  //       if (response.data.token) {
  //         localStorage.setItem('auth_token', response.data.token)
  //       }
        
  //       currentUser.value = response.data.data || response.data.user
  //       return currentUser.value
  //     } else {
  //       throw new Error(response.data.message || 'Login failed')
  //     }
  //   } catch (err: any) {
  //     error.value = err.response?.data?.message || err.message || 'Login failed'
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.warn('Logout request failed:', err)
    } finally {
      // Clear local state regardless of API response
      currentUser.value = null
      localStorage.removeItem('auth_token')
    }
  }

  // const updateProfile = async (userData: Partial<User>): Promise<User> => {
  //   try {
  //     loading.value = true
  //     error.value = null
      
  //     const response = await api.put('/auth/profile', userData)
      
  //     if (response.data.status) {
  //       currentUser.value = response.data.data || response.data.user
  //       return currentUser.value
  //     } else {
  //       throw new Error(response.data.message || 'Failed to update profile')
  //     }
  //   } catch (err: any) {
  //     error.value = err.response?.data?.message || err.message || 'Failed to update profile'
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }

  // const register = async (userData: { name: string; email: string; password: string; password_confirmation: string }): Promise<User> => {
  //   try {
  //     loading.value = true
  //     error.value = null
      
  //     const response = await api.post('/auth/register', userData)
      
  //     if (response.data.status) {
  //       // Store auth token if provided
  //       if (response.data.token) {
  //         localStorage.setItem('auth_token', response.data.token)
  //       }
        
  //       currentUser.value = response.data.data || response.data.user
  //       return currentUser.value
  //     } else {
  //       throw new Error(response.data.message || 'Registration failed')
  //     }
  //   } catch (err: any) {
  //     error.value = err.response?.data?.message || err.message || 'Registration failed'
  //     throw err
  //   } finally {
  //     loading.value = false
  //   }
  // }

  const changePassword = async (passwordData: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put('/auth/change-password', passwordData)
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to change password')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to change password'
      throw err
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/forgot-password', { email })
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to send reset email')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to send reset email'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (resetData: { token: string; email: string; password: string; password_confirmation: string }): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/auth/reset-password', resetData)
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to reset password')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to reset password'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Initialize user on store creation
  const initializeAuth = async () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        // await fetchCurrentUser()
      } catch (err) {
        console.warn('Failed to initialize auth:', err)
        localStorage.removeItem('auth_token')
      }
    }
  }

  return {
    users,
    currentUser,
    loading,
    error,
    isAuthenticated,
    fetchUsers,
    // fetchCurrentUser,
    // login,
    logout,
    // updateProfile,
    // register,
    changePassword,
    forgotPassword,
    resetPassword,
    initializeAuth
  }
})