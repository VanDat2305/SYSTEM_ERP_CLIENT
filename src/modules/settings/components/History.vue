<template>
  <div class="max-w mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-base font-bold text-gray-800 dark:text-white">
        {{ t('account_settings.history.activity_history') }}
      </h2>
      <button 
        @click="refreshTimeline"
        class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
        :disabled="loading"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-4 w-4 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          :class="{ 'animate-spin': loading }"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ t('common.refresh') }}
      </button>
    </div>

    <div v-if="loading && timelineItems.length === 0" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="timelineItems.length === 0" class="text-center text-sm py-8 text-gray-500 dark:text-gray-400">
      {{ t('account_settings.history.no_data') }}
    </div>

    <div v-else class="space-y-4">
      <div 
        v-for="item in timelineItems" 
        :key="item.id" 
        class="relative pl-8 pb-6 border-l-2 border-gray-200 dark:border-gray-700 last:border-l-0 last:pb-0"
      >
        <!-- Timeline dot -->
        <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-600 border-2 border-white dark:border-gray-800"></div>
        
        <!-- Timeline content -->
        <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div>
              <!-- <h3 class="text-sm font-medium text-gray-800 dark:text-white">
                {{ getEventTitle(item) }}
              </h3> -->
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatDate(item.created_at) }}
              </p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                  :class="getLogNameClass(item.log_name)">
              {{ formatLogName(item.log_name) }}
            </span>
          </div>
          
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">
            {{ item.description }}
          </p>
        
          
          <!-- Details dropdown -->
          <div class="mt-3">
            <button 
              @click="toggleDetails(item.id)" 
              class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              {{ expandedItems.includes(item.id) ? t('common.hide_details') : t('common.show_details') }}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-3 w-3 ml-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                :class="{ 'rotate-180': expandedItems.includes(item.id) }"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <transition
              enter-active-class="transition-all duration-200 ease-out"
              leave-active-class="transition-all duration-150 ease-in"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-screen"
              leave-from-class="opacity-100 max-h-screen"
              leave-to-class="opacity-0 max-h-0"
            >
              <div 
                v-if="expandedItems.includes(item.id)" 
                class="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-xs overflow-hidden"
              >
                <div v-if="item.properties.ip" class=" text-gray-700 dark:text-gray-300">
                  <span class="font-medium ">{{ t('account_settings.history.ip_address') }}:</span> {{ item.properties.ip }}
                </div>
                
                <!-- <div v-if="item.properties.user_agent" class="mb-2">
                  <span class="font-medium">{{ t('account_settings.user_agent') }}:</span> {{ item.properties.user_agent }}
                </div> -->
                
                <template v-if="item.properties.old_attributes || item.properties.changed_attributes">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div v-if="item.properties.old_attributes">
                      <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('account_settings.history.old_values') }}
                      </h4>
                      <pre class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-x-auto text-gray-700 dark:text-gray-300">{{ formatAttributes(item.properties.old_attributes) }}</pre>
                    </div>
                    
                    <div v-if="item.properties.changed_attributes">
                      <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('account_settings.history.new_values') }}
                      </h4>
                      <pre class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-x-auto text-gray-700 dark:text-gray-300">{{ formatAttributes(item.properties.changed_attributes) }}</pre>
                    </div>
                  </div>
                </template>
                
                <div v-if="item.properties.note" class="mt-2 text-gray-700 dark:text-gray-300">
                  <span class="font-medium">{{ t('account_settings.history.note') }}:</span> {{ item.properties.note }}
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="pagination && pagination.total > pagination.per_page" class="flex justify-between items-center mt-6">
        <button 
          @click="loadPage(pagination.current_page - 1)" 
          :disabled="loading || pagination.current_page === 1"
          class="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {{ t('common.previous') }}
        </button>
        
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ t('common.page') }} {{ pagination.current_page }} {{ t('common.of') }} {{ pagination.last_page }}
        </span>
        
        <button 
          @click="loadPage(pagination.current_page + 1)" 
          :disabled="loading || pagination.current_page === pagination.last_page"
          class="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 flex items-center"
        >
          {{ t('common.next') }}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from '@/utils/api';
import { notificationService } from '@/services/notification';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const authStore = useAuthStore();

const loading = ref(false);
const timelineData = ref({ items: [], pagination: null });
const expandedItems = ref([]);

const fetchTimeline = async (page = 1) => {
  try {
    loading.value = true;
    const response = await api.get(`/logs?page=${page}&per_page=5&causer_id=${authStore.user.id}`);
    timelineData.value = response.data.data;
  } catch (error) {
    notificationService.error(t('account_settings.history.fetch_failed'));
    console.error('Error fetching timeline:', error);
  } finally {
    loading.value = false;
  }
};

const refreshTimeline = () => {
  fetchTimeline(pagination.value?.current_page || 1);
};

const loadPage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchTimeline(page);
  }
};

const timelineItems = computed(() => timelineData.value.items || []);
const pagination = computed(() => timelineData.value.pagination || null);

const toggleDetails = (id) => {
  const index = expandedItems.value.indexOf(id);
  if (index === -1) {
    expandedItems.value.push(id);
  } else {
    expandedItems.value.splice(index, 1);
  }
};

const getEventTitle = (item) => {
  const titles = {
    // 'users.updated': t('account_settings.user_updated'),
    // 'login': t('account_settings.user_logged_in'),
    // 'logout': t('account_settings.user_logged_out'),
    // 'password.updated': t('account_settings.password_updated'),
    // 'profile.updated': t('account_settings.profile_updated'),
    // 'two_factor.authentication.enabled': t('account_settings.two_factor_enabled'),
    // 'two_factor.authentication.disabled': t('account_settings.two_factor_disabled'),
  };
  return titles[item.log_name] || item.log_name;
};

const formatLogName = (logName) => {
  return logName
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getLogNameClass = (logName) => {
  const classes = {
    // 'login': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    // 'logout': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    // 'users.updated': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    // 'password.updated': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    // 'two_factor.authentication.enabled': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    // 'two_factor.authentication.disabled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return classes[logName] || 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
};

const formatDate = (dateString) => {

  const options = { 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
};

const formatAttributes = (attributes) => {
  return JSON.stringify(attributes, null, 2);
};

onMounted(() => {
  fetchTimeline();
});
</script>

<style scoped>
/* Custom transition for details dropdown */
.details-enter-active,
.details-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.details-enter-from,
.details-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>