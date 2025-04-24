<template>
    <div class="flex items-center gap-2">
      <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ $t('show') }}</span>
      <select 
        :value="pageSize"
        @change="$emit('change', $event.target.value)"
        class="pl-3 pr-8 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-colors duration-200"
      >
        <option v-for="size in [5, 10, 15]" :value="size" :key="size">{{ size }}</option>
      </select>
      <span class="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{{ $t('entries') }}</span>
    </div>
  </template>
  
  <script setup>
  defineProps({
    pageSize: Number
  });
  
  defineEmits(['change']);
  </script>