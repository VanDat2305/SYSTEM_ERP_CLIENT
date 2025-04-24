<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Thay thế BulkActions bằng implementation thực tế nếu không cần component riêng -->
        <div v-if="hasSelection && selectedRows.length > 0" class="flex items-center gap-2">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('selected_count', { count: selectedRows.length }) }}
          </span>
          <div class="relative">
            <button @click="showBulkActions = !showBulkActions" class="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              {{ $t('bulk_actions') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div v-if="showBulkActions" class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div class="py-1">
                <button v-for="action in bulkActions" :key="action.name" @click="$emit('bulk-action', action)" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  {{ $t(action.name) }}
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Thay thế ColumnSelector -->
        <div class="relative">
          <button @click="showColumnMenu = !showColumnMenu" class="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            {{ $t('columns') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>
          <div v-if="showColumnMenu" class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div class="py-1">
              <div v-for="column in columns" :key="column.field" class="px-4 py-2 text-sm flex items-center">
                <input type="checkbox" :id="`col-${column.field}`" v-model="column.visible" class="rounded text-blue-500 focus:ring-blue-500 mr-2">
                <label :for="`col-${column.field}`" class="text-gray-700 dark:text-gray-300 cursor-pointer">
                  {{ $t(column.field) }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <div class="flex items-center gap-3">
        <!-- Thay thế SearchInput -->
        <div class="relative w-full sm:w-64">
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input v-model="searchQuery" @input="$emit('search', $event.target.value)" type="text" :placeholder="$t('search')" class="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
  
        <!-- Thay thế ActionButtons -->
        <button v-if="showAddButton" @click="$emit('add')" class="flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          <span>{{ $t('add') }}</span>
        </button>
  
        <button v-if="showExport" @click="$emit('export')" class="flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          <span>{{ $t('export') }}</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  defineProps({
    hasSelection: Boolean,
    selectedRows: Array,
    bulkActions: Array,
    columns: Array,
    showAddButton: Boolean,
    showExport: Boolean
  });
  
  defineEmits(['search', 'add', 'export', 'bulk-action']);
  
  const searchQuery = ref('');
  const showBulkActions = ref(false);
  const showColumnMenu = ref(false);
  </script>