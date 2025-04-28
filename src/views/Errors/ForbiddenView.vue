<template>
  <div class="forbidden-page">
    <h1>403 Forbidden</h1>
    <p>You don't have permission to access this resource.</p>
    <button @click="goBack">Go Back</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const goBack = () => router.go(-1);
</script>

<style scoped>
.forbidden-page {
  text-align: center;
  padding: 2rem;
}
</style>