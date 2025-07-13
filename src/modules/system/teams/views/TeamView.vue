<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <div class="">
            <CustomTable :columns="columns" :rowData="teams" :actions="tableActions" :bulkActions="bulkActions"
                :pageSizeOptions="[10, 15, 20]" :defaultPageSize="pagination.per_page"
                :showAddButton="hasPermission('teams.create' as PermissionValues)" hasSelection
                :server-pagination="true" :server-total-items="pagination.total"
                :server-current-page="pagination.current_page" :server-per-page="pagination.per_page"
                :server-last-page="pagination.last_page" @add="openAddModal"
                @update:selectedRows="handleSelectionChange" @refresh="fetchTeams"
                @server-page-change="handleServerPageChange" @server-sort="handleServerSort"
                @filter="handleServerFilter" :show-refresh-button="true" :searchOptions="searchOptions"
                :filterOptions="filterOptions" />
        </div>

        <TeamModal :errors="formErrors" :isModalOpen="isModalOpen" :mode="currentMode" :currentTeam="currentTeam"
            @close="closeModal" @submit="handleSubmit" />

        <TeamMembersModal :show="showMembersModal" :team="selectedTeam" @close="closeMembersModal"/>

        <ConfirmModal :show="showDeleteModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
            :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
            :confirmText="t('common.yes')" :cancelText="t('common.no')" />
    </AdminLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import CustomTable from "@/components/tables/CustomTable.vue"
