<template>
    <thead class="sticky top-0 bg-white dark:bg-gray-800 z-9">
      <tr class="border-b border-gray-200 dark:border-gray-700">
        <!-- Checkbox column -->
        <th v-if="hasSelection" class="px-4 py-3 w-10">
          <input type="checkbox" 
            class="rounded text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600">
        </th>
        
        <!-- Data columns -->
        <th 
          v-for="column in columns" 
          :key="column.field"
          @click="column.sortable ? emit('sort', column.field) : null"
          class="px-5 py-3 text-left cursor-pointer select-none sm:px-6"
          :class="{ 
            'bg-gray-50 dark:bg-gray-700': sortKey === column.field,
            'cursor-default': !column.sortable
          }"
        >
          <ColumnHeader 
            :column="column"
            :sortKey="sortKey"
            :sortOrder="sortOrder"
            @filter="emit('filter', $event)"
          />
        </th>
        
        <!-- Action column -->
        <th v-if="hasActions" class="px-5 py-3 text-left sm:px-6 w-24">
          <span class="text-gray-500 text-xs tracking-wider dark:text-gray-400">
            {{ $t('action') }}
          </span>
        </th>
      </tr>
    </thead>
  </template>
  
  <script setup>
  import ColumnHeader from './ColumnHeader.vue';
  defineProps({
    columns: Array,
    hasSelection: Boolean,
    hasActions: Boolean,
    sortKey: String,
    sortOrder: String
  });
  
  const emit = defineEmits(['sort', 'filter']);
  </script>