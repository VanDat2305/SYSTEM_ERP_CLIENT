<template>
    <tbody>
      <tr 
        v-for="row in rows" 
        :key="row.id"
        class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
        :class="{ 'bg-blue-50 dark:bg-blue-900/20': isSelected(row) }"
      >
        <!-- Checkbox selection -->
        <td v-if="hasSelection" class="px-4 py-3">
          <input 
            type="checkbox" 
            :checked="isSelected(row)" 
            @change="emit('row-select', row)"
            class="rounded text-blue-500 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
          >
        </td>
        
        <!-- Data cells -->
        <td 
          v-for="column in columns" 
          :key="column.field" 
          class="px-5 py-3 sm:px-6"
        >
          <TableCell 
            :row="row"
            :column="column"
            :editing="editingCell === `${row.id}-${column.field}`"
            @edit-start="emit('edit-start', row.id, column.field)"
            @edit-save="emit('edit-save', row)"
          />
        </td>
        
        <!-- Action cells -->
        <td v-if="hasActions" class="px-5 py-3 sm:px-6 flex items-center gap-2">
          <button 
            v-for="(action, index) in actions" 
            :key="index" 
            @click="action.handler(row)"
            v-html="action.icon"
            :class="action.class"
          />
        </td>
      </tr>
    </tbody>
  </template>
  
  <script setup>
import TableCell from './TableCell.vue';
  
  const props = defineProps({
    rows: Array,
    columns: Array,
    hasSelection: Boolean,
    hasActions: Boolean,
    actions: Array,
    selectedRows: Array,
    editingCell: String
  });
  
  const emit = defineEmits(['row-select', 'edit-start', 'edit-save']);
  
  const isSelected = (row) => {
    return props.selectedRows.some(r => r.id === row.id);
  };
  </script>