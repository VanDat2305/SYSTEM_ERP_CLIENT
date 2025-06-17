<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />

        <!-- Status Tabs -->
        <div class="mb-6">
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="-mb-px flex space-x-8 overflow-x-auto">
                    <button v-for="tab in statusTabs" :key="tab.value" @click="changeStatusTab(tab.value)" :class="[
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs flex items-center space-x-2',
                        activeTab === tab.value
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                    ]">
                        <!-- <component :is="tab.icon" class="w-5 h-5" /> -->
                        <span>{{ tab.label }}</span>
                        <!-- <span v-if="tab.count !== undefined" :class="[
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            activeTab === tab.value
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        ]">
                            {{ tab.count }}
                        </span> -->
                    </button>
                </nav>
            </div>
        </div>

        <!-- Main Content -->
        <div class="space-y-6">
            <!-- Stats Cards -->
            <!-- <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="stat in statsCards"
          :key="stat.name"
          class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
        >
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <component :is="stat.icon" :class="stat.iconClass" />
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    {{ stat.name }}
                  </dt>
                  <dd class="text-lg font-medium text-gray-900 dark:text-white">
                    {{ stat.value }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div> -->

            <!-- Customer Table -->
            <CustomTable :columns="columns" :rowData="customers" :actions="tableActions" :bulkActions="bulkActions"
                :pageSizeOptions="[10, 25, 50]" :defaultPageSize="25"
                :showAddButton="hasPermission('customers.create' as PermissionValues)" hasSelection
                :server-pagination="true" :server-total-items="pagination.total"
                :server-current-page="pagination.current_page" :server-per-page="pagination.per_page"
                :server-last-page="pagination.last_page" @add="openAddModal"
                @update:selectedRows="handleSelectionChange" @refresh="fetchCustomers"
                @server-page-change="handleServerPageChange" @server-sort="handleServerSort"
                @filter="handleServerFilter" :show-refresh-button="true" :searchOptions="searchOptions"
                :filterOptions="filterOptions" @server-filter="handleServerFilter" />
        </div>

        <!-- Customer Modal -->
        <CustomerModal :errors="formErrors" :isModalOpen="isModalOpen" :mode="currentMode"
            :currentCustomer="currentCustomer" :categorySystem="categorySystem" @close="closeModal"
            @submit="handleSubmit" />

        <!-- Confirm Modal -->
        <ConfirmModal :show="showDeleteModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />

        <!-- Status Change Modal -->
        <!-- <StatusChangeModal :show="showStatusModal" :customer="customerToChangeStatus"
            :availableStatuses="availableStatuses" @close="closeStatusModal" @confirm="confirmStatusChange" /> -->
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import CustomerModal from "@/modules/customer/components/CustomerModal.vue"
// import StatusChangeModal from "@/modules/customer/components/StatusChangeModal.vue"  
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    //   UserIcon,
    //   ClockIcon,
    //   CheckCircleIcon,
    //   XCircleIcon,
    //   PauseCircleIcon,
    //   UserGroupIcon,
    //   ArrowTrendingUpIcon,
    //   ArrowTrendingDownIcon,
    //   ExclamationTriangleIcon
} from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import { useCategorySystem } from '@/stores/categorySystem'
import type { PermissionValues } from '@/types/permissions'

const { t } = useI18n()
const { hasPermission } = usePermissions()
const categorySystem = useCategorySystem()

interface CustomerContact {
    id?: number
    contact_type: string
    value: string
    label?: string
    is_primary: boolean
    note?: string
}

interface CustomerRepresentative {
    id?: number
    full_name: string
    position?: string
    phone?: string
    email?: string
    identity_type?: string
    identity_number?: string
    note?: string
}

