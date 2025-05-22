<template>
    <div class="p-6 border border-gray-200 rounded-xl dark:border-gray-800">
      <div class="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <!-- Tab buttons -->
        <div
          class="overflow-x-auto pb-2 sm:w-[200px] 
                 [&::-webkit-scrollbar-thumb]:rounded-full 
                 [&::-webkit-scrollbar-thumb]:bg-gray-100 
                 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 
                 [&::-webkit-scrollbar-track]:bg-white 
                 dark:[&::-webkit-scrollbar-track]:bg-transparent 
                 [&::-webkit-scrollbar]:h-1.5"
        >
          <nav class="flex flex-row w-full sm:flex-col sm:space-y-2">
            <button
              v-for="tab in sanitizedTabs"
              :key="tab.id"
              class="inline-flex items-center px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out rounded-lg sm:p-3 shadow-sm"
              :class="{
                'text-brand-500 dark:bg-brand-400/20 dark:text-brand-400 bg-brand-50': activeTab === tab.id,
                'bg-transparent text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200': activeTab !== tab.id
              }"
              @click="changeTab(tab.id)"
            >
              {{ t(tab.label) }}
            </button>
          </nav>
        </div>
  
        <!-- Tab contents with dynamic components -->
        <div class="flex-1">
          <component 
            :is="activeComponent" 
            v-bind="activeProps" 
            @tab-event="handleTabEvent" 
          />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, markRaw } from 'vue';
  import { useI18n } from 'vue-i18n';
  
  const { t } = useI18n();
  
  const props = defineProps({
    tabs: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(tab => tab.id && tab.label && tab.component);
      }
    },
    initialTab: {
      type: String,
      default: ''
    }
  });
  
  const emit = defineEmits(['tab-changed', 'tab-event']);
  
  // Prevent Vue from making components reactive
  const sanitizedTabs = props.tabs.map(tab => ({
    ...tab,
    component: markRaw(tab.component)
  }));
  
  const activeTab = ref(props.initialTab || sanitizedTabs[0]?.id || '');
  
  const activeComponent = computed(() => {
    const tab = sanitizedTabs.find(t => t.id === activeTab.value);
    return tab?.component || null;
  });
  
  const activeProps = computed(() => {
    const tab = sanitizedTabs.find(t => t.id === activeTab.value);
    return tab?.props || {};
  });
  
  function changeTab(tabId) {
    activeTab.value = tabId;
    emit('tab-changed', tabId);
  }
  
  function handleTabEvent(payload) {
    emit('tab-event', { tabId: activeTab.value, ...payload });
  }
  </script>
  