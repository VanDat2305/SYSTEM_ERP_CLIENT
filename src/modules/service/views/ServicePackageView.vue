<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
      <div class="">
        <CustomTable 
        :columns="columns" 
        :rowData="packages" 
        :actions="tableActions" 
        :bulkActions="bulkActions"
        :pageSizeOptions="[5, 10, 15]" 
        :defaultPageSize="5" 
        :showAddButton="hasPermission('service_packages.create')" 
        hasSelection
        :server-pagination="true"
        :server-total-items="pagination.total"
        :server-current-page="pagination.current_page"
        :server-per-page="pagination.per_page"
        :server-last-page="pagination.last_page"
        @add="openAddModal" 
        @update:selectedRows="handleSelectionChange"
        @refresh="fetchPackages"
        @server-page-change="handleServerPageChange"
        @server-sort="handleServerSort"
        @filter="handleServerFilter"
        :show-refresh-button="true"
        :searchOptions="searchOptions"
        :filterOptions="filterOptions"
      />
      </div>
    
    <ServicePackageModal 
      :errors="formErrors" 
      :isModalOpen="isModalOpen" 
      :mode="currentMode" 
      :currentPackage="currentPackage"
      :categorySystem="categorySystem"
      @close="closeModal" 
      @submit="handleSubmit" 
    />
    
    <ConfirmModal 
      :show="showDeleteModal" 
      :close="closeDeleteModal" 
      :onConfirm="confirmDelete" 
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
import { ref, onMounted, inject, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import ServicePackageModal from "@/modules/service/components/ServicePackageModal.vue"
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { EyeIcon, PencilIcon, TrashIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import { useCategorySystem } from '@/stores/categorySystem'
import type { PermissionValues } from '@/types/permissions'

const { t } = useI18n()
const { hasPermission } = usePermissions()
const categorySystem = useCategorySystem()

interface Feature {
  feature_key: string
  feature_name: string
  feature_type: string
  unit: string
  limit_value: number
  is_optional: boolean
  is_customizable: boolean
  display_order: number
}

interface ServicePackage {
  id: number
  type_service: string
  customer_type: string
  package_code: string
  package_name: string
  base_price: number
  billing_cycle: string
  is_active: boolean
  features: Feature[]
  created_at: string
  updated_at: string
}
const setLoading = inject<(isLoading: boolean) => void>('setLoading')
// State
const currentPageTitle = ref('service_packages')
const packages = ref<ServicePackage[]>([])
const selectedRows = ref<ServicePackage[]>([])
const formErrors = ref({})
const currentMode = ref<'add' | 'edit' | 'view'>('add')
const currentPackage = ref<Partial<ServicePackage>>({
  type_service: 'SER_IHD',
  customer_type: 'INDIVIDUAL',
  package_code: '',
  package_name: '',
  base_price: 0,
  billing_cycle: 'monthly',
  is_active: true,
  features: []
})
const packageToDelete = ref<ServicePackage | ServicePackage[] | null>(null)
const isModalOpen = ref(false)
const showDeleteModal = ref(false)

// Pagination
const pagination = ref({
  current_page: 1,
  per_page: 5,
  total: 0,
  last_page: 1
})

// Filter/Sort
const filters = ref({
  type_service: 'ALL',
  is_active: null,
  sort_by: '',
  sort_order: 'asc'
})
const billingCycle = ref<any[]>([]);
const typeService = ref<any[]>([]);

// Search and Filter Options
const searchOptions = [
    { field: 'package_code', label: t('service_packages.fields.code') },
    { field: 'package_name', label: t('service_packages.fields.name') },
    { field: 'base_price', label: t('service_packages.fields.price') },
]
const optionTypeService = computed(() =>
  typeService.value.map(item => ({
    value: item.code,
    label: item.name
  }))
);
const filterOptions: any[] = [
    {
        field: 'type_service',
        label: 'service_packages.fields.type_service',
        type: 'select',
        options: '',
        getCategory: true,
        categoryName: 'service_type',
    },
    {
        field: 'customer_type',
        label: 'service_packages.fields.customer_type',
        type: 'select',
        options: '',
        getCategory: true,
        categoryName: 'customer_type',
    },
    {
      field: 'is_active',
      label: 'service_packages.fields.status',
      type: 'select',
      options: [
        { value: true, label: t('status_map.active') },
        { value: false, label: t('status_map.inactive') }
      ]
    }
]



// Table Configuration
const columns = [
  {
    field: 'type_service',
    label: 'service_packages.fields.type_service',
    filterable: false,
    sortable: true,
    formatter: (value: string) => {
      return typeService.value.find((item: { code: string }) => item.code === value)?.name || value;
    }
  },
  {
    field: 'package_code',
    label: 'service_packages.fields.code',
    filterable: false,
    sortable: true
  },
  {
    field: 'package_name',
    label: 'service_packages.fields.name',
    filterable: false,
    sortable: true
  },
  {
    field: 'base_price',
    label: 'service_packages.fields.price',
    filterable: false,
    sortable: true,
    formatter: (value: number, currency: string = 'VND') => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
      }).format(value);
    }
  },
  // {
  //   field: 'billing_cycle',
  //   label: 'service_packages.fields.billing_cycle',
  //   filterable: false,
  //   formatter: (value: string) => {
  //     return billingCycle.value.find((item: { code: string }) => item.code === value)?.name || value;
  //   }
  // },
  {
    field: 'is_active',
    label: 'service_packages.fields.status',
    filterable: false,
    cellClass: (value: boolean) => value 
      ? 'px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
      : 'px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    formatter: (value: boolean) => t(`status_map.${value ? 'active' : 'inactive'}`)
  }
]

