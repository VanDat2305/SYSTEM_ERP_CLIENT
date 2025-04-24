<template>
    <div class="flex items-center gap-1">
      <button 
        :disabled="currentPage === 1" 
        @click="$emit('page-change', currentPage - 1)"
        class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[2.5rem]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <button 
        v-for="page in displayedPages" 
        :key="page" 
        @click="$emit('page-change', page)"
        class="px-3 py-1.5 rounded-md min-w-[2.5rem] flex items-center justify-center transition-colors duration-200"
        :class="currentPage === page
          ? 'bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'"
      >
        {{ page }}
      </button>
      
      <button 
        :disabled="currentPage === totalPages" 
        @click="$emit('page-change', currentPage + 1)"
        class="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center min-w-[2.5rem]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    currentPage: Number,
    totalPages: Number
  });
  
  const emit = defineEmits(['page-change']);
  
  const displayedPages = computed(() => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, props.currentPage - 2);
    let endPage = Math.min(props.totalPages, startPage + maxPagesToShow - 1);
  
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
  
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  });
  </script>