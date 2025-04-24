<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />
    <div class="space-y-5 sm:space-y-6">
      <CustomTable 
      :columns="columns" 
      :rowData="rowData" 
      :actions="actions" 
      :bulkActions="bulkActions"
      :pageSizeOptions="[5, 10, 15]" 
      :defaultPageSize="5" 
      showAddButton 
      showExport 
      hasSelection
       @add="showAddModal" 
       @export="exportToExcel" 
       @update:selectedRows="handleSelectionChange" />
    </div>
  </AdminLayout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue";
import CustomTable from "@/components/tables/DataTable/DataTable.vue";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const currentPageTitle = ref(t("menu.roles_management"));
const selectedRows = ref([]);

const columns = [
  {
    field: 'user',
    label: 'User',
    filterable: true,
    searchable: true
  },
  {
    field: 'position',
    label: 'Position',
    filterable: true
  },
  {
    field: 'office',
    label: 'Office',
    filterable: true
  },
  {
    field: 'age',
    label: 'Age',
    filterable: true,
    formatter: (val) => `${val} years`
  },
  {
    field: 'startDate',
    label: 'Start date',
    sortable: true
  },
  {
    field: 'salary',
    label: 'Salary',
    sortable: true,
    formatter: (val) => val.replace('$', '€') // Example formatter
  },
];

const rowData = ref([
  { id: 1, user: 'Abram Schleifer', position: 'Sales Assistant', office: 'Edinburgh', age: 57, startDate: '25 Apr, 2027', salary: '$89,500' },
  { id: 2, user: 'Carla George', position: 'Sales Assistant', office: 'London', age: 45, startDate: '11 May, 2027', salary: '$15,500' },
  { id: 3, user: 'John Doe', position: 'Marketing Manager', office: 'New York', age: 32, startDate: '15 Jun, 2027', salary: '$75,000' },
  { id: 4, user: 'Jane Smith', position: 'Developer', office: 'San Francisco', age: 28, startDate: '20 Jul, 2027', salary: '$95,000' },
  { id: 5, user: 'Robert Johnson', position: 'HR Specialist', office: 'Chicago', age: 41, startDate: '05 Aug, 2027', salary: '$65,000' },
  { id: 6, user: 'Emily Davis', position: 'Product Manager', office: 'Boston', age: 35, startDate: '10 Sep, 2027', salary: '$85,000' },
  { id: 7, user: 'Michael Wilson', position: 'UX Designer', office: 'Seattle', age: 30, startDate: '25 Oct, 2027', salary: '$72,000' },
]);

const actions = [
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg>',
    tooltip: 'View',
    handler: (row) => {
      alert(`Viewing row ${row.id}`);
    },
    class: 'text-gray-400 hover:text-green-500 dark:text-gray-500 dark:hover:text-green-400',
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>',
    tooltip: 'Edit',
    handler: (row) => {
      alert(`Editing row ${row.id}`);
    },
    class: 'text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400',
  },
  {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>',
    tooltip: 'Delete',
    handler: (row) => {
      rowData.value = rowData.value.filter((r) => r.id !== row.id);
      alert(`Deleted row ${row.id}`);
    },
    class: 'text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400',
  }
];

const bulkActions = [
  {
    name: 'delete_selected',
    handler: deleteSelected,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>'
  },
  {
    name: 'export_selected',
    handler: exportSelected,
    icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>'
  }
];

function showAddModal() {
  alert('Add new item');
}

function exportToExcel() {
  alert('Exporting all data to Excel');
}

function handleSelectionChange(rows) {
  selectedRows.value = rows;
}

function deleteSelected() {
  if (selectedRows.value.length === 0) {
    alert('Please select at least one row');
    return;
  }

  const idsToDelete = selectedRows.value.map(row => row.id);
  rowData.value = rowData.value.filter(row => !idsToDelete.includes(row.id));
  selectedRows.value = [];
  alert(`Deleted ${idsToDelete.length} items`);
}

function exportSelected() {
  if (selectedRows.value.length === 0) {
    alert('Please select at least one row');
    return;
  }
  alert(`Exporting ${selectedRows.value.length} selected items`);
}
</script>

<style scoped>
/* Add custom styles if needed */
</style>