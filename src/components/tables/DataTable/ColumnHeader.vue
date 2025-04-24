<template>
  <div class="flex items-center justify-between">
    <p class="text-gray-500 text-xs tracking-wider dark:text-gray-400 flex items-center gap-1">
      {{ $t(column.field) }}
      <span v-if="sortKey === column.field" class="ml-1">
        {{ sortOrder === 'asc' ? '↑' : '↓' }}
      </span>
    </p>
    <button 
      v-if="column.filterable" 
      @click.stop="toggleFilter"
      class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
      </svg>
    </button>
  </div>
  
  <div v-if="column.filterActive" class="mt-2">
    <input 
      v-model="column.filterValue" 
      @input="handleFilterInput"
      @click.stop=""
      type="text" 
      :placeholder="$t('filter')"
      class="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  column: Object,
  sortKey: String,
  sortOrder: String
});

const emit = defineEmits(['filter']);

const toggleFilter = () => {
  props.column.filterActive = !props.column.filterActive;
  if (!props.column.filterActive) {
    props.column.filterValue = '';
    emit('filter', { field: props.column.field, value: '' });
  }
};

const handleFilterInput = (event) => {
  emit('filter', { 
    field: props.column.field, 
    value: event.target.value 
  });
};
</script>