<template>
    <div class="collapsible-section border rounded-lg mb-4 dark:border-gray-700">
      <!-- Header -->
      <div 
        class="section-header flex justify-between items-center p-3 cursor-pointer hover:rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
        
      >
        <div class="flex items-center">
          <h3 class="font-medium text-gray-900 dark:text-gray-100">
            {{ title }}
          </h3>
          
          <!-- Loading indicator -->
          <span v-if="loading" class="ml-2">
            <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          
          <!-- Error indicator -->
          <span v-if="error" class="ml-2 text-red-500 dark:text-red-400">
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
          </span>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Header extra content slot -->
          <slot name="header-extra"></slot>
          
          <!-- Toggle icon -->
          <svg 
            @click="toggle"
            class="h-5 w-5 text-gray-500 transform transition-transform duration-200" 
            :class="{ 'rotate-180': isOpen }" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <!-- Content -->
      <div v-show="isOpen" class="section-content p-0 pt-0 border-t dark:border-gray-700">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  
  export default defineComponent({
    name: 'CollapsibleSection',
    props: {
      title: {
        type: String,
        required: true
      },
      loading: {
        type: Boolean,
        default: false
      },
      error: {
        type: Boolean,
        default: false
      },
      defaultOpen: {
        type: Boolean,
        default: false
      }
    },
    emits: ['retry'],
    setup(props, { emit }) {
      const isOpen = ref(props.defaultOpen);
      
      const toggle = () => {
        isOpen.value = !isOpen.value;
      };
      
      // Retry handler
      const handleRetry = () => {
        emit('retry');
      };
      
      // Watch for error changes to auto-expand
      watch(() => props.error, (newVal) => {
        if (newVal) {
          isOpen.value = true;
        }
      });
      
      return {
        isOpen,
        toggle,
        handleRetry
      };
    }
  });
  </script>
  
  <style scoped>
  .collapsible-section {
    background-color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .dark .collapsible-section {
    background-color: #1f2937;
  }
  
  .section-header {
    transition: background-color 0.2s ease;
  }
  
  .section-content {
    transition: all 0.2s ease;
  }
  </style>