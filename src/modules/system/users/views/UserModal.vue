<!-- eslint-disable vue/no-dupe-keys -->
<template>
  <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize" :closeOnClickOutside="false"
    :aria-labelledby="isEditMode ? 'edit-user-title' : 'add-user-title'">
    <template #header>
      <h3 :id="isEditMode ? 'edit-user-title' : 'add-user-title'"
        class="text-lg text-base font-semibold leading-6 text-gray-900 dark:text-white">
        {{
          isViewMode ? t('users_module.view_user') :
            isEditMode ? t('users_module.edit_user') :
              t('users_module.add_user')
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

        <!-- Name Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('users_module.fields.name') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <input type="text" v-model="formData.name" :readonly="isViewMode" :required="!isViewMode" :class="[
            'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
            isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
            errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]" :placeholder="t('users_module.placeholders.name')" />
          <p v-if="errors.name" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ Array.isArray(errors.name) ? errors.name[0] : errors.name }}</p>
        </div>

        <!-- Email Field -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('users_module.fields.email') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <input type="email" v-model="formData.email" :readonly="isViewMode" :required="!isViewMode" :class="[
            'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
            isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
            errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]" :placeholder="t('users_module.placeholders.email')" />
          <p v-if="errors.email" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ Array.isArray(errors.email) ? errors.email[0] : errors.email }}</p>
        </div>
        
          <!-- Change password toggle (only in edit mode) -->
          <div v-if="isEditMode" class="flex items-center">
            <button type="button" @click="toggleChangePassword"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none">
              {{ changePassword ? t('users_module.cancel_password_change') : t('users_module.change_password') }}
            </button>
          </div>

        <div v-if="!isViewMode && (!isEditMode || changePassword)" class="space-y-4">
          <!-- Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('users_module.fields.password') }}
              <span class="text-red-500 ml-1 font-bold text-sm">*</span>
            </label>
            <div class="relative">
              <input :type="showPassword ? 'text' : 'password'" v-model="formData.password"
                :required="!isEditMode || changePassword" :class="[
                  'w-full px-3 py-2 rounded-lg border dark:text-white text-sm pr-10',
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                  'bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500'
                ]" :placeholder="t('users_module.placeholders.password')" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="showPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                      'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 text-theme-xs text-error-500">{{ Array.isArray(errors.password) ? errors.password[0] : errors.password }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ t('users_module.password_requirements') }}
            </p>
          </div>

          <!-- Confirm Password Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('users_module.fields.confirm_password') }}
              <span class="text-red-500 ml-1 font-bold text-sm">*</span>
            </label>
            <div class="relative">
              <input :type="showConfirmPassword ? 'text' : 'password'" v-model="formData.password_confirmation"
                :required="!isEditMode || changePassword" :class="[
                  'w-full px-3 py-2 rounded-lg border dark:text-white text-sm pr-10',
                  errors.password_confirmation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
                  'bg-white dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500'
                ]" :placeholder="t('users_module.placeholders.confirm_password')" />
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    :d="showConfirmPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                      'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                </svg>
              </button>
            </div>
            <p v-if="errors.password_confirmation" class="mt-1.5 text-theme-xs text-error-500">
              {{ Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation  }}
            </p>
          </div>

        </div>

        <!-- Two-Factor Authentication Toggle -->
        <div class="mb-4">
          <div class="flex items-center">
            <span class="mr-4 text-sm text-gray-700 dark:text-gray-300">
              {{ t('users_module.fields.two_factor_enabled') }}
            </span>
            <button type="button" @click="!isViewMode && toggleTwoFactor()" :disabled="isViewMode" :class="[
              'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              formData.two_factor_enabled ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600',
              isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            ]">
              <span :class="[
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                formData.two_factor_enabled ? 'translate-x-5' : 'translate-x-0'
              ]" />
            </button>
          </div>
        </div>

        <!-- Status Select -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('status') }}
            <span v-if="!isViewMode" class="text-red-500 ml-1 font-bold text-sm">*</span>
          </label>
          <select v-model="formData.status" :disabled="isViewMode" :class="[
            'w-full px-3 py-2 rounded-lg border dark:text-white text-sm',
            isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
            errors.status ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          ]">
            <option v-for="status in availableStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
          <p v-if="errors.status" class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ Array.isArray(errors.status) ? errors.status[0] : errors.status }}</p>
        </div>

        <!-- Roles Section -->
        <CollapsibleSection :title="t('users_module.fields.roles')" :loading="loadingRoles"
          @retry="fetchRoles" :default-open="true">
          <template v-slot:header-extra>
            <button v-if="!isViewMode" @click="toggleSelectAllRoles" type="button"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ areAllRolesSelected ? t('common.deselect_all') : t('common.select_all') }}
            </button>
          </template>

          <div v-if="!isViewMode" class="search-box mb-3">
            <input type="text" v-model="roleSearchQuery" :placeholder="t('common.search')"
              class="w-full px-3 py-2  dark:text-white border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>

          <div class="roles-list-container" :class="{ 'max-h-60 overflow-y-auto': !isViewMode }">
            <div v-for="role in filteredRoles" :key="role.id" class="role-item">
              <label class="role-label">
                <input type="checkbox" :id="`role-${role.id}`" v-model="formData.roles" :value="role.name"
                  :disabled="isViewMode" class="role-checkbox" />
                <span class="custom-checkbox"></span>
                <div class="role-content">
                  <div class="flex justify-between items-center">
                    <span class="role-name">
                      {{ role.title || role.name }}
                    </span>
                    <button v-if="!isViewMode" type="button" @click.stop="toggleRolePermissions(role.id)"
                      class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                      {{ showRolePermissions[role.id] ? t('common.hide_permissions') : t('common.show_permissions') }}
                    </button>
                  </div>
                  <!-- <p v-if="role.description" class="role-description">
                    {{ role.description }}
                  </p> -->

                  <!-- Role Permissions Preview -->
                  <div v-if="showRolePermissions[role.id] && role.permissions" class="mt-2 pl-6">
                    <div v-for="permission in role.permissions.slice(0, 5)" :key="permission"
                      class="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <svg class="h-3 w-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd" />
                      </svg>
                      {{ permission.title }}
                    </div>
                    <div v-if="role.permissions.length > 5" class="text-xs text-gray-400 mt-1">
                      + {{ role.permissions.length - 5 }} {{ t('common.more_permissions') }}
                    </div>
                  </div>
                </div>
              </label>
            </div>
            <div v-if="filteredRoles.length === 0" class="no-results">
              {{ t('common.no_results_found') }}
            </div>
          </div>
        </CollapsibleSection>

        <!-- Permissions Section -->
        <CollapsibleSection :title="t('users_module.fields.permissions')" :loading="loadingPermissions"
           @retry="fetchPermissions" :default-open="false">
          <template v-slot:header-extra>
            <button v-if="!isViewMode" @click="toggleSelectAllPermissions" type="button"
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              {{ areAllPermissionsSelected ? t('common.deselect_all') : t('common.select_all') }}
            </button>
          </template>

          <div v-if="!isViewMode" class="search-box mb-3">
            <input type="text" v-model="permissionSearchQuery" :placeholder="t('common.search')"
              class="w-full px-3 py-2  dark:text-white border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>

          <div class="permissions-grid">
            <div v-for="(modulePermissions, moduleName) in filteredGroupedPermissions" :key="moduleName"
              class="module-card">
              <div class="module-header">
                <div class="flex items-center">
                  <h4 class="module-title">
                    <span class="module-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                        <path fill-rule="evenodd"
                          d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                          clip-rule="evenodd" />
                      </svg>
                    </span>
                     {{ t('menu.'+ moduleName) }}
                  </h4>
                </div>
                <button v-if="!isViewMode" @click="toggleAllModulePermissions(moduleName)" type="button"
                  class="select-all-btn text-xs">
                  {{ areAllModulePermissionsSelected(moduleName) ? t('common.deselect') : t('common.select') }}
                </button>
              </div>

              <div class="permissions-list">
                <div v-for="permission in modulePermissions" :key="permission.name" class="permission-item">
                  <label class="permission-label">
                    <input type="checkbox" :id="`permission-${permission.name}`" v-model="formData.permissions"
                      :value="permission.name" :disabled="isViewMode" class="permission-checkbox" />
                    <span class="custom-checkbox-permission"></span>
                    <div class="permission-content">
                      <span class="permission-name">
                        {{ permission.title }}
                      </span>
                      <!-- <p v-if="permission.description" class="permission-description">
                        {{ permission.description }}
                      </p> -->
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <div v-if="Object.keys(filteredGroupedPermissions).length === 0" class="no-results">
              {{ t('common.no_results_found') }}
            </div>
          </div>
        </CollapsibleSection>

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
      <div class="flex justify-end space-x-3 mx-2">
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
import CollapsibleSection from '@/components/ui/CollapsibleSection.vue';
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
  currentUser: {
    type: Object,
    default: () => ({})
  }
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const changePassword = ref(false);

