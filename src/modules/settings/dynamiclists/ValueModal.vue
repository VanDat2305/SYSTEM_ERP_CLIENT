<!-- Modal Value (Giá trị danh mục) -->
<template>
  <BaseModal 
    :show="isModalOpen" 
    :close="closeModal" 
    :size="modalSize" 
    :closeOnClickOutside="false"
    :aria-labelledby="isEditMode ? 'edit-catalog-value-title' : 'add-catalog-value-title'">
    
    <template #header>
      <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
        {{ modalTitle }}
      </h3>
    </template>

    <template #body>
      <div class="border-b border-gray-200 dark:border-gray-700 mx-4">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="currentTab = tab.name"
            :class="[
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              currentTab === tab.name
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            ]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
      
      <form @submit.prevent="handleSubmit" class="space-y-6 mx-4">
        <!-- Basic Info Tab -->
        <div v-show="currentTab === 'basic'" class="space-y-4">
          <!-- ID Field (Only visible in edit/view mode) -->
          <div v-if="isEditMode || isViewMode">
            <input type="hidden" v-model="formData.id" readonly
              class="font-medium w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed" />
          </div>

          <!-- Object Type ID (Hidden) -->
          <input type="hidden" v-model="formData.object_type_id" />

          <!-- Code Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('dynamic_lists.catalog-values.fields.code') }}
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
              :placeholder="t('dynamic_lists.catalog-values.placeholders.code')" 
              @blur="validateField('code')"
            />
            <p v-if="errors.code" class="mt-1.5 text-theme-xs text-error-500">{{ errors.code[0] }}</p>
          </div>

          <!-- Name Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('dynamic_lists.catalog-values.fields.name') }}
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
              :placeholder="t('dynamic_lists.catalog-values.placeholders.name')" 
              @blur="validateField('name')"
            />
            <p v-if="errors.name" class="mt-1.5 text-theme-xs text-error-500">{{ errors.name[0] }}</p>
          </div>

          <!-- Parent ID Field -->
          <div class="mb-4" v-if="showParentField">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('dynamic_lists.catalog-values.fields.parent') }}
            </label>
            <select 
              v-model="formData.parent_id" 
              :disabled="isViewMode"
              :class="[
                'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
                isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                errors.parent_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]">
              <option value="">{{ t('dynamic_lists.catalog-values.no_parent') }}</option>
              <option 
                v-for="parent in parentOptions" 
                :key="parent.id" 
                :value="parent.id">
                {{ parent.name }}
              </option>
            </select>
            <p v-if="errors.parent_id" class="mt-1.5 text-theme-xs text-error-500">{{ errors.parent_id[0] }}</p>
          </div>

          <!-- Order Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('dynamic_lists.catalog-values.fields.order') }}
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
              :placeholder="t('dynamic_lists.catalog-values.placeholders.order')" 
            />
            <p v-if="errors.order" class="mt-1.5 text-theme-xs text-error-500">{{ errors.order[0] }}</p>
          </div>

          <!-- Status Toggle -->
          <div class="mb-4">
            <div class="flex items-center">
              <span class="ml-3 mr-4 text-sm text-gray-700 dark:text-gray-300">
                {{ t('dynamic_lists.catalog-values.fields.status') }}
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
        </div>

        <!-- Metadata Tab -->
        <div v-show="currentTab === 'metadata'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-md font-medium text-gray-900 dark:text-white">
              {{ t('dynamic_lists.catalog-values.metadata') }}
            </h4>
            <button
              type="button"
              @click="addMetaField"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              :disabled="isViewMode"
            >
              <PlusIcon class="icon" />
            </button>
          </div>

          <div v-for="(meta, index) in metaFields" :key="index" class="flex gap-2 items-start">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('dynamic_lists.catalog-meta.fields.key') }}
              </label>
              <input
                type="text"
                v-model="meta.key"
                :readonly="isViewMode"
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  metaErrors[index]?.key ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]"
                :placeholder="t('dynamic_lists.catalog-meta.placeholders.key')"
                @blur="validateMetaField(index, 'key')"
              />
              <p v-if="metaErrors[index]?.key" class="mt-1 text-sm text-red-600">
                {{ metaErrors[index].key }}
              </p>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('dynamic_lists.catalog-meta.fields.value') }}
              </label>
              <input
                type="text"
                v-model="meta.value"
                :readonly="isViewMode"
                :class="[
                  'w-full px-3 py-2 rounded-lg border text-sm text-gray-700 dark:text-gray-300',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  metaErrors[index]?.value ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]"
                :placeholder="t('dynamic_lists.catalog-meta.placeholders.value')"
              />
              <p v-if="metaErrors[index]?.value" class="mt-1 text-sm text-red-600">
                {{ metaErrors[index].value }}
              </p>
            </div>

            <button
              v-if="!isViewMode"
              type="button"
              @click="removeMetaField(index)"
              class="mt-6 p-2 text-red-500 hover:text-red-700"
              :title="t('common.remove')"
            >
              <TrashIcon class="h-5 w-5" />
            </button>
          </div>    

          <div v-if="metaFields.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
            {{ t('dynamic_lists.catalog-meta.no_metadata') }}
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
import { PlusIcon, TrashIcon } from '@/icons';

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
  currentValue: {
    type: Object,
    default: () => ({})
  },
  parentOptions: {
    type: Array,
    default: () => []
  },
  objectTypeId: {
    type: String,
    default: ''
  },
  showParentField: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'submit']);

