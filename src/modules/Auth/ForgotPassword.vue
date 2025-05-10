<template>
    <FullScreenLayout>
        <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
            <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900">
                <div class="flex flex-col flex-1 w-full lg:w-1/2">
                    <div class="w-full max-w-md pt-10 mx-auto flex justify-between items-center">
                        <router-link to="/signin"
                            class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                            <svg class="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                viewBox="0 0 20 20" fill="none">
                                <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            {{ $t('forgot_password.back_to_login') }}
                        </router-link>
                        <LanguageMenu />
                    </div>
                    <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                        <div>
                            <div class="mb-5 sm:mb-8">
                                <h1
                                    class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                                    {{ $t('forgot_password.title') }}
                                </h1>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    {{ $t('forgot_password.prompt') }}
                                </p>
                            </div>
                            <form @submit.prevent="submitForm">
                                <div class="space-y-5">
                                    <!-- Email -->
                                    <div>
                                        <label for="email"
                                            class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                                            {{ $t('forgot_password.email') }}<span class="text-error-500">*</span>
                                        </label>
                                        <input v-model="email" type="text" id="email" name="email"
                                            :placeholder="$t('forgot_password.email_placeholder')"
                                            class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                                        <p v-if="validationErrors.email"
                                            class="mt-1.5 text-theme-xs text-error-500 mt-1">{{ validationErrors.email
                                            }}</p>
                                        <p v-else-if="message" class="mt-1.5 text-theme-xs"
                                            :class="{ 'text-error-500': isError, 'text-green-500': !isError }">
                                            {{ message }}
                                        </p>    
                                    </div>
                                    <!-- Button -->
                                    <div>
                                        <button type="submit" :disabled="loading"
                                            class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600">
                                            {{ loading ? $t('forgot_password.sending') :
                                            $t('forgot_password.send_reset_link') }}
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
                <div class="relative items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
                    <div class="flex items-center justify-center z-1">
                        <common-grid-shape />
                        <div class="flex flex-col items-center max-w-xs">
                            <router-link to="/" class="block mb-0">
                                <img width="{231}" height="{1}" src="/images/logo/logo.png" alt="Logo" />
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
import { ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '@/plugins/axios';
import LanguageMenu from '@/components/layout/header/LanguageMenu.vue';
import CommonGridShape from '@/components/common/CommonGridShape.vue';
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue';
import { notificationService } from '@/services/notification';
import type { AxiosError } from 'axios';

const setLoading = inject("setLoading");
const { t } = useI18n();
const router = useRouter();

const email = ref('');
const message = ref('');
const isError = ref(false);
const loading = ref(false);
const validationErrors = ref({
    email: '',
});

const submitForm = async () => {
  // Reset validation errors
  validationErrors.value.email = '';

  // Validate email
  if (email.value === '') {
    validationErrors.value.email = t('forgot_password.email_valid.required');
    return;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    validationErrors.value.email = t('forgot_password.email_valid.invalid');
    return;
  }

  loading.value = true;
  if (typeof setLoading === 'function') {
    setLoading(true);
  }

  try {
    const response = await api.post('/forgot-password', {
      email: email.value,
    });

    // Handle successful response
    message.value = t('forgot_password.success_message');
    isError.value = false;
    notificationService.success(t('forgot_password.success_message'));
    email.value = ''; // Clear email input
    if (response.data.code === 200) {
      router.push('/send-success'); // Redirect to success page
    }


} catch (err: unknown) {
    const error = err as AxiosError<{ errors?: Record<string, string[]>; message?: string ;status?: number}>;
    console.log(error.response?.data);
    
    if (error.response?.data?.errors) {
      // Handle validation errors
      const errors = error.response.data.errors;
      if (errors.email) {
        validationErrors.value.email = errors.email[0];
      }
      isError.value = true;
    } else if (error.response?.status === 422) {
        
        message.value = error.response?.data?.errors 
            ? JSON.stringify(error.response.data.errors)
            : t('forgot_password.error_message');

    } else if (error.response?.status === 429) {
      // Handle 429 Too Many Requests error
      message.value = t('forgot_password.too_many_requests');
        
    } else {
        message.value = error.response?.data?.message || t('forgot_password.error_message');
    }
 

    notificationService.error(message.value);
  } finally {
    loading.value = false;
    if (typeof setLoading === 'function') {
      setLoading(false);
    }
  }
};
</script>

<style scoped>
/* Inherit existing styles and add specific ones for forgot password */
</style>