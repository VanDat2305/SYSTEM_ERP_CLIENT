<template>
    <AdminLayout>
      <PageBreadcrumb :pageTitle="currentPageTitle" />
      <div class="space-y-5 sm:space-y-6">
        <CustomTable 
          :columns="columns" 
          :rowData="users" 
          :actions="tableActions" 
          :bulkActions="bulkActions"
          :pageSizeOptions="[5, 10, 15]" 
          :defaultPageSize="5" 
          :showAddButton="hasPermission('users.create' as PermissionValues)" 
          :showExport="hasPermission('users.export' as PermissionValues)" 
          hasSelection
          @add="openAddUserModal" 
          @export="exportToExcel" 
          @update:selectedRows="handleSelectionChange"

        />
      </div>
      
      <UserModal 
        :errors="formErrors" 
        :isModalOpen="isModalOpen" 
        :mode="currentMode" 
        :currentUser="currentUser"
        @close="closeModal" 
        @submit="handleUserSubmit" 
      />
      
      <ConfirmModal 
        :show="showModal" 
        :close="closeModalConfirm" 
        :onConfirm="confirmAction" 
        type="danger"
        :closeOnClickOutside="false" 
        :title="t('common.confirm')" 
        :message="t('common.confirm_delete')"
        :confirmText="t('common.yes')" 
        :cancelText="t('common.no')" 
      />
    </AdminLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, inject} from 'vue'
  import { useI18n } from 'vue-i18n'
  import AdminLayout from '@/components/layout/AdminLayout.vue'
  import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
  import CustomTable from "@/components/tables/CustomTable.vue"
  import UserModal from "@/modules/system/users/views/UserModal.vue"
  import ConfirmModal from '@/components/modals/ConfirmModal.vue'
  import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon, TrashIcon as BulkTrashIcon } from '@/icons'
  import { api } from '@/utils/api'
  import { notificationService } from '@/services/notification'
  import { usePermissions } from '@/auth/usePermissions'
  import type { PermissionValues } from '@/types/permissions'
  import { getStatusClass } from '@/modules/system/users/utils/statusStyles'
  
  // Constants and Configuration
  const { t } = useI18n()
  const { hasPermission } = usePermissions()
  
  // Interfaces
  interface User {
    id: string
    name: string
    email: string
    two_factor_enabled: boolean
    status: string
    status_label: string,
    created_at: string
    updated_at: string,
    permiossions: string[],
    roles: string[]
  }
  
  // State
  const currentPageTitle = ref('users_management')
  const users = ref<User[]>([])
  const selectedRows = ref<User[]>([])
  const formErrors = ref({})
  const currentMode = ref<'add' | 'edit' | 'view'>('add')
  const currentUser = ref<Partial<User>>({
    name: ''
  })
  const setLoading = inject<(isLoading: boolean) => void>('setLoading')
  const userToDelete = ref<User | User[] | null>(null)
  
  // Modal states
  const isModalOpen = ref(false)
  const showModal = ref(false)
  
  // Helper functions
  function formatDate(dateString: string) {
    if (!dateString) return ''
    const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  return new Date(dateString).toLocaleDateString('vi-VN', options)
  }
  
  // Table Configuration
  const columns = [
    {
      field: 'name',
      label: 'users_module.fields.name',
      filterable: true,
      sortable: true
    },
    {
      field: 'email',
      label: 'users_module.fields.email',
      filterable: true,
      sortable: true
    },
    {
      field: 'status',
      label: 'users_module.fields.status',
      filterable: true,
      cellClass: (value: string) => getStatusClass(value),
    formatter: (value: string) => t(`status_map.${value}`),
    },
    {
      field: 'created_at',
      label: 'users_module.fields.created_at',
      filterable: false,
      sortable: true,
      formatter: (value: string) => formatDate(value)
    }
  ]
  
  // Actions Configuration
  const tableActions = [
    {
      icon: EyeIcon,
      tooltip: 'View',
      permission: 'users.read' as PermissionValues,
      handler: (row: User) => viewUser(row),
      class: 'text-gray-400 hover:text-green-500'
    },
    {
      icon: PencilIcon,
      tooltip: 'Edit',
      permission: 'users.update' as PermissionValues,
      handler: (row: User) => editUser(row),
      class: 'text-gray-400 hover:text-blue-500'
    },
    {
      icon: TrashIcon,
      tooltip: 'Delete',
      permission: 'users.delete' as PermissionValues,
      handler: (row: User) => deleteUser(row),
      class: 'text-gray-400 hover:text-red-500'
    }
  ].filter(action => !action.permission || hasPermission(action.permission))
  
  const bulkActions = [
    {
      name: 'delete_selected',
      label: 'Delete Selected',
      icon: BulkTrashIcon,
      handler: deleteSelected,
      confirm: true,
      confirmMessage: (selectedCount: number) =>
        t('users_module.delete_selected_confirmation', { count: selectedCount }),
      permission: 'users.delete' as PermissionValues,
    },
    {
      name: 'export_selected',
      label: 'Export Selected',
      icon: DownloadIcon,
      handler: exportSelected,
      permission: 'users.export' as PermissionValues,
    },
    {
      name: 'resend_email_verify',
      label: 'Resend Email Verify',
      icon: DownloadIcon,
      handler: resendEmailVerify,
      permission: 'users.resend_email_verify' as PermissionValues,
    }
  ].filter(action => !action.permission || hasPermission(action.permission))
  
  function handleSearch(search: string) {
    // Implement search logic here
    console.log('Search:', search)
  } 
  function handleFilter(filters: Record<string, any>) {
    // Implement filter logic here
    console.log('Filters:', filters)
  }

  // CRUD Operations
  async function fetchUsers() {
    setLoading?.(true)
    try {
      const response = await api.get('/users')
      users.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch users:', error)
      notificationService.error(t('users_module.fetch_failed'))
    } finally {
      setLoading?.(false)
    }
  }
  
  async function handleUserSubmit(userData: Partial<User>) {
    setLoading?.(true)
    
    try {
      const isEdit = !!userData.id
      const method = isEdit ? 'put' : 'post'
      const url = isEdit ? `/users/${userData.id}` : '/users'
      
      const response = await api[method](url, userData)
      
      if (response.data.status) {
        notificationService.success(response.data.message)
        await fetchUsers()
        closeModal()
      } else {
        notificationService.error(response.data.message || 
          t(isEdit ? 'users_module.update_failed' : 'users_module.create_failed'))
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        formErrors.value = error.response.data.errors
      }
      notificationService.error(error.response?.data?.message || 
          t('users_module.operation_failed'))
    } finally {
      setLoading?.(false)
    }
  }
  
  // Modal handlers
  const openAddUserModal = () => {
    currentMode.value = 'add'
    currentUser.value = { name: '', email: '', two_factor_enabled: false, status: 'active' }
    isModalOpen.value = true
  }
  
  function editUser(user: User) {
    currentMode.value = 'edit'
    currentUser.value = { ...user }
    formErrors.value = {}
    isModalOpen.value = true
  }
  
  function viewUser(user: User) {
    currentMode.value = 'view'
    currentUser.value = { ...user }
    isModalOpen.value = true
  }
  
  function closeModal() {
    isModalOpen.value = false
    formErrors.value = {}
  }
  
  // Delete handlers
  function deleteUser(user: User) {
    userToDelete.value = user
    showModal.value = true
  }
  
  async function confirmAction() {
    if (!userToDelete.value) return
  
    const usersToDelete = Array.isArray(userToDelete.value) 
      ? userToDelete.value 
      : [userToDelete.value]
  
    const ids = usersToDelete.map(user => user.id)
    setLoading?.(true)
    try {
      closeModalConfirm()
  
      const response = await api.post('/users/delete', { ids })
  
      if (response.data.status) {
        notificationService.success(response.data.message)
        await fetchUsers()
        userToDelete.value = null
      } else {
        notificationService.error(response.data.message || t('users_module.delete_failed'))
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        formErrors.value = error.response.data.errors
        notificationService.error(error.response?.data?.message || t('users_module.delete_failed'))
      }
    } finally {
      setLoading?.(false)
    }
  }
  
  function closeModalConfirm() {
    showModal.value = false
  }
  
  // Bulk actions
  function handleSelectionChange(rows: User[]) {
    selectedRows.value = rows
    console.log('Selected rows:', selectedRows.value);
    
  }

  function resendEmailVerify() {
    if (!selectedRows.value.length) return
    if (selectedRows.value.length > 1) {
      notificationService.error(t('users_module.not_resend_email_verify_multiple'))
      return
    }
    const email = selectedRows.value[0].email;
    setLoading?.(true)
    api.post('/email/resend', { email: email })
      .then(response => {
        notificationService.success(response.data.message)
      })
      .catch(error => {
        notificationService.error(error.response?.data?.message || t('users_module.resend_email_verify_failed'))
      })
      .finally(() => {
        setLoading?.(false)
      })
  }
  
  function deleteSelected() {
    if (!selectedRows.value.length) return
    userToDelete.value = selectedRows.value
    showModal.value = true
  }
  
  function exportToExcel() {
    alert('Exporting all users to Excel')
  }
  
  function exportSelected() {
    if (!selectedRows.value.length) return
    alert(`Exporting ${selectedRows.value.length} selected user`)
  }
  
  // Initialize
  onMounted(() => {
    fetchUsers()
  })
  </script>