<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />

        <!-- Status Tabs -->
        <div class="mb-6">
            <div class="border-b border-gray-200 dark:border-gray-700">
                <nav class="-mb-px flex space-x-8 overflow-x-auto">
                    <button v-for="tab in statusTabs" :key="tab.value" @click="changeStatusTab(tab.value)" :class="[
                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs flex items-center space-x-2 transition-colors duration-200',
                        activeTab === tab.value
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    ]">
                        <span>{{ tab.label }}</span>
                    </button>
                </nav>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="space-y-6">
            <CustomTable :columns="columns" :rowData="orders" :actions="tableActions" :bulkActions="bulkActions"
                :pageSizeOptions="[10, 25, 50, 100]" :defaultPageSize="25"
                :showAddButton="hasPermission('orders.create' as PermissionValues)" hasSelection
                :server-pagination="true" :server-total-items="pagination.total"
                :server-current-page="pagination.current_page" :server-per-page="pagination.per_page"
                :server-last-page="pagination.last_page" @add="openAddModal"
                @update:selectedRows="handleSelectionChange" @refresh="fetchOrders"
                @server-page-change="handleServerPageChange" @server-sort="handleServerSort"
                @filter="handleServerFilter" :show-refresh-button="true" :searchOptions="searchOptions"
                :filterOptions="filterOptions" @server-filter="handleServerFilter" />
        </div>

        <!-- Order Modal -->
        <OrderModal :errors="formErrors" :isModalOpen="isModalOpen" :mode="currentMode" :currentOrder="currentOrder"
            :loading="isModalLoading" @close="closeModal" @submit="handleSubmit" :categorySystem="categorySystem" />

        <!-- confirm change status -->
        <ConfirmModal :show="showConfirmChangeStatusModal" :close="() => showConfirmChangeStatusModal = false"
            :onConfirm="handleConfirmChangeStatus" :type="typeConfirmModal" :closeOnClickOutside="false"
            :title="t('common.confirm')" :message="confirmMessage" :confirmText="t('common.yes')"
            :cancelText="t('common.no')" />

        <!-- Delete Confirmation Modal -->
        <ConfirmModal :show="showDeleteModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="deleteConfirmMessage"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />

        <!-- Bulk Actions Modal -->
        <ConfirmModal :show="showBulkDeleteModal" :close="closeBulkDeleteModal" :onConfirm="confirmBulkDelete"
            type="danger" :closeOnClickOutside="false" :title="t('common.confirm')"
            :message="t('orders.bulk_delete_confirmation', { count: selectedRows.length })"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />
        <InputModal :show="showInputModal" :close="() => showInputModal = false" :onConfirm="handleCancelConfirm"
            :title="titleModal" :message="confirmMessage" :inputLabel="labelInputModal"
            :inputPlaceholder="placeholderInputModal" inputRequired :inputValidator="inputValidator" />
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import OrderModal from "@/modules/order/components/OrderModal.vue"
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import InputModal from '@/components/modals/InputModal.vue'
import { EyeIcon, PencilIcon, TrashIcon, SendIcon, CancelIcon, ApproveIcon, TimeIcon, DoneIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import type { PermissionValues } from '@/types/permissions'
import { useCategorySystem } from '@/stores/categorySystem'

// ===== TYPES =====
interface CustomerContact {
    contact_type: string
    value: string
    label?: string
    is_primary?: boolean
    note?: string
}

interface Customer {
    id: string
    full_name: string
    contacts?: CustomerContact[]
}

interface OrderDetail {
    id?: string
    service_package_id: string
    package_code: string
    package_name: string
    base_price: number
    quantity: number
    currency: string
    start_date: string
    end_date: string
    tax_rate?: number
    tax_included?: boolean
    features?: string[]
}

interface Order {
    submitData: any
    id: string
    order_code: string
    order_date: string
    customer_id: string
    customer: Customer
    order_status: 'draft' | 'pending' | 'approved' | 'processing' | 'completed' | 'cancelled' | string
    team_id?: string
    total_amount?: number
    order_details?: OrderDetail[]
    created_at?: string
    updated_at?: string
}

interface StatusTab {
    value: string
    label: string
    count?: number
}

interface Pagination {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

interface Filters {
    order_status: string
    customer_id: string
    sort_by: string
    sort_order: 'asc' | 'desc'
    search?: string
    date_from?: string
    date_to?: string
}

// ===== COMPOSABLES =====
const { t } = useI18n()
const { hasPermission } = usePermissions()
const setLoading = inject<(isLoading: boolean) => void>('setLoading')
const categorySystem = useCategorySystem()


// ===== REACTIVE DATA =====
const currentPageTitle = ref('orders')
const orders = ref<Order[]>([])
const selectedRows = ref<Order[]>([])
const formErrors = ref<Record<string, string[]>>({})
const currentMode = ref<'add' | 'edit' | 'view'>('add')
const currentOrder = ref<Partial<Order>>({})
const isModalOpen = ref(false)
const isModalLoading = ref(false)
const showDeleteModal = ref(false)
const showBulkDeleteModal = ref(false)
const isDeleteLoading = ref(false)
const isBulkDeleteLoading = ref(false)
const isLoading = ref(false)
const activeTab = ref('all')
const statusCounts = ref<Record<string, number>>({})
const showInputModal = ref(false)
const titleModal = ref('')
const labelInputModal = ref('')
const placeholderInputModal = ref('')
const inputValidator = ref<((value: string) => boolean) | null>(null);
const showConfirmChangeStatusModal = ref(false)
const typeConfirmModal = ref<'danger' | 'warning' | 'info' | 'success'>('warning')


// ===== COMPUTED =====
const statusTabs = computed<StatusTab[]>(() => [
    {
        value: 'all',
        label: t('orders.status.all'),
        count: statusCounts.value.all || 0
    },
    {
        value: 'draft',
        label: t('orders.status.draft'),
        count: statusCounts.value.draft || 0
    },
    {
        value: 'pending',
        label: t('orders.status.pending'),
        count: statusCounts.value.pending || 0
    },
    {
        value: 'approved',
        label: t('orders.status.approved'),
        count: statusCounts.value.approved || 0
    },
    {
        value: 'processing',
        label: t('orders.status.processing'),
        count: statusCounts.value.processing || 0
    },
    {
        value: 'completed',
        label: t('orders.status.completed'),
        count: statusCounts.value.completed || 0
    },
    {
        value: 'cancelled',
        label: t('orders.status.cancelled'),
        count: statusCounts.value.cancelled || 0
    }
])

const deleteConfirmMessage = computed(() => {
    if (selectedRows.value.length === 1) {
        return t('orders.single_delete_confirmation', {
            orderCode: selectedRows.value[0].order_code
        })
    }
    return t('orders.delete_confirmation')
})

const confirmMessage = ref('')

// ===== REACTIVE REFS =====
const pagination = ref<Pagination>({
    current_page: 1,
    per_page: 25,
    total: 0,
    last_page: 1
})

const filters = ref<Filters>({
    order_status: '',
    customer_id: '',
    sort_by: 'created_at',
    sort_order: 'desc'
})

// ===== CONFIGURATION =====
const searchOptions = computed(() => [
    { field: 'order_code', label: t('orders.fields.order_code') },
    { field: 'customer.full_name', label: t('orders.fields.customer_full_name') },
    { field: 'customer.customer_code', label: t('customers.fields.customer_code') },
])

const filterOptions = computed(() => [
    {
        field: 'order_status',
        label: 'orders.fields.order_status',
        type: 'select',
        options: [
            { value: '', label: t('common.all') },
            { value: 'draft', label: t('orders.status.draft') },
            { value: 'pending', label: t('orders.status.pending') },
            { value: 'approved', label: t('orders.status.approved') },
            { value: 'processing', label: t('orders.status.processing') },
            { value: 'completed', label: t('orders.status.completed') },
            { value: 'cancelled', label: t('orders.status.cancelled') }
        ]
    },
    {
        field: 'date_from',
        label: 'orders.fields.date_from',
        type: 'date'
    },
    {
        field: 'date_to',
        label: 'orders.fields.date_to',
        type: 'date'
    }
])

const columns = ref([
    {
        field: 'order_code',
        label: 'orders.fields.order_code',
        sortable: true,
        width: '120px'
    },
    {
        field: 'created_at',
        label: 'orders.fields.created_at',
        sortable: true,
        width: '120px',
        formatter: (value: string) => {
            if (!value) return '-'
            const date = new Date(value)
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date)
        },
        isHtml: false
    },
    {
        field: 'customer',
        label: 'orders.fields.customer',
        sortable: false,
        width: '250px',
        formatter: (customer: Customer) => {
            if (!customer) return '-'
            if (customer.full_name) return `<div class="text-gray-600 dark:text-gray-500">${customer.full_name}</div>`
            const primaryContact = customer.contacts?.find(c => c.is_primary) || customer.contacts?.[0]
            const contactInfo = primaryContact ? `<br><span class="text-xs text-gray-500">${primaryContact.value}</span>` : ''
            return `<div><strong class="text-gray-600 dark:text-gray-500">${customer.full_name}</strong>${contactInfo}</div>`
        },
        isHtml: true
    },
    {
        field: 'total_amount',
        label: 'orders.fields.total_amount',
        sortable: true,
        width: '120px',
        formatter: (value: number, row: { currency: any }) => {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: row.currency || 'VND',
            }).format(value);
        },
        align: 'left'
    },
    {
        field: 'order_status',
        label: 'orders.fields.order_status',
        sortable: true,
        width: '120px',
        formatter: (value: string) => t(`orders.status.${value}`),
        cellClass: (value: string) => {
            const colorMap: Record<string, string> = {
                draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
                pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
                approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
                processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
                completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
                cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }
            return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`
        },
        align: 'left',
        headerAlign: 'left',
        isShow: activeTab.value === 'all'
    },
    {
        field: 'reason_cancel',
        label: 'orders.fields.reason_cancel',
        sortable: false,
        width: '250px',
        isShow: activeTab.value === 'cancelled',
    },
])

const tableActions = computed(() => {
    const baseActions = [
        {
            icon: EyeIcon,
            tooltip: 'common.view',
            permission: 'orders.view' as PermissionValues,
            handler: (row: Order) => viewOrder(row),
            class: 'text-gray-400 hover:text-green-500 transition-colors duration-200'
        },
        {
            icon: PencilIcon,
            tooltip: 'common.edit',
            permission: 'orders.update' as PermissionValues,
            handler: (row: Order) => editOrder(row),
            class: 'text-gray-400 hover:text-blue-500 transition-colors duration-200',
            conditionShow: (row: Order) => row.order_status == 'draft' || row.order_status === 'pending'
        }
    ]

    // Dynamic status actions based on current status
    const statusActions: any[] = []

    statusActions.push({
        icon: SendIcon,
        tooltip: 'orders.send_approved',
        permission: 'orders.draft_to_pending' as PermissionValues,
        handler: (row: Order) => confirmChangeStatus(row, 'pending'),
        class: 'text-gray-400 hover:text-blue-500 transition-colors duration-200',
        conditionShow: (row: Order) => row.order_status === 'draft',

    })

    // Approve action (for draft, pending)
    statusActions.push({
        icon: ApproveIcon,
        tooltip: 'orders.approve_selected',
        permission: 'orders.pending_to_approved' as PermissionValues,
        handler: (row: Order) => confirmChangeStatus(row, 'approved'),
        class: 'text-gray-400 hover:text-blue-500 transition-colors duration-200',
        conditionShow: (row: Order) => ['draft', 'pending'].includes(row.order_status),

    })

    // Process action (for approved)
    statusActions.push({
        icon: TimeIcon,
        tooltip: 'orders.process_selected',
        permission: 'orders.approved_to_processing' as PermissionValues,
        handler: (row: Order) => confirmChangeStatus(row, 'processing'),
        class: 'text-gray-400 hover:text-purple-500 transition-colors duration-200',
        conditionShow: (row: Order) => row.order_status === 'approved',

    })
    statusActions.push({
        icon: TimeIcon,
        tooltip: 'Chuyển chờ xử lý',
        permission: 'orders.pending_to_approved' as PermissionValues,
        handler: (row: Order) => confirmChangeStatus(row, 'pending'),
        class: 'text-gray-400 hover:text-purple-500 transition-colors duration-200',
        conditionShow: (row: Order) => row.order_status === 'approved',

    })

    // Complete action (for processing)
    statusActions.push({
        icon: DoneIcon,
        tooltip: 'orders.complete_selected',
        permission: 'orders.processing_to_completed' as PermissionValues,
        handler: (row: Order) => confirmChangeStatus(row, 'completed'),
        class: 'text-gray-400 hover:text-green-500 transition-colors duration-200',
        conditionShow: (row: Order) => row.order_status === 'processing',

    })

    // Cancel action (for non-completed, non-cancelled)
    statusActions.push({
        icon: CancelIcon,
        tooltip: 'orders.cancel_selected',
        permission: 'orders.any_to_cancelled' as PermissionValues,
        handler: (row: Order) => confirmCancelOrder(row, 'cancelled'),
        class: 'text-gray-400 hover:text-red-500 transition-colors duration-200',
        conditionShow: (row: Order) => !['completed', 'cancelled'].includes(row.order_status),
    })

    const deleteAction = {
        icon: TrashIcon,
        tooltip: 'common.delete',
        permission: 'orders.delete' as PermissionValues,
        handler: (row: Order) => deleteOrder(row),
        class: 'text-gray-400 hover:text-red-500 transition-colors duration-200'
    }

    return [...baseActions, ...statusActions, deleteAction]
        .filter(action => (!action.permission || hasPermission(action.permission) && (!action.condition || action.condition(selectedRows.value[0]))))
})

const bulkActions = computed(() => [
    {
        name: 'delete_selected',
        label: 'common.delete_selected',
        handler: deleteSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.delete_selected_confirmation', { count: selectedCount }),
        permission: 'orders.delete' as PermissionValues,
        class: 'text-red-600 hover:text-red-700'
    },
    {
        name: 'orders.send_approved',
        label: 'orders.send_approved',
        handler: sendApproveSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.send_approved_confirmation', { count: selectedCount }),
        permission: 'orders.draft_to_pending' as PermissionValues,
        class: 'text-blue-600 hover:text-blue-700',
        condition: () => selectedRows.value.some(order => ['draft'].includes(order.order_status))
    },
    {
        name: 'orders.approve_selected',
        label: 'orders.approve_selected',
        handler: approveSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.approve_selected_confirmation', { count: selectedCount }),
        permission: 'orders.pending_to_approved' as PermissionValues,
        class: 'text-blue-600 hover:text-blue-700',
        condition: () => selectedRows.value.some(order => ['draft', 'pending'].includes(order.order_status))
    },
    {
        name: 'orders.process_selected',
        label: 'orders.process_selected',
        handler: processSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.process_selected_confirmation', { count: selectedCount }),
        permission: 'orders.approved_to_processing' as PermissionValues,
        class: 'text-purple-600 hover:text-purple-700',
        condition: () => selectedRows.value.some(order => order.order_status === 'approved')
    },
    {
        name: 'orders.complete_selected',
        label: 'orders.complete_selected',
        handler: completeSelected,
        requireConfirm: true,
        confirmMessage: (selectedCount: number) => t('orders.complete_selected_confirmation', { count: selectedCount }),
        permission: 'orders.processing_to_completed' as PermissionValues,
        class: 'text-green-600 hover:text-green-700',
        condition: () => selectedRows.value.some(order => order.order_status === 'processing')
    },
    {
        name: 'orders.cancel_selected',
        label: 'orders.cancel_selected',
        handler: cancelSelected,
        requireInput: true,
        requireConfirm: false,
        inputLabel: '',
        inputPlaceholder: 'Nhập lý do hủy đơn hàng...',
        confirmMessage: (selectedCount: number) => t('orders.cancel_selected_confirmation', { count: selectedCount }),
        permission: 'orders.any_to_cancelled' as PermissionValues,
        class: 'text-red-600 hover:text-red-700',
        condition: () => selectedRows.value.some(order => !['completed', 'cancelled'].includes(order.order_status))
    },
    {
        name: 'export_selected',
        label: 'orders.export_selected',
        handler: exportSelected,
        permission: 'orders.export' as PermissionValues,
        class: 'text-indigo-600 hover:text-indigo-700'
    }
].filter(action => {
    if (action.permission && !hasPermission(action.permission)) return false
    if (action.condition && !action.condition()) return false
    return true
}))

// ===== METHODS =====
const changeStatusTab = (status: string) => {
    activeTab.value = status
    filters.value.order_status = status === 'all' ? '' : status
    pagination.value.current_page = 1
    columns.value = columns.value.map(col => {
        if (col.field === 'order_status' && col.isShow !== undefined) {
            return { ...col, isShow: status === 'all' }
        }
        if (col.field === 'reason_cancel' && col.isShow !== undefined) {
            return { ...col, isShow: status === 'cancelled' }
        }
        return { ...col } // Giữ nguyên nhưng tạo object mới để Vue reactivity hoạt động
    })
    fetchOrders()
}

const fetchOrders = async () => {
    if (isLoading.value) return

    isLoading.value = true
    setLoading?.(true)

    try {
        const params = {
            ...filters.value,
            page: pagination.value.current_page,
            per_page: pagination.value.per_page
        }

        const response = await api.get('/orders', { params })

        if (response.data.status) {
            orders.value = response.data.data.items || []
            pagination.value = response.data.data.pagination || pagination.value
            statusCounts.value = response.data.data.status_counts || {}
        } else {
            throw new Error(response.data.message || 'Failed to fetch orders')
        }
    } catch (error: any) {
        console.error('Fetch orders error:', error)
        notificationService.error(error.message || t('orders.fetch_failed'))
        orders.value = []
    } finally {
        isLoading.value = false
        setLoading?.(false)
    }
}

const openAddModal = () => {
    currentMode.value = 'add'
    currentOrder.value = {}
    formErrors.value = {}
    isModalOpen.value = true
}

const editOrder = (order: Order) => {
    currentMode.value = 'edit'
    currentOrder.value = { ...order }
    formErrors.value = {}
    isModalOpen.value = true

}

const viewOrder = (order: Order) => {
    currentMode.value = 'view'
    currentOrder.value = { ...order }
    isModalOpen.value = true
}

const closeModal = () => {
    isModalOpen.value = false
    formErrors.value = {}
    currentOrder.value = {}
}

const deleteOrder = (order: Order) => {
    selectedRows.value = [order]
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!selectedRows.value.length || isDeleteLoading.value) return

    isDeleteLoading.value = true

    try {
        await Promise.all(
            selectedRows.value.map(order => api.delete(`/orders/${order.id}`))
        )

        notificationService.success(
            selectedRows.value.length === 1
                ? t('orders.delete_success')
                : t('orders.bulk_delete_success', { count: selectedRows.value.length })
        )

        await fetchOrders()
        closeDeleteModal()
    } catch (error: any) {
        console.error('Delete error:', error)
        notificationService.error(error.response?.data?.message || t('orders.delete_failed'))
    } finally {
        isDeleteLoading.value = false
    }
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    selectedRows.value = []
}

const deleteSelected = () => {
    if (!selectedRows.value.length) return
    showBulkDeleteModal.value = true
}

const confirmBulkDelete = async () => {
    if (!selectedRows.value.length || isBulkDeleteLoading.value) return

    isBulkDeleteLoading.value = true

    try {
        await Promise.all(
            selectedRows.value.map(order => api.delete(`/orders/${order.id}`))
        )

        notificationService.success(
            t('orders.bulk_delete_success', { count: selectedRows.value.length })
        )

        await fetchOrders()
        closeBulkDeleteModal()
    } catch (error: any) {
        console.error('Bulk delete error:', error)
        notificationService.error(error.response?.data?.message || t('orders.bulk_delete_failed'))
    } finally {
        isBulkDeleteLoading.value = false
    }
}

const closeBulkDeleteModal = () => {
    showBulkDeleteModal.value = false
    selectedRows.value = []
}
const orderToCancel = ref<Order | null>(null);
const cancelReason = ref('');
const newStatusSelect = ref('');


const confirmChangeStatus = (order: Order, newStatus: string) => {
    if (!order || !newStatus) return;

    showConfirmChangeStatusModal.value = true;
    typeConfirmModal.value = 'warning';
    titleModal.value = "Xác nhận";

    if (newStatus === 'approved') {
        confirmMessage.value = `Bạn có chắc chắn muốn phê duyệt đơn hàng ${order.order_code}?`;
    } else if (newStatus === 'pending') {
        confirmMessage.value = `Bạn có chắc chắn muốn gửi phê duyệt đơn hàng ${order.order_code}?`;
    } else if (newStatus === 'processing') {
        confirmMessage.value = `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng ${order.order_code} sang đang xử lý?`;
    } else if (newStatus === 'completed') {
        confirmMessage.value = `Bạn có chắc chắn muốn hoàn thành đơn hàng ${order.order_code}?`;
    } else if (newStatus === 'cancelled') {
        confirmMessage.value = `Bạn có chắc chắn muốn hủy đơn hàng ${order.order_code}?`;
    } else {
        confirmMessage.value = `Bạn có chắc chắn muốn chuyển trạng thái đơn hàng ${order.order_code} sang ${t(`orders.status.${newStatus}`)}?`;
    }
    orderToCancel.value = order;
    newStatusSelect.value = newStatus;
};
const handleConfirmChangeStatus = () => {
    if (!orderToCancel.value || !newStatusSelect.value) return;
    changeOrderStatus(orderToCancel.value, newStatusSelect.value, cancelReason.value);
    resetCancelData();
    showConfirmChangeStatusModal.value = false;
};
// xác nhận hủy đơn 1
const handleCancelConfirm = (reason: string) => {
    if (!orderToCancel.value || !newStatusSelect.value) return;
    changeOrderStatus(orderToCancel.value, newStatusSelect.value, reason);
};

const resetCancelData = () => {
    orderToCancel.value = null;
    newStatusSelect.value = '';
    cancelReason.value = '';
};

const confirmCancelOrder = (order: Order, newStatus: string) => {
    showInputModal.value = true
    titleModal.value = 'Xác nhận'
    confirmMessage.value = `Bạn có chắc chắn muốn hủy đơn hàng ${order.order_code}?`
    labelInputModal.value = ''
    placeholderInputModal.value = 'Nhập lý do hủy đơn hàng...'
    inputValidator.value = (value: string) => {
        return true
    }
    orderToCancel.value = order;
    newStatusSelect.value = newStatus;

}

const exportSelected = async () => {
    if (!selectedRows.value.length) return

    try {
        const orderIds = selectedRows.value.map(order => order.id)
        const response = await api.post('/orders/export', { order_ids: orderIds }, {
            responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)

        notificationService.success(t('orders.export_success'))
    } catch (error: any) {
        console.error('Export error:', error)
        notificationService.error(error.response?.data?.message || t('orders.export_failed'))
    }
}
type OrderStatus = 'draft' | 'pending' | 'approved' | 'processing' | 'cancelled' | 'completed';

const updateOrdersStatus = async (status: string, actionName: string, status_old: OrderStatus[], reason = "") => {
    if (!selectedRows.value.length) return
    if (selectedRows.value.some(order => order.order_status === status)) {
        // notificationService.warning(t(`orders.${actionName}_already`))
        notificationService.warning("Vui lòng kiểm tra lại trạng thái đơn hàng");
        return
    }

    if (status_old?.length &&
        selectedRows.value.some((order: Order) =>
            !(status_old as Array<Order['order_status']>).includes(order.order_status)
        )) {
        // notificationService.warning(
        //     t(`orders.${actionName}_not_allowed`, {
        //         status: t(`orders.status.${status_old.join(', ')}`)
        //     })
        // )
        notificationService.warning("Vui lòng kiểm tra lại trạng thái đơn hàng");
        return
    }

    if (status === 'cancelled' && !reason) {
        notificationService.warning('Vui lòng cung cấp lý do hủy đơn hàng');
        return

    }
    setLoading?.(true)
    try {
        const orderIds = selectedRows.value.map(order => order.id)
        const response = await api.patch('/orders-update-status', {
            order_ids: orderIds,
            status: status,
            reason: reason
        })

        if (response.data.status) {
            notificationService.success(
                'Cập nhật thành công'
                // t(`orders.${actionName}_success`, { count: selectedRows.value.length })
            )
            resetCancelData()
            await fetchOrders()
            selectedRows.value = []
        } else {
            throw new Error(response.data.message)
        }
    } catch (error: any) {
        console.error(`${actionName} error:`, error)
        notificationService.error(
            error.response?.data?.message || 'Cập nhật thất bại'//t(`orders.${actionName}_failed`)
        )
    } finally {
        setLoading?.(false)
    }
}

// ===== BULK ACTIONS =====
// chuyen phe duyet
const sendApproveSelected = async () => {
    await updateOrdersStatus('pending', 'send_approve', ['draft'])
}

const approveSelected = async () => {
    await updateOrdersStatus('approved', 'approve', ['draft', 'pending'])
}

const processSelected = async () => {
    await updateOrdersStatus('processing', 'process', ['approved'])
}

const completeSelected = async () => {
    await updateOrdersStatus('completed', 'complete', ['processing'])
}

const cancelSelected = async (reason: string) => {
    await updateOrdersStatus('cancelled', 'cancel', ['draft', 'pending', 'approved', 'processing'], reason)
}

const changeOrderStatus = async (order: Order, newStatus: string, reason = "") => {
    if (!order.id) {
        notificationService.error("Không tìm thấy đơn hàng để cập nhật trạng thái")
        return
    }
    if (order.order_status === newStatus) {
        notificationService.warning("Vui lòng kiểm tra lại trạng thái đơn hàng");
        return
    }
    if (newStatus === 'cancelled' && !reason) {
        notificationService.warning('Vui lòng cung cấp lý do hủy đơn hàng');
        return
    }
    setLoading?.(true)
    try {
        const response = await api.patch(`/orders/${order.id}/status`, {
            status: newStatus,
            reason: reason
        })

        if (response.data.status) {
            if (status == 'cancelled') {
                notificationService.success('Hủy đơn hàng thành công')
            } else {
                notificationService.success(
                    `Cập nhật trạng thái đơn hàng ${order.order_code} thành công`
                    // t('orders.status_change_success', {
                    //     orderCode: order.order_code,
                    //     status: t(`orders.status.${newStatus}`)
                    // })
                )
                
            }
            await fetchOrders()
        } else {
            throw new Error(response.data.message)
        }
    } catch (error: any) {
        console.error('Status change error:', error)
        notificationService.error(
            error.response?.data?.message || t('orders.status_change_failed')
        )
    } finally {
        setLoading?.(false)
    }
}

const handleSelectionChange = (rows: Order[]) => {
    selectedRows.value = rows
}

const handleServerPageChange = (pageData: { page: number; perPage: number }) => {
    pagination.value.current_page = pageData.page
    pagination.value.per_page = pageData.perPage
    fetchOrders()
}

const handleServerSort = (sortData: { field: string; direction: 'asc' | 'desc' }) => {
    filters.value.sort_by = sortData.field
    filters.value.sort_order = sortData.direction
    fetchOrders()
}

const handleServerFilter = (filterData: Partial<Filters>) => {
    filters.value = {
        ...filters.value,
        ...filterData
    }
    pagination.value.current_page = 1
    fetchOrders()
}

const handleSubmit = async (orderData: Order) => {
    if (isModalLoading.value) return

    isModalLoading.value = true
    formErrors.value = {}
    const data = orderData.submitData;
    const isEdit = !!data.id
    setLoading?.(true)
    try {
        const method = isEdit ? 'put' : 'post'
        const url = isEdit ? `/orders/${data.id}` : '/orders'

        const response = await api[method](url, data)

        if (response.data.status || response.status === 201) {
            notificationService.success(
                response.data.message ||
                (isEdit ? t('orders.update_success') : t('orders.create_success'))
            )

            await fetchOrders()
            closeModal()
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
        isModalLoading.value = false
    }
}

const refreshData = async () => {
    selectedRows.value = []
    await fetchOrders()
}
watch(categorySystem, (newValue) => {
    if (newValue.loaded) {
        // console.log('Category system loaded:', newValue.categories)
    }
}, { immediate: true })

// ===== LIFECYCLE =====
onMounted(async () => {
    await categorySystem.initCategories();
    fetchOrders()
})

// ===== WATCHERS =====
watch(activeTab, () => {
    selectedRows.value = []
})

// ===== PROVIDE/INJECT =====
// Có thể thêm provide nếu cần thiết cho các component con
</script>

<style scoped>
/* Custom styles nếu cần */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Responsive improvements */
@media (max-width: 768px) {
    .space-x-8 {
        @apply space-x-4;
    }
}
</style>