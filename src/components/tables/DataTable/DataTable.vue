<template>
    <div class="data-table-container">
      <!-- Header Section -->
      <TableHeader
        :hasSelection="hasSelection"
        :selectedRows="selectedRows"
        :bulkActions="bulkActions"
        :columns="allColumns"
        :showAddButton="showAddButton"
        :showExport="showExport"
        @search="handleSearch"
        @add="$emit('add')"
        @export="handleExport"
        @bulk-action="handleBulkAction"
        @toggle-column="toggleColumnVisibility"
      />
  
      <!-- Table Section -->
      <div class="table-wrapper">
        <table class="data-table">
          <TableHead
            :columns="visibleColumns"
            :sortKey="sortKey"
            :sortOrder="sortOrder"
            :hasSelection="hasSelection"
            :hasActions="hasActions"
            @sort="handleSort"
            @filter="applyColumnFilter"
          />
          
          <TableBody
            :rows="paginatedData"
            :columns="visibleColumns"
            :hasSelection="hasSelection"
            :hasActions="hasActions"
            :actions="actions"
            :editingCell="editingCell"
            :selectedRows="selectedRows"
            @row-select="toggleRowSelection"
            @edit-start="startEdit"
            @edit-save="saveEdit"
          />
        </table>
        
        <EmptyState
          v-if="filteredData.length === 0"
          :showAddButton="showAddButton"
          @add="$emit('add')"
        />
      </div>
  
      <!-- Pagination Section -->
      <TablePagination
        v-if="paginationMode === 'client'"
        :currentPage="currentPage"
        :pageSize="pageSize"
        :totalItems="filteredData.length"
        :pageSizeOptions="pageSizeOptions"
        @page-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
      
      <ServerPagination
        v-else
        :currentPage="currentPage"
        :pageSize="pageSize"
        :totalItems="totalServerItems"
        @page-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { debounce } from 'lodash';
  
  // Components
  import TableHeader from './TableHeader.vue';
  import TableHead from './TableHead.vue';
  import TableBody from './TableBody.vue';
  import TablePagination from './TablePagination.vue';
  import ServerPagination from './ServerPagination.vue';
  import EmptyState from './EmptyState.vue';
  
  const props = defineProps({
    columns: { 
      type: Array,
      required: true,
      validator: cols => cols.every(c => typeof c.field === 'string')
    },
    rowData: {
      type: Array,
      default: () => []
    },
    actions: {
      type: Array,
      default: () => [],
      validator: actions => actions.every(action => 
        typeof action.handler === 'function'
      )
    },
    bulkActions: {
      type: Array,
      default: () => []
    },
    paginationMode: {
      type: String,
      default: 'client', // 'client' or 'server'
      validator: value => ['client', 'server'].includes(value)
    },
    totalServerItems: {
      type: Number,
      default: 0
    },
    pageSizeOptions: {
      type: Array,
      default: () => [10, 25, 50, 100]
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    showAddButton: Boolean,
    showExport: Boolean,
    hasSelection: Boolean,
    selectable: Boolean
  });
  
  const emit = defineEmits([
    'add',
    'edit',
    'update:selectedRows',
    'export',
    'page-change',
    'size-change',
    'search',
    'sort',
    'filter'
  ]);
  
  // Reactive state
  const searchQuery = ref('');
  const filteredData = ref([]);
  const allColumns = ref([]);
  const selectedRows = ref([]);
  const selectAll = ref(false);
  const editingCell = ref(null);
  const sortKey = ref('');
  const sortOrder = ref('asc');
  const currentPage = ref(1);
  const pageSize = ref(props.defaultPageSize);
  
  // Computed properties
  const visibleColumns = computed(() => allColumns.value.filter(col => col.visible));
  const hasActions = computed(() => props.actions.length > 0);
  const totalColumns = computed(() => 
    visibleColumns.value.length + (props.hasSelection ? 1 : 0) + (hasActions.value ? 1 : 0)
  );
  
  // Client-side pagination
  const paginatedData = computed(() => {
    if (props.paginationMode === 'server') {
      return props.rowData;
    }
    
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredData.value.slice(start, start + pageSize.value);
  });
  
  const totalPages = computed(() => {
    if (props.paginationMode === 'server') {
      return Math.ceil(props.totalServerItems / pageSize.value);
    }
    return Math.ceil(filteredData.value.length / pageSize.value);
  });
  
  // Initialize
  onMounted(() => {
    initColumns();
    initData();
  });
  
  function initColumns() {
    allColumns.value = props.columns.map(column => ({
      ...column,
      visible: column.visible !== false,
      filterable: column.filterable || false,
      filterActive: false,
      filterValue: '',
      sortable: column.sortable !== false
    }));
  }
  
  function initData() {
    if (props.paginationMode === 'client') {
      filteredData.value = [...props.rowData];
    }
  }
  
  // Data handling
  const filterData = debounce(() => {
    if (props.paginationMode === 'server') {
      emit('search', searchQuery.value);
      return;
    }
  
    let result = [...props.rowData];
    
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      result = result.filter(row =>
        Object.entries(row).some(([key, val]) => {
          const column = allColumns.value.find(col => col.field === key);
          if (column?.searchable === false) return false;
          return String(val).toLowerCase().includes(q);
        })
      );
    }
  
    filteredData.value = result;
    currentPage.value = 1;
  }, 300);
  
  function handleSearch(query) {
    searchQuery.value = query;
    filterData();
  }
  
  // Sorting
  function handleSort(field) {
    if (props.paginationMode === 'server') {
      const newOrder = sortKey.value === field ? 
        (sortOrder.value === 'asc' ? 'desc' : 'asc') : 'asc';
      
      sortKey.value = field;
      sortOrder.value = newOrder;
      
      emit('sort', { field, order: newOrder });
      return;
    }
  
    if (sortKey.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey.value = field;
      sortOrder.value = 'asc';
    }
  
    filteredData.value = [...filteredData.value].sort((a, b) => {
      const A = a[field];
      const B = b[field];
      if (A === B) return 0;
      return sortOrder.value === 'asc' ? (A > B ? 1 : -1) : (A < B ? 1 : -1);
    });
  }
  
  // Pagination
  function handlePageChange(page) {
    currentPage.value = page;
    
    if (props.paginationMode === 'server') {
      emit('page-change', { page, size: pageSize.value });
    }
  }
  
  function handlePageSizeChange(size) {
    pageSize.value = size;
    currentPage.value = 1;
    
    if (props.paginationMode === 'server') {
      emit('size-change', size);
    }
  }
  
  // Row selection
  function toggleRowSelection(row) {
    const index = selectedRows.value.findIndex(r => r.id === row.id);
    if (index >= 0) {
      selectedRows.value.splice(index, 1);
    } else {
      selectedRows.value.push(row);
    }
    emit('update:selectedRows', selectedRows.value);
  }
  
  // Editing
  function startEdit(rowId, field) {
    editingCell.value = `${rowId}-${field}`;
  }
  
  function saveEdit(row) {
    editingCell.value = null;
    emit('edit', row);
  }
  
  // Export
  function handleExport() {
    const dataToExport = props.paginationMode === 'client' ? filteredData.value : props.rowData;
    emit('export', dataToExport);
  }
  
  // Column visibility
  function toggleColumnVisibility(field) {
    const column = allColumns.value.find(col => col.field === field);
    if (column) {
      column.visible = !column.visible;
    }
  }
  
  // Bulk actions
  function handleBulkAction(action) {
    action.handler(selectedRows.value);
  }
  
  // Column filtering
  function applyColumnFilter({ field, value }) {
    if (props.paginationMode === 'server') {
      emit('filter', { field, value });
      return;
    }
  
    const column = allColumns.value.find(col => col.field === field);
    if (column) {
      column.filterValue = value;
      filterData();
    }
  }
  
  // Watch for changes
  watch(selectAll, (newVal) => {
    if (newVal) {
      selectedRows.value = [...paginatedData.value];
    } else {
      selectedRows.value = [];
    }
    emit('update:selectedRows', selectedRows.value);
  });
  
  watch(() => props.rowData, () => {
    initData();
  }, { deep: true });
  
  watch(pageSize, () => {
    currentPage.value = 1;
  });
  </script>
  
  <style scoped>
  .data-table-container {
    @apply overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03];
  }
  
  .table-wrapper {
    @apply max-w-full overflow-x-auto custom-scrollbar;
  }
  
  .data-table {
    @apply min-w-full text-sm;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    @apply h-2 w-2;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    @apply bg-gray-100 dark:bg-gray-800 rounded;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400 dark:hover:bg-gray-500;
  }
  </style>