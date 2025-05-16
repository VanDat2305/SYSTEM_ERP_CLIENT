<template>
    <div>
        <!-- Root Folder -->
        <div role="button" tabindex="0"
            class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
            :class="{ 'bg-blue-100 dark:bg-blue-700': currentFolderId === null }" @click="emit('select-folder', null)"
            @keydown.enter="emit('select-folder', null)">
             <div class="w-5 h-5 text-yellow-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                </svg>
            </div>
            <span class="text-sm text-gray-800 dark:text-white">{{ t('file_manager.root') }}</span>
        </div>

        <!-- Folder List -->
        <ul class="ml-4" v-if="normalizedFolders.length > 0">
            <li v-for="folder in folders" :key="folder.id" class="flex flex-col">
                <div role="button" tabindex="0"
                    class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                    :class="{ 'bg-blue-100 dark:bg-blue-700': currentFolderId === folder.id }"
                    @click.stop="emit('select-folder', folder.id)"
                    @keydown.enter.stop="emit('select-folder', folder.id)">
                    <!-- Toggle button -->
                    <button v-if="hasChildren(folder)" @click.stop="emit('toggle-folder', folder.id)"
                        class="text-gray-500 dark:text-gray-300 focus:outline-none"
                        :aria-expanded="expandedFolders[folder.id] || false"
                        :aria-label="expandedFolders[folder.id] ? 'Collapse folder' : 'Expand folder'">
                        <ChevronIcon class="w-4 h-4 transition-transform"
                            :class="{ 'rotate-90': expandedFolders[folder.id] }" />
                    </button>
                    <!-- Spacer for alignment when no children -->
                    <span v-else class="w-4 h-4" aria-hidden="true"></span>

                    <!-- Folder icon and name -->
                    <div class="flex items-center gap-2 flex-1 min-w-0">
                        <div class="w-5 h-5 text-yellow-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                                    d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                            </svg>
                        </div>
                        <span class="text-sm text-gray-800 dark:text-white truncate">{{ folder.name }}</span>
                    </div>
                </div>

                <!-- Child folders with transition -->
                <transition name="fade">
                    <FolderTree v-if="hasChildren(folder) && expandedFolders[folder.id]" :folders="folder.children"
                        :current-folder-id="currentFolderId" :expanded-folders="expandedFolders"
                        @select-folder="emit('select-folder', $event)" @toggle-folder="emit('toggle-folder', $event)" />
                </transition>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from 'vue';
import { useI18n } from 'vue-i18n';

interface Folder {
    id: string;
    name: string;
    children?: Folder[];
}


const { t } = useI18n();

const props = defineProps<{
    folders?: Folder[];  // Make it optional with default value
    currentFolderId: string | null;
    expandedFolders: Record<string, boolean>;
}>();


let normalizedFolders = props.folders || [];

watch(() => props.folders, (newFolders) => {
    if (newFolders) {
        normalizedFolders = newFolders;
    }
}, { immediate: true });


const emit = defineEmits<{
    (e: 'select-folder', folderId: string | null): void;
    (e: 'toggle-folder', folderId: string): void;
}>();



const hasChildren = (folder: Folder): boolean => {
    return !!folder.children && folder.children.length > 0;
};

// SVG components for better reusability
const FolderIcon = {
    template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
        d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
    </svg>
  `
};

const ChevronIcon = {
    template: `
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  `
};

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
    transform-origin: top;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

[role="button"]:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
}
</style>