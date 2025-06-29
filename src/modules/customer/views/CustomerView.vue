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
            @submit="handleSubmit" @renew-order="openRenewOrderModal" />

        <!-- Confirm Modal -->
        <ConfirmModal :show="showDeleteModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />
        <!-- Order Modal -->
        <OrderModal :errors="formOrderError" :isModalOpen="isOrderModalOpen" mode="add" :currentOrder="renewOrderData"
            @close="closeOrderModal" @submit="handleSubmitOrder" :categorySystem="categorySystem"
            :customerCode="customerCode" />
        <ConfirmModal :show="showConfirmChangeStatusModal" :close="() => showConfirmChangeStatusModal = false"
            :onConfirm="handleConfirmChangeStatus" type="danger" :closeOnClickOutside="false"
            :title="t('common.confirm')" :message="confirmMessage" :confirmText="t('common.yes')"
            :cancelText="t('common.no')" />
        <InputModal :show="showInputModal" :close="() => showInputModal = false" :onConfirm="handleMarkConfirm"
            :title="titleModal" :message="confirmMessage" :inputLabel="labelInputModal"
            :inputPlaceholder="placeholderInputModal" inputRequired :inputValidator="inputValidator" />

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
import InputModal from '@/components/modals/InputModal.vue'
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PageIcon
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
import OrderModal from "@/modules/order/components/OrderModal.vue"
import { UnqualifiedIcon, InactiveIcon, RestoreIcon } from '@/icons'
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
const formOrderError = ref({})
const isOrderModalOpen = ref(false)
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
    },
    {
        value: 'expiring_soon',
        label: t('customers.status.expiring_soon'),
    },
    {
        value: 'expired',
        label: t('customers.status.expired'),
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
const customerCode = ref<string | null>(null);
const openAddOrderModal = (customer: Customer) => {
    isOrderModalOpen.value = true
    customerCode.value = customer.customer_code || null
}

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
                new: 'bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
                in_progress: 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
                converted: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
                unqualified: 'bg-rose-50 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
                inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
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
        icon: PageIcon,
        tooltip: 'common.create_order',
        permission: 'orders.create' as PermissionValues,
        handler: (row: Customer) => openAddOrderModal(row),
        class: 'text-gray-400 hover:text-blue-500'
    },
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
    {
        icon: UnqualifiedIcon,
        tooltip: 'common.mark_unqualified',
        permission: 'customers.mark_unqualified' as PermissionValues,
        handler: (row: Customer) => confirmMarkUnqualified(row),
        class: 'text-gray-400 hover:text-blue-500',
        conditionShow: (row: Customer) => ['new'].includes(row.status),
    },
    {
        icon: InactiveIcon,
        tooltip: 'common.mark_inactive',
        permission: 'customers.mark_inactive' as PermissionValues,
        handler: (row: Customer) => confirmMarkInactive(row),
        class: 'text-gray-400 hover:text-blue-500',
        conditionShow: (row: Customer) => ['in_progress', 'converted'].includes(row.status),
    },
    {
        icon: RestoreIcon,
        tooltip: 'common.restore',
        permission: 'customers.restore' as PermissionValues,
        handler: (row: Customer) => confirmRestore(row),
        class: 'text-gray-400 hover:text-blue-500',
        conditionShow: (row: Customer) => ['inactive', 'unqualified'].includes(row.status),
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
const markUnqualifiedSelected = async (reason: string) => {
    if (selectedRows.value.length === 0) {
        notificationService.error(t('customers.no_selected'))
        return
    }

    if (!reason) {
        notificationService.error("Lý do đánh dấu không tiềm năng là bắt buộc")
        return
    }

    setLoading?.(true)
    try {
        const ids = selectedRows.value.map(customer => customer.id)
        const response = await api.post('/customers/mark-unqualified', { ids, reason })

        if (response.data.status) {
            notificationService.success("Khách hàng đã được cập nhật là không tiềm năng")
            fetchCustomers()
        } else {
            notificationService.error(response.data.message || "Không thể cập nhật khách hàng là không tiềm năng")
        }
    } catch (error: any) {
        console.error('Mark unqualified error:', error)
        notificationService.error(error.response?.data?.message || "Không thể cập nhật khách hàng là không tiềm năng")
    } finally {
        setLoading?.(false)
    }
};
const markInactiveSelected = async (reason: string) => {
    if (selectedRows.value.length === 0) {
        notificationService.error(t('customers.no_selected'))
        return
    }

    if (!reason) {
        notificationService.error("Lý do đánh dấu ngưng hoạt động là bắt buộc")
        return
    }

    setLoading?.(true)
    try {
        const ids = selectedRows.value.map(customer => customer.id)
        const response = await api.post('/customers/mark-inactive', { ids, reason })
        console.log(response);

        if (response.data.status) {
            notificationService.success("Khách hàng đã được cập nhật thành ngưng hoạt động")
            fetchCustomers()
        } else {
            notificationService.error(response.data.message || "Không thể cập nhật khách hàng thành ngưng hoạt động")
        }
    } catch (error: any) {
        console.error('Mark inactive error:', error)
        notificationService.error(error.response?.data?.message || "Không thể cập nhật khách hàng thành ngưng hoạt động")
    } finally {
        setLoading?.(false)
    }
};
const restoreSelected = async () => {
    if (selectedRows.value.length === 0) {
        notificationService.error(t('customers.no_selected'))
        return
    }

    const ids = selectedRows.value.map(customer => customer.id)
    setLoading?.(true)
    try {
        const response = await api.post('/customers/restore', { ids })

        if (response.data.status) {
            notificationService.success("Khách hàng đã được khôi phục thành công")
            fetchCustomers()
        } else {
            notificationService.error(response.data.message || "Không thể khôi phục khách hàng")
        }
    } catch (error: any) {
        console.error('Restore error:', error)
        notificationService.error(error.response?.data?.message || "Không thể khôi phục khách hàng")
    } finally {
        setLoading?.(false)
    }
};

const bulkActions = [

    {
        name: 'common.mark_unqualified',
        label: 'common.mark_unqualified',
        handler: markUnqualifiedSelected,
        requireInput: true,
        requireConfirm: false,
        inputLabel: '',
        inputPlaceholder: 'Nhập lý do đánh dấu không tiềm năng',
        confirmMessage: (selectedCount: number) => "Bạn có chắc chắn muốn cập nhật không tiềm năng các khách hàng đã chọn?",
        permission: 'customers.mark_unqualified' as PermissionValues,
        class: 'text-red-600 hover:text-red-700',
        condition: () => selectedRows.value.some(customer => ['new'].includes(customer.status))
    },
    {
        name: 'common.mark_inactive',
        label: 'common.mark_inactive',
        handler: markInactiveSelected,
        requireInput: true,
        requireConfirm: false,
        inputLabel: '',
        inputPlaceholder: 'Nhập lý do đánh dấu ngưng hoạt động',
        confirmMessage: (selectedCount: number) => "Bạn có chắc chắn muốn cập nhật ngưng hoạt động', các khách hàng đã chọn?",
        permission: 'customers.mark_inactive' as PermissionValues,
        class: 'text-red-600 hover:text-red-700',
        condition: () => selectedRows.value.some(customer => ['converted', 'in_progress'].includes(customer.status))
    },
    {
        name: 'common.restore',
        label: 'common.restore',
        handler: restoreSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.complete_selected_confirmation', { count: selectedCount }),
        permission: 'customer.restore' as PermissionValues,
        class: 'text-green-600 hover:text-green-700',
        condition: () => selectedRows.value.some(customer => customer.status === 'processing')
    },
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
const showInputModal = ref(false)
const labelInputModal = ref('')
const placeholderInputModal = ref('')
const inputValidator = ref<((value: string) => boolean) | null>(null);
const showConfirmChangeStatusModal = ref(false)
const titleModal = ref('')
const confirmMessage = ref('')
const selectStatusCustomer = ref('')


const handleMarkConfirm = (inputValue: string) => {
    if (!customerToChangeStatus.value || !selectStatusCustomer.value) return
    if (selectStatusCustomer.value === 'inactive') {
        markInactive(customerToChangeStatus.value, inputValue)
    } else if (selectStatusCustomer.value === 'unqualified') {
        markUnqualified(customerToChangeStatus.value, inputValue)
    }
    showInputModal.value = false
    selectStatusCustomer.value = ''
};
const confirmRestore = (customer: Customer) => {
    if (!customer || !selectStatusCustomer) return;

    showConfirmChangeStatusModal.value = true;
    titleModal.value = "Xác nhận";
    confirmMessage.value = `Bạn có chắc chắn muốn khôi phục khách hàng ${customer.customer_code}?`;
    selectStatusCustomer.value = 'restore';
    customerToChangeStatus.value = customer;
};
const confirmMarkInactive = (customer: Customer) => {
    if (!customer || !selectStatusCustomer) return;

    showInputModal.value = true;
    titleModal.value = "Xác nhận";
    confirmMessage.value = `Bạn có chắc chắn muốn đánh dấu khách hàng ${customer.customer_code} là ngưng hoạt động?`;
    // labelInputModal.value = "Lý do đánh dấu ngưng hoạt động";
    placeholderInputModal.value = "Nhập lý do đánh dấu ngưng hoạt động";
    selectStatusCustomer.value = 'inactive';
    customerToChangeStatus.value = customer;
};
const confirmMarkUnqualified = (customer: Customer) => {
    if (!customer || !selectStatusCustomer) return;

    showInputModal.value = true;
    titleModal.value = "Xác nhận";
    confirmMessage.value = `Bạn có chắc chắn muốn chuyển trạng thái khách hàng ${customer.customer_code} sang không tiềm năng?`;
    placeholderInputModal.value = "Nhập lý do đánh dấu không tiềm năng";
    selectStatusCustomer.value = 'unqualified';
    customerToChangeStatus.value = customer;
};
const restoreCustomer = (customer: Customer) => {
    if (customer.status !== 'inactive' && customer.status !== 'unqualified') {
        notificationService.error("Khách hàng chỉ có thể cập nhật khi ở trạng thái 'Không tiềm năng' hoặc 'ngưng hoạt động'")
        return
    }

    setLoading?.(true)
    api.post(`/customers/restore`, { ids: [customer.id] })
        .then(response => {
            if (response.data.status) {
                notificationService.success("Khách hàng đã được khôi phục thành công")
                fetchCustomers()

            } else {
                notificationService.error(response.data.message || "Không thể khôi phục khách hàng")
            }
        })
        .catch(error => {
            console.error('Restore error:', error)
            if (error.response?.data?.message) {
                notificationService.error(error.response.data.message)
            } else {
                notificationService.error("Không thể khôi phục khách hàng")
            }
        })
        .finally(() => {
            setLoading?.(false)
            showConfirmChangeStatusModal.value = false;
        }
        )
}
const markInactive = (customer: Customer, reason: string) => {
    if (customer.status !== 'in_progress' && customer.status !== 'converted') {
        notificationService.error("Khách hàng chỉ có thể cập nhật khi ở trạng thái 'Đang xử lý' hoặc 'Đã chuyển đổi'")
        return
    }

    setLoading?.(true)
    api.post(`/customers/mark-inactive`, { ids: [customer.id], reason })
        .then(response => {
            if (response.data.status) {
                notificationService.success("Khách hàng đã được cập nhật thành ngưng hoạt động")
                fetchCustomers()
            } else {
                notificationService.error(response.data.message || "Không thể cập nhật khách hàng thành ngưng hoạt động")
            }
        })
        .catch(error => {
            console.error('Mark inactive error:', error)
            if (error.response?.data?.message) {
                notificationService.error(error.response.data.message)
            } else {
                notificationService.error("Không thể cập nhật khách hàng thành ngưng hoạt động")
            }
        })
        .finally(() => setLoading?.(false))
}
const markUnqualified = (customer: Customer, reason: string) => {
    if (customer.status !== 'new') {
        notificationService.error("Khách hàng chỉ có thể cập nhật khi ở trạng thái 'Đăng ký mới'")
        return
    }

    setLoading?.(true)
    api.post(`/customers/mark-unqualified`, { ids: [customer.id], reason })
        .then(response => {
            if (response.data.status) {
                notificationService.success("Khách hàng đã được cập nhật là không tiềm năng")
                fetchCustomers()
            } else {
                notificationService.error(response.data.message || "Không thể cập nhật khách hàng là không tiềm năng")
            }
        })
        .catch(error => {
            console.error('Mark unqualified error:', error)
            if (error.response?.data?.message) {
                notificationService.error(error.response.data.message)
            } else {
                notificationService.error("Không thể cập nhật khách hàng là không tiềm năng")
            }
        })
        .finally(() => setLoading?.(false))
}
const handleConfirmChangeStatus = () => {
    if (!customerToChangeStatus.value || !selectStatusCustomer.value) return
    if (selectStatusCustomer.value === 'restore') {
        restoreCustomer(customerToChangeStatus.value)
    }
}
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

const handleSubmitOrder = async (orderData: any) => {

    formErrors.value = {}
    const data = orderData.submitData;
    const isEdit = !!data.id
    setLoading?.(true)
    try {
        const method = 'post'
        const url = '/orders'

        const response = await api[method](url, data)

        if (response.data.status || response.status === 201) {
            notificationService.success(
                response.data.message ||
                (isEdit ? t('orders.update_success') : t('orders.create_success'))
            )
            await fetchCustomers()
            closeOrderModal()
        } else {
            throw new Error(response.data.message || t('orders.save_failed'))
        }
    } catch (error: any) {
        console.error('Submit error:', error)

        if (error.response?.status === 422 && error.response?.data?.errors) {
            formErrors.value = error.response.data.errors
        }

        notificationService.error(
            error.response?.data?.message ||
            error.message ||
            t('orders.save_failed')
        )
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
    customerCode.value = customer.customer_code || null
}

function viewCustomer(customer: Customer) {
    currentMode.value = 'view'
    currentCustomer.value = { ...customer }
    isModalOpen.value = true
    customerCode.value = customer.customer_code || null
}

function closeModal() {
    isModalOpen.value = false
    formErrors.value = {}
}
function closeOrderModal() {
    isOrderModalOpen.value = false
    formOrderError.value = {}
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
const renewOrderData = ref({})
const openRenewOrderModal = async (
    pkg: { id: any; service_type: any; package_id: any } |
        { id: any; service_type: any; package_id: any }[]
) => {
    // Chuẩn hóa đầu vào thành mảng
    const packages = Array.isArray(pkg) ? pkg : [pkg];

    console.log('Preparing renewal for packages:', packages);
    setLoading?.(true);

    try {
        // Xử lý song song các yêu cầu API
        const renewalRequests = packages.map(async (pkgItem) => {
            try {
                const res = await api.get(`/order-details/${pkgItem.id}/prepare-renew`);
                return res.data.data;
            } catch (error) {
                console.error(`Error preparing renewal for package ${pkgItem.id}:`, error);
                notificationService.error(`Không thể chuẩn bị gia hạn cho gói ${pkgItem.package_id}`);
                return null;
            }
        });

        // Chờ tất cả kết quả
        const renewalData = await Promise.all(renewalRequests);

        // Lọc bỏ các gói không thành công
        const validRenewals = renewalData.filter(data => data !== null);

        if (validRenewals.length === 0) {
            notificationService.error("Không có gói nào có thể gia hạn");
            return;
        }

        // Cập nhật dữ liệu gia hạn
        renewOrderData.value = {
            details: validRenewals,
            customer: currentCustomer.value
        };

        // Mở modal
        isOrderModalOpen.value = true;

        // Thông báo thành công
        if (validRenewals.length !== packages.length) {
            notificationService.warning(
                `Đã chuẩn bị ${validRenewals.length}/${packages.length} gói để gia hạn`
            );
        } else {
            notificationService.success(
                `Đã sẵn sàng gia hạn ${validRenewals.length} gói`
            );
        }

    } catch (error) {
        console.error('Unexpected error:', error);
        notificationService.error("Có lỗi xảy ra khi xử lý gia hạn");
    } finally {
        setLoading?.(false);
    }
};
// Watch for active tab changes
watch(activeTab, (newTab) => {
    filters.value.status = newTab === 'all' ? '' : newTab
    pagination.value.current_page = 1
    fetchCustomers()
})
</script>