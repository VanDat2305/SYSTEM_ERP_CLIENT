<template>
    <AdminLayout>
      <PageBreadcrumb :pageTitle="currentPageTitle" />
      <div class="space-y-5 sm:space-y-6">
        <CustomTable 
          :columns="columns" 
          :rowData="permissions" 
          :actions="tableActions" 
          :bulkActions="bulkActions"
          :pageSizeOptions="[5, 10, 15]" 
          :defaultPageSize="5" 
          :showAddButton="hasPermission('permissions.create' as PermissionValues)" 
          :showExport="hasPermission('permissions.export' as PermissionValues)" 
          hasSelection
          @add="openAddPermissionModal" 
          @export="exportToExcel" 
          @update:selectedRows="handleSelectionChange"
          @refresh="handleRefresh"
          :show-refresh-button="true"
        />
      </div>
      
      <PermissionModal 
        :errors="formErrors" 
        :isModalOpen="isModalOpen" 
        :mode="currentMode" 
        :currentPermission="currentPermission"
        @close="closeModal" 
        @submit="handlePermissionSubmit" 
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
  import PermissionModal from "@/modules/system/permissions/views/PermissionModal.vue"
  import ConfirmModal from '@/components/modals/ConfirmModal.vue'
  import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon, TrashIcon as BulkTrashIcon } from '@/icons'
  import { api } from '@/utils/api'
  import { notificationService } from '@/services/notification'
  import { usePermissions } from '@/auth/usePermissions'
  import type { PermissionValues } from '@/types/permissions'
  
  // Constants and Configuration
  const { t } = useI18n()
  const { hasPermission } = usePermissions()
  
  // Interfaces
  interface Permission {
    id: number
    title: string
    name: string
    guard_name: string
    description?: string
    created_at: string
    updated_at: string
  }
  
  // State
  const currentPageTitle = ref('permissions_management')
  const permissions = ref<Permission[]>([])
  const selectedRows = ref<Permission[]>([])
  const formErrors = ref({})
  const currentMode = ref<'add' | 'edit' | 'view'>('add')
  const currentPermission = ref<Partial<Permission>>({
    name: '',
    guard_name: 'web',
    description: ''
  })
  const setLoading = inject<(isLoading: boolean) => void>('setLoading')
  const permissionToDelete = ref<Permission | Permission[] | null>(null)
  
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
      field: 'title',
      label: 'permissions_module.fields.name',
      filterable: true,
      sortable: true
    },
    {
      field: 'name',
      label: 'permissions_module.fields.name_code',
      filterable: true,
      sortable: true
    },
    {
      field: 'description',
      label: 'permissions_module.fields.description',
      filterable: true
    },
    {
      field: 'created_at',
      label: 'permissions_module.fields.created_at',
      filterable: false,
      sortable: true,
      formatter: (value: string) => formatDate(value)
    },
    {
      field: 'status',
      label: 'permissions_module.fields.status',
      filterable: true,
      cellClass: (value: string) => ({
      'active': 'px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'inactive': 'px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      })[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      formatter: (value: string) => t(`status_map.${value}`),
    }
  ]
  
  // Actions Configuration
  const tableActions = [
    {
      icon: EyeIcon,
      tooltip: 'View',
      permission: 'permissions.view' as PermissionValues,
      handler: (row: Permission) => viewPermission(row),
      class: 'text-gray-400 hover:text-green-500'
    },
    {
      icon: PencilIcon,
      tooltip: 'Edit',
      permission: 'permissions.update' as PermissionValues,
      handler: (row: Permission) => editPermission(row),
      class: 'text-gray-400 hover:text-blue-500'
    },
    {
      icon: TrashIcon,
      tooltip: 'Delete',
      permission: 'permissions.delete' as PermissionValues,
      handler: (row: Permission) => deletePermission(row),
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
        t('permissions_module.delete_selected_confirmation', { count: selectedCount }),
      permission: 'permissions.delete' as PermissionValues,
    },
    {
      name: 'export_selected',
      label: 'Export Selected',
      icon: DownloadIcon,
      handler: exportSelected,
      permission: 'permissions.export' as PermissionValues,
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
  async function fetchPermissions() {
    setLoading?.(true)
    try {
      const response = await api.get('/permissions')
      permissions.value = response.data.data
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      notificationService.error(t('permissions_module.fetch_failed'))
    } finally {
      setLoading?.(false)
    }
  }
  
  async function handlePermissionSubmit(permissionData: Partial<Permission>) {
    setLoading?.(true)
    try {
      const isEdit = !!permissionData.id
      const method = isEdit ? 'put' : 'post'
      const url = isEdit ? `/permissions/${permissionData.id}` : '/permissions'
      
      const response = await api[method](url, permissionData)
  
      if (response.data.status) {
        notificationService.success(response.data.message)
        await fetchPermissions()
        closeModal()
      } else {
        notificationService.error(response.data.message || 
          t(isEdit ? 'permissions_module.update_failed' : 'permissions_module.create_failed'))
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        formErrors.value = error.response.data.errors
        notificationService.error(error.response?.data?.message || 
          t('permissions_module.operation_failed'))
      }
    } finally {
      setLoading?.(false)
    }
  }
  
  // Modal handlers
  const handleRefresh = () => {
    fetchPermissions()
  }
  const openAddPermissionModal = () => {
    currentMode.value = 'add'
    currentPermission.value = { name: '', guard_name: 'web', description: '' }
    isModalOpen.value = true
  }
  
  function editPermission(permission: Permission) {
    currentMode.value = 'edit'
    currentPermission.value = { ...permission }
    formErrors.value = {}
    isModalOpen.value = true
  }
  
  function viewPermission(permission: Permission) {
    currentMode.value = 'view'
    currentPermission.value = { ...permission }
    isModalOpen.value = true
  }
  
  function closeModal() {
    isModalOpen.value = false
    formErrors.value = {}
  }
  
  // Delete handlers
  function deletePermission(permission: Permission) {
    permissionToDelete.value = permission
    showModal.value = true
  }
  
  async function confirmAction() {
    if (!permissionToDelete.value) return
  
    const permissionsToDelete = Array.isArray(permissionToDelete.value) 
      ? permissionToDelete.value 
      : [permissionToDelete.value]
  
    const ids = permissionsToDelete.map(permission => permission.id)
    setLoading?.(true)
    try {
      closeModalConfirm()
  
      const response = await api.post('/permissions/delete', { ids })
  
      if (response.data.status) {
        notificationService.success(response.data.message)
        await fetchPermissions()
        permissionToDelete.value = null
      } else {
        notificationService.error(response.data.message || t('permissions_module.delete_failed'))
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        formErrors.value = error.response.data.errors
        notificationService.error(error.response?.data?.message || t('permissions_module.delete_failed'))
      }
    } finally {
      setLoading?.(false)
    }
  }
  
  function closeModalConfirm() {
    showModal.value = false
  }
  
  // Bulk actions
  function handleSelectionChange(rows: Permission[]) {
    selectedRows.value = rows
  }
  
  function deleteSelected() {
    if (!selectedRows.value.length) return
    permissionToDelete.value = selectedRows.value
    showModal.value = true
  }
  
  function exportToExcel() {
    alert('Exporting all permissions to Excel')
  }
  
  function exportSelected() {
    if (!selectedRows.value.length) return
    alert(`Exporting ${selectedRows.value.length} selected permissions`)
  }
  
  // Initialize
  onMounted(() => {
    fetchPermissions()
  })
  </script>