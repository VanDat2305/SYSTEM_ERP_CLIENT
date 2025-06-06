<template>
  <BaseModal :show="isModalOpen" :close="closeModal" :size="modalSize" :closeOnClickOutside="false">
    <template #header>
      <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        {{
          isViewMode ? t('service_packages.view_title') :
            isEditMode ? t('service_packages.edit_title') :
              t('service_packages.add_title')
        }}
      </h3>
    </template>

    <template #body>
      <div class="border-b border-gray-200 dark:border-gray-700 mx-4">
        <nav class="-mb-px flex space-x-8">
          <button v-for="tab in tabs" :key="tab.name" @click="currentTab = tab.name" :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs',
            currentTab === tab.name
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
          ]">
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6 mx-4">
        <!-- Basic Info Tab -->
        <!-- Basic Info Tab -->
        <div v-show="currentTab === 'basic'" class="space-y-4 mt-4 mb-4">
          <!-- ID Field (hidden) -->
          <input type="hidden" v-model="formData.id" readonly />

          <!-- Grid Layout for Better Organization -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <!-- Package Code -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.code') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input type="text" v-model="formData.package_code" :readonly="isViewMode" :required="!isViewMode"
                  :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                    errors.package_code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" :placeholder="t('service_packages.placeholders.code')" />
                <div v-if="isViewMode" class="absolute inset-0 bg-transparent cursor-not-allowed"></div>
              </div>
              <p v-if="errors.package_code" class="mt-1 text-xs text-red-500">{{ errors.package_code[0] }}</p>
            </div>


            <!-- Package Name -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.name') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input type="text" v-model="formData.package_name" :readonly="isViewMode" :required="!isViewMode"
                  :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                    errors.package_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" :placeholder="t('service_packages.placeholders.name')" />
              </div>
              <p v-if="errors.package_name" class="mt-1 text-xs text-red-500">{{ errors.package_name[0] }}</p>
            </div>
            <!-- Service Type -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.type_service') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <SelectSearch v-model="formData.type_service" :options="serviceTypeOptions"
                :placeholder="$t('common.select')" :search-placeholder="$t('common.search')" :disabled="isViewMode"
                size="xs" :class="errors.type_service ? 'border-red-500' : ''" />
              <p v-if="errors.type_service" class="mt-1 text-xs text-red-500">{{ errors.type_service[0] }}</p>
            </div>
            <!-- Customer Type -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.customer_type') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <SelectSearch v-model="formData.customer_type" :options="customerTypeOptions"
                :placeholder="$t('common.select')" :search-placeholder="$t('common.search')" :disabled="isViewMode"
                size="xs" :class="errors.customer_type ? 'border-red-500' : ''" />
              <p v-if="errors.customer_type" class="mt-1 text-xs text-red-500">{{ errors.customer_type[0] }}</p>
            </div>
            <!-- Base Price & Currency (Grouped) -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.price') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <div class="flex gap-2">
                <div class="flex-1 relative">
                  <input type="number" v-model.number="formData.base_price" step="1000" min="1000"
                    :readonly="isViewMode" :required="!isViewMode" :class="[
                      'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                      isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                      errors.base_price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    ]" :placeholder="t('service_packages.placeholders.price')" />
                </div>
                <div class="w-30">
                  <SelectSearch v-model="formData.currency" :options="currencyOptions" :placeholder="$t('common.select')"
                :search-placeholder="$t('common.search')" :disabled="isViewMode" size="xs" />
                </div>
              </div>
              <p v-if="errors.base_price" class="mt-1 text-xs text-red-500">{{ errors.base_price[0] }}</p>
            </div>
            <!-- <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.currency') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <SelectSearch v-model="formData.currency" :options="currencyOptions" :placeholder="$t('common.select')"
                :search-placeholder="$t('common.search')" :disabled="isViewMode" size="xs" />
            </div> -->

            <!-- Display Order -->
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.display_order') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input type="number" v-model.number="formData.display_order" :readonly="isViewMode"
                  :required="!isViewMode" :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                    errors.display_order ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" />
              </div>
              <p v-if="errors.display_order" class="mt-1 text-xs text-red-500">{{ errors.display_order[0] }}</p>
            </div>
          </div>

          <!-- Description (Full Width) -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ t('service_packages.fields.description') }}
              <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
            </label>
            <div class="relative">
              <textarea v-model="formData.description" :readonly="isViewMode" :required="!isViewMode" rows="3" :class="[
                'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              ]" :placeholder="t('service_packages.placeholders.description')"></textarea>
            </div>
            <p v-if="errors.description" class="mt-1 text-xs text-red-500">{{ errors.description[0] }}</p>
          </div>

          <!-- Status Toggle (Improved) -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mr-3">
                {{ t('status') }}:
              </span>
              <span class="text-xs font-medium" :class="formData.is_active ? 'text-green-600' : 'text-gray-500'">
                {{ formData.is_active ? t('status_map.active') : t('status_map.inactive') }}
              </span>
            </div>

            <button type="button" @click="!isViewMode && toggleStatus()" :disabled="isViewMode" :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              formData.is_active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
              isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
            ]">
              <span :class="[
                'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                formData.is_active ? 'translate-x-6' : 'translate-x-0'
              ]" />
            </button>
          </div>
        </div>
        <!-- Features Tab -->
        <div v-show="currentTab === 'features'" class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="text-xs font-medium text-gray-900 dark:text-white">
              {{ t('service_packages.fields.features') }}
            </h4>
            <button v-if="!isViewMode" type="button" @click="addFeature"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              {{ t('service_packages.add_feature') }}
            </button>
          </div>

          <div v-for="(feature, index) in formData.features" :key="index" class="mb-4 p-4 border rounded-lg">
            <div class="flex justify-between items-start mb-2">
              <h5 class="text-xs font-medium text-gray-700 dark:text-gray-300">
                {{ t('service_packages.feature') }} #{{ index + 1 }}
              </h5>
              <button v-if="!isViewMode" type="button" @click="removeFeature(index)"
                class="p-1 text-red-500 hover:text-red-700" :title="t('common.remove')">
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Feature Key -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.feature_key') }}
                  <span class="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input type="text" v-model="feature.feature_key" :readonly="isViewMode" :required="true" :class="[
                  'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  errors[`features.${index}.feature_key`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]" />
                <p v-if="errors[`features.${index}.feature_key`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.feature_key`][0] }}
                </p>
              </div>

              <!-- Feature Name -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.feature_name') }}
                  <span class="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input type="text" v-model="feature.feature_name" :readonly="isViewMode" :required="true" :class="[
                  'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  errors[`features.${index}.feature_name`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]" />
                <p v-if="errors[`features.${index}.feature_name`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.feature_name`][0] }}
                </p>
              </div>

              <!-- Feature Type -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.feature_type') }}
                  <span class="text-red-500 ml-1 font-bold">*</span>
                </label>
                <SelectSearch v-model="feature.feature_type" :options="featureTypeOptions"
                  :placeholder="$t('common.select')" :search-placeholder="$t('common.search')" :disabled="isViewMode"
                  size="xs" />
                <!-- <select v-model="feature.feature_type" :disabled="isViewMode" :required="true" :class="[
                  'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  errors[`features.${index}.feature_type`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]">
                  <option value="quantity">{{ t('service_packages.feature_types.quantity') }}</option>
                  <option value="boolean">{{ t('service_packages.feature_types.boolean') }}</option>
                </select> -->
                <p v-if="errors[`features.${index}.feature_type`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.feature_type`][0] }}
                </p>
              </div>
              <!-- Display Order -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.display_order') }}
                  <span class="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input type="number" v-model.number="feature.display_order" :readonly="isViewMode" :required="true"
                  :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                    errors[`features.${index}.display_order`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" />
                <p v-if="errors[`features.${index}.display_order`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.display_order`][0] }}
                </p>
              </div>
              <!-- Limit Value -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.limit_value') }}
                  <span v-if="feature.feature_type === 'quantity'" class="text-red-500 ml-1 font-bold">*</span>
                </label>
                <input type="number" v-model.number="feature.limit_value" :readonly="isViewMode"
                  :required="feature.feature_type === 'quantity'" :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                    errors[`features.${index}.limit_value`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" />
                <p v-if="errors[`features.${index}.limit_value`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.limit_value`][0] }}
                </p>
              </div>
              <!-- Unit -->
              <div>
                <label class="block text-xs text-gray-500 mb-1">
                  {{ t('service_packages.fields.unit') }}
                </label>
                <SelectSearch v-model="feature.unit" :options="unitsOptions" :placeholder="$t('common.select')"
                  :search-placeholder="$t('common.search')" :disabled="isViewMode" size="xs" />
                <!-- <input type="text" v-model="feature.unit" :readonly="isViewMode" :class="[
                  'w-full text-xs px-3 py-2 rounded-lg border dark:text-white',
                  isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800',
                  errors[`features.${index}.unit`] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                ]" /> -->
                <p v-if="errors[`features.${index}.unit`]" class="mt-1 text-xs text-red-500">
                  {{ errors[`features.${index}.unit`][0] }}
                </p>
              </div>

            </div>

            <div class="mt-3 flex items-center space-x-4">
              <!-- Is Optional -->
              <div class="flex items-center">
                <input type="checkbox" :id="`feature-optional-${index}`" v-model="feature.is_optional"
                  :disabled="isViewMode" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label :for="`feature-optional-${index}`" class="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                  {{ t('service_packages.fields.is_optional') }}
                </label>
              </div>

              <!-- Is Customizable -->
              <div class="flex items-center">
                <input type="checkbox" :id="`feature-customizable-${index}`" v-model="feature.is_customizable"
                  :disabled="isViewMode" class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <label :for="`feature-customizable-${index}`"
                  class="ml-2 block text-xs text-gray-700 dark:text-gray-300">
                  {{ t('service_packages.fields.is_customizable') }}
                </label>
              </div>
            </div>
          </div>

          <div v-if="formData.features.length === 0" class="text-center text-xs py-4 text-gray-500 dark:text-gray-400">
            {{ t('service_packages.no_features') }}
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="submitError" class="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class=" font-medium text-red-800 dark:text-red-200">
                {{ t('common.submission_error') }}
              </h3>
              <div class="mt-2  text-red-700 dark:text-red-300">
                <p>{{ submitError }}</p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button type="button" @click="closeModal"
          class="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
          {{ isViewMode ? t('common.close') : t('common.cancel') }}
        </button>
        <button v-if="!isViewMode" type="submit" @click="handleSubmit" :disabled="hasErrors"
          class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
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
import TrashIcon from '@/icons/TrashIcon.vue'
import SelectSearch from '@/components/forms/SelectSearch.vue'

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
  currentPackage: {
    type: Object,
    default: () => ({})
  },
  categorySystem: {
    type: Object
  }
})

const emit = defineEmits(['close', 'submit'])

// Tabs
const tabs = computed(() => [
  { name: 'basic', label: t('service_packages.basic_info') },
  { name: 'features', label: t('service_packages.features') }
])
const currentTab = ref('basic')

// Form Data
const formData = ref({
  id: null,
  type_service: '',
  customer_type: 'INDIVIDUAL',
  package_code: '',
  package_name: '',
  description: '',
  base_price: 0,
  currency: 'VND',
  billing_cycle: 'one-time',
  display_order: 0,
  is_active: true,
  features: [] as Array<{
    feature_key: string
    feature_name: string
    feature_type: string
    unit: string
    limit_value: number
    is_optional: boolean
    is_customizable: boolean
    display_order: number
  }>
})

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const errors = ref<Record<string, any>>({})

const currencyOptions = ref<{ label: string; value: string }[]>([]);
const unitsOptions = ref<{ label: string; value: string }[]>([]);
const featureTypeOptions = ref<{ label: string; value: string }[]>([]);
const customerTypeOptions = ref<{ label: string; value: string }[]>([]);
const serviceTypeOptions = ref<{ label: string; value: string }[]>([]);


// Computed
const isEditMode = computed(() => props.mode === 'edit')
const isViewMode = computed(() => props.mode === 'view')
const modalSize = computed(() => 'xl')
const hasErrors = computed(() => {
  return !formData.value.package_name ||
    !formData.value.package_code ||
    formData.value.base_price <= 0 ||
    formData.value.features.some(f => !f.feature_name || f.limit_value === undefined)
})

// Methods
const toggleStatus = () => {
  formData.value.is_active = !formData.value.is_active
}

const addFeature = () => {
  formData.value.features.push({
    feature_key: '',
    feature_name: '',
    feature_type: 'number',
    unit: '',
    limit_value: 0,
    is_optional: false,
    is_customizable: false,
    display_order: formData.value.features.length + 1
  })
}

const removeFeature = (index: number) => {
  formData.value.features.splice(index, 1)
}

const resetForm = () => {
  formData.value = {
    id: null,
    type_service: '',
    customer_type: 'INDIVIDUAL',
    package_code: '',
    package_name: '',
    base_price: 0,
    description: '',
    currency: 'VND',
    display_order: 0,
    billing_cycle: 'monthly',
    is_active: true,
    features: []
  }
  errors.value = {}
  submitError.value = null
  currentTab.value = 'basic'
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
      package_name: formData.value.package_name.trim(),
      package_code: formData.value.package_code.trim(),
      features: formData.value.features.map(f => ({
        ...f,
        feature_name: f.feature_name.trim()
      }))
    })
  } catch (error: any) {
    submitError.value = error.message || t('common.submission_error')
  } finally {
    isSubmitting.value = false
  }
}

