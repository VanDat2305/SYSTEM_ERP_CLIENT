<template>
    <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize"
      :aria-labelledby="isEditMode ? 'edit-permission-title' : 'add-permission-title'">
      <template #header>
        <h3 :id="isEditMode ? 'edit-permission-title' : 'add-permission-title'"
          class="text-lg text-base font-semibold leading-6 text-gray-900 dark:text-white">
          {{
            isViewMode ? t('permissions_module.view_permission') :
              isEditMode ? t('permissions_module.edit_permission') :
                t('permissions_module.add_permission')
          }}
        </h3>
      </template>
  
      <template #body>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- ID Field (Only visible in edit/view mode) -->
          <div v-if="isEditMode || isViewMode">
            <input type="hidden" v-model="formData.id" readonly
              class="font-medium w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed" />
          </div>
  
          <!-- Name Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('permissions_module.fields.name') }}
              <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
            </label>
            <input type="text" v-model="formData.name" :readonly="isViewMode" :required="!isViewMode" :class="[
              'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" :placeholder="t('permissions_module.placeholders.name')" />
            <p v-if="errors.name" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ errors.name[0] }}</p>
          </div>
  
          <!-- Module Field -->
          <!-- <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('permissions_module.fields.module') }}
              <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
            </label>
            <input type="text" v-model="formData.module" :readonly="isViewMode" :required="!isViewMode" :class="[
              'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.module ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" :placeholder="t('permissions_module.placeholders.module')" />
            <p v-if="errors.module" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ errors.module[0] }}</p>
          </div> -->
  
          <!-- Description Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('permissions_module.fields.description') }}
            </label>
            <textarea v-model.trim="formData.description" rows="3" :readonly="isViewMode" :class="[
              'text-sm w-full px-3 py-2 dark:text-white rounded-lg border',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" :placeholder="t('permissions_module.placeholders.description')" />
            <p v-if="errors.description" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ errors.description[0] }}</p>
          </div>
  
          <!-- Status Toggle -->
          <div class="mb-4">
            <div class="flex items-center">
              <span class="ml-3 mr-4 text-sm text-gray-700 dark:text-gray-300">
                {{ t('status') }}
              </span>
              <button type="button" @click="!isViewMode && toggleStatus()" :disabled="isViewMode" :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                formData.status === 'active' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
                isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              ]">
                <span :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  formData.status === 'active' ? 'translate-x-5' : 'translate-x-0'
                ]" />
              </button>
            </div>
          </div>
  
          <!-- Error Message -->
          <div v-if="submitError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div class="flex">
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                  {{ t('common.submission_error') }}
                </h3>
                <div class="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{{ submitError }}</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </template>
  
      <template #footer>
        <div class="flex justify-end space-x-3">
          <Button type="button" variant="outline" @click="closeModal" size="md">
            {{ isViewMode ? t('common.close') : t('common.cancel') }}
          </Button>
          <Button v-if="!isViewMode" type="submit" variant="primary" :loading="isSubmitting" @click="handleSubmit"
            :disabled="hasErrors">
            {{ isEditMode ? t('common.update') : t('common.save') }}
          </Button>
        </div>
      </template>
    </BaseModal>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import BaseModal from '@/components/modals/BaseModal.vue';
  import Button from '@/components/ui/Button.vue';
  
  const { t } = useI18n();
  
  const props = defineProps({
    isModalOpen: Boolean,
    errors: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: 'add',
      validator: (value) => ['add', 'edit', 'view'].includes(value)
    },
    currentPermission: {
      type: Object,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['close', 'submit']);
  
  // Data
  const formData = ref({
    id: null,
    name: '',
    // module: '',
    description: '',
    status: 'active'
  });
  
  const isSubmitting = ref(false);
  const submitError = ref(null);
  const errors = ref({});
  
  // Computed
  const isEditMode = computed(() => props.mode === 'edit');
  const isViewMode = computed(() => props.mode === 'view');
  const modalSize = computed(() => 'md');
  const hasErrors = computed(() => !formData.value.name.trim());
  
  // Methods
  const toggleStatus = () => {
    formData.value.status = formData.value.status === 'active' ? 'inactive' : 'active';
  };
  
  const validateField = (field) => {
    if (field === 'name') {
      if (!formData.value.name.trim()) {
        errors.value.name = t('validation.required', { field: t('permissions_module.fields.name') });
      } else if (formData.value.name.length > 50) {
        errors.value.name = t('validation.max_length', { field: t('permissions_module.fields.name'), count: 50 });
      } else {
        errors.value.name = '';
      }
    }
    
    // if (field === 'module') {
    //   if (!formData.value.module.trim()) {
    //     errors.value.module = t('validation.required', { field: t('permissions_module.fields.module') });
    //   } else if (formData.value.module.length > 30) {
    //     errors.value.module = t('validation.max_length', { field: t('permissions_module.fields.module'), count: 30 });
    //   } else {
    //     errors.value.module = '';
    //   }
    // }
  };
  
  const resetForm = () => {
    formData.value = {
      id: null,
      name: '',
      // module: '',
      description: '',
      status: 'active'
    };
    errors.value = {};
    submitError.value = null;
  };
  
  const closeModal = () => {
    resetForm();
    emit('close');
  };
  
  const handleSubmit = async () => {
    validateField('name');
    // validateField('module');
    if (hasErrors.value) return;
  
    isSubmitting.value = true;
    submitError.value = null;
  
    try {
      await emit('submit', {
        ...formData.value,
        name: formData.value.name?.trim() || '',
        // module: formData.value.module?.trim() || '',
        description: formData.value.description?.trim() || '',
      });
    } catch (error) {
      submitError.value = error.message || t('common.submission_error');
    } finally {
      isSubmitting.value = false;
    }
  };
  
  // Watchers
  watch(() => props.errors, (newErrors) => {
    errors.value = newErrors;
  }, { deep: true });
  
  watch(() => props.currentPermission, (permission) => {
    if (permission && (isViewMode.value || isEditMode.value)) {
      formData.value = {
        id: permission.id,
        name: permission.name,
        // module: permission.module,
        description: permission.description,
        status: permission.status || 'active'
      };
    }
  }, { immediate: true });
  
  defineExpose({
    errors,
    submitError
  });
  </script>