interface Customer {
    id: number
    customer_code?: string
    customer_type: 'INDIVIDUAL' | 'ORGANIZATION' | string
    full_name: string
    short_name?: string
    gender?: string
    date_of_birth?: string
    tax_code?: string
    industry?: string
    address?: string
    province_code?: string
    identity_type?: string
    identity_number?: string
    position?: string
    website?: string
    team_id?: string
    assigned_to?: string
    status: string
    contacts: CustomerContact[]
    representatives: CustomerRepresentative[]
    created_at: string
    updated_at: string
}

const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// State
const currentPageTitle = ref('customers')
const customers = ref<Customer[]>([])
const selectedRows = ref<Customer[]>([])
const formErrors = ref({})
const currentMode = ref<'add' | 'edit' | 'view'>('add')
const currentCustomer = ref<Partial<Customer>>({
    customer_type: '',
    full_name: '',
    short_name: '',
    status: 'new',
    contacts: [],
    representatives: []
})
const customerToDelete = ref<Customer | Customer[] | null>(null)
const customerToChangeStatus = ref<Customer | null>(null)
const isModalOpen = ref(false)
const showDeleteModal = ref(false)
const showStatusModal = ref(false)

// Active tab state
const activeTab = ref('all')

// Status tabs configuration
const statusTabs = computed(() => [
    {
        value: 'all',
        label: t('customers.status.all'),
        // icon: UserGroupIcon,
        count: customers.value.length
    },
    {
        value: 'new',
        label: t('customers.status.new'),
        // icon: UserIcon,
        // count: customers.value.filter(c => c.status === 'new').length
    },
    {
        value: 'in_progress',
        label: t('customers.status.in_progress'),
        // icon: ClockIcon,
        // count: customers.value.filter(c => c.status === 'in_progress').length
    },
    {
        value: 'converted',
        label: t('customers.status.converted'),
        // icon: CheckCircleIcon,
        // count: customers.value.filter(c => c.status === 'converted').length
    },
    {
        value: 'unqualified',
        label: t('customers.status.unqualified'),
        // icon: XCircleIcon,
        // count: customers.value.filter(c => c.status === 'unqualified').length
    },
    {
        value: 'inactive',
        label: t('customers.status.inactive'),
        // icon: PauseCircleIcon,
        // count: customers.value.filter(c => c.status === 'inactive').length
    }
])

// Stats cards
const statsCards = computed(() => [
    {
        name: t('customers.stats.total'),
        value: customers.value.length,
        // icon: UserGroupIcon,
        iconClass: 'h-6 w-6 text-gray-400'
    },
    {
        name: t('customers.stats.new_this_month'),
        value: customers.value.filter(c => {
            const created = new Date(c.created_at)
            const now = new Date()
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
        }).length,
        // icon: ArrowTrendingUpIcon,
        iconClass: 'h-6 w-6 text-green-400'
    },
    {
        name: t('customers.stats.converted'),
        value: customers.value.filter(c => c.status === 'converted').length,
        // icon: CheckCircleIcon,
        iconClass: 'h-6 w-6 text-blue-400'
    },
    {
        name: t('customers.stats.in_progress'),
        value: customers.value.filter(c => c.status === 'in_progress').length,
        // icon: ClockIcon,
        iconClass: 'h-6 w-6 text-yellow-400'
    }
])

// Pagination
const pagination = ref({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1
})

// Filter/Sort
const filters = ref({
    status: 'all',
    customer_type: 'ALL',
    assigned_to: null,
    sort_by: '',
    sort_order: 'desc'
})

// Search and Filter Options
const searchOptions = [
    { field: 'customer_code', label: t('customers.fields.customer_code') },
    { field: 'full_name', label: t('customers.fields.full_name') },
    { field: 'short_name', label: t('customers.fields.short_name') },
    { field: 'tax_code', label: t('customers.fields.tax_code') },
    { field: 'identity_number', label: t('customers.fields.identity_number') },
]