const emit = defineEmits(['close', 'submit']);

// Status options
const availableStatuses = [
  { value: 'active', label: t('status_map.active') },
  { value: 'inactive', label: t('status_map.inactive') },
  { value: 'pending', label: t('status_map.pending') },
  { value: 'suspended', label: t('status_map.suspended') },
  { value: 'banned', label: t('status_map.banned') }
];

// Data
const formData = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  two_factor_enabled: false,
  status: 'active',
  roles: [],
  permissions: []
});

const availableRoles = ref([]);
const availablePermissions = ref([]);
const loadingRoles = ref(false);
const loadingPermissions = ref(false);
const rolesError = ref(null);
const permissionError = ref(null);
const isSubmitting = ref(false);
const submitError = ref(null);
const errors = ref({});
const roleSearchQuery = ref('');
const permissionSearchQuery = ref('');
const showRolePermissions = ref({});

// Computed
const isEditMode = computed(() => props.mode === 'edit');
const isViewMode = computed(() => props.mode === 'view');
const modalSize = computed(() => 'xl');
const hasErrors = computed(() => !formData.value.name.trim() || !formData.value.email.trim());

const filteredRoles = computed(() => {
  if (!roleSearchQuery.value) return availableRoles.value;
  const query = roleSearchQuery.value.toLowerCase();
  return availableRoles.value.filter(role =>
    role.name.toLowerCase().includes(query) ||
    (role.description && role.description.toLowerCase().includes(query))
  );
});

