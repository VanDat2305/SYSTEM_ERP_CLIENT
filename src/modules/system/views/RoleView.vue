<template>
  <admin-layout>

    <!-- Bố cục lưới trống -->
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <!-- Cột 1: Dự phòng cho danh sách hoặc thống kê -->
      <div class="col-span-12 space-y-6 xl:col-span-7">
        <slot name="primary"></slot>
      </div>
      <!-- Cột 2: Dự phòng cho form hoặc chi tiết -->
      <div class="col-span-12 xl:col-span-5">
        <slot name="detail"></slot>
      </div>
      <!-- Cột đầy đủ: Dự phòng cho biểu đồ -->
      <div class="col-span-12">
        <slot name="chart"></slot>
      </div>
      <!-- Cột 3: Dự phòng cho thông tin bổ sung -->
      <div class="col-span-12 xl:col-span-5">
        <slot name="info"></slot>
      </div>
      <!-- Cột 4: Dự phòng cho lịch sử hoặc danh sách phụ -->
      <div class="col-span-12 xl:col-span-7">
        <slot name="history"></slot>
      </div>
    </div>
  </admin-layout>
</template>

<script lang="ts" setup>
import AdminLayout from '@/components/layout/AdminLayout.vue';
import { notificationService } from '@/services/notification';

</script>

<style scoped>

</style>