const filterOptions = [
    {
        field: 'customer_type',
        label: 'customers.fields.customer_type',
        type: 'select',
        options: [
            { value: 'INDIVIDUAL', label: t('customers.types.individual') },
            { value: 'ORGANIZATION', label: t('customers.types.organization') }
        ]
    },
    {
        field: 'status',
        label: 'customers.fields.status',
        type: 'select',
        options: [
            { value: 'new', label: t('customers.status.new') },
            { value: 'in_progress', label: t('customers.status.in_progress') },
            { value: 'converted', label: t('customers.status.converted') },
            { value: 'unqualified', label: t('customers.status.unqualified') },
            { value: 'inactive', label: t('customers.status.inactive') }
        ]
    },
    {
        field: 'created_at',
        label: 'Ngày tạo từ ngày đến ngày',
        type: 'date-range',
        fields: {
            from: 'created_at_from', // key trong activeFilters
            to: 'created_at_to'     // key trong activeFilters
        },
        preventFutureDates: true, // Ngăn không cho chọn ngày trong tương lai
    },
]

// Available status changes
const availableStatuses = computed(() => [
    { value: 'new', label: t('customers.status.new'), color: 'bg-gray-100 text-gray-800' },
    { value: 'in_progress', label: t('customers.status.in_progress'), color: 'bg-yellow-100 text-yellow-800' },
    { value: 'converted', label: t('customers.status.converted'), color: 'bg-green-100 text-green-800' },
    { value: 'unqualified', label: t('customers.status.unqualified'), color: 'bg-red-100 text-red-800' },
    { value: 'inactive', label: t('customers.status.inactive'), color: 'bg-gray-100 text-gray-800' }
])

// Table Configuration
const columns = ref([
    {
        field: 'customer_code',
        label: 'customers.fields.customer_code',
        sortable: true,
    },
    {
        field: 'full_name',
        label: 'customers.fields.full_name',
        sortable: true,
        formatter: (value: string, row: Customer) => {
            return `
      <div class="flex items-center space-x-3 text-xs">
        <div>
          <div class="text-xs font-medium text-gray-900 dark:text-gray-100">${value}</div>
          ${row.short_name ? `<div class="text-xs text-gray-500 dark:text-gray-400">${row.short_name}</div>` : ''}
        </div>
      </div>`;
        },
        isHtml: true
    },
    {
        field: 'customer_type',
        label: 'customers.fields.customer_type',
        sortable: true,
        cellClass: (value: string) =>
            value === 'INDIVIDUAL'
                ? 'px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium dark:bg-blue-900 dark:text-blue-200'
                : 'px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-medium dark:bg-purple-900 dark:text-purple-200',
        formatter: (value: string) => t(`customers.types.${value.toLowerCase()}`)
    },
    {
        field: 'contacts',
        label: 'customers.fields.primary_contact',
        formatter: (contacts: CustomerContact[]) => {
            const primary = contacts.find(c => c.is_primary)
            if (!primary) return '-'
            return `
        <div class="text-xs">
          <div class="font-medium text-gray-900 dark:text-gray-100">${primary.value}</div>
        </div>`;
        },
        isHtml: true,
        
    },
    {
        field: 'status',
        label: 'customers.fields.status',
        cellClass: (value: string) => {
            const base = 'px-2 py-1 rounded-full text-xs font-medium';
            const colorMap: Record<string, string> = {
                new: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
                in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                converted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                unqualified: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
            };
            return `${base} ${colorMap[value] || colorMap.new}`;
        },
        formatter: (value: string) => t(`customers.status.${value}`),
        headerAlign: 'right',
        align: 'left',
        isShow: activeTab.value === 'all'
    },
    {
        field: 'created_at',
        label: 'customers.fields.created_at',
        sortable: true,
        formatter: (value: string) => {
            const d = new Date(value);
            const pad = (n: number) => n.toString().padStart(2, '0');
            const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
            return `<span class="text-xs text-gray-700 dark:text-gray-300">${time} ${date}</span>`;
        },
        isHtml: true
    }
])