const areAllRolesSelected = computed(() => {
  return availableRoles.value.length > 0 &&
    availableRoles.value.every(role => formData.value.roles.includes(role.id));
});

const areAllPermissionsSelected = computed(() => {
  return availablePermissions.value.length > 0 &&
    availablePermissions.value.every(perm => formData.value.permissions.includes(perm.name));
});

const groupedPermissions = computed(() => {
  const groups = {};
  availablePermissions.value.forEach(permission => {
    const [module] = permission.name.split('.');
    if (!groups[module]) groups[module] = [];
    groups[module].push(permission);
  });
  return groups;
});

const filteredGroupedPermissions = computed(() => {
  if (!permissionSearchQuery.value) return groupedPermissions.value;

  const query = permissionSearchQuery.value.toLowerCase();
  const filtered = {};

  Object.keys(groupedPermissions.value).forEach(module => {
    const filteredPermissions = groupedPermissions.value[module].filter(permission =>
      permission.name.toLowerCase().includes(query) ||
      (permission.description && permission.description.toLowerCase().includes(query))
    );

    if (filteredPermissions.length > 0) {
      filtered[module] = filteredPermissions;
    }
  });

  return filtered;
});

// Methods
const formatModuleName = (module) => {
  return module.replace('.', ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const formatPermissionName = (permission) => {
  const parts = permission.split('.');
  if (parts.length < 2) return permission;

  const formatted = parts[1].replace(/_/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const toggleTwoFactor = () => {
  formData.value.two_factor_enabled = !formData.value.two_factor_enabled;
};

const toggleSelectAllRoles = () => {
  if (areAllRolesSelected.value) {
    formData.value.roles = [];
  } else {
    formData.value.roles = availableRoles.value.map(role => role.id);
  }
};

const toggleSelectAllPermissions = () => {
  if (areAllPermissionsSelected.value) {
    formData.value.permissions = [];
  } else {
    formData.value.permissions = availablePermissions.value.map(perm => perm.name);
  }
};

const toggleRolePermissions = (roleId) => {
  showRolePermissions.value = {
    ...showRolePermissions.value,
    [roleId]: !showRolePermissions.value[roleId]
  };
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

const areAllModulePermissionsSelected = (moduleName) => {
  const modulePerms = availablePermissions.value
    .filter(p => p.name.startsWith(`${moduleName}.`))
    .map(p => p.name);

  return modulePerms.length > 0 && modulePerms.every(perm =>
    formData.value.permissions.includes(perm)
  );
};

const validateField = (field) => {
  if (field === 'name') {
    if (!formData.value.name.trim()) {
      errors.value.name = t('validation.required', { field: t('users_module.fields.name') });
    } else if (formData.value.name.length > 50) {
      errors.value.name = t('validation.max_length', { field: t('users_module.fields.name'), length: 50 });
    } else {
      errors.value.name = '';
    }
  }

  if (field === 'email') {
    if (!formData.value.email.trim()) {
      errors.value.email = t('validation.required', { field: t('users_module.fields.email') });
    } else if (!/^\S+@\S+\.\S+$/.test(formData.value.email)) {
      errors.value.email = t('validation.email');
    } else {
      errors.value.email = '';
    }
  }
};
const validatePassword = () => {
  if ((!isEditMode.value || changePassword.value) && !formData.value.password) {
    errors.value.password = t('validation.required', { field: t('users_module.fields.password') });
    return false;
  }

  if (formData.value.password && formData.value.password.length < 8) {
    errors.value.password = t('validation.min_length', { field: t('users_module.fields.password'), length: 8 });
    return false;
  }

  if (formData.value.password !== formData.value.password_confirmation) {
    errors.value.password_confirmation = t('validation.confirmed', { field: t('users_module.fields.password') });
    return false;
  }

  errors.value.password = '';
  errors.value.password_confirmation = '';
  return true;
};
const toggleChangePassword = () => {
  changePassword.value = !changePassword.value;
  if (!changePassword.value) {
    formData.value.password = '';
    formData.value.password_confirmation = '';
  }
};

const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    email: '',
    two_factor_enabled: false,
    password: '',
    password_confirmation: '',
    status: 'active',
    roles: [],
    permissions: []
  };
  errors.value = {};
  submitError.value = null;
  roleSearchQuery.value = '';
  permissionSearchQuery.value = '';
  showRolePermissions.value = {};
  changePassword.value = false;
  showPassword.value = false;
  showConfirmPassword.value = false;
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const fetchRoles = async () => {
  try {
    loadingRoles.value = true;
    rolesError.value = null;

    const response = await api.get('/roles', {
      params: {
        filters: [
          { field: "status", operator: "=", value: "active" }
        ],
        with_permissions: true
      }
    });

    if (response.data.status && response.data.data) {
      availableRoles.value = response.data.data;
      if (isEditMode.value && props.currentUser?.roles) {
        
        formData.value.roles = props.currentUser.roles.map(r => r.name);
      }
    }
  } catch (error) {
    rolesError.value = error.response?.data?.message || t('errors.failed_to_load_roles');
  } finally {
    loadingRoles.value = false;
  }
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
      if (isEditMode.value && props.currentUser?.permissions) {
        formData.value.permissions = props.currentUser.permissions;
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
  validateField('email');

  if (!isEditMode.value || changePassword.value) {
    if (!validatePassword()) {
      return;
    }
  }

  if (hasErrors.value) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {

    // Clone dữ liệu để không làm thay đổi formData gốc
    const data = { ...formData.value };
    // Nếu đang chỉnh sửa và không đổi mật khẩu thì xóa password ra khỏi payload
    if (isEditMode.value && !changePassword.value) {
      delete data.password;
      delete data.password_confirmation;
    }

    // Trim các trường đầu vào
    data.name = data.name?.trim() || '';
    data.email = data.email?.trim() || '';

    // Gửi dữ liệu ra ngoài qua emit
    await emit('submit', data);
  } catch (error) {
    submitError.value = error.message || t('common.submission_error');
  } finally {
    isSubmitting.value = false;
  }
};

// Watchers
watch(() => props.isModalOpen, (isOpen) => {
  if (isOpen) {
    fetchRoles();
    fetchPermissions();
  }
});

watch(() => props.errors, (newErrors) => {
  errors.value = newErrors;
}, { deep: true });

watch(() => props.currentUser, (user) => {
  if (user && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: user.id,
      name: user.name,
      email: user.email,
      two_factor_enabled: user.two_factor_enabled || false,
      status: user.status || 'active',
      roles: user.roles ? user.roles.map(r => r.name) : [],
      permissions: user.permissions ? user.permissions : []
    };
  }
}, { immediate: true });

defineExpose({
  errors,
  submitError
});
</script>

<style scoped>
.roles-list-container {
  @apply space-y-2;
}

.role-item {
  @apply transition-colors;
}

.role-label {
  @apply flex items-start space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50;
}

.role-checkbox {
  @apply sr-only;
}

.custom-checkbox {
  @apply h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5 transition-all;
}

.custom-checkbox-permission {
  @apply h-5 w-5 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5 transition-all;
}

.role-checkbox:checked+.custom-checkbox {
  @apply bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
  background-size: 60%;
}

.role-content {
  @apply flex-1 min-w-0;
}

.role-name {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.role-description {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
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

.permission-checkbox:checked+.custom-checkbox-permission {
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

.no-results {
  @apply text-sm text-gray-500 dark:text-gray-400 text-center py-4;
}

.search-box {
  @apply relative;
}

.search-box input {
  @apply pl-10;
}

.search-box::before {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
  content: '🔍';
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

.select-all-btn {
  @apply text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline px-2 py-1 rounded transition-colors;
}

.password-toggle-btn {
  @apply absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500;
}

.password-requirements {
  @apply text-xs text-gray-500 dark:text-gray-400 mt-1;
}
</style>