<template>
  <div class="bg-white rounded-xl shadow p-5">
    <canvas ref="chartEl"></canvas>
  </div>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({ data: Array })
const chartEl = ref(null)
let chart

const renderChart = () => {
  if (chart) chart.destroy()
  if (!props.data || !props.data.length) return
  chart = new Chart(chartEl.value, {
    type: 'line',
    data: {
      labels: props.data.map(item => item.month),
      datasets: [{
        label: 'Doanh thu',
        data: props.data.map(item => item.revenue),
      }]
    }
  })
}

watch(() => props.data, renderChart)
onMounted(renderChart)
</script>