// Actions Configuration
const tableActions = [
    {
        icon: EyeIcon,
        tooltip: 'common.view',
        permission: 'customers.view' as PermissionValues,
        handler: (row: Customer) => viewCustomer(row),
        class: 'text-gray-400 hover:text-green-500'
    },
    {
        icon: PencilIcon,
        tooltip: 'common.edit',
        permission: 'customers.update' as PermissionValues,
        handler: (row: Customer) => editCustomer(row),
        class: 'text-gray-400 hover:text-blue-500'
    },
    //   {
    //     // icon: ArrowTrendingUpIcon,
    //     tooltip: 'customers.change_status',
    //     permission: 'customers.update' as PermissionValues,
    //     handler: (row: Customer) => openStatusModal(row),
    //     class: 'text-gray-400 hover:text-purple-500' 
    //   },
    {
        icon: TrashIcon,
        tooltip: 'common.delete',
        permission: 'customers.delete' as PermissionValues,
        handler: (row: Customer) => deleteCustomer(row),
        class: 'text-gray-400 hover:text-red-500'
    }
].filter(action => !action.permission || hasPermission(action.permission))

const bulkActions = [
    //   {
    //     name: 'change_status',
    //     label: 'customers.change_status_bulk',
    //     // icon: ArrowTrendingUpIcon,
    //     handler: changeStatusBulk,
    //     permission: 'customers.update' as PermissionValues,
    //   },
    {
        name: 'delete_selected',
        label: 'common.delete_selected',
        // icon: TrashIcon,
        handler: deleteSelected,
        confirm: true,
        confirmMessage: (selectedCount: number) =>
            t('customers.delete_selected_confirmation', { count: selectedCount }),
        permission: 'customers.delete' as PermissionValues,
    }
].filter(action => !action.permission || hasPermission(action.permission))

// Methods
const changeStatusTab = (status: string) => {
    activeTab.value = status
    filters.value.status = status === 'all' ? '' : status
    pagination.value.current_page = 1
    columns.value = columns.value.map(col => {
    if (col.field === 'status' && col.isShow !== undefined) {
        return { ...col, isShow: status == 'all' }
    }
    return { ...col } // Giữ nguyên nhưng tạo object mới để Vue reactivity hoạt động
    })
    fetchCustomers()
}

async function fetchCustomers() {
    setLoading?.(true)
    try {
        const params = {
            ...filters.value,
            page: pagination.value.current_page,
            per_page: pagination.value.per_page
        }

        const response = await api.get('/customers', { params })
        customers.value = response.data.data.items
        pagination.value = response.data.data.pagination
    } catch (error) {
        notificationService.error(t('customers.fetch_failed'))
    } finally {
        setLoading?.(false)
    }
}

async function handleSubmit(customerData: Partial<Customer>) {
    setLoading?.(true)
    const isEdit = !!customerData.id
    try {
        const method = isEdit ? 'put' : 'post'
        const url = isEdit ? `/customers/${customerData.id}` : '/customers'

        const response = await api[method](url, customerData)

        if (response.data.status) {
            notificationService.success(response.data.message)
            await fetchCustomers()
            closeModal()
        } else {
            notificationService.error(String(response.data.errors) ? response.data.errors : (response.data.message ||
                t(isEdit ? 'customers.update_failed' : 'customers.create_failed')))
            formErrors.value = response.data.errors || {}
        }
    } catch (error: any) {
        if (error.response?.data?.errors) {
            formErrors.value = error.response.data.errors
            notificationService.error(
                // Nếu errors tồn tại và là mảng
                error.response?.data?.errors && Array.isArray(error.response.data.errors)
                    ? error.response?.data?.message || 'Lỗi không xác định' // Hiển thị message nếu có
                    : typeof error.response?.data?.errors === 'string'
                        ? error.response.data.errors // Hiển thị chuỗi lỗi
                        : error.response?.data?.message
                            ? error.response.data.message // Fallback vào message nếu có
                            : t(isEdit ? 'customers.update_failed' : 'customers.create_failed') // Fallback cuối cùng
            );

        }
    }
    finally {
        setLoading?.(false)
    }
}

