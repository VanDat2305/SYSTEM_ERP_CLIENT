<template>
  <BaseModal :show="show" :close="close" size="lg" :closeOnClickOutside="false"
    :aria-labelledby="`import-${type}-title`">

    <template #header>
      <h3 :id="`import-${type}-title`" class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
        {{ $t(`dynamic_lists.import.${type}_title`) }}
      </h3>
    </template>

    <template #body>
      <div class="space-y-6 mx-4">
        <!-- Download Template Section -->
        <div class="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('dynamic_lists.import.download_template') }}
          </label>
          <Button type="button" variant="outline" @click="downloadTemplate" class="inline-flex items-center">
            <DownloadIcon class="h-4 w-4 mr-2" />
            {{ $t('dynamic_lists.import.download') }}
          </Button>
        </div>

        <!-- File Upload Section -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('dynamic_lists.import.select_file') }}
          </label>
          <div class="relative">
            <input type="file" ref="fileInput" accept=".xlsx,.xls,.csv" @change="handleFileChange" class="hidden" />
            <div @click="triggerFileInput" :class="[
              'flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer text-sm',
              selectedFile ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-300 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-500'
            ]">
              <template v-if="selectedFile">
                <div class="h-5 w-5 text-blue-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>

                </div>
                <span class="truncate max-w-xs">{{ selectedFile.name }}</span>
              </template>
              <template v-else>
                <div class="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>

                </div>
                <span class="text-gray-700 dark:text-gray-400">{{ $t('dynamic_lists.import.choose_file') }}</span>
              </template>
            </div>
          </div>
        </div>

        <!-- Preview Button -->
        <Button type="button" variant="secondary" @click="previewImport" :disabled="!selectedFile"
          class="inline-flex items-center text-gray-700 dark:text-gray-300">
          <EyeIcon class="h-4 w-4 mr-2" />
          {{ $t('dynamic_lists.import.preview') }}
        </Button>

        <!-- Preview Table -->
        <div v-if="previewData.length > 0"
          class="border border-gray-200 rounded-lg dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto max-h-64">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th v-for="header in previewHeaders" :key="header"
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    {{ header }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr v-for="(row, index) in previewData" :key="index">
                  <td v-for="header in previewHeaders" :key="header"
                    class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {{ row[header] || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ $t('common.error') }}
              </h3>
              <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{{ errorMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button type="button" variant="outline" @click="close" size="md">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="button" variant="primary" @click="confirmImport" :loading="isImporting"
          :disabled="!selectedFile || isImporting" size="md">
          {{ $t('dynamic_lists.import.confirm_import') }}
        </Button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import Button from '@/components/ui/Button.vue'
import {
  DownloadIcon,
  // UploadIcon, 
  // DocumentTextIcon, 
  EyeIcon
} from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'

const { t } = useI18n()

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['type', 'value'].includes(value)
  },
  objectTypeId: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close', 'success'])

// Refs
const fileInput = ref(null)
const selectedFile = ref(null)
const previewData = ref([])
const previewHeaders = ref([])
const isImporting = ref(false)
const errorMessage = ref('')

// Computed
const endpoint = computed(() => {
  return props.type === 'type'
    ? '/object-types/import'
    : '/objects/import'
})

// Methods
function close() {
  resetForm()
  emit('close')
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(event) {
  const target = event.target
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    previewData.value = []
    errorMessage.value = ''
  }
}

async function downloadTemplate() {
  try {
    const response = await api.get(
      props.type === 'type'
        ? '/object-types/import/template'
        : '/objects/import/template',
      {
        responseType: 'blob',
        params: props.type === 'value' ? { object_type_id: props.objectTypeId } : {}
      }
    )

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      props.type === 'type'
        ? 'object_types_template.xlsx'
        : 'objects_template.xlsx'
    )
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    notificationService.error(t('dynamic_lists.import.template_download_error'))
  }
}

async function previewImport() {
  if (!selectedFile.value) return

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await api.post(`${endpoint.value}/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    previewData.value = response.data.data
    previewHeaders.value = response.data.headers
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.response?.data?.message || t('dynamic_lists.import.preview_error')
    previewData.value = []
    previewHeaders.value = []
  }
}

async function confirmImport() {
  if (!selectedFile.value) return

  isImporting.value = true
  errorMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    if (props.type === 'value') {
      formData.append('object_type_id', props.objectTypeId || '')
    }

    await api.post(endpoint.value, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    notificationService.success(t('dynamic_lists.import.import_success'))
    emit('success')
    close()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || t('dynamic_lists.import.import_error')
  } finally {
    isImporting.value = false
  }
}

function resetForm() {
  selectedFile.value = null
  previewData.value = []
  previewHeaders.value = []
  errorMessage.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>