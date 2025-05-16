<template>
  <BaseModal
    :show="open"
    :close="close"
    size="full"
    :closeOnClickOutside="true"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <FileIcon :mime="file.mime_type" class="w-5 h-5 shrink-0" />
        <span class="text-base font-medium dark:text-white text-gray-800 truncate max-w-[80vw]">{{ file.original_name }}</span>
      </div>
    </template>
    <template #body>
      <div class="flex flex-col h-full">
        <!-- Content -->
        <div class="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 overflow-auto">
          <template v-if="isImage">
            <div class="flex items-center justify-center w-full h-full">
              <img 
                :src="fileUrl" 
                class="max-h-[100vh] max-w-full object-contain rounded shadow-lg" 
                :alt="file.original_name"
              />
            </div>
          </template>

          <template v-else-if="isPdf">
            <div class="w-full h-full">
              <iframe 
                :src="fileUrl" 
                class="w-full h-full min-h-[85vh] border rounded shadow-lg bg-white"
                frameborder="0"
              />
            </div>
          </template>

          <template v-else-if="isOfficeDocument">
            <div class="w-full h-full flex flex-col">
              <div class="flex justify-between items-center mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-t">
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ t('file_manager.messages.document_preview') }}</span>
                <div class="flex gap-2">
                  <a 
                    :href="googleDocsUrl" 
                    target="_blank"
                    class="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {{ t('file_manager.action_map.open_in_google_docs') }}
                  </a>
                  <a 
                    :href="downloadUrl" 
                    download
                    class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {{ t('file_manager.action_map.download') }}
                  </a>
                </div>
              </div>
              <iframe 
                :src="officeViewerUrl" 
                class="w-full flex-1 min-h-[80vh] border rounded-b shadow-lg bg-white"
                frameborder="0"
              />
            </div>
          </template>

          <template v-else-if="isAudio">
            <div class="w-full max-w-2xl p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div class="flex items-center gap-4 mb-4">
                <FileIcon :mime="file.mime_type" class="w-10 h-10 shrink-0" />
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-medium truncate dark:text-white">{{ file.original_name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <audio 
                controls 
                :src="fileUrl" 
                class="w-full"
              />
            </div>
          </template>

          <template v-else-if="isVideo">
            <div class="w-full max-w-4xl">
              <video 
                controls 
                :src="fileUrl" 
                class="w-full max-h-[100vh] rounded shadow-lg"
              />
            </div>
          </template>

          <template v-else-if="isText">
            <div class="w-full h-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div class="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 class="font-medium dark:text-white">{{ file.original_name }}</h3>
                <div class="flex gap-2">
                  <a 
                    :href="downloadUrl" 
                    download
                    class="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {{ t('file_manager.action_map.download') }}
                  </a>
                </div>
              </div>
              <pre class="p-4 overflow-auto max-h-[80vh] text-sm dark:text-gray-300">{{ fileContent }}</pre>
            </div>
          </template>

          <template v-else>
            <div class="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
              <FileIcon :mime="file.mime_type" class="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 class="text-lg font-medium mb-2 dark:text-white">{{ t('file_manager.messages.not_preview') }}</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">{{ t('file_manager.messages.type_not_supported') }}</p>
              <div class="flex justify-center gap-3">
                <a 
                  :href="downloadUrl" 
                  download 
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {{ t('file_manager.action_map.download') }}
                </a>
                <button 
                  @click="close"
                  class="px-4 py-2 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {{ t('common.close') }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import FileIcon from '@/modules/filemanager/components/FileIcon.vue'
import config from "@/config/config";
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
const fileContent = ref('');

const props = defineProps<{
  open: boolean
  file: {
    id: string;
    name: string;
    original_name: string;
    mime_type: string;
    size: number;
    folder_id: string | null;
    updated_at: string;
    type: 'file';
  }
}>()
const emit = defineEmits(['close'])

const fileUrl = computed(() => config.api_be + `/file/${props.file.id}`)
const downloadUrl = computed(() => config.api_be + `/file/${props.file.id}?download=1`)
const officeViewerUrl = computed(() => `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl.value)}`)

const isImage = computed(() => props.file.mime_type.startsWith('image/'))
const isPdf = computed(() => props.file.mime_type === 'application/pdf')
const isAudio = computed(() => props.file.mime_type.startsWith('audio/'))
const isVideo = computed(() => props.file.mime_type.startsWith('video/'))
const isText = computed(() => props.file.mime_type.startsWith('text/') || [
  'application/json',
  'application/xml',
  'application/javascript',
].includes(props.file.mime_type))

const isOfficeDocument = computed(() =>
  [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
  ].includes(props.file.mime_type)
)

const googleDocsUrl = computed(() =>
  `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl.value)}&embedded=true`
)

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i])
}

// Load text file content
onMounted(async () => {
  if (isText.value && props.file.size < 1024 * 1024) { // Only load files < 1MB
    try {
      const response = await fetch(fileUrl.value);
      fileContent.value = await response.text();
    } catch (error) {
      console.error('Error loading text file:', error);
      fileContent.value = t('file_manager.messages.failed_to_load_content');
    }
  }
})

const close = () => emit('close')
</script>

<style scoped>
.audio-player::-webkit-media-controls-panel {
  @apply bg-white dark:bg-gray-700;
}

.audio-player::-webkit-media-controls-play-button,
.audio-player::-webkit-media-controls-mute-button {
  @apply rounded-full bg-gray-200 dark:bg-gray-600;
}

.video-player {
  aspect-ratio: 16/9;
}

@media (max-width: 640px) {
  .video-player {
    width: 100%;
    height: auto;
  }
  
  .document-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>