// Reactive state
const formData = ref({
  id: null,
  object_type_id: props.objectTypeId,
  code: '',
  name: '',
  parent_id: null,
  order: null,
  status: 'active'
});

const isSubmitting = ref(false);
const submitError = ref(null);
const errors = ref({});
const currentTab = ref('basic');
const metaFields = ref([]);
const metaErrors = ref([]);

// Computed properties
const tabs = computed(() => [
  { name: 'basic', label: t('dynamic_lists.catalog-values.basic_info') },
  { name: 'metadata', label: t('dynamic_lists.catalog-values.metadata') }
]);

const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');
const modalSize = computed(() => 'xl');
const hasErrors = computed(() => !formData.value.code.trim() || !formData.value.name.trim());

const modalTitle = computed(() => {
  return isViewMode.value 
    ? t('dynamic_lists.catalog-values.view') 
    : isEditMode.value 
      ? t('dynamic_lists.catalog-values.edit') 
      : t('dynamic_lists.catalog-values.add');
});

// Methods
const toggleStatus = () => {
  formData.value.status = formData.value.status === 'active' ? 'inactive' : 'active';
};

const validateField = (field) => {
  if (field === 'code') {
    errors.value.code = errors.value.code || [];
    if (!formData.value.code.trim()) {
      errors.value.code[0] = t('validation.required', { field: t('dynamic_lists.catalog-values.fields.code') });
    } else if (formData.value.code.length > 50) {
      errors.value.code[0] = t('validation.max_length', { field: t('dynamic_lists.catalog-values.fields.code'), count: 50 });
    } else {
      delete errors.value.code;
    }
  }
  
  if (field === 'name') {
    errors.value.name = errors.value.name || [];
    if (!formData.value.name.trim()) {
      errors.value.name[0] = t('validation.required', { field: t('dynamic_lists.catalog-values.fields.name') });
    } else if (formData.value.name.length > 255) {
      errors.value.name[0] = t('validation.max_length', { field: t('dynamic_lists.catalog-values.fields.name'), count: 255 });
    } else {
      delete errors.value.name;
    }
  }
};

const validateMetaField = (index, field) => {
  if (field === 'key') {
    if (!metaFields.value[index].key.trim()) {
      metaErrors.value[index] = { ...metaErrors.value[index], key: t('validation.required', { field: t('dynamic_lists.catalog-meta.fields.key') }) };
    } else if (metaFields.value[index].key.length > 100) {
      metaErrors.value[index] = { ...metaErrors.value[index], key: t('validation.max_length', { field: t('dynamic_lists.catalog-meta.fields.key'), count: 100 }) };
    } else {
      delete metaErrors.value[index]?.key;
    }
  }
};

const addMetaField = () => {
  metaFields.value.push({ key: '', value: '' });
  metaErrors.value.push({});
};

const removeMetaField = (index) => {
  metaFields.value.splice(index, 1);
  metaErrors.value.splice(index, 1);
};

const validateBasicFields = () => {
  let isValid = true;
  errors.value = {};
  
  validateField('code');
  validateField('name');
  
  if (errors.value.code || errors.value.name) {
    isValid = false;
  }
  
  return isValid;
};

const validateMetaFields = () => {
  let isValid = true;
  
  metaFields.value.forEach((_, index) => {
    validateMetaField(index, 'key');
    if (metaErrors.value[index]?.key) {
      isValid = false;
    }
  });
  
  return isValid;
};

const resetForm = () => {
  formData.value = {
    id: null,
    object_type_id: props.objectTypeId,
    code: '',
    name: '',
    parent_id: null,
    order: null,
    status: 'active'
  };
  metaFields.value = [];
  metaErrors.value = [];
  errors.value = {};
  submitError.value = null;
  currentTab.value = 'basic';
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!validateBasicFields() || !validateMetaFields()) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {
    const metaData = {};
    metaFields.value.forEach(meta => {
      if (meta.key.trim()) {
        metaData[meta.key.trim()] = meta.value;
      }
    });

    const payload = {
      ...formData.value,
      code: formData.value.code.trim(),
      name: formData.value.name.trim(),
      object_type_id: formData.value.object_type_id || props.objectTypeId,
      ...(Object.keys(metaData).length > 0 && { meta: metaData })
    };

    await emit('submit', payload);
  } catch (error) {
    submitError.value = error.message || t('common.submission_error');
  } finally {
    isSubmitting.value = false;
  }
};

// Watchers
watch(() => props.currentValue, (value) => {
  if (props.mode === 'add') {
    resetForm();
    return;
  }
  if (value && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: value.id,
      object_type_id: value.object_type_id || props.objectTypeId,
      code: value.code,
      name: value.name,
      parent_id: value.parent_id,
      order: value.order,
      status: value.status || 'active'
    };
    
    // Load metadata
    metaFields.value = [];
    if (value.meta) {
      Object.entries(value.meta).forEach(([key, val]) => {
        metaFields.value.push({ key:val.key, value: val.value });
        metaErrors.value.push({});
      });
    }
  }
}, { immediate: true });

watch(() => props.errors, (newErrors) => {
  errors.value = newErrors;
}, { deep: true });

watch(() => props.objectTypeId, (newId) => {
  formData.value.object_type_id = newId;
}, { immediate: true });

defineExpose({
  errors,
  submitError
});
</script>