// Watchers
watch(() => props.categorySystem, (newSystem) => {
  if (newSystem && newSystem.loaded) {
    currencyOptions.value = newSystem.getItemsByTypeCode('CURRENCY_TYPE').map((item: { name: any; code: any }) => ({
      label: item.name,
      value: item.code
    }));

    featureTypeOptions.value = newSystem.getItemsByTypeCode('feature_type').map((item: { name: any; code: any }) => ({
      label: item.name,
      value: item.code
    }))

    unitsOptions.value = newSystem.getItemsByTypeCode('unit_type').map((item: { name: any; code: any }) => ({
      label: item.name,
      value: item.code
    }))

    customerTypeOptions.value = newSystem.getItemsByTypeCode('customer_type').map((item: { name: any; code: any }) => ({
      label: item.name,
      value: item.code
    }))
    serviceTypeOptions.value = newSystem.getItemsByTypeCode('service_type').map((item: { name: any; code: any }) => ({
      label: item.name,
      value: item.code
    }))

  }
}, { immediate: true })
watch(() => props.errors, (newErrors) => {
  errors.value = newErrors
}, { deep: true })

watch(() => props.currentPackage, (pkg) => {
  if (!props.mode || props.mode === 'add') {
    resetForm()
    return
  }

  if (pkg && (isViewMode.value || isEditMode.value)) {
    formData.value = {
      id: pkg.id,
      type_service: pkg.type_service || 'SER_IHD',
      customer_type: pkg.customer_type || 'INDIVIDUAL',
      package_code: pkg.package_code,
      package_name: pkg.package_name,
      description: pkg.description || '',
      currency: pkg.currency || 'VND',
      display_order: pkg.display_order || 0,
      base_price: pkg.base_price,
      billing_cycle: pkg.billing_cycle || 'monthly',
      is_active: pkg.is_active !== undefined ? pkg.is_active : true,
      features: pkg.features ? [...pkg.features] : []
    }
  }
}, { immediate: true })
</script>