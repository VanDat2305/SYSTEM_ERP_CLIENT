<!-- Modal Type (Loại danh mục) -->
<template>
  <BaseModal 
    :show="isModalOpen" 
    :close="closeModal" 
    :size="modalSize" 
    :closeOnClickOutside="false"
    :aria-labelledby="`${isEditMode ? 'edit' : 'add'}-catalog-type-title`">
    
    <template #header>
      <h3 
        :id="`${isEditMode ? 'edit' : 'add'}-catalog-type-title`"
        class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
        {{
          isViewMode ? t('dynamic_lists.catalog-types.view_type') :
            isEditMode ? t('dynamic_lists.catalog-types.edit_type') :
              t('dynamic_lists.catalog-types.add_type')
        }}
      </h3>
    </template>

    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6 mx-4">
        <!-- ID Field (Only visible in edit/view mode) -->
        <div v-if="isEditMode || isViewMode">
          <input type="hidden" v-model="formData.id" readonly
            class="font-medium w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed" />
        </div>

        <!-- Code Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('dynamic_lists.catalog-types.fields.code') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <input 
            type="text" 
            v-model="formData.code" 
            :readonly="isViewMode" 
            :required="!isViewMode" 
            :class="[
              'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" 
            :placeholder="t('dynamic_lists.catalog-types.placeholders.code')" />
          <p v-if="errors.code" class="mt-1.5 text-xs text-red-500">{{ errors.code[0] }}</p>
        </div>

        <!-- Name Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('dynamic_lists.catalog-types.fields.name') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <input 
            type="text" 
            v-model="formData.name" 
            :readonly="isViewMode" 
            :required="!isViewMode" 
            :class="[
              'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" 
            :placeholder="t('dynamic_lists.catalog-types.placeholders.name')" />
          <p v-if="errors.name" class="mt-1.5 text-xs text-red-500">{{ errors.name[0] }}</p>
        </div>

        <!-- Order Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('dynamic_lists.catalog-types.fields.order') }}
          </label>
          <input 
            type="number" 
            v-model="formData.order" 
            :readonly="isViewMode" 
            :class="[
              'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
              isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
              errors.order ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            ]" 
            :placeholder="t('dynamic_lists.catalog-types.placeholders.order')" />
          <p v-if="errors.order" class="mt-1.5 text-xs text-red-500">{{ errors.order[0] }}</p>
        </div>

        <!-- Status Toggle -->
        <div class="mb-4">
          <div class="flex items-center">
            <span class="ml-3 mr-4 text-sm text-gray-700 dark:text-gray-300">
              {{ t('dynamic_lists.catalog-types.fields.status') }}
            </span>
            <button 
              type="button" 
              @click="!isViewMode && toggleStatus()" 
              :disabled="isViewMode" 
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                formData.status === 'active' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
                isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              ]">
              <span :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                formData.status === 'active' ? 'translate-x-5' : 'translate-x-0'
              ]" />
            </button>
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {{ formData.status === 'active' ? t('status_map.active') : t('status_map.inactive') }}
            </span>
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
        <Button 
          v-if="!isViewMode" 
          type="submit" 
          variant="primary" 
          :loading="isSubmitting" 
          @click="handleSubmit"
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
  currentType: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'submit']);

const formData = ref({
  id: null,
  code: '',
  name: '',
  order: null,
  status: 'active'
});

const isSubmitting = ref(false);
const submitError = ref(null);
const errors = ref({});

const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');
const modalSize = computed(() => 'md');
const hasErrors = computed(() => !formData.value.code.trim() || !formData.value.name.trim());

const toggleStatus = () => {
  formData.value.status = formData.value.status === 'active' ? 'inactive' : 'active';
};

const validateField = (field) => {
  if (field === 'code') {
    if (!formData.value.code.trim()) {
      errors.value.code = t('validation.required', { field: t('dynamic_lists.catalog-fields.code') });
    } else if (formData.value.code.length > 50) {
      errors.value.code = t('validation.max_length', { field: t('dynamic_lists.catalog-fields.code'), count: 50 });
    } else {
      errors.value.code = '';
    }
  }
  
  if (field === 'name') {
    if (!formData.value.name.trim()) {
      errors.value.name = t('validation.required', { field: t('dynamic_lists.catalog-fields.name') });
    } else if (formData.value.name.length > 255) {
      errors.value.name = t('validation.max_length', { field: t('dynamic_lists.catalog-fields.name'), count: 255 });
    } else {
      errors.value.name = '';
    }
  }
};

const resetForm = () => {
  formData.value = {
    id: null,
    code: '',
    name: '',
    order: null,
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
  validateField('code');
  validateField('name');
  if (hasErrors.value) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {
    await emit('submit', {
      ...formData.value,
      code: formData.value.code?.trim() || '',
      name: formData.value.name?.trim() || '',
    });
  } catch (error) {
    submitError.value = error.message || t('common.submission_error');
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.errors, (newErrors) => {
  errors.value = newErrors;
}, { deep: true });

watch(() => props.currentType, (type) => {
  if (type && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: type.id,
      code: type.code,
      name: type.name,
      order: type.order,
      status: type.status || 'active'
    };
  }
}, { immediate: true });

defineExpose({
  errors,
  submitError
});
</script>