<template>
  <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize" :closeOnClickOutside="false">
    <template #header>
      <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        {{
          isViewMode ? t('teams.view_title') :
            isEditMode ? t('teams.edit_title') :
              t('teams.add_title')
        }}
      </h3>
    </template>

    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6 mx-4">
        <!-- ID Field (hidden) -->
        <input type="hidden" v-model="formData.id" readonly />

        <!-- Team Name -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('teams.fields.name') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
          </label>
          <div class="relative">
            <input 
              type="text" 
              v-model="formData.name" 
              :readonly="isViewMode" 
              :required="!isViewMode"
              :class="[
                'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]" 
              :placeholder="t('teams.placeholders.name')" 
            />
            <div v-if="isViewMode" class="absolute inset-0 bg-transparent cursor-not-allowed"></div>
          </div>
          <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name[0] }}</p>
        </div>

        <!-- Description -->
        <div class="mb-4">
          <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('teams.fields.description') }}
          </label>
          <div class="relative">
            <textarea 
              v-model="formData.description" 
              :readonly="isViewMode" 
              rows="4" 
              :class="[
                'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]" 
              :placeholder="t('teams.placeholders.description')"
            ></textarea>
          </div>
          <p v-if="errors.description" class="mt-1 text-xs text-red-500">{{ errors.description[0] }}</p>
        </div>

        <!-- Status Toggle -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div class="flex items-center">
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mr-3">
              {{ t('status') }}:
            </span>
            <span class="text-xs font-medium" :class="formData.is_active ? 'text-green-600' : 'text-gray-500'">
              {{ formData.is_active ? t('status_map.active') : t('status_map.inactive') }}
            </span>
          </div>

          <button 
            type="button" 
            @click="!isViewMode && toggleStatus()" 
            :disabled="isViewMode" 
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              formData.is_active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
              isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
            ]"
          >
            <span :class="[
              'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
              formData.is_active ? 'translate-x-6' : 'translate-x-0'
            ]" />
          </button>
        </div>

        <!-- Team Stats (View Mode Only) -->
        <div v-if="isViewMode && formData.id" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <!-- <h4 class="text-xs font-medium text-gray-900 dark:text-white mb-2">
            {{ t('teams.team_stats') }}
          </h4> -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs text-gray-700 dark:text-gray-100">{{ t('teams.fields.members_count') }}:</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white ml-1">
                {{ formData.members_count || 0 }}
              </span>
            </div>
            <!-- <div>
              <span class="text-xs text-gray-500">{{ t('teams.fields.created_at') }}:</span>
              <span class="text-xs font-medium text-gray-900 dark:text-white ml-1">
                {{ formData.created_at ? new Date(formData.created_at).toLocaleDateString('vi-VN') : '-' }}
              </span>
            </div> -->
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="font-medium text-red-800 dark:text-red-200">
                {{ t('common.submission_error') }}
              </h3>
              <div class="mt-2 text-red-700 dark:text-red-300">
                <p>{{ submitError }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button 
          type="button" 
          @click="closeModal"
          class="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          {{ isViewMode ? t('common.close') : t('common.cancel') }}
        </button>
        <button 
          v-if="!isViewMode" 
          type="submit" 
          @click="handleSubmit" 
          :disabled="hasErrors"
          class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isEditMode ? t('common.update') : t('common.save') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'

const { t } = useI18n()

const props = defineProps({
  isModalOpen: Boolean,
  errors: {
    type: Object,
    default: () => ({})
  },
  mode: {
    type: String,
    default: 'add',
    validator: (value: string) => ['add', 'edit', 'view'].includes(value)
  },
  currentTeam: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'submit'])

// Form Data
const formData = ref({
  id: null,
  name: '',
  description: '',
  is_active: true,
  members_count: 0,
  created_at: null
})

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const errors = ref<Record<string, any>>({})

// Computed
const isEditMode = computed(() => props.mode === 'edit')
const isViewMode = computed(() => props.mode === 'view')
const modalSize = computed(() => 'lg')
const hasErrors = computed(() => {
  return !formData.value.name || formData.value.name.trim().length === 0
})

// Methods
const toggleStatus = () => {
  formData.value.is_active = !formData.value.is_active
}

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    description: '',
    is_active: true,
    members_count: 0,
    created_at: null
  }
  errors.value = {}
  submitError.value = null
}

const closeModal = () => {
  resetForm()
  emit('close')
}

const handleSubmit = () => {
  if (hasErrors.value) return

  isSubmitting.value = true
  submitError.value = null

  try {
    emit('submit', {
      ...formData.value,
      name: formData.value.name.trim(),
      description: formData.value.description ? formData.value.description.trim() : ''
    })
  } catch (error: any) {
    submitError.value = error.message || t('common.submission_error')
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.errors, (newErrors) => {
  errors.value = newErrors
}, { deep: true })

watch(() => props.currentTeam, (team) => {
  if (!props.mode || props.mode === 'add') {
    resetForm()
    return
  }

  if (team && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: team.id,
      name: team.name || '',
      description: team.description || '',
      is_active: team.is_active !== undefined ? team.is_active : true,
      members_count: team.users.length || 0,
      created_at: team.created_at
    }
  }
}, { immediate: true })
</script>