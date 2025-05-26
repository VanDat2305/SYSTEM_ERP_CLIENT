<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="space-y-5 sm:space-y-6">
            <CustomTable :columns="columns" :rowData="activityLogs" :actions="tableActions" :bulkActions="bulkActions"
                :pageSizeOptions="[10, 25, 50]" :defaultPageSize="10" :searchOptions="searchOptions"
                :filterOptions="filterOptions" hasSelection @export="exportToExcel"
                @update:selectedRows="handleSelectionChange" @refresh="fetchActivityLogs" @search="handleSearch"
                @filter="handleFilter" :show-refresh-button="true" :server-pagination="true"
                :server-total-items="pagination.total" :server-current-page="pagination.current_page"
                :server-per-page="pagination.per_page" :server-last-page="pagination.last_page"
                @server-page-change="handleServerPageChange" @server-sort="handleServerSort"
                @server-filter="handleServerFilter" />
        </div>

        <ActivityLogModal v-if="selectedLog" :isModalOpen="isModalOpen" :logData="selectedLog" @close="closeModal" />

        <ConfirmModal :show="showDeleteModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="deleteMessage"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import ActivityLogModal from "@/modules/system/logs/components/ActivityLogModal.vue"
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { EyeIcon, TrashIcon, DownloadIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import type { ActivityLog } from '@/types/activityLog'
import type { PermissionValues } from '@/types/permissions'

const { t } = useI18n()
const { hasPermission } = usePermissions()

// State
const currentPageTitle = ref('activity_logs')
const activityLogs = ref<ActivityLog[]>([])
const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
})
const selectedRows = ref<ActivityLog[]>([])
const selectedLog = ref<ActivityLog | null>(null)
const isModalOpen = ref(false)
const showDeleteModal = ref(false)
const logsToDelete = ref<ActivityLog[]>([])
const searchQuery = ref('')
const filters = ref({
    date_from: '',
    date_to: '',
    log_name: '',
    causer_id: '',
    sortBy: '',
    sortOrder: 'asc',
    search: '',
    searchField: ''
})
const isLoading = ref(false)
const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// Table Configuration
const columns = [
    {
        field: 'causer',
        label: 'activity_logs.fields.user',
        filterable: true,
        sortable: true,
        formatter: (value: any, row: ActivityLog) => {
            return value?.name || t('activity_logs.system')
        }
    },
    {
        field: 'log_name',
        label: 'activity_logs.fields.name',
        filterable: true,
        sortable: true,
        formatter: (value: string) => value
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    },
    // {
    //     field: 'description',
    //     label: 'activity_logs.fields.description',
    //     filterable: true,
    //     sortable: true
    // },
    {
        field: 'created_at',
        label: 'activity_logs.fields.time',
        filterable: false,
        sortable: true,
        formatter: (value: string) => formatDateTime(value)
    },
    {
        field: 'properties',
        label: 'activity_logs.fields.ip',
        filterable: true,
        formatter: (value: any) => value.ip
    }
]

// Search and Filter Options
const searchOptions = [
    { field: 'log_name', label: t('activity_logs.fields.name') },
    { field: 'description', label: t('activity_logs.fields.description') },
    { field: 'causer.name', label: t('activity_logs.fields.user') }
]

const filterOptions: any[] = [
    {
        field: 'created_at',
        label: 'Ngày tạo',
        type: 'date-range',
        fields: {
            from: 'created_at_from', // key trong activeFilters
            to: 'created_at_to'     // key trong activeFilters
        },
        preventFutureDates: true, // Ngăn không cho chọn ngày trong tương lai
    },
    {
        field: 'log_name',
        label: 'activity_logs.filters.type',
        type: 'select',
        options: [
            { value: 'login', label: 'activity_logs.types.login' },
            { value: 'logout', label: 'activity_logs.types.logout' },
            // { value: 'users.created', label: 'activity_logs.types.users.created' },
            // { value: 'users.updated', label: 'activity_logs.types.users.updated' },
            // { value: 'users.deleted', label: 'activity_logs.types.users.deleted' }
        ]
    }
]

// Actions Configuration
const tableActions = [
    {
        icon: EyeIcon,
        tooltip: 'common.view',
        permission: 'logs.view' as PermissionValues,
        handler: (row: ActivityLog) => viewLogDetails(row),
        class: 'text-gray-400 hover:text-green-500'
    },
    {
        icon: TrashIcon,
        tooltip: 'common.delete',
        permission: 'logs.delete' as PermissionValues,
        handler: (row: ActivityLog) => deleteLog(row),
        class: 'text-gray-400 hover:text-red-500'
    }
].filter(action => !action.permission || hasPermission(action.permission))

const bulkActions = [
    {
        name: 'delete_selected',
        label: 'common.delete_selected',
        icon: TrashIcon,
        handler: deleteSelectedLogs,
        confirm: true,
        confirmMessage: (selectedCount: number) =>
            t('activity_logs.delete_selected_confirmation', { count: selectedCount }),
        permission: 'logs.delete' as PermissionValues
    }
].filter(action => !action.permission || hasPermission(action.permission))

// Helper functions
function formatDateTime(dateString: string) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

