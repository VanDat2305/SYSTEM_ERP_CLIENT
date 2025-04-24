<template>
    <span class="text-gray-600 dark:text-gray-400 whitespace-nowrap">
      {{ $t('showing', {
        start: (currentPage - 1) * pageSize + 1, 
        end: Math.min(currentPage * pageSize, totalItems), 
        total: totalItems 
      }) }}
    </span>
  </template>
  
  <script setup>
  defineProps({
    currentPage: Number,
    pageSize: Number,
    totalItems: Number
  });
  </script>