import TeamModal from "@/modules/system/teams/components/TeamModal.vue"
import TeamMembersModal from "@/modules/system/teams/components/TeamMembersModal.vue"
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { EyeIcon, PencilIcon, TrashIcon, UserGroupIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'
import type { PermissionValues } from '@/types/permissions'
import { useCategorySystem } from '@/stores/categorySystem'
const categorySystem = useCategorySystem()

const { t } = useI18n()
const { hasPermission } = usePermissions()

interface Team {
    id: number
    name: string
    description: string
    is_active: boolean
    members_count: number
    created_at: string
    updated_at: string
}

const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// State
const currentPageTitle = ref('teams')
const teams = ref<Team[]>([])
const selectedRows = ref<Team[]>([])
const formErrors = ref({})
const currentMode = ref<'add' | 'edit' | 'view'>('add')
const currentTeam = ref<Partial<Team>>({
    name: '',
    description: '',
    is_active: true
})
const selectedTeam = ref<Team | null>(null)
const teamToDelete = ref<Team | Team[] | null>(null)
const isModalOpen = ref(false)
const showDeleteModal = ref(false)
const showMembersModal = ref(false)

// Pagination
const pagination = ref({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
})

// Filter/Sort
const filters = ref({
    is_active: null,
    sort_by: '',
    sort_order: 'asc'
})

// Search and Filter Options
const searchOptions = [
    { field: 'name', label: t('teams.fields.name') },
    { field: 'description', label: t('teams.fields.description') },
]

const filterOptions: any[] = [
    {
        field: 'is_active',
        label: 'status',
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
        field: 'name',
        label: 'teams.fields.name',
        filterable: false,
        sortable: true
    },
    {
        field: 'description',
        label: 'teams.fields.description',
        filterable: false,
        sortable: true,
        formatter: (value: string) => {
            return value && value.length > 50 ? value.substring(0, 50) + '...' : value || '-'
        }
    },
    {
        field: 'users',
        label: 'teams.fields.members_count',
        filterable: false,
        sortable: true,
        formatter: (value: any) => {
            return value && Array.isArray(value) ? value.length : 0
        },
    },
    {
        field: 'is_active',
        label: 'status',
        filterable: false,
        cellClass: (value: boolean) => value
            ? 'px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        formatter: (value: boolean) => t(`status_map.${value ? 'active' : 'inactive'}`)
    },
    {
        field: 'created_at',
        label: 'teams.fields.created_at',
        filterable: false,
        sortable: true,
        formatter: (value: string) => {
            return new Date(value).toLocaleDateString('vi-VN')
        }
    }
]

// Actions Configuration
const tableActions = [
    {
        icon: UserGroupIcon,
        tooltip: 'teams.manage_members',
        permission: 'teams.update' as PermissionValues,
        handler: (row: Team) => viewMembers(row),
        class: 'text-gray-400 hover:text-purple-500'
    },
    {
        icon: EyeIcon,
        tooltip: 'common.view',
        permission: 'teams.view' as PermissionValues,
        handler: (row: Team) => viewTeam(row),
        class: 'text-gray-400 hover:text-green-500'
    },
    {
        icon: PencilIcon,
        tooltip: 'common.edit',
        permission: 'teams.update' as PermissionValues,
        handler: (row: Team) => editTeam(row),
        class: 'text-gray-400 hover:text-blue-500'
    },
    {
        icon: TrashIcon,
        tooltip: 'common.delete',
        permission: 'teams.delete' as PermissionValues,
        handler: (row: Team) => deleteTeam(row),
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
            t('teams.delete_selected_confirmation', { count: selectedCount }),
        permission: 'teams.delete' as PermissionValues,
    }
]
    .filter(
        action => !action.permission
            || hasPermission(action.permission)
    )

// CRUD Operations
async function fetchTeams() {
    setLoading?.(true)
    try {
        const params = {
            ...filters.value,
            page: pagination.value.current_page,
            per_page: pagination.value.per_page
        }

        const response = await api.get('/teams', { params })
        teams.value = response.data.data.items
        pagination.value = response.data.data.pagination
    } catch (error) {
        notificationService.error(t('teams.fetch_failed'))
    } finally {
        setLoading?.(false)
    }
}

async function handleSubmit(teamData: Partial<Team>) {
    setLoading?.(true)
    try {
        const isEdit = !!teamData.id
        const method = isEdit ? 'put' : 'post'
        const url = isEdit ? `/teams/${teamData.id}` : '/teams'

        const response = await api[method](url, teamData)

        if (response.data.status) {
            notificationService.success(response.data.message)
            await fetchTeams()
            closeModal()
        } else {
            notificationService.error(response.data.message ||
                t(isEdit ? 'teams.update_failed' : 'teams.create_failed'))
        }
    } catch (error: any) {
        if (error.response?.data?.errors) {
            formErrors.value = error.response.data.errors
            notificationService.error(error.response?.data?.message ||
                t('teams.operation_failed'))
        }
    } finally {
        setLoading?.(false)
    }
}

// Modal handlers
const openAddModal = () => {
    currentMode.value = 'add'
    currentTeam.value = {
        name: '',
        description: '',
        is_active: true
    }
    isModalOpen.value = true
}

function editTeam(team: Team) {
    currentMode.value = 'edit'
    currentTeam.value = { ...team }
    formErrors.value = {}
    isModalOpen.value = true
}

function viewTeam(team: Team) {
    currentMode.value = 'view'
    currentTeam.value = { ...team }
    isModalOpen.value = true
}

function viewMembers(team: Team) {
    selectedTeam.value = team
    showMembersModal.value = true
}

function closeModal() {
    isModalOpen.value = false
    formErrors.value = {}
}

function closeMembersModal() {
    showMembersModal.value = false
    selectedTeam.value = null
}

// Delete handlers
function deleteTeam(team: Team) {
    teamToDelete.value = team
    showDeleteModal.value = true
}

async function confirmDelete() {
    if (!teamToDelete.value) return

    const teamsToDelete = Array.isArray(teamToDelete.value)
        ? teamToDelete.value
        : [teamToDelete.value]
    setLoading?.(true)
    try {
        for (const team of teamsToDelete) {
            await api.delete(`/teams/${team.id}`)
        }

        notificationService.success(t('teams.messages.delete_success'))
        await fetchTeams()
    } catch (error) {
        console.error('Failed to delete teams:', error)
        notificationService.error(t('teams.messages.delete_failed'))
    } finally {
        showDeleteModal.value = false
        teamToDelete.value = null
        setLoading?.(false);
    }
}

function closeDeleteModal() {
    showDeleteModal.value = false
}

// Bulk actions
function handleSelectionChange(rows: Team[]) {
    selectedRows.value = rows
}

function deleteSelected() {
    if (!selectedRows.value.length) return
    teamToDelete.value = selectedRows.value
    showDeleteModal.value = true
}

// Server-side handlers
function handleServerPageChange(pageData: any) {
    pagination.value.current_page = pageData.page
    pagination.value.per_page = pageData.perPage
    fetchTeams()
}

function handleServerSort(sortData: any) {
    filters.value.sort_by = sortData.field
    filters.value.sort_order = sortData.direction
    fetchTeams()
}

function handleServerFilter(filterData: any) {
    filters.value = {
        ...filters.value,
        ...filterData
    }

    pagination.value.current_page = 1
    fetchTeams()
}

// Initialize
onMounted(async () => {
    fetchTeams()
    // if (!categorySystem.loaded) {
        await categorySystem.initCategories();
    // }
})

function count(users: any) {
    throw new Error('Function not implemented.')
}
</script>