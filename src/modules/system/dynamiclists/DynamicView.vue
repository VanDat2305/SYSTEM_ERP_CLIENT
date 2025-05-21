<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div class="common-catalog-container">
      <div class="catalog-grid">
        <!-- Cột loại danh mục -->
        <div class="catalog-types col-span-5">
          <div class="header">
            <h4>{{ t('dynamic_lists.catalog-types.title') }}</h4>
            <div class="flex items-center gap-1">
              <div class="relative mr-2">
                <input v-model="typeSearchQuery" type="text" :placeholder="t('common.search')"
                  class="w-full pl-3 pr-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
                <!-- Icon bên trái -->
                <!-- <SearchIcon
                    class="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" /> -->
              </div>

              <button class="btn-add-type" @click="openAddTypeModal">
                <PlusIcon class="icon m-1" />
                <!-- {{ t('dynamic_lists.catalog-types.add') }} -->
              </button>
            </div>
          </div>

          <div class="type-list">
            <div v-for="type in filteredTypes" :key="type.id" class="type-item"
              :class="{ 'active': selectedType?.id === type.id }" @click="selectType(type)">
              <div class="type-content">
                <span class="type-icon">▸</span>
                <span class="type-name">{{ type.name }}</span>
                <span class="type-code">{{ type.code }}</span>
              </div>
              <div class="type-actions">
                <StatusBadge :status="type.status" class="mr-2" />
                <button class="btn-edit" @click.stop="openEditTypeModal(type)">
                  <PencilIcon class="icon" />
                </button>
                <button class="btn-delete" @click.stop="confirmDeleteType(type)">
                  <TrashIcon class="icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột danh sách giá trị -->
        <div class="catalog-values col-span-5">
          <div class="header">
            <h4>{{ t('dynamic_lists.catalog-values.title') }}</h4>
            <div class="value-actions">
              <div class="relative mr-2">

                <input v-model="valueSearchQuery" type="text" :placeholder="t('common.search')"
                  :disabled="!selectedType"
                  class="w-full pl-3 pr-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <button class="btn-add-value" @click="openAddValueModal" :disabled="!selectedType">
                <PlusIcon class="icon m-1" />
                 <!-- {{ t('dynamic_lists.catalog-values.add') }} -->
              </button>
              <button class="btn-import" @click="openValueImportModal" :disabled="!selectedType"
                title="Import Excel">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>

                </div>
              </button>
              <button class="btn-refresh" @click="fetchData">
                <RefreshIcon class="icon text-gray-600 dark:text-gray-100" />
              </button>
            </div>
          </div>

          <div class="value-list">
            <template v-if="selectedType">
              <div v-for="item in filteredValues" :key="item.id" class="value-item">
                <div class="value-content">
                  <input type="checkbox" :id="'item_' + item.id" class="value-checkbox" />
                  <label :for="'item_' + item.id" class="value-name">
                    {{ item.name }}
                    <span class="value-code">{{ item.code }}</span>
                  </label>
                </div>
                <div class="value-actions">
                  <StatusBadge :status="item.status" class="mr-2" />
                  <button class="btn-edit" @click="openEditValueModal(item)">
                    <PencilIcon class="icon" />
                  </button>
                  <button class="btn-delete" @click="confirmDeleteValue(item)">
                    <TrashIcon class="icon" />
                  </button>
                </div>
              </div>

              <div v-if="filteredValues.length === 0" class="empty-state">
                <p class="text-sm">{{ t('dynamic_lists.catalog-values.messages.not_values') }}</p>
              </div>
            </template>
            <div v-else class="empty-state">
              <p class="text-sm">{{ t('dynamic_lists.catalog-values.messages.choose_one_type') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TypeModal :errors="formTypeErrors" :isModalOpen="isTypeModalOpen" :mode="currentTypeMode"
      :currentType="currentType" @close="closeTypeModal" @submit="handleTypeSubmit" />

    <ValueModal :errors="formValueErrors" :isModalOpen="isValueModalOpen" :mode="currentValueMode"
      :currentValue="currentValue" :parentOptions="parentOptions" :objectTypeId="selectedTypeId"
      @close="closeValueModal" @submit="handleValueSubmit" />

    <!-- Import Modal -->
    <ImportModal 
      :show="showImportModal"
      :type="importType"
      :objectTypeId="selectedType?.id"
      @close="closeImportModal"
      @success="handleImportSuccess"
    />

    <!-- Confirm Modal -->
    <ConfirmModal :show="showConfirmModal" :title="confirmModalTitle" :message="confirmModalMessage"
      :close="closeConfirmModal" @confirm="handleConfirmAction" :type="confirmModalType" :confirmText="t('common.yes')"
      :cancelText="t('common.no')" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import PageBreadcrumb from '@/components/common/PageBreadcrumb.vue'
import TypeModal from '@/modules/system/dynamiclists/TypeModal.vue'
import ValueModal from '@/modules/system/dynamiclists/ValueModal.vue'
import ImportModal from '@/modules/system/dynamiclists/ImportModal.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { PlusIcon, PencilIcon, TrashIcon, RefreshIcon } from '@/icons'
import { api } from '@/utils/api'
import { notificationService } from '@/services/notification'
import { usePermissions } from '@/auth/usePermissions'

const { t } = useI18n()
const { hasPermission } = usePermissions()
const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// Data state
const objectTypes = ref<any[]>([])
const objects = ref<any[]>([])
const selectedType = ref<any>(null)
const currentPageTitle = ref('dynamiclists')

// Search and filter
const typeSearchQuery = ref('')
const valueSearchQuery = ref('')
const filteredTypes = computed(() => {
  if (!typeSearchQuery.value) return objectTypes.value
  return objectTypes.value.filter(type =>
    type.name.toLowerCase().includes(typeSearchQuery.value.toLowerCase()) ||
    type.code.toLowerCase().includes(typeSearchQuery.value.toLowerCase())
  )
})
const filteredValues = computed(() => {
  if (!valueSearchQuery.value) return objects.value
  return objects.value.filter(item =>
    item.name.toLowerCase().includes(valueSearchQuery.value.toLowerCase()) ||
    item.code.toLowerCase().includes(valueSearchQuery.value.toLowerCase())
  )
})

// Modal states
const isTypeModalOpen = ref(false)
const isValueModalOpen = ref(false)
const showImportModal = ref(false)
const showConfirmModal = ref(false)
const importType = ref<'type' | 'value'>('type')

// Form data
const currentType = ref({
  id: '',
  code: '',
  name: '',
  order: null,
  status: 'active'
})

const currentValue = ref({
  id: '',
  code: '',
  name: '',
  object_type_id: '',
  order: null,
  status: 'active'
})

// Modal flags
const currentTypeMode = ref<'add' | 'edit'>('add')
const currentValueMode = ref<'add' | 'edit'>('add')
const formTypeErrors = ref({})
const formValueErrors = ref({})
const parentOptions = ref<any[]>([])
const selectedTypeId = computed(() => selectedType.value ? selectedType.value.id : null)

// Confirm modal data
const confirmAction = ref<() => void>(() => { })
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalType = ref('danger')
const itemToDelete = ref<any>(null)


const openValueImportModal = () => {
  if (!selectedType.value) return
  importType.value = 'value'
  showImportModal.value = true
}


// Methods
async function fetchData() {
  try {
    setLoading?.(true)
    const typeResponse = await api.get('/object-types')
    objectTypes.value = typeResponse.data.data

    if (selectedType.value) {
      const objectResponse = await api.get('/objects', {
        params: { object_type_id: selectedType.value.id }
      })
      objects.value = objectResponse.data.data
    }
  } catch (error: any) {
    notificationService.error(error.response?.data.message)
  } finally {
    setLoading?.(false)
  }
}

function selectType(type: any) {
  selectedType.value = type
  fetchObjectsByType(type.id)
}

async function fetchObjectsByType(typeId: string) {
  try {
    setLoading?.(true)
    const response = await api.get('/objects', {
      params: { object_type_id: typeId }
    })
    objects.value = response.data.data
    valueSearchQuery.value = '' // Reset search when changing type
  } catch (error: any) {
    notificationService.error(error.response?.data.message)
  } finally {
    setLoading?.(false)
  }
}

function openAddTypeModal() {
  currentTypeMode.value = 'add'
  currentType.value = {
    id: '',
    code: '',
    name: '',
    order: null,
    status: 'active'
  }
  isTypeModalOpen.value = true
}

function openEditTypeModal(type: any) {
  currentTypeMode.value = 'edit'
  currentType.value = { ...type }
  isTypeModalOpen.value = true
}

function openAddValueModal() {
  if (!selectedType.value) return
  currentValueMode.value = 'add'
  isValueModalOpen.value = true
  currentValue.value = {
    id: '',
    code: '',
    name: '',
    object_type_id: selectedType.value.id,
    order: null,
    status: 'active'
  }
}



function closeImportModal() {
  showImportModal.value = false
}

function handleImportSuccess() {
  fetchData()
  if (selectedType.value) {
    fetchObjectsByType(selectedType.value.id)
  }
  closeImportModal()
}

function handleConfirmAction() {
  if (confirmAction.value) {
    confirmAction.value()
  }
}

function openEditValueModal(value: any) {
  currentValueMode.value = 'edit'
  currentValue.value = { ...value }
  isValueModalOpen.value = true
}

function closeTypeModal() {
  isTypeModalOpen.value = false
  formTypeErrors.value = {}
}

function closeValueModal() {
  isValueModalOpen.value = false
  formValueErrors.value = {}
}

async function handleTypeSubmit(data: any) {
  try {
    setLoading?.(true)
    const url = currentTypeMode.value === 'edit'
      ? `/object-types/${currentType.value.id}`
      : '/object-types'

    const method = currentTypeMode.value === 'edit' ? 'put' : 'post'

    const response = await api[method](url, data)
    notificationService.success(response.data.message)
    closeTypeModal()
    fetchData()
  } catch (error: any) {
    formTypeErrors.value = error.response.data.errors
    notificationService.error(error.response?.data?.message)
  } finally {
    setLoading?.(false)
  }
}

async function handleValueSubmit(data: any) {
  try {
    setLoading?.(true)
    const url = currentValueMode.value === 'edit'
      ? `/objects/${currentValue.value.id}`
      : '/objects'

    const method = currentValueMode.value === 'edit' ? 'put' : 'post'

    const response = await api[method](url, data)
    notificationService.success(response.data.message)
    closeValueModal()
    fetchObjectsByType(selectedType.value.id)
  } catch (error: any) {
    formValueErrors.value = error.response.data.errors
    notificationService.error(error.response?.data?.message)
  } finally {
    setLoading?.(false)
  }
}

function confirmDeleteType(type: any) {
  itemToDelete.value = type
  confirmModalTitle.value = t('common.confirm')
  confirmModalMessage.value = t('dynamic_lists.catalog-types.messages.confirm_delete')
  confirmAction.value = deleteType
  showConfirmModal.value = true
}

function confirmDeleteValue(value: any) {
  itemToDelete.value = value
  confirmModalTitle.value = t('common.confirm')
  confirmModalMessage.value = t('dynamic_lists.catalog-values.messages.confirm_delete')
  confirmAction.value = deleteValue
  showConfirmModal.value = true
}

async function deleteType() {
  try {
    setLoading?.(true)
    const response = await api.delete(`/object-types/${itemToDelete.value.id}`)
    notificationService.success(response.data.message)
    if (selectedType.value?.id === itemToDelete.value.id) {
      selectedType.value = null
      objects.value = []
    }
    fetchData()
  } catch (error: any) {
    notificationService.error(error.response?.data?.message)
  } finally {
    closeConfirmModal()
    setLoading?.(false)
  }
}

async function deleteValue() {
  try {
    setLoading?.(true)
    const response = await api.delete(`/objects/${itemToDelete.value.id}`)
    notificationService.success(response.data.message)
    fetchObjectsByType(selectedType.value.id)
  } catch (error: any) {
    notificationService.error(error.response?.data?.message)
  } finally {
    closeConfirmModal()
    setLoading?.(false)
  }
}

function closeConfirmModal() {
  showConfirmModal.value = false
  itemToDelete.value = null
}


// Lifecycle hooks
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.common-catalog-container {
  @apply p-4;
}

.catalog-grid {
  @apply grid grid-cols-10 gap-6;
}

.catalog-types,
.catalog-values {
  @apply border rounded-lg overflow-hidden dark:border-gray-700 shadow-sm dark:bg-gray-800 bg-white;
}

.header {
  @apply flex justify-between items-center p-4 bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600;
}

.header h4 {
  @apply text-base font-semibold text-gray-800 dark:text-gray-200;
}

.type-list,
.value-list {
  @apply divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-250px)] overflow-y-auto;
}

.type-item,
.value-item {
  @apply p-3 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200;
}

.type-item.active {
  @apply bg-blue-50 dark:bg-gray-600;
}

.type-content {
  @apply flex items-center gap-2;
}

.type-icon {
  @apply text-gray-500 dark:text-gray-400;
}

.type-name {
  @apply text-sm font-medium dark:text-white;
}

.type-code {
  @apply text-xs text-gray-500 dark:text-gray-400;
}

.value-content {
  @apply flex items-center gap-3;
}

.value-checkbox {
  @apply rounded text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-600;
}

.value-name {
  @apply text-sm dark:text-white cursor-pointer;
}

.value-code {
  @apply text-xs text-gray-500 ml-2 dark:text-gray-400;
}

.type-actions,
.value-actions {
  @apply flex gap-2 items-center;
}

.btn-edit,
.btn-delete,
.btn-refresh,
.btn-import {
  @apply p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200;
}

.btn-edit {
  @apply text-blue-500 hover:text-blue-700;
}

.btn-delete {
  @apply text-red-500 hover:text-red-700;
}

.btn-import {
  @apply text-green-500 hover:text-green-700;
}

.btn-add-type,
.btn-add-value {
  @apply flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200;
}

.btn-add-value:disabled {
  @apply bg-gray-300 cursor-not-allowed dark:bg-gray-600;
}

.empty-state {
  @apply p-4 text-center text-gray-500 dark:text-gray-400;
}

.search-input {
  @apply pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:ring-blue-600;
}
</style>