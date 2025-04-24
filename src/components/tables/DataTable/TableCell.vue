<template>
    <input 
      v-if="editing" 
      v-model="row[column.field]"
      @blur="$emit('edit-save', row)" 
      @keydown.enter="$emit('edit-save', row)"
      class="font-medium w-full px-2 py-1 text-theme-xs bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white" 
    />
    <span 
      v-else 
      @click="$emit('edit-start', row.id, column.field)" 
      class="cursor-pointer font-medium text-gray-500 text-theme-xs dark:text-gray-400"
    >
      {{ formatCellValue(row[column.field], column) }}
    </span>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    row: Object,
    column: Object,
    editing: Boolean
  });
  
  const emit = defineEmits(['edit-start', 'edit-save']);
  
  const formatCellValue = (value, column) => {
    return column.formatter ? column.formatter(value) : value;
  };
  </script>