// Modal handlers
const openAddModal = () => {
    currentMode.value = 'add'
    currentCustomer.value = {
        customer_type: 'INDIVIDUAL',
        full_name: '',
        short_name: '',
        status: 'new',
        contacts: [],
        representatives: []
    }
    isModalOpen.value = true
}

function editCustomer(customer: Customer) {
    currentMode.value = 'edit'
    currentCustomer.value = { ...customer }
    formErrors.value = {}
    isModalOpen.value = true
}

function viewCustomer(customer: Customer) {
    currentMode.value = 'view'
    currentCustomer.value = { ...customer }
    isModalOpen.value = true
}

function closeModal() {
    isModalOpen.value = false
    formErrors.value = {}
}

// Status change handlers
function openStatusModal(customer: Customer) {
    customerToChangeStatus.value = customer
    showStatusModal.value = true
}

function closeStatusModal() {
    showStatusModal.value = false
    customerToChangeStatus.value = null
}

async function confirmStatusChange(newStatus: string, note?: string) {
    if (!customerToChangeStatus.value) return

    setLoading?.(true)
    try {
        await api.put(`/customers/${customerToChangeStatus.value.id}`, {
            status: newStatus,
            status_note: note
        })

        notificationService.success(t('customers.status_changed_success'))
        await fetchCustomers()
        closeStatusModal()
    } catch (error) {
        notificationService.error(t('customers.status_change_failed'))
    } finally {
        setLoading?.(false)
    }
}

// Delete handlers
function deleteCustomer(customer: Customer) {
    customerToDelete.value = customer
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!customerToDelete.value) return

    const customersToDelete = Array.isArray(customerToDelete.value)
        ? customerToDelete.value
        : [customerToDelete.value]

    setLoading?.(true)
    try {
        for (const customer of customersToDelete) {
            await api.delete(`/customers/${customer.id}`)
        }

        notificationService.success(t('customers.delete_success'))
        await fetchCustomers()
    } catch (error) {
        notificationService.error(t('customers.delete_failed'))
    } finally {
        showDeleteModal.value = false
        customerToDelete.value = null
        setLoading?.(false)
    }
}

function closeDeleteModal() {
    showDeleteModal.value = false
}

// Bulk actions
function handleSelectionChange(rows: Customer[]) {
    selectedRows.value = rows
}

function deleteSelected() {
    if (!selectedRows.value.length) return
    customerToDelete.value = selectedRows.value
    showDeleteModal.value = true
}

function changeStatusBulk() {
    // Implementation for bulk status change
    if (selectedRows.value.length > 0) {
        // Open bulk status change modal
        notificationService.info(t('customers.bulk_status_change_coming_soon'))
    }
}

// Server-side handlers
function handleServerPageChange(pageData: any) {
    pagination.value.current_page = pageData.page
    pagination.value.per_page = pageData.perPage
    fetchCustomers()
}

function handleServerSort(sortData: any) {
    filters.value.sort_by = sortData.field
    filters.value.sort_order = sortData.direction
    fetchCustomers()
}

function handleServerFilter(filterData: any) {
    filters.value = {
        ...filters.value,
        ...filterData
    }

    pagination.value.current_page = 1
    fetchCustomers()
}

// Initialize
onMounted(async () => {
    if (!categorySystem.loaded) {
        await categorySystem.initCategories()
    }
    await fetchCustomers()
})

// Watch for active tab changes
watch(activeTab, (newTab) => {
    filters.value.status = newTab === 'all' ? '' : newTab
    pagination.value.current_page = 1
    fetchCustomers()
})
</script>