// Actions Configuration
const tableActions = [
  {
    icon: EyeIcon,
    tooltip: 'common.view',
    permission: 'service_packages.view' as PermissionValues,
    handler: (row: ServicePackage) => viewPackage(row),
    class: 'text-gray-400 hover:text-green-500'
  },
  {
    icon: PencilIcon,
    tooltip: 'common.edit',
    permission: 'service_packages.update' as PermissionValues,
    handler: (row: ServicePackage) => editPackage(row),
    class: 'text-gray-400 hover:text-blue-500'
  },
  {
    icon: TrashIcon,
    tooltip: 'common.delete',
    permission: 'service_packages.delete' as PermissionValues,
    handler: (row: ServicePackage) => deletePackage(row),
    class: 'text-gray-400 hover:text-red-500'
  }
].filter(
  action => !action.permission 
  || hasPermission(action.permission)
)

const bulkActions = [
  {
    name: 'delete_selected',
    label: 'common.delete_selected',
    icon: TrashIcon,
    handler: deleteSelected,
    confirm: true,
    confirmMessage: (selectedCount: number) =>
      t('service_packages.delete_selected_confirmation', { count: selectedCount }),
    permission: 'service_packages.delete' as PermissionValues,
  }
]
.filter(
  action => !action.permission 
  || hasPermission(action.permission)
)

// CRUD Operations
async function fetchPackages() {
  setLoading?.(true)
  try {
    const params = {
      ...filters.value,
      page: pagination.value.current_page,
      per_page: pagination.value.per_page
    }

    const response = await api.get('/service-packages', { params })
    packages.value = response.data.data.items
    pagination.value = response.data.data.pagination
  } catch (error) {
    notificationService.error(t('service_packages.fetch_failed'))
  } finally {
    setLoading?.(false)
  }
}

async function handleSubmit(packageData: Partial<ServicePackage>) {
  try {
    const isEdit = !!packageData.id
    const method = isEdit ? 'put' : 'post'
    const url = isEdit ? `/service-packages/${packageData.id}` : '/service-packages'
    
    const response = await api[method](url, packageData)

    if (response.data.status) {
      notificationService.success(response.data.message)
      await fetchPackages()
      closeModal()
    } else {
      notificationService.error(response.data.message || 
        t(isEdit ? 'service_packages.update_failed' : 'service_packages.create_failed'))
    }
  } catch (error: any) {
    if (error.response?.data?.errors) {
      formErrors.value = error.response.data.errors
      notificationService.error(error.response?.data?.message || 
        t('service_packages.operation_failed'))
    }
  }
}

// Modal handlers
const openAddModal = () => {
  currentMode.value = 'add'
  currentPackage.value = {
    type_service: 'SER_IHD',
    customer_type: 'INDIVIDUAL',
    package_code: '',
    package_name: '',
    base_price: 0,
    billing_cycle: 'monthly',
    is_active: true,
    features: []
  }
  isModalOpen.value = true
}

function editPackage(pkg: ServicePackage) {
  currentMode.value = 'edit'
  currentPackage.value = { ...pkg }
  formErrors.value = {}
  isModalOpen.value = true
}

function viewPackage(pkg: ServicePackage) {
  currentMode.value = 'view'
  currentPackage.value = { ...pkg }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
  formErrors.value = {}
}

// Delete handlers
function deletePackage(pkg: ServicePackage) {
  packageToDelete.value = pkg
  showDeleteModal.value = true
}

async function confirmDelete() {
  if (!packageToDelete.value) return

  const packagesToDelete = Array.isArray(packageToDelete.value) 
    ? packageToDelete.value 
    : [packageToDelete.value]
  setLoading?.(true)
  try {
    for (const pkg of packagesToDelete) {
      await api.delete(`/service-packages/${pkg.id}`)
    }

    notificationService.success(t('service_packages.messages.delete_success'))
    await fetchPackages()
  } catch (error) {
    console.error('Failed to delete packages:', error)
    notificationService.error(t('service_packages.messages.delete_failed'))
  } finally {
    showDeleteModal.value = false
    packageToDelete.value = null
    setLoading?.(false);
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
}


// Bulk actions
function handleSelectionChange(rows: ServicePackage[]) {
  selectedRows.value = rows
  
}

function deleteSelected() {
  if (!selectedRows.value.length) return
  packageToDelete.value = selectedRows.value
  showDeleteModal.value = true
}

// Server-side handlers
function handleServerPageChange(pageData: any) {
  pagination.value.current_page = pageData.page
  pagination.value.per_page = pageData.perPage
  fetchPackages()
}

function handleServerSort(sortData: any) {
  filters.value.sort_by = sortData.field
  filters.value.sort_order = sortData.direction
  fetchPackages()
}

function handleServerFilter(filterData: any) {
  filters.value = {
    ...filters.value,
    ...filterData
  }
  
  pagination.value.current_page = 1
  fetchPackages()
}

// Initialize
onMounted(async() => {
 if (!categorySystem.loaded) {
    await categorySystem.initCategories();
  }
  // billingCycle.value = categorySystem.getItemsByTypeCode('billing_cycle');
  typeService.value = categorySystem.getItemsByTypeCode('service_type');
  fetchPackages()
})
</script>