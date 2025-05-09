<template>
  <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize" :closeOnClickOutside="false" 
    :aria-labelledby="isEditMode ? 'edit-role-title' : 'add-role-title'">
    <template #header>
      <h3 :id="isEditMode ? 'edit-role-title' : 'add-role-title'"
        class="text-lg text-base font-semibold leading-6 text-gray-900 dark:text-white">
        {{
          isViewMode ? t('roles_module.view_role') :
            isEditMode ? t('roles_module.edit_role') :
              t('roles_module.add_role')
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
            {{ t('roles_module.fields.name') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <input type="text" v-model="formData.name" :readonly="isViewMode" :required="!isViewMode" :class="[
            'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
            isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]" :placeholder="t('roles_module.placeholders.name')" />
          <p v-if="errors.name" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ errors.name[0] }}</p>
        </div>

        <!-- Description Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('roles_module.fields.description') }}
          </label>
          <textarea v-model.trim="formData.description" rows="3" :readonly="isViewMode" :class="[
            'text-sm w-full px-3 py-2 dark:text-white rounded-lg border',
            isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]" :placeholder="t('roles_module.placeholders.description')" />
          <p v-if="errors.description" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ errors.description[0] }}</p>
        </div>

        <!-- Permissions Checkboxes -->
        <div class="permissions-section">
          <fieldset class="permissions-fieldset">
            <legend class="permissions-legend">
              <div class="legend-header">
                <h3 class="legend-title">
                  {{ t('roles_module.fields.permissions') }}
                  <span v-if="loadingPermissions" class="loading-indicator">
                    <svg class="loading-spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                      </path>
                    </svg>
                    {{ t('common.loading') }}
                  </span>
                </h3>
                <p class="legend-subtitle">
                  {{ t('roles_module.permissions_helper') }}
                </p>
              </div>
            </legend>

            <div v-if="permissionError" class="error-message">
              <svg class="error-icon" viewBox="0 0 20 20">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              <div class="error-content">
                <p>{{ permissionError }}</p>
                <button @click="fetchPermissions" class="retry-button">
                  {{ t('common.retry') }}
                </button>
              </div>
            </div>

            <div class="permissions-grid">
              <div v-for="(modulePermissions, moduleName) in groupedPermissions" :key="moduleName" class="module-card">
                <div class="module-header">
                  <div class="flex items-center">
                    <h4 class="module-title">
                      <span class="module-icon">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd"
                            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                            clip-rule="evenodd" />
                        </svg>
                      </span>
                      {{ formatModuleName(moduleName) }}
                    </h4>
                  </div>

                  <button v-if="!isViewMode" @click="toggleAllModulePermissions(moduleName)" type="button"
                    class="select-all-btn">
                    {{ areAllModulePermissionsSelected(moduleName) ? t('common.deselect_all') : t('common.select_all') }}
                  </button>
                </div>

                <div class="permissions-list">
                  <div v-for="permission in modulePermissions" :key="permission.name" class="permission-item">
                    <label class="permission-label">
                      <input type="checkbox" :id="`permission-${permission.name}`" v-model="formData.permissions"
                        :value="permission.name" :disabled="isViewMode" class="permission-checkbox" />
                      <span class="custom-checkbox"></span>
                      <div class="permission-content">
                        <span class="permission-name">
                          {{ formatPermissionName(permission.name) }}
                          <span v-if="isViewMode && formData.permissions.includes(permission.name)"
                            class="selected-badge">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                            </svg>
                          </span>
                        </span>
                        <p v-if="permission.description" class="permission-description">
                          {{ permission.description }}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
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
import { api } from '@/utils/api';

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
  currentRole: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'submit']);

// Data
const formData = ref({
  id: null,
  name: '',
  description: '',
  status: 'active',
  permissions: []
});

const availablePermissions = ref([]);
const loadingPermissions = ref(false);
const permissionError = ref(null);
const isSubmitting = ref(false);
const submitError = ref(null);
const errors = ref({});

// Computed
const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');
const modalSize = computed(() => 'xl');
const hasErrors = computed(() => !formData.value.name.trim());

const groupedPermissions = computed(() => {
  const groups = {};
  availablePermissions.value.forEach(permission => {
    const [module] = permission.name.split('.');
    if (!groups[module]) groups[module] = [];
    groups[module].push(permission);
  });
  return groups;
});

