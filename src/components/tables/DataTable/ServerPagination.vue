<template>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-sm gap-3">
      <!-- Show entries selector -->
      <EntriesSelector 
        :pageSize="pageSize"
        :options="[10, 25, 50, 100]"
        @change="emit('size-change', $event)"
      />
      
      <!-- Server-side pagination controls -->
      <ServerPaginationControls 
        :currentPage="currentPage"
        :pageSize="pageSize"
        :totalItems="totalItems"
        @page-change="emit('page-change', $event)"
      />
    </div>
  </template>
  
  <script setup>
  defineProps({
    currentPage: Number,
    pageSize: Number,
    totalItems: Number
  });
  
  const emit = defineEmits(['page-change', 'size-change']);
  </script>