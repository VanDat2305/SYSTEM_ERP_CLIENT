<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm gap-3">
      <!-- Show entries selector -->
      <EntriesSelector 
        :pageSize="pageSize"
        :options="pageSizeOptions"
        @change="emit('size-change', $event)"
      />
      
      <!-- Pagination controls -->
      <PaginationControls 
        :currentPage="currentPage"
        :totalPages="totalPages"
        @page-change="emit('page-change', $event)"
      />
      
      <!-- Showing info -->
      <ShowingInfo 
        :currentPage="currentPage"
        :pageSize="pageSize"
        :totalItems="totalItems"
      />
    </div>
  </template>
  
  <script setup>
import EntriesSelector from './EntriesSelector.vue';
import PaginationControls from './PaginationControls.vue';
import ShowingInfo from './ShowingInfo.vue';
  defineProps({
    currentPage: Number,
    pageSize: Number,
    totalItems: Number,
    pageSizeOptions: Array,
    totalPages: Number
  });
  
  const emit = defineEmits(['page-change', 'size-change']);
  </script>