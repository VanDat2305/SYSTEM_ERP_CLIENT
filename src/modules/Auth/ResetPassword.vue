<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div class="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900">
        <div class="flex flex-col flex-1 w-full lg:w-1/2">
          <div class="w-full max-w-md pt-10 mx-auto flex justify-between items-center">
            <router-link to="/signin"
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
              <svg class="stroke-current" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
                fill="none">
                <path d="M12.7083 5L7.5 10.2083L12.7083 15.4167" stroke="" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
              {{ $t('forgot_password.back_to_login') }}
            </router-link>
            <LanguageMenu />
          </div>
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div class="mb-5 sm:mb-8">
                <h1 class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                  {{ $t('reset_password.title') }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('reset_password.prompt') }}
                </p>
              </div>
              <form @submit.prevent="submitForm">
                <div class="space-y-5">
                  <!-- Email (disabled) -->
                  <div>
                    <label for="email" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {{ $t('reset_password.email') }}
                    </label>
                    <input v-model="email" type="email" id="email" name="email" disabled
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 cursor-not-allowed" />
                  </div>

                  <!-- New Password -->
                  <div class="relative">
                    <label for="password" class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {{ $t('reset_password.new_password') }}<span class="text-error-500">*</span>
                    </label>
                    <div class="relative">
                      <input v-model="password" :type="showPassword ? 'text' : 'password'" id="password" name="password"
                        :placeholder="$t('reset_password.new_password_placeholder')"
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      <button type="button" @click="showPassword = !showPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="showPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                              'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                        </svg>
                      </button>
                    </div>
                    <p v-if="validationErrors.password" class="mt-1.5 text-theme-xs text-error-500">
                      {{ validationErrors.password }}
                    </p>
                    <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {{ $t('reset_password.password_requirements') }}
                    </p>
                  </div>

                  <!-- Confirm Password -->
                  <div class="relative">
                    <label for="password_confirmation"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                      {{ $t('reset_password.confirm_password') }}<span class="text-error-500">*</span>
                    </label>
                    <div class="relative">
                      <input v-model="passwordConfirmation" :type="showPasswordConfirmation ? 'text' : 'password'"
                        id="password_confirmation" name="password_confirmation"
                        :placeholder="$t('reset_password.confirm_password_placeholder')"
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" />
                      <button type="button" @click="showPasswordConfirmation = !showPasswordConfirmation"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="showPasswordConfirmation ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                              'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                        </svg>
                      </button>
                    </div>
                    <p v-if="validationErrors.password_confirmation" class="mt-1.5 text-theme-xs text-error-500">
                      {{ validationErrors.password_confirmation }}
                    </p>
                  </div>

                  <!-- Button -->
                  <div>
                    <button type="submit" :disabled="loading || !isFormValid"
                      class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-600">
                      {{ loading ? $t('reset_password.processing') : $t('reset_password.submit') }}
                    </button>
                  </div>

                  <!-- Message -->
                  <p v-if="message" class="mt-1.5 text-theme-xs"
                    :class="{ 'text-error-500': isError, 'text-green-500': !isError }">
                    {{ message }}
                  </p>
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
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '@/plugins/axios';
import LanguageMenu from '@/components/layout/header/LanguageMenu.vue';
import CommonGridShape from '@/components/common/CommonGridShape.vue';
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue';
import { notificationService } from '@/services/notification';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const email = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const message = ref('');
const isError = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const showPasswordConfirmation = ref(false);

const validationErrors = ref({
  password: '',
  password_confirmation: ''
});

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const isFormValid = computed(() => {
  return password.value &&
    passwordConfirmation.value &&
    password.value === passwordConfirmation.value &&
    passwordRegex.test(password.value);
});

onMounted(async () => {
  const token = route.params.token || route.query.token;
  const emailParam = route.query.email;

  if (!token || !emailParam) {
    message.value = t('reset_password.invalid_link');
    isError.value = true;
    notificationService.error(message.value);
    return;
  }

  try {
    loading.value = true;
    const res = await api.get('/reset-password/' + token, {
      params: {
        token,
        email: emailParam
      }
    });
    if (res.data.data.valid) {
      email.value = emailParam as string;
    } else {
      message.value = t('reset_password.link_expired');
      isError.value = true;
      notificationService.error(message.value);
      router.push('/forgot-password');
    }
  } catch (err: any) {
    const mes = err.response?.data?.message || t('reset_password.verify_failed');
    notificationService.error(mes);
    router.push('/forgot-password');
  } finally {
    loading.value = false;
  }
});

const validateForm = () => {
  let isValid = true;
  validationErrors.value = {
    password: '',
    password_confirmation: ''
  };

  if (!password.value) {
    validationErrors.value.password = t('reset_password.password_required');
    isValid = false;
  } else if (!passwordRegex.test(password.value)) {
    validationErrors.value.password = t('reset_password.password_invalid');
    isValid = false;
  }

  if (!passwordConfirmation.value) {
    validationErrors.value.password_confirmation = t('reset_password.confirm_password_required');
    isValid = false;
  } else if (password.value !== passwordConfirmation.value) {
    validationErrors.value.password_confirmation = t('reset_password.passwords_not_match');
    isValid = false;
  }

  return isValid;
};

const submitForm = async () => {
  if (!validateForm()) return;

  loading.value = true;
  const token = route.params.token || route.query.token;

  try {
    const response = await api.post('/reset-password', {
      token,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value
    });

    message.value = t('reset_password.success');
    isError.value = false;
    notificationService.success(message.value);

    setTimeout(() => {
      router.push('/signin');
    }, 3000);
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const errors = err.response.data.errors;
      if (errors.password) {
        validationErrors.value.password = errors.password[0];
      }
      if (errors.password_confirmation) {
        validationErrors.value.password_confirmation = errors.password_confirmation[0];
      }
    }

    message.value = err.response?.data?.message || t('reset_password.failed');
    isError.value = true;
    notificationService.error(message.value);
  } finally {
    loading.value = false;
  }
};
</script>