// Methods
const formatModuleName = (module) => {
  return module.replace('.', ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatPermissionName = (permission) => {
  const parts = permission.split('.');
  return parts.length > 1 
    ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
    : permission;
};

const areAllModulePermissionsSelected = (moduleName) => {
  const modulePerms = availablePermissions.value
    .filter(p => p.name.startsWith(`${moduleName}.`))
    .map(p => p.name);

  return modulePerms.length > 0 && modulePerms.every(perm =>
    formData.value.permissions.includes(perm)
  );
};

const toggleAllModulePermissions = (moduleName) => {
  const modulePerms = availablePermissions.value
    .filter(p => p.name.startsWith(`${moduleName}.`))
    .map(p => p.name);

  if (areAllModulePermissionsSelected(moduleName)) {
    formData.value.permissions = formData.value.permissions.filter(
      perm => !modulePerms.includes(perm)
    );
  } else {
    formData.value.permissions = [...new Set([...formData.value.permissions, ...modulePerms])];
  }
};

const toggleStatus = () => {
  formData.value.status = formData.value.status === 'active' ? 'inactive' : 'active';
};

const validateField = (field) => {
  if (field === 'name') {
    if (!formData.value.name.trim()) {
      errors.value.name = t('validation.required', { field: t('roles_module.fields.name') });
    } else if (formData.value.name.length > 50) {
      errors.value.name = t('validation.max_length', { field: t('roles_module.fields.name'), count: 50 });
    } else {
      errors.value.name = '';
    }
  }
};

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    description: '',
    status: 'active',
    permissions: []
  };
  errors.value = {};
  submitError.value = null;
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const fetchPermissions = async () => {
  try {
    loadingPermissions.value = true;
    permissionError.value = null;

    const response = await api.get('/permissions', {
      params: {
        filters: [
          { field: "status", operator: "=", value: "active" }
        ]
      }
    });

    if (response.data.status && response.data.data) {
      availablePermissions.value = response.data.data;
      if (isEditMode.value && props.currentRole?.permissions) {
        formData.value.permissions = props.currentRole.permissions.map(p => p.name);
      }
    }
  } catch (error) {
    permissionError.value = error.response?.data?.message || t('errors.failed_to_load_permissions');
  } finally {
    loadingPermissions.value = false;
  }
};

const handleSubmit = async () => {
  validateField('name');
  if (hasErrors.value) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {
    await emit('submit', {
      ...formData.value,
      name: formData.value.name?.trim() || '',
      description: formData.value.description?.trim() || '',
    });
  } catch (error) {
    submitError.value = error.message || t('common.submission_error');
  } finally {
    isSubmitting.value = false;
  }
};

// Watchers
watch(() => props.isModalOpen, (isOpen) => {
  if (isOpen && availablePermissions.value.length === 0) {
    fetchPermissions();
  }
});

watch(() => props.errors, (newErrors) => {
  errors.value = newErrors;
}, { deep: true });

watch(() => props.currentRole, (role) => {
  if (role && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: role.id,
      name: role.name,
      description: role.description,
      status: role.status || 'active',
      permissions: role.permissions ? role.permissions.map(p => p.name) : []
    };
  }
}, { immediate: true });

defineExpose({
  errors,
  submitError
});
</script>
<style scoped>
.permissions-section {
  @apply mb-8;
}

.permissions-fieldset {
  @apply space-y-5 border-0 p-0 m-0;
}

.permissions-legend {
  @apply block w-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-3;
}

.legend-header {
  @apply space-y-1;
}

.legend-title {
  @apply flex items-center text-base font-semibold text-gray-900 dark:text-white;
}

.legend-subtitle {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.loading-indicator {
  @apply ml-2 text-sm text-gray-500 dark:text-gray-400 flex items-center;
}

.loading-spinner {
  @apply animate-spin -ml-1 mr-1 h-4 w-4 text-gray-400;
}

.error-message {
  @apply p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30 flex items-start;
}

.error-icon {
  @apply h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0;
}

.error-content {
  @apply space-y-1;
}

.error-content p {
  @apply text-sm font-medium text-red-800 dark:text-red-200;
}

.retry-button {
  @apply text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none;
}

.permissions-grid {
  @apply grid grid-cols-1 gap-4;
}

.module-card {
  @apply bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 transition-all hover:shadow-sm dark:hover:bg-gray-800/70;
}

.module-header {
  @apply flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700;
}

.module-title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center;
}

.module-icon {
  @apply mr-2 text-blue-500 dark:text-blue-400;
}

.module-icon svg {
  @apply h-4 w-4;
}

.module-badge {
  @apply text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full;
}

.permissions-list {
  @apply space-y-3;
}

.permission-item {
  @apply transition-colors;
}

.permission-label {
  @apply flex items-start space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50;
}

.permission-checkbox {
  @apply sr-only;
}

.custom-checkbox {
  @apply h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5 transition-all;
}

.permission-checkbox:checked+.custom-checkbox {
  @apply bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 60%;
}

.permission-content {
  @apply flex-1 min-w-0;
}

.permission-name {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.permission-description {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
}

.selected-badge {
  @apply ml-2 inline-flex items-center text-green-600 dark:text-green-400;
}

.selected-badge svg {
  @apply h-3 w-3;
}

/* Animation for checkboxes */
@keyframes checkAnim {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.permission-checkbox:checked+.custom-checkbox {
  animation: checkAnim 0.2s ease-out;
}

/* Responsive adjustments */
@media (min-width: 640px) {
  .permissions-grid {
    @apply grid-cols-1;
  }
}

@media (min-width: 1024px) {
  .permissions-grid {
    @apply grid-cols-2;
  }
}

.module-header {
  @apply flex items-center justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-700;
}

.select-all-btn {
  @apply text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline px-2 py-1 rounded transition-colors;
}

.module-title {
  @apply text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center;
}
</style>