<template>
  <div class="rounded-xl shadow p-5 bg-white text-center">
    <div class="text-2xl font-bold mb-2">{{ value }}</div>
    <div class="text-gray-600 text-sm">{{ label }}</div>
  </div>
</template>
<script setup>
defineProps({ label: String, value: [String, Number] })
</script>
