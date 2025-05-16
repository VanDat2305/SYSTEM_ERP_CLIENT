<template>
  <component :is="icon" class="text-gray-500" />
</template>

<script setup lang="ts">
import { FileText, Image, FileAudio, FileVideo, FileArchive, File } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{ mime: string }>()

const icon = computed(() => {
  if (props.mime.startsWith('image/')) return Image
  if (props.mime.startsWith('audio/')) return FileAudio
  if (props.mime.startsWith('video/')) return FileVideo
  if (props.mime.includes('zip') || props.mime.includes('rar')) return FileArchive
  if (props.mime.includes('pdf') || props.mime.includes('word') || props.mime.includes('excel')) return FileText
  return File
})
</script>
