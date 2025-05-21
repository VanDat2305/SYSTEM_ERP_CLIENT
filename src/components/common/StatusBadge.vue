<template>
  <span 
    class="status-badge" 
    :class="{
      'active': status === 'active',
      'inactive': status !== 'active'
    }"
  >
    {{ status === 'active' ? $t('status_map.active') : $t('status_map.inactive') }}
  </span>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value: string) => ['active', 'inactive'].includes(value)
  }
})
</script>

<style scoped>
.status-badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.status-badge.active {
  @apply bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}

.status-badge.inactive {
  @apply bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}
</style>