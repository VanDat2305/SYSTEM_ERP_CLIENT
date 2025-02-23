<template>
  <Loading :isLoading="isLoading" />
  <ThemeProvider>
    <SidebarProvider>
      <RouterView />
    </SidebarProvider>
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import Loading from './components/layout/Loading.vue';
import { provide, ref } from 'vue';
// Khai báo biến trạng thái isLoading
const isLoading = ref(false);

// Cung cấp isLoading cho các component con
provide('isLoading', isLoading);
provide('setLoading', (value: boolean) => {
  isLoading.value = value;
});
</script>

<!-- import { inject } from 'vue';

const setLoading = inject('setLoading');

const fetchData = async () => {
  if (setLoading) {
    setLoading(true);
  }
  
  // Giả lập một cuộc gọi API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (setLoading) {
    setLoading(false);
  }
}; -->
