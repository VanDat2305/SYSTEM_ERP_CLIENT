<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <CustomTable 
        :columns="columns" 
        :rowData="roles" 
        :actions="tableActions" 
        :bulkActions="bulkActions"
        :pageSizeOptions="[5, 10, 15]" 
        :defaultPageSize="5" 
        :showAddButton="hasPermission('roles.create' as PermissionValues)" 
        :showExport="hasPermission('roles.export' as PermissionValues)" 
        hasSelection
        @add="openAddRoleModal" 
        @export="exportToExcel" 
        @update:selectedRows="handleSelectionChange" 
      />
    </div>
    
    <RoleModal 
      :errors="formErrors" 
      :isModalOpen="isModalOpen" 
      :mode="currentMode" 
      :currentRole="currentRole"
      :availablePermissions="[]" 
      @close="closeModal" 
      @submit="handleRoleSubmit" 
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
import { ref, computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import RoleModal from "@/modules/system/role/views/RoleModal.vue"
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon, TrashIcon as BulkTrashIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import type { PermissionValues } from '@/types/permissions'

// Constants and Configuration
const { t } = useI18n()
const { hasPermission } = usePermissions()
// Injected dependencies
const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// Data state
const currentPageTitle = ref('roles_management')
const roles = ref<Role[]>([])
const selectedRows = ref<Role[]>([])
const formErrors = ref({})
const currentMode = ref('add')
const currentRole = ref<Partial<Role>>({
  name: '',
  description: '',
  status: 'active'
})
const roleToDelete = ref<Role | Role[] | null>(null)

// Modal states
const isModalOpen = ref(false)
const showModal = ref(false)

// Interfaces
interface Role {
  id: number
  name: string
  description?: string
  status: 'active' | 'inactive'
  created_at: string
}

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
    label: 'roles_module.fields.name',
    filterable: true,
    sortable: true
  },
  {
    field: 'description',
    label: 'roles_module.fields.description',
    filterable: true
  },
  {
    field: 'status',
    label: 'status',
    cellClass: (value: string) => ({
      'active': 'px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'inactive': 'px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    })[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    formatter: (value: string) => t(`status_map.${value}`),
  },
  {
    field: 'created_at',
    label: 'roles_module.fields.created_at',
    filterable: false,
    sortable: true,
    formatter: (value: string) => formatDate(value)
  },
]

// Actions Configuration
const tableActions = [
  {
    icon: EyeIcon,
    tooltip: 'View',
    permission: 'roles.detail' as PermissionValues,
    handler: (row: Role) => viewRole(row),
    class: 'text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400'
  },
  {
    icon: PencilIcon,
    tooltip: 'Edit',
    permission: 'roles.update' as PermissionValues,
    handler: (row: Role) => editRole(row),
    class: 'text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400'
  },
  {
    icon: TrashIcon,
    tooltip: 'Delete',
    permission: 'roles.delete' as PermissionValues,
    handler: (row: Role) => deleteRole(row),
    class: 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400'
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
      t('roles_module.delete_selected_confirmation', { count: selectedCount }),
    permission: 'roles.delete' as PermissionValues,
  },
  {
    name: 'export_selected',
    label: 'Export Selected',
    icon: DownloadIcon,
    handler: exportSelected,
    permission: 'roles.export' as PermissionValues,
  }
].filter(action => !action.permission || hasPermission(action.permission))

// CRUD Operations
async function fetchRoles() {
  try {
    setLoading?.(true)
    const response = await api.get('/roles')
    roles.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch roles:', error)
  } finally {
    setLoading?.(false)
  }
}

async function handleRoleSubmit(roleData: any) {
  try {
    setLoading?.(true)
    const isEdit = !!roleData.id
    const method = isEdit ? 'put' : 'post'
    const url = isEdit ? `/roles/${roleData.id}` : '/roles'
    
    const response = await api[method](url, roleData)

    if (response.data.status) {
      notificationService.success(response.data.message)
      await fetchRoles()
      closeModal()
    } else {
      notificationService.error(response.data.message || 
        t(isEdit ? 'roles_module.update_role_failed' : 'roles_module.create_role_failed'))
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
      notificationService.error(error.response?.data?.message || 
        t('roles_module.operation_failed'))
    }
  } finally {
    setLoading?.(false)
  }
}

// Modal handlers
const openAddRoleModal = () => {
  currentMode.value = 'add'
  currentRole.value = { name: '', description: '', status: 'active' }
  isModalOpen.value = true
}

function editRole(role: Role) {
  currentMode.value = 'edit'
  currentRole.value = { ...role }
  formErrors.value = {}
  isModalOpen.value = true
}

function viewRole(role: Role) {
  currentMode.value = 'view'
  currentRole.value = { ...role }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  formErrors.value = {}
}

// Delete handlers
function deleteRole(role: Role) {
  roleToDelete.value = role
  showModal.value = true
}

async function confirmAction() {
  if (!roleToDelete.value) return

  const rolesToDelete = Array.isArray(roleToDelete.value) 
    ? roleToDelete.value 
    : [roleToDelete.value]

  const ids = rolesToDelete.map(role => role.id)
  
  try {
    setLoading?.(true)
    closeModalConfirm()

    const response = await api.post('/roles/delete', { ids })

    if (response.data.status) {
      notificationService.success(response.data.message)
      await fetchRoles()
      roleToDelete.value = null
    } else {
      notificationService.error(response.data.message || t('roles_module.delete_failed'))
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
      notificationService.error(error.response?.data?.message || t('roles_module.delete_failed'))
    }
  } finally {
    setLoading?.(false)
  }
}

function closeModalConfirm() {
  showModal.value = false
}

// Bulk actions
function handleSelectionChange(rows: Role[]) {
  selectedRows.value = rows
}

function deleteSelected() {
  if (!selectedRows.value.length) return
  roleToDelete.value = selectedRows.value
  showModal.value = true
}

function exportToExcel() {
  alert('Exporting all data to Excel')
}

function exportSelected() {
  if (!selectedRows.value.length) return
  alert(`Exporting ${selectedRows.value.length} selected items`)
}

// Initialize
onMounted(() => {
  fetchRoles()
})
</script>