<template>
    <FullScreenLayout>
      <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900">
          <div class="flex flex-col flex-1 w-full lg:w-1/2">
            <div class="w-full max-w-md pt-10 mx-auto flex justify-between items-center">
              <router-link to="/"
                class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                <svg class="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                  fill="none">
                  <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" stroke-width="1.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                {{ $t('common.back') }}
              </router-link>
              <LanguageMenu />
            </div>
            <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
              <div>
                <div class="mb-5 sm:mb-8">
                  <h1 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                    {{ $t('two_factor.title') }}
                  </h1>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ $t('two_factor.description') }}
                  </p>
                </div>
                
                <!-- Authentication Code Form -->
                <div v-if="!usingRecovery">
                  <form @submit.prevent="submitCode" class="space-y-5">
                    <div>
                      <label for="code" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        {{ $t('two_factor.auth_code') }}<span class="text-error-500">*</span>
                      </label>
                      <input v-model="code" type="text" id="code" :placeholder="$t('two_factor.enter_auth_code')" autofocus
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      <p v-if="errors.code" class="mt-1.5 text-theme-xs text-error-500">{{ errors.code }}</p>
                    </div>
                    
                    <div>
                      <button type="submit" :disabled="isLoading"
                        class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70">
                        <span v-if="isLoading" class="mr-2">
                          <svg class="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        {{ $t('two_factor.verify') }}
                      </button>
                    </div>
                  </form>
                  
                  <div class="mt-4 text-center">
                    <button @click="toggleRecovery" type="button"
                      class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                      {{ $t('two_factor.use_recovery_code') }}
                    </button>
                  </div>
                </div>
                
                <!-- Recovery Code Form -->
                <div v-else>
                  <form @submit.prevent="submitRecoveryCode" class="space-y-5">
                    <div>
                      <label for="recoveryCode" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                        {{ $t('two_factor.recovery_code') }}<span class="text-error-500">*</span>
                      </label>
                      <input v-model="recoveryCode" type="text" id="recoveryCode" :placeholder="$t('two_factor.enter_recovery_code')" autofocus
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      <p v-if="errors.recoveryCode" class="mt-1.5 text-theme-xs text-error-500">{{ errors.recoveryCode }}</p>
                    </div>
                    
                    <div>
                      <button type="submit" :disabled="isLoading"
                        class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-70">
                        <span v-if="isLoading" class="mr-2">
                          <svg class="w-4 h-4 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        {{ $t('two_factor.verify') }}
                      </button>
                    </div>
                  </form>
                  
                  <div class="mt-4 text-center">
                    <button @click="toggleRecovery" type="button"
                      class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                      {{ $t('two_factor.use_auth_code') }}
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          
          <!-- Right side (graphic) -->
          <div class="relative items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
            <div class="flex items-center justify-center z-1">
              <CommonGridShape />
              <div class="flex flex-col items-center max-w-xs">
                <router-link to="/" class="block mb-4">
                  <img width="231" height="1" src="/images/logo/logo.png" alt="Logo" />
                </router-link>
                <p class="text-center text-gray-100 dark:text-white/60">
                  {{ $t('login_page.sologan') }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRouter } from 'vue-router';
  import { useAuth } from '@/auth/useAuth';
  import LanguageMenu from '@/components/layout/header/LanguageMenu.vue';
  import CommonGridShape from '@/components/common/CommonGridShape.vue';
  import FullScreenLayout from '@/components/layout/FullScreenLayout.vue';
  import { notificationService } from '@/services/notification';
  import { useAuthStore } from '@/stores/auth';

  const authStore = useAuthStore();
  
  const { t } = useI18n();
  const router = useRouter();
  const { verifyTwoFactor, isLoading } = useAuth();
  
  const code = ref('');
  const recoveryCode = ref('');
  const usingRecovery = ref(false);
  const errors = ref({
    code: '',
    recoveryCode: ''
  });
  
  const toggleRecovery = () => {
    usingRecovery.value = !usingRecovery.value;
    errors.value = { code: '', recoveryCode: '' };
  };
  
  const submitCode = async () => {
    if (!code.value) {
      errors.value.code = t('two_factor.code_required');
      return;
    }
  
    try {
      await verifyTwoFactor(code.value);
      notificationService.success(t('two_factor.success_message'));
    } catch (error) {
      errors.value.code = t('two_factor.invalid_code');
    }
  };
  
  const submitRecoveryCode = async () => {
    if (!recoveryCode.value) {
      errors.value.recoveryCode = t('two_factor.recovery_code_required');
      return;
    }
  
    try {
      await verifyTwoFactor('', recoveryCode.value);
      notificationService.success(t('two_factor.success_message'));
    } catch (error) {
      errors.value.recoveryCode = t('two_factor.invalid_recovery_code');
    }
  };
  onMounted(() => {
  if (!authStore.preTwoFactorData) {
    router.push('/signin');
  }
});
  </script>