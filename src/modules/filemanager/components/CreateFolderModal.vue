<template>
  <BaseModal
    :show="isModalOpen"
    :close="closeModal"
    size="md"
    :closeOnClickOutside="false"
    aria-labelledby="create-folder-title"
  >
    <template #header>
      <h3 id="create-folder-title" class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
        {{ t('file_manager.create_folder') }}
      </h3>
    </template>

    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-6 mx-4">
        <!-- Folder Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ t('file_manager.fields.folder_name') }}
            <span class="text-red-500 ml-1">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            required
            :placeholder="t('file_manager.placeholders.folder_name')"
            :class="[
              'w-full px-3 py-2 rounded-lg border text-sm',
              'dark:text-white',
              errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800'
            ]"
          />
          <p v-if="errors.name" class="text-sm text-error-500 mt-1">{{ errors.name }}</p>
        </div>

        <!-- Submission Error -->
        <div v-if="submitError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <p class="text-sm text-red-700 dark:text-red-300">{{ submitError }}</p>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button variant="outline" @click="closeModal" size="md">
          {{ t('common.cancel') }}
        </Button>
        <Button variant="primary" :loading="isSubmitting" @click="handleSubmit">
          {{ t('common.add') }}
        </Button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseModal from '@/components/modals/BaseModal.vue';
import Button from '@/components/ui/Button.vue';

const { t } = useI18n();

// Props
const props = defineProps({
  isModalOpen: Boolean
});
const emit = defineEmits(['close', 'submit']);

// State
const formData = ref({ name: '' });
const errors = ref({});
const submitError = ref(null);
const isSubmitting = ref(false);

// Computed
const hasErrors = () => {
  const name = formData.value.name.trim();
  if (!name) {
    errors.value.name = t('validation.required', { field: t('file_manager.fields.folder_name') });
    return true;
  }
  if (name.length > 100) {
    errors.value.name = t('validation.max_length', { field: t('file_manager.fields.folder_name'), count: 100 });
    return true;
  }
  errors.value.name = '';
  return false;
};

// Methods
const resetForm = () => {
  formData.value.name = '';
  errors.value = {};
  submitError.value = null;
};

const closeModal = () => {
  resetForm();
  emit('close');
};

const handleSubmit = async () => {
    hasErrors();
  if (hasErrors.value) return;

  isSubmitting.value = true;
  submitError.value = null;
  try {
    await emit('submit', { name: formData.value.name.trim() });
    resetForm();
  } catch (err) {
    submitError.value = err?.message || t('common.submission_error');
  } finally {
    isSubmitting.value = false;
  }
};

defineExpose({ errors, submitError });
</script>