// CRUD Operations
async function fetchActivityLogs(page = 1, perPage = pagination.value.per_page) {
    setLoading?.(true);
    isLoading.value = true;

    try {
        // Chuẩn bị params
        const params: Record<string, any> = {
            page,
            per_page: perPage,
        };

        // Thêm search params nếu có
        if (filters.value.search) {
            // params.search = filters.value.search;
            if (filters.value.searchField) {
                params.search_field = filters.value.searchField;
                params.search_value = filters.value.search;
            }
        }

        // Thêm filter theo ngày
        if (filters.value.date_from) {
            params.created_at_from = filters.value.date_from;
        }
        if (filters.value.date_to) {
            params.created_at_to = filters.value.date_to;
        }

        // Thêm sắp xếp
        if (filters.value.sortBy) {
            params.sort_by = filters.value.sortBy;
            params.sort_order = filters.value.sortOrder;
        }

        const response = await api.get('/logs', { params });

        activityLogs.value = response.data.data.items;
        pagination.value = response.data.data.pagination;
    } catch (error) {
        console.error('Failed to fetch activity logs:', error);
        notificationService.error(t('activity_logs.fetch_failed'));
    } finally {
        setLoading?.(false);
        isLoading.value = false;
    }
}
function resetFilters() {
    filters.value = {
        date_from: '',
        date_to: '',
        log_name: '',
        causer_id: '',
        sortBy: '',
        sortOrder: 'asc',
        search: '',
        searchField: ''
    };
    searchQuery.value = '';
    pagination.value.current_page = 1;
    fetchActivityLogs();
}
// Modal handlers
function viewLogDetails(log: ActivityLog) {
    selectedLog.value = log
    isModalOpen.value = true
}

function closeModal() {
    isModalOpen.value = false
    selectedLog.value = null
}

// Delete handlers
function deleteLog(log: ActivityLog) {
    logsToDelete.value = [log]
    showDeleteModal.value = true
}

function deleteSelectedLogs() {
    if (!selectedRows.value.length) return
    logsToDelete.value = selectedRows.value
    showDeleteModal.value = true
}

const deleteMessage = computed(() => {
    if (logsToDelete.value.length === 1) {
        return t('activity_logs.delete_confirmation', {
            description: logsToDelete.value[0].description
        })
    }
    return t('activity_logs.delete_selected_confirmation', {
        count: logsToDelete.value.length
    })
})

async function confirmDelete() {
    if (!logsToDelete.value.length) return

    const ids = logsToDelete.value.map((log: { id: any }) => log.id)
    setLoading?.(true)

    try {
        const response = await api.delete('/activity-logs', { data: { ids } })

        if (response.data.status) {
            notificationService.success(response.data.message)
            await fetchActivityLogs()
        } else {
            notificationService.error(response.data.message || t('activity_logs.delete_failed'))
        }
    } catch (error) {
        console.error('Failed to delete logs:', error)
        notificationService.error(t('activity_logs.delete_failed'))
    } finally {
        setLoading?.(false)
        showDeleteModal.value = false
        logsToDelete.value = []
    }
}

function closeDeleteModal() {
    showDeleteModal.value = false
    logsToDelete.value = []
}

// Search and Filter handlers
function handleSearch(query: string, field: string) {
    searchQuery.value = query
    fetchActivityLogs()
}

function handleFilter(newFilters: Record<string, any>) {
    // Reset tất cả filters trước
    filters.value = {
        date_from: '',
        date_to: '',
        log_name: '',
        causer_id: '',
        sortBy: filters.value.sortBy, // Giữ lại sort nếu có
        sortOrder: filters.value.sortOrder,
        search: filters.value.search,
        searchField: filters.value.searchField
    };

    // Áp dụng các filter mới
    if (newFilters.created_at) {
        filters.value.date_from = newFilters.created_at.from || '';
        filters.value.date_to = newFilters.created_at.to || '';
    }

    if (newFilters.log_name) {
        filters.value.log_name = newFilters.log_name;
    }

    // Reset về trang đầu tiên khi filter thay đổi
    pagination.value.current_page = 1;

    fetchActivityLogs();
}
function handleServerPageChange(pagina: any) {
    pagination.value.current_page = pagina.page
    pagination.value.per_page = pagina.perPage
    fetchActivityLogs(pagina.page, pagina.perPage)
}
const handleServerSort = (data: any) => {
    // Cập nhật tham số sắp xếp và gọi lại API
    filters.value.sortBy = data.field;
    filters.value.sortOrder = data.direction;
    fetchActivityLogs();
};

const handleServerFilter = (data: any) => {
    // Cập nhật tham số filter
    if (data.query) {
        filters.value.search = data.query;
        filters.value.searchField = data.field;
    }

    // Xử lý date range filter
    if (data.filters?.date_range) {
        filters.value.date_from = data.filters.date_range.from || '';
        filters.value.date_to = data.filters.date_range.to || '';
    }

    // Reset về trang 1 khi filter thay đổi
    pagination.value.current_page = 1;
    fetchActivityLogs();
};
// Export handlers
function exportToExcel() {
    // Implement export logic
    notificationService.info(t('activity_logs.export_started'))
}

function exportSelectedLogs() {
    if (!selectedRows.value.length) return
    // Implement export selected logic
    notificationService.info(t('activity_logs.export_selected_started', {
        count: selectedRows.value.length
    }))
}

// Selection handlers
function handleSelectionChange(rows: ActivityLog[]) {
    selectedRows.value = rows
}

// Initialize
onMounted(() => {
    fetchActivityLogs()
})
</script>