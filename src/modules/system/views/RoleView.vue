<template>
    <AdminLayout>
      <PageBreadcrumb :pageTitle="currentPageTitle" />
      <div class="space-y-5 sm:space-y-6">
        <CustomTable 
          :columns="columns" 
          :rowData="rowData" 
          :actions="tableActions"
          :bulkActions="bulkActions"
          :pageSizeOptions="[5, 10, 15]"
          :defaultPageSize="5"
          showAddButton
          showExport
          hasSelection
          @add="showAddModal"
          @export="exportToExcel"
          @update:selectedRows="handleSelectionChange"
        />
      </div>
    </AdminLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import AdminLayout from '@/components/layout/AdminLayout.vue'
  import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
  import CustomTable from "@/components/tables/CustomTable.vue"
  import { EyeIcon, PencilIcon, TrashIcon, DownloadIcon, TrashIcon as BulkTrashIcon } from '@/icons'
  
  // Constants and Configuration
  const { t } = useI18n()
  const currentPageTitle = ref(t("menu.roles_management"))
  const selectedRows = ref<Array<Record<string, any>>>([])
  
  // Table Configuration
  const columns = [

    {
      field: 'name',
      label:  'roles_module.fields.name',
      filterable: false
    },
    {
      field: 'description',
      label: 'roles_module.fields.description',
      filterable: false
    },
    {
        field: 'status',
        label: 'status',
        cellClass: (value: string) => ({
        'active': 'px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'inactive': 'px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        })[value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    },
    {
      field: 'created_at',
      label: 'roles_module.fields.created_at',
      filterable: false
    },
  ]
  
  // Data
  const rowData = ref([
    { id: 1, user: 'Abram Schleifer', position: 'Sales Assistant', office: 'Edinburgh', age: 57, startDate: '25 Apr, 2027', salary: '$89,500', status: 'active' }
  ])
  
  // Actions Configuration
  const tableActions = [
    {
      icon: EyeIcon,
      tooltip: 'View',
      handler: (row: Record<string, any>) => alert(`Viewing row ${row.id}`),
      class: 'text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400'
    },
    {
      icon: PencilIcon,
      tooltip: 'Edit',
      handler: (row: Record<string, any>) => alert(`Editing row ${row.id}`),
      class: 'text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400'
    },
    {
      icon: TrashIcon,
      tooltip: 'Delete',
      handler: (row: Record<string, any>) => {
        if (confirm(`Are you sure you want to delete ${row.user}?`)) {
          rowData.value = rowData.value.filter(r => r.id !== row.id)
        }
      },
      class: 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400'
    }
  ]
  
  // Bulk Actions
  const bulkActions = [
    {
      name: 'delete_selected',
      label: 'Delete Selected',
      icon: BulkTrashIcon,
      handler: deleteSelected,
      confirm: true,
      confirmMessage: (selectedCount: number) => `Are you sure you want to delete ${selectedCount} items?`
    },
    {
      name: 'export_selected',
      label: 'Export Selected',
      icon: DownloadIcon,
      handler: exportSelected
    }
  ]
  
  // Methods
  function showAddModal() {
    alert('Add new item')
  }
  
  function exportToExcel() {
    alert('Exporting all data to Excel')
  }
  
  function handleSelectionChange(rows: Array<Record<string, any>>) {
    selectedRows.value = rows
  }
  
  function deleteSelected() {
    if (!selectedRows.value.length) {
      alert('Please select at least one row')
      return
    }
  
    const idsToDelete = selectedRows.value.map(row => row.id)
    rowData.value = rowData.value.filter(row => !idsToDelete.includes(row.id))
    selectedRows.value = []
    alert(`Deleted ${idsToDelete.length} items`)
  }
  
  function exportSelected() {
    if (!selectedRows.value.length) {
      alert('Please select at least one row')
      return
    }
    alert(`Exporting ${selectedRows.value.length} selected items`)
  }
  </script>