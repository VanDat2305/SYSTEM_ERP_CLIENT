<template>
    <tr>
      <td :colspan="colspan" class="px-5 py-10 text-center text-gray-500 dark:text-gray-400">
        <div class="flex flex-col items-center justify-center gap-2">
          <svg class="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-sm">{{ $t('no_data') }}</p>
          <button 
            v-if="showAddButton" 
            @click="emit('add')"
            class="mt-2 px-3 py-1.5 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600"
          >
            {{ $t('add_first_item') }}
          </button>
        </div>
      </td>
    </tr>
  </template>
  
  <script setup>
  defineProps({
    colspan: Number,
    showAddButton: Boolean
  });
  
  const emit = defineEmits(['add']);
  </script>