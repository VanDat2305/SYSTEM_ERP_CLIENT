<template>
  <AdminLayout>
    <PageBreadcrumb :pageTitle="currentPageTitle" class="mt-1" />

    <!-- Header với các chức năng chính -->
    <div class="file-manager-header mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div class="flex flex-wrap items-center justify-between">
        <!-- Back Button -->
        <div class="flex items-center">
          <button v-if="showBackButton" @click="navigateBack"
            class="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {{ t('common.back') }}
          </button>
        </div>

        <!-- Các nút chức năng -->
        <div class="flex items-center space-x-2">
          <!-- Sắp xếp -->
          <div class="relative">
            <select v-model="sortOption"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
              <option value="name_asc">{{ t("file_manager.orderby.name_asc") }}</option>
              <option value="name_desc">{{ t("file_manager.orderby.name_desc") }}</option>
              <option value="date_asc">{{ t("file_manager.orderby.date_asc") }}</option>
              <option value="date_desc">{{ t("file_manager.orderby.date_desc") }}</option>
              <option value="size_asc">{{ t("file_manager.orderby.size_asc") }}</option>
              <option value="size_desc">{{ t("file_manager.orderby.size_desc") }}</option>
            </select>
          </div>
          <!-- Chế độ xem -->
          <button @click="toggleViewMode" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg v-if="viewMode === 'grid'" class="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M1 5h15M1 1h15M1 9h15" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
              <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                d="M4 1h4v4H4V1Zm0 6h4v4H4V7Zm0 6h4v4H4v-4Zm6-12h4v4h-4V1Zm0 6h4v4h-4V7Zm0 6h4v4h-4v-4Z" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Thanh tìm kiếm và hành động -->
      <div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <!-- Search + Filters -->
        <div class="flex flex-wrap items-center gap-4 flex-grow">
          <!-- Search box -->
          <div class="relative w-full sm:max-w-xs">
            <span class="absolute inset-y-0 start-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
              </svg>
            </span>
            <input v-model="searchQuery" type="text"
              class="block w-full pl-10 pr-4 py-2 rounded-md text-sm border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              :placeholder="t('common.search')">
          </div>

          <!-- Toggle filters -->
          <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="filterFoldersOnly"
              class="rounded-lg form-checkbox text-blue-600 dark:text-blue-400">
            {{ t('file_manager.only_folders') }}
          </label>

          <label class="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" v-model="filterFilesOnly"
              class="rounded-lg form-checkbox text-blue-600 dark:text-blue-400">
            {{ t('file_manager.only_files') }}
          </label>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-wrap gap-2">
          <!-- Tạo folder -->
          <button v-if="hasPermission('folders.create')" @click="openModalCreateFolder = true"
            class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-300 transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            {{ t('file_manager.create_folder') }}
          </button>

          <!-- Tải lên file -->
          <button v-if="hasPermission('files.upload')" @click="triggerFileUpload"
            class="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-300 transition-all">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            {{ t('file_manager.upload_file') }}
          </button>

          <input type="file" ref="fileInput" @change="handleFileUpload" multiple class="hidden" />
        </div>
      </div>
    </div>

    <!-- Nội dung chính -->
    <div class="file-manager-content">
      <!-- Chế độ xem grid -->
      <div v-if="viewMode === 'grid'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 transition-all">
        <div v-for="item in filteredItems" :key="item.id"
          class="relative p-4 bg-white dark:bg-gray-800 rounded-2xl shadow hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 group cursor-pointer">

          <!-- Folder -->
          <div v-if="item.type === 'folder'" @click="navigateToFolder(item.id)"
            class="flex flex-col items-center text-center space-y-2">
            <div
              class="w-16 h-16 flex items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-300/10 text-yellow-500">
              <svg class="w-7 h-7" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
              </svg>
            </div>
            <div class="text-sm font-medium truncate w-full text-gray-800 dark:text-white">{{ item.name }}</div>
            <!-- <div class="text-xs text-gray-500 dark:text-gray-400">{{ item.itemCount }} {{ t('file_manager.items') }}</div> -->
          </div>

          <!-- File -->
          <div v-else class="flex flex-col items-center text-center space-y-2" @click="previewFile(item)">
            <div
              class="w-16 h-16 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-300/10 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                <path
                  d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625Z" />
                <path
                  d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
              </svg>
            </div>
            <div class="text-sm font-medium truncate w-full text-gray-800 dark:text-white" :title="item.original_name">
              {{ item.original_name }}
            </div>

            <div class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(item.size) }}</div>
          </div>

          <!-- Dropdown actions -->
          <div class="absolute top-2 right-2">
            <button @click.stop="toggleFileMenu(item.id)"
              class="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <svg class="w-4 h-4 text-gray-500 dark:text-gray-300" fill="currentColor" viewBox="0 0 4 15">
                <path
                  d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </button>

            <transition name="fade">
              <div v-if="activeFileMenu === item.id" @mouseleave="activeFileMenu = null"
                class="absolute z-20 right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-700 shadow-xl ring-1 ring-black/5">
                <div class="py-2">
                  <a v-if="item.type !== 'folder'" href="#" @click.prevent="downloadFile(item)"
                    class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 16 18" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                    </svg>
                    {{ t('common.download') }}
                  </a>
                  <a v-if="hasPermission('files.delete')" href="#" @click="openModalDelete(item)"
                    class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                    <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 18 20" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z" />
                    </svg>
                    {{ t('common.delete') }}
                  </a>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>


      <!-- Chế độ xem list -->
      <div v-else class="bg-white rounded-lg shadow dark:bg-gray-700 overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead class="bg-gray-50 dark:bg-gray-600">
            <tr>
              <!-- text-gray-500 text-xs tracking-wider dark:text-gray-400 flex items-center gap-1 -->
              <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider gap-1">{{
                  t('file_manager.fields.name') }}</th>
              <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">{{
                  t('file_manager.fields.type') }}</th>
              <th scope="col"
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">{{
                  t('file_manager.fields.size') }}</th>
              <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">{{
                  t('file_manager.fields.updated_at') }}</th>
              <th scope="col"
                class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 tracking-wider">{{
                  t('file_manager.fields.actions') }}</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-700 dark:divide-gray-600">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gray-50 dark:hover:bg-gray-600">
              <td @click="item.type === 'folder' ? navigateToFolder(item.id) : previewFile(item)"
                class="px-6 py-4 whitespace-nowrap cursor-pointer">
                <div class="flex items-center">
                  <!-- <svg v-if="item.type === 'folder'" class="w-5 h-5 mr-3 text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 12.25V1m0 11.25a1.25 1.25 0 0 0 1.25 1.25H10m-6-12.5h5.25a1.25 1.25 0 0 1 1.25 1.25v2.25a1.25 1.25 0 0 1-1.25 1.25H4M4 16v1.75A1.25 1.25 0 0 0 5.25 19h9.5A1.25 1.25 0 0 0 16 17.75V12.5m-12-.25h12.5a1.25 1.25 0 0 1 1.25 1.25v4.5a1.25 1.25 0 0 1-1.25 1.25H4a1.25 1.25 0 0 1-1.25-1.25v-4.5A1.25 1.25 0 0 1 4 12.25Z"/>
                  </svg>
                  <svg v-else class="w-5 h-5 mr-3 text-blue-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17v1a.97.97 0 0 1-.933 1H1.933A.97.97 0 0 1 1 18V5.828a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 1 5.828 1h8.239A.97.97 0 0 1 15 2M6 1v4a1 1 0 0 1-1 1H1m13 14a.97.97 0 0 1-.933-1V9.828a2 2 0 0 0-.586-1.414l-2.828-2.828A2 2 0 0 0 10.172 5H8.023a.97.97 0 0 1-.953-.923V3.309a2 2 0 0 1 .586-1.414L10.293.293A2 2 0 0 1 11.828 0H15a1 1 0 0 1 1 1v3.309a2 2 0 0 1-.586 1.414L12.707 7.5a2 2 0 0 0-.586 1.414V16a.97.97 0 0 1-.933 1H14Z"/>
                  </svg> -->
                  <div class="text-xs font-medium text-gray-900 dark:text-white">{{ item.type === 'folder' ? item.name :
                    item.original_name }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                {{ item.type === 'folder' ? 'Thư mục' : item.mime_type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300 text-center">
                {{ item.type === 'folder' ? '-' : formatFileSize(item.size) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-300">
                {{ formatDate(item.updated_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-xs font-medium">
                <button @click.stop="toggleFileMenu(item.id)"
                  class="text-gray-500 hover:text-gray-700 dark:hover:text-white">
                  <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                    viewBox="0 0 4 15">
                    <path
                      d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                  </svg>
                </button>

                <transition name="fade">
                  <div v-if="activeFileMenu === item.id" @mouseleave="activeFileMenu = null"
                    class="absolute z-20 right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-700 shadow-xl ring-1 ring-black/5">
                    <div class="py-2">
                      <a v-if="item.type !== 'folder'" href="#" @click.prevent="downloadFile(item)"
                        class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 16 18" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 1v11m0 0 4-4m-4 4L4 8m11 4v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3" />
                        </svg>
                        {{ t('common.download') }}
                      </a>
                      <a v-if="hasPermission('files.delete')" href="#" @click="openModalDelete(item)"
                        class="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 18 20" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M1 5h16M7 8v8m4-8v8M7 1h4a1 1 0 0 1 1 1v3H6V2a1 1 0 0 1 1-1ZM3 5h12v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5Z" />
                        </svg>
                        {{ t('common.delete') }}
                      </a>
                    </div>
                  </div>
                </transition>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty state -->
      <div v-if="filteredItems.length === 0" class="text-center py-12">
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ t("file_manager.not_found") }}</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ t("file_manager.not_found_description") }}</p>
      </div>
    </div>
    <ConfirmModal :show="showModalDelete" :close="closeModalConfirm" :onConfirm="confirmDelete" type="danger"
      :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
      :confirmText="t('common.yes')" :cancelText="t('common.no')" />
    <CreateFolderModal :errors="formErrors" :isModalOpen="openModalCreateFolder" @close="closeModalCreateFolder"
      @submit="createFolder" />
    <FilePreview v-if="previewItem !== null" :open="previewItem !== null" :file="previewItem"
      @close="previewItem = null" />
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import { notificationService } from '@/services/notification';
import { api } from '@/utils/api';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import CreateFolderModal from '@/modules/filemanager/components/CreateFolderModal.vue'
import FilePreview from '@/modules/filemanager/components/FilePreview.vue'
import config from "@/config/config";
import { usePermissions } from '@/auth/usePermissions'


interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  children?: Folder[];
  itemCount: number;
  updated_at: string;
  type: 'folder';
}

interface File {
  id: string;
  name: string;
  original_name: string;
  mime_type: string;
  size: number;
  folder_id: string | null;
  updated_at: string;
  type: 'file';
}

type FileItem = Folder | File;

const { t } = useI18n();
const router = useRouter();
const setLoading = inject<(isLoading: boolean) => void>('setLoading')

// State
const currentPageTitle = ref('file_manager');
const viewMode = ref<'grid' | 'list'>('grid');
const sortOption = ref('name_asc');
const searchQuery = ref('');
const filterFoldersOnly = ref(false);
const filterFilesOnly = ref(false);
const breadcrumbs = ref<Array<{ name: string; path: string }>>([{ name: 'Home', path: '/filemanager' }]);

const currentFolderId = ref<string | null>(null);
const allFoldersTree = ref<Folder[]>([]); // Store all folders for tree structure
const folders = ref<Folder[]>([]);
const files = ref<File[]>([]);
const formErrors = ref<Record<string, string[]>>({});
const previewItem = ref<File | null>(null);
const itemToDelete = ref<FileItem | null>(null);
const activeFileMenu = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const showModalDelete = ref(false);
const openModalCreateFolder = ref(false);
const folderCache = ref<Map<string | null, Folder[]>>(new Map());
const { hasPermission } = usePermissions()

const showBackButton = computed(() => {
  return !!currentFolderId.value; // Show the button if not in the root folder
});

// Add to the methods section
const navigateBack = async () => {
  if (!currentFolderId.value) return;

  // Dùng cây đầy đủ để tìm chính xác folder hiện tại
  const currentFolder = findFolderInTree(allFoldersTree.value, currentFolderId.value);

  if (!currentFolder) {
    console.warn('⚠️ Không tìm thấy folder hiện tại trong cây');
    return;
  }

  const parentId = currentFolder.parent_id;
  currentFolderId.value = parentId;

  await fetchFoldersForCurrentFolder();
  await fetchFilesForCurrentFolder();
  updateBreadcrumbs();
};


// Helper function to find a folder in the tree (if not in the root level)
const findFolderInTree = (folders: Folder[], id: string): Folder | null => {
  for (const folder of folders) {
    console.log(`🔍 Đang kiểm tra folder: ${folder.name} (id: ${folder.id})`);

    if (folder.id === id) {
      console.log(`✅ Tìm thấy folder: ${folder.name} (id: ${folder.id})`);
      return folder;
    }

    if (folder.children?.length) {
      console.log(`📂 Đi vào children của folder: ${folder.name}`);
      const found = findFolderInTree(folder.children, id);
      if (found) return found;
    }
  }

  console.log(`❌ Không tìm thấy folder với id: ${id} trong nhánh này`);
  return null;
};

// Computed
const filteredItems = computed(() => {
  let items = currentItems.value;

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item =>
      (item.type === 'folder' ? item.name : item.original_name).toLowerCase().includes(query)
    );
  }

  // Apply filters
  if (filterFoldersOnly.value) {
    items = items.filter(item => item.type === 'folder');
  }
  if (filterFilesOnly.value) {
    items = items.filter(item => item.type === 'file');
  }

  // Apply sorting
  switch (sortOption.value) {
    case 'name_asc':
      return items.sort((a, b) =>
        (a.type === 'folder' ? a.name : a.original_name).localeCompare(b.type === 'folder' ? b.name : b.original_name)
      );
    case 'name_desc':
      return items.sort((a, b) =>
        (b.type === 'folder' ? b.name : b.original_name).localeCompare(a.type === 'folder' ? a.name : a.original_name)
      );
    case 'date_asc':
      return items.sort((a, b) =>
        new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
      );
    case 'date_desc':
      return items.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    case 'size_asc':
      return items.sort((a, b) =>
        (a.type === 'file' ? a.size : 0) - (b.type === 'file' ? b.size : 0)
      );
    case 'size_desc':
      return items.sort((a, b) =>
        (b.type === 'file' ? b.size : 0) - (a.type === 'file' ? a.size : 0)
      );
    default:
      return items;
  }
});

const currentItems = computed<FileItem[]>(() => {
  const folderItems = folders.value
    .filter(f => f.parent_id === currentFolderId.value)
    .map(f => ({ ...f, type: 'folder' as const }));

  const fileItems = files.value
    .filter(f => f.folder_id === currentFolderId.value)
    .map(f => ({ ...f, type: 'file' as const }));

  return [...folderItems, ...fileItems];
});

const currentPath = computed(() => {
  const path: Folder[] = [];
  if (!currentFolderId.value) return path;

  const findFolder = (id: string, folderList: Folder[]): boolean => {
    for (const folder of folderList) {
      if (folder.id === id) {
        path.unshift(folder);
        return true;
      }
      if (folder.children && findFolder(id, folder.children)) {
        path.unshift(folder);
        return true;
      }
    }
    return false;
  };

  findFolder(currentFolderId.value, folders.value);
  return path;
});

// Methods
const fetchAllFolders = async () => {
  try {
    setLoading?.(true);
    const { data } = await api.get<{ data: Folder[] }>('/folders');
    allFoldersTree.value = enrichFolderTree(data.data);
  } catch (error) {
    notificationService.error(t('file_manager.messages.fetch_folders_failed'));
  } finally {
    setLoading?.(false);
  }
};


const fetchFoldersForCurrentFolder = async () => {
  const parentId = currentFolderId.value || null;

  // Nếu đã có trong cache thì dùng cache
  if (folderCache.value.has(parentId)) {
    folders.value = folderCache.value.get(parentId)!;
    return;
  }

  try {
    setLoading?.(true);
    const { data } = await api.get<{ data: Folder[] }>('/folders', {
      params: { parent_id: parentId },
    });
    folders.value = data.data;
    folderCache.value.set(parentId, data.data); // Cache lại kết quả
  } catch (error) {
    notificationService.error(t('file_manager.messages.fetch_folders_failed'));
  } finally {
    setLoading?.(false);
  }
};


const fetchFilesForCurrentFolder = async () => {
  try {
    setLoading?.(true);
    const { data } = await api.get<{ data: File[] }>('/files', {
      params: { folder_id: currentFolderId.value || null }
    });
    files.value = data.data;
  } catch (error) {
    notificationService.error(t('file_manager.messages.fetch_files_failed'));
  } finally {
    setLoading?.(false);
  }
};

const buildFolderTree = (allFolders: Folder[], parentId: string | null = null): Folder[] => {
  return allFolders
    .filter(folder => folder.parent_id === parentId)
    .map(folder => ({
      ...folder,
      children: buildFolderTree(allFolders, folder.id),
      type: 'folder' as const,
      itemCount: 0
    }));
};

const updateBreadcrumbs = () => {
  const newBreadcrumbs = [{ name: t('file_manager.root'), path: '/filemanager' }];

  if (currentFolderId.value) {
    const path: Folder[] = [];
    const findFolder = (id: string, folders: Folder[]): boolean => {
      for (const folder of folders) {
        if (folder.id === id) {
          path.unshift(folder);
          return true;
        }
        if (folder.children && findFolder(id, folder.children)) {
          path.unshift(folder);
          return true;
        }
      }
      return false;
    };

    findFolder(currentFolderId.value, allFoldersTree.value);

    path.forEach(folder => {
      newBreadcrumbs.push({
        name: folder.name,
        path: `/filemanager?folder=${folder.id}`
      });
    });
  }

  breadcrumbs.value = newBreadcrumbs;
};


const navigateToFolder = async (folderId: string) => {
  currentFolderId.value = folderId;
};

const enrichFolderTree = (folders: Folder[]): Folder[] => {
  return folders.map(folder => ({
    ...folder,
    type: 'folder' as const,
    itemCount: 0,
    children: folder.children ? enrichFolderTree(folder.children) : [],
  }));
};


const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
};

const downloadFile = (file: File) => {
  if (!file.id) return;
  window.open(config.api_be + `/file/${file.id}?download=1`, '_blank');
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const formData = new FormData();
  Array.from(input.files).forEach(file => {
    formData.append('files[]', file);
  });
  if (currentFolderId.value) {
    formData.append('folder_id', currentFolderId.value);
  }

  try {
    setLoading?.(true);
    await api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    await fetchFilesForCurrentFolder();
    notificationService.success(t('file_manager.messages.upload_success'));
  } catch (error) {
    notificationService.error(t('file_manager.messages.upload_failed'));
  } finally {
    input.value = '';
    setLoading?.(false);
  }
};

const createFolder = async ({ name }: { name: string }) => {
  if (!name.trim()) return;
  try {
    setLoading?.(true);
    await api.post('/folders', {
      name,
      parent_id: currentFolderId.value
    });
    folderCache.value.delete(currentFolderId.value || null);

    await fetchFoldersForCurrentFolder(); // Lấy lại thư mục sau khi xóa cache

    openModalCreateFolder.value = false;
    notificationService.success(t('file_manager.messages.folder_created'));
  } catch (error: any) {
    formErrors.value = error.response?.data?.errors || {};
  } finally {
    setLoading?.(false);
  }
};

const openModalDelete = (item: FileItem) => {
  showModalDelete.value = true;
  itemToDelete.value = item;
};

const closeModalConfirm = () => {
  showModalDelete.value = false;
  itemToDelete.value = null;
};

const closeModalCreateFolder = () => {
  openModalCreateFolder.value = false;
  formErrors.value = {};
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  try {
    setLoading?.(true);
    const endpoint = itemToDelete.value.type === 'folder'
      ? `/folders/${itemToDelete.value.id}`
      : `/files/${itemToDelete.value.id}`;

    await api.delete(endpoint, {
      params: { id: itemToDelete.value.id }
    });

    if (itemToDelete.value.type === 'folder') {
      folderCache.value.clear(); // Vì có thể ảnh hưởng toàn bộ cây, xóa toàn bộ
      await fetchAllFolders();
      if (currentFolderId.value === itemToDelete.value.id) {
        currentFolderId.value = itemToDelete.value.parent_id;
        updateBreadcrumbs();
      }
    } else {
      await fetchFilesForCurrentFolder();
    }

    notificationService.success(t('file_manager.messages.delete_success'));
  } catch (error) {
    notificationService.error(t('file_manager.messages.delete_failed'));
  } finally {
    closeModalConfirm();
    setLoading?.(false);
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const toggleFileMenu = (itemId: string) => {
  activeFileMenu.value = activeFileMenu.value === itemId ? null : itemId;
};

const previewFile = (file: File) => {
  previewItem.value = file;
};

// Lifecycle
onMounted(async () => {
  const folderId = new URLSearchParams(window.location.search).get('folder');
  currentFolderId.value = folderId;

  await Promise.all([
    fetchAllFolders(),
    fetchFoldersForCurrentFolder(),
    fetchFilesForCurrentFolder()
  ]);

  updateBreadcrumbs();
});

watch(currentFolderId, async () => {
  await Promise.all([
    fetchFoldersForCurrentFolder(),
    fetchFilesForCurrentFolder(),
  ]);

  updateBreadcrumbs();

  const newUrl = currentFolderId.value
    ? `/filemanager?folder=${currentFolderId.value}`
    : '/filemanager';
  router.replace(newUrl);
});

</script>
