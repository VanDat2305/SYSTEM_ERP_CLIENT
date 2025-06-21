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

      <form @submit.prevent="" class="space-y-6 mx-4">
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
                  <SelectSearch v-model="formData.currency" :options="currencyOptions"
                    :placeholder="$t('common.select')" :search-placeholder="$t('common.search')" :disabled="isViewMode"
                    size="xs" />
                </div>
              </div>
              <p v-if="errors.base_price" class="mt-1 text-xs text-red-500">{{ errors.base_price[0] }}</p>
            </div>
            <div class="flex items-center justify-between pt-2 pl-5 border-gray-200 dark:border-gray-700">
              <button type="button" @click="!isViewMode && toggleTaxIncluded()" :disabled="isViewMode" :class="[
                ' relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                formData.tax_included ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600',
                isViewMode ? 'cursor-not-allowed opacity-50' : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500'
              ]">
                <span :class="[
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition',
                  formData.tax_included ? 'translate-x-6' : 'translate-x-0'
                ]" />
              </button>
              <div class="flex items-center">
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mr-3">
                  {{ t('service_packages.fields.tax_included') }}
                </span>
              </div>
            </div>
            <div class="mb-4">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {{ t('service_packages.fields.tax_rate') }}
                <span v-if="!isViewMode" class="text-red-500 ml-1">*</span>
              </label>
              <div class="relative">
                <input type="number" v-model.number="formData.tax_rate" :readonly="isViewMode" :required="!isViewMode"
                  :class="[
                    'w-full text-xs px-3 py-2 rounded-lg border dark:text-white transition-colors',
                    isViewMode ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed' : 'bg-white dark:bg-gray-800 hover:border-blue-300',
                    errors.tax_rate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  ]" />
              </div>
              <p v-if="errors.tax_rate" class="mt-1 text-xs text-red-500">{{ errors.tax_rate[0] }}</p>
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
              <h3 class="text-xs font-medium text-red-800 dark:text-red-200">
                {{ t('common.submission_error') }}
              </h3>
              <div class="text-xs mt-2  text-red-700 dark:text-red-300">
                <p v-if="errors && errors.features">{{ errors.features[0] }}</p>
                <p v-else>{{ submitError }}</p>
                <!-- <p v-if="errors &&  errors['features'][0]">{{ errors['features'][0] }}</p>
                <p v-else>{{ submitError }}</p> -->
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
        <button v-if="!isViewMode" type="submit" @click="handleSubmit" :disabled="isSubmitting"
          class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isEditMode ? t('common.update') : t('common.save') }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import TrashIcon from '@/icons/TrashIcon.vue'
import SelectSearch from '@/components/forms/SelectSearch.vue'
import { notificationService } from '@/services/notification'

const { t } = useI18n()
const isFormActive = ref(false)
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
  tax_rate: 0,
  tax_included: false,
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
// const hasErrors = computed(() => {
//   return !formData.value.package_name ||
//     !formData.value.package_code ||
//     formData.value.base_price <= 0 ||
//     formData.value.features.some(f => !f.feature_name || f.limit_value === undefined)
// })

// Methods
const toggleStatus = () => {
  formData.value.is_active = !formData.value.is_active
}
const toggleTaxIncluded = () => {
  formData.value.tax_included = !formData.value.tax_included
}

const addFeature = () => {
  const previousState = isFormActive.value
  isFormActive.value = false  // Tắt validate tạm thời
  formData.value.features.push({
    feature_key: '',
    feature_name: '',
    feature_type: 'quantity',
    unit: '',
    limit_value: 0,
    is_optional: false,
    is_customizable: false,
    display_order: formData.value.features.length + 1
  })
  nextTick(() => {
    isFormActive.value = previousState // Khôi phục lại sau push
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
    tax_rate: 0,
    tax_included: false,
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
const validateForm = () => {
  const newErrors = { ...errors.value }

  if (formData.value.features.length === 0) {
    newErrors.features = [t('service_packages.errors.features_required')]
    notificationService.error(t('service_packages.errors.features_required'))
  } else {
    delete newErrors.features
  }
  // Basic fields
  if (!formData.value.package_code?.trim()) {
    newErrors.package_code = [t('service_packages.errors.package_code_required')]
  } else if (formData.value.package_code.length < 3) {
    newErrors.package_code = [t('service_packages.errors.package_code_min_length')]
  }

  if (!formData.value.package_name?.trim()) {
    newErrors.package_name = [t('service_packages.errors.package_name_required')]
  } else if (formData.value.package_name.length < 5) {
    newErrors.package_name = [t('service_packages.errors.package_name_min_length')]
  }

  if (!formData.value.type_service) {
    newErrors.type_service = [t('service_packages.errors.type_service_required')]
  }

  if (!formData.value.customer_type) {
    newErrors.customer_type = [t('service_packages.errors.customer_type_required')]
  }

  if (!formData.value.base_price || formData.value.base_price < 1000) {
    newErrors.base_price = [t('service_packages.errors.base_price_invalid')]
  }

  if (formData.value.tax_rate < 0 || formData.value.tax_rate > 100) {
    newErrors.tax_rate = [t('service_packages.errors.tax_rate_invalid')]
  }

  if (!formData.value.display_order || formData.value.display_order < 1) {
    newErrors.display_order = [t('service_packages.errors.display_order_invalid')]
  }

  if (!formData.value.description?.trim()) {
    newErrors.description = [t('service_packages.errors.description_required')]
  }

  // Validate features
  const keyMap = new Map()
  const orderSet = new Set()

  formData.value.features.forEach((feature, index) => {
    const path = (field: string) => `features.${index}.${field}`

    // Required fields
    if (!feature.feature_key?.trim()) {
      newErrors[path('feature_key')] = [t('service_packages.errors.feature_key_required')]
    }

    if (!feature.feature_name?.trim()) {
      newErrors[path('feature_name')] = [t('service_packages.errors.feature_name_required')]
    }

    if (!feature.feature_type) {
      newErrors[path('feature_type')] = [t('service_packages.errors.feature_type_required')]
    }

    if (!feature.display_order || feature.display_order < 1) {
      newErrors[path('display_order')] = [t('service_packages.errors.feature_display_order_invalid')]
    }

    // Conditional logic
    if (feature.feature_type === 'quantity') {
      if (!feature.limit_value || feature.limit_value < 1) {
        newErrors[path('limit_value')] = [t('service_packages.errors.limit_value_required')]
      }
      if (!feature.unit || feature.unit.trim() === '') {
        newErrors[path('unit')] = [t('service_packages.errors.unit_required')]
      }
    } else if (feature.feature_type === 'boolean' && feature.limit_value !== undefined) {
      if (Number(feature.limit_value) !== 0 && Number(feature.limit_value) !== 1) {
        newErrors[path('limit_value')] = [t('service_packages.errors.limit_value_boolean_must_be_0_or_1')]
      }
    }

    // Duplicate key
    const key = feature.feature_key?.trim()
    if (key) {
      if (keyMap.has(key)) {
        newErrors[path('feature_key')] = [t('service_packages.errors.feature_key_duplicate')]
      } else {
        keyMap.set(key, true)
      }
    }

    // Duplicate display_order
    const order = feature.display_order
    if (order && orderSet.has(order)) {
      newErrors[path('display_order')] = [t('service_packages.errors.display_order_duplicate')]
    } else {
      orderSet.add(order)
    }
  })

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// Update hasErrors computed
const hasErrors = computed(() => {
  submitError.value !== null || Object.keys(errors.value).length > 0 || isSubmitting.value
  return Object.keys(errors.value).length > 0 || isSubmitting.value
})

// Update handleSubmit method
const handleSubmit = () => {
  if (!validateForm()) {
    submitError.value = t('common.validation_failed')
    return
  }

  isSubmitting.value = true
  submitError.value = null

  try {
    emit('submit', {
      ...formData.value,
      package_code: formData.value.package_code.trim(),
      package_name: formData.value.package_name.trim(),
      description: formData.value.description.trim(),
      features: formData.value.features.map(f => ({
        ...f,
        feature_key: f.feature_key.trim(),
        feature_name: f.feature_name.trim()
      }))
    })
  } catch (error: any) {
    submitError.value = error.message || t('common.submission_error')
  } finally {
    isSubmitting.value = false
  }
}


// Real-time validation for specific fields
const validateField = (fieldName: string) => {
  const newErrors = { ...errors.value }

  const clearError = (key: string) => delete newErrors[key]

  if (fieldName.startsWith('features.')) {
    const [_, indexStr, prop] = fieldName.split('.')
    const i = parseInt(indexStr)
    const f = formData.value.features[i]
    const path = (p: string) => `features.${i}.${p}`

    clearError(path(prop))

    switch (prop) {
      case 'feature_key':
        if (!f.feature_key?.trim()) {
          newErrors[path('feature_key')] = [t('service_packages.errors.feature_key_required')]
        } else {
          const dup = formData.value.features.some((x, idx) => x.feature_key === f.feature_key && idx !== i)
          if (dup) newErrors[path('feature_key')] = [t('service_packages.errors.feature_key_duplicate')]
        }
        break

      case 'feature_name':
        if (!f.feature_name?.trim()) {
          newErrors[path('feature_name')] = [t('service_packages.errors.feature_name_required')]
        }
        break

      case 'feature_type':
        if (!f.feature_type) {
          newErrors[path('feature_type')] = [t('service_packages.errors.feature_type_required')]
        }
        break

      case 'display_order':
        if (!f.display_order || f.display_order < 1) {
          newErrors[path('display_order')] = [t('service_packages.errors.feature_display_order_invalid')]
        } else {
          const dup = formData.value.features.some((x, idx) => x.display_order === f.display_order && idx !== i)
          if (dup) newErrors[path('display_order')] = [t('service_packages.errors.display_order_duplicate')]
        }
        break

      case 'limit_value':
        if (f.feature_type === 'quantity' && (!f.limit_value || f.limit_value < 1)) {
          newErrors[path('limit_value')] = [t('service_packages.errors.limit_value_required')]
        } else if (f.feature_type === 'boolean') {
          if (f.limit_value !== 0 && f.limit_value !== 1) {
            newErrors[path('limit_value')] = [t('service_packages.errors.limit_value_boolean_must_be_0_or_1')]
          }
        }
        break

      case 'unit':
        if (f.feature_type === 'quantity' && (!f.unit || f.unit.trim() === '')) {
          newErrors[path('unit')] = [t('service_packages.errors.unit_required')]
        }
        break
    }

  } else {
    clearError(fieldName)

    switch (fieldName) {
      case 'package_code':
        if (!formData.value.package_code?.trim()) {
          newErrors.package_code = [t('service_packages.errors.package_code_required')]
        } else if (formData.value.package_code.length < 3) {
          newErrors.package_code = [t('service_packages.errors.package_code_min_length')]
        }
        break

      case 'package_name':
        if (!formData.value.package_name?.trim()) {
          newErrors.package_name = [t('service_packages.errors.package_name_required')]
        } else if (formData.value.package_name.length < 5) {
          newErrors.package_name = [t('service_packages.errors.package_name_min_length')]
        }
        break

      case 'base_price':
        if (!formData.value.base_price || formData.value.base_price < 1000) {
          newErrors.base_price = [t('service_packages.errors.base_price_invalid')]
        }
        break

      case 'type_service':
        if (!formData.value.type_service) {
          newErrors.type_service = [t('service_packages.errors.type_service_required')]
        }
        break

      case 'display_order':
        if (!formData.value.display_order || formData.value.display_order < 1) {
          newErrors.display_order = [t('service_packages.errors.display_order_invalid')]
        }
        break

      case 'description':
        if (!formData.value.description?.trim()) {
          newErrors.description = [t('service_packages.errors.description_required')]
        }
        break

      case 'tax_rate':
        if (formData.value.tax_rate < 0 || formData.value.tax_rate > 100) {
          newErrors.tax_rate = [t('service_packages.errors.tax_rate_invalid')]
        }
        break
    }
  }

  errors.value = newErrors
}


// Add watchers for real-time validation
watch(() => formData.value.package_code, () => {
  if (!isFormActive.value) return
  validateField('package_code')
})
watch(() => formData.value.package_name, () => {
  if (!isFormActive.value) return
  validateField('package_name')
})
watch(() => formData.value.base_price, () => {
  if (!isFormActive.value) return
  validateField('base_price')
})
watch(() => formData.value.type_service, () => {
  if (!isFormActive.value) return
  validateField('type_service')
})
watch(() => formData.value.display_order, () => {
  if (!isFormActive.value) return
  validateField('display_order')
})
watch(() => formData.value.description, () => {
  if (!isFormActive.value) return
  validateField('description')
})
watch(() => formData.value.tax_rate, () => {
  if (!isFormActive.value) return
  validateField('tax_rate')
})

watch(() => formData.value.features, (features) => {
  console.log(isFormActive.value);

  if (!isFormActive.value) return
  features.forEach((_, i) => {
    validateField(`features.${i}.feature_key`)
    validateField(`features.${i}.feature_name`)
    validateField(`features.${i}.feature_type`)
    validateField(`features.${i}.display_order`)
    validateField(`features.${i}.limit_value`)
    validateField(`features.${i}.unit`)
  })
}, { deep: true })



// const handleSubmit = () => {
//   if (hasErrors.value) return

//   isSubmitting.value = true
//   submitError.value = null

//   try {
//     emit('submit', {
//       ...formData.value,
//       package_name: formData.value.package_name.trim(),
//       package_code: formData.value.package_code.trim(),
//       features: formData.value.features.map(f => ({
//         ...f,
//         feature_name: f.feature_name.trim()
//       }))
//     })
//   } catch (error: any) {
//     submitError.value = error.message || t('common.submission_error')
//   } finally {
//     isSubmitting.value = false
//   }
// }

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
  isFormActive.value = false
  if (!props.mode || props.mode === 'add') {
    resetForm()
  } else if (pkg && (isViewMode.value || isEditMode.value)) {
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
      tax_rate: pkg.tax_rate || 0,
      tax_included: pkg.tax_included !== undefined ? pkg.tax_included : false,
      is_active: pkg.is_active !== undefined ? pkg.is_active : true,
      features: pkg.features ? [...pkg.features] : []
    }
  }
  nextTick(() => {
    isFormActive.value = true
  })
}, { immediate: true })
</script>