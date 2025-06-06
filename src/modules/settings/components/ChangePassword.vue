<template>
    <div class="max-w mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 class="text-base font-bold text-gray-800 dark:text-white mb-6">
            {{ t('account_settings.change_password') }}
        </h2>

        <form @submit.prevent="showConfirmModal = true" class="space-y-6">
            <!-- Current Password -->
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="current_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('account_settings.current_password') }}
                    </label>
                </div>
                <div class="relative">
                    <input
                        v-model="form.current_password"
                        id="current_password"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        required
                        :placeholder="t('account_settings.current_password_placeholder')"
                        class="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                    />
                    <button
                        type="button"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        @click="showCurrentPassword = !showCurrentPassword"
                    >
                        <!-- <EyeIcon v-if="!showCurrentPassword" class="h-5 w-5" /> -->
                        <!-- <EyeSlashIcon v-else class="h-5 w-5" /> -->
                    </button>
                </div>
                <p v-if="errors.current_password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.current_password }}
                </p>
            </div>

            <!-- New Password -->
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="new_password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('account_settings.new_password') }}
                    </label>
                </div>
                <div class="relative">
                    <input
                        v-model="form.new_password"
                        id="new_password"
                        :type="showNewPassword ? 'text' : 'password'"
                        required
                        :placeholder="t('account_settings.new_password_placeholder')"
                        class="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                        @input="checkPasswordStrength"
                    />
                    <button
                        type="button"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        @click="showNewPassword = !showNewPassword"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="showNewPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                              'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                        </svg>
                    </button>
                </div>
                
                <!-- Password Strength Meter -->
                <div v-if="form.new_password" class="mt-2">
                    <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                            class="h-2 rounded-full"
                            :class="{
                                'bg-red-500': passwordStrength === 1,
                                'bg-yellow-500': passwordStrength === 2,
                                'bg-blue-500': passwordStrength === 3,
                                'bg-green-500': passwordStrength >= 4
                            }"
                            :style="`width: ${(passwordStrength / 4) * 100}%`"
                        ></div>
                    </div>
                    <p class="text-xs mt-1" :class="{
                        'text-red-500 dark:text-red-400': passwordStrength === 1,
                        'text-yellow-500 dark:text-yellow-400': passwordStrength === 2,
                        'text-blue-500 dark:text-blue-400': passwordStrength === 3,
                        'text-green-500 dark:text-green-400': passwordStrength >= 4
                    }">
                        {{ passwordStrengthText }}
                    </p>
                </div>
                
                <p v-if="errors.new_password" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.new_password }}
                </p>
            </div>

            <!-- Confirm New Password -->
            <div>
                <div class="flex justify-between items-center mb-1">
                    <label for="new_password_confirmation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ t('account_settings.confirm_new_password') }}
                    </label>
                </div>
                <div class="relative">
                    <input
                        v-model="form.new_password_confirmation"
                        id="new_password_confirmation"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        required
                        :placeholder="t('account_settings.confirm_new_password_placeholder')"
                        class="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white pr-10"
                    />
                    <button
                        type="button"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        @click="showConfirmPassword = !showConfirmPassword"
                    >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            :d="showConfirmPassword ? 'M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21' :
                              'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'" />
                        </svg>
                    </button>
                </div>
                <p v-if="errors.new_password_confirmation" class="mt-1 text-sm text-red-600 dark:text-red-400">
                    {{ errors.new_password_confirmation }}
                </p>
            </div>

            <!-- Password Requirements -->
            <div class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ t('account_settings.password_requirements') }}
                </h3>
                <ul class="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                    <li :class="{'text-green-600 dark:text-green-400': passwordRequirements.minLength}">
                        {{ t('account_settings.password_min_length', { length: 8 }) }}
                    </li>
                    <li :class="{'text-green-600 dark:text-green-400': passwordRequirements.hasNumber}">
                        {{ t('account_settings.password_has_number') }}
                    </li>
                    <li :class="{'text-green-600 dark:text-green-400': passwordRequirements.hasSpecialChar}">
                        {{ t('account_settings.password_has_special_char') }}
                    </li>
                    <li :class="{'text-green-600 dark:text-green-400': passwordRequirements.hasUpperCase}">
                        {{ t('account_settings.password_has_upper_case') }}
                    </li>
                </ul>
            </div>

            <!-- Submit Button -->
            <button
                type="submit"
                :disabled="loading || !formValid"
                class="w-full text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors"
            >
                <span v-if="loading">
                    {{ t('common.processing') }}...
                </span>
                <span v-else>
                    {{ t('account_settings.change_password_button') }}
                </span>
            </button>

            <!-- Success Message -->
            <div v-if="successMessage" class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p class="text-sm text-green-800 dark:text-green-200 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    {{ successMessage }}
                </p>
            </div>
        </form>

        <!-- Confirmation Modal -->
        <ConfirmModal 
            v-if="showConfirmModal"
            :show="showConfirmModal" 
            :close="() => showConfirmModal = false" 
            :onConfirm="changePassword" 
            type="warning"
            :closeOnClickOutside="false" 
            :title="t('account_settings.confirm_password_change_title')" 
            :message="t('account_settings.confirm_password_change_message')"
            :confirmText="t('common.yes_change')" 
            :cancelText="t('common.cancel')" 
        />

        <!-- Logout Confirmation Modal -->
        <ConfirmModal 
            v-if="showLogoutModal"
            :show="showLogoutModal" 
            :close="() => showLogoutModal = false" 
            :onConfirm="forceLogout" 
            type="info"
            :closeOnClickOutside="false" 
            :title="t('account_settings.logout_after_change_title')" 
            :message="t('account_settings.logout_after_change_message')"
            :confirmText="t('common.logout_now')" 
            :cancelText="t('common.logout_later')" 
        />
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { notificationService } from '@/services/notification';
import { api } from '@/utils/api';
import { useI18n } from 'vue-i18n';
// import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import {useAuth} from "@/auth/useAuth";

const { t } = useI18n();
const {logout} = useAuth();
const loading = ref(false);
const successMessage = ref('');
const showConfirmModal = ref(false);
const showLogoutModal = ref(false);

// Toggle password visibility
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password strength
const passwordStrength = ref(0);
const passwordStrengthText = ref('');

const form = reactive({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
});

const errors = reactive({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
});

const passwordRequirements = computed(() => {
    return {
        minLength: form.new_password.length >= 8,
        hasNumber: /\d/.test(form.new_password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(form.new_password),
        hasUpperCase: /[A-Z]/.test(form.new_password)
    };
});

const formValid = computed(() => {
    return (
        form.current_password &&
        form.new_password &&
        form.new_password_confirmation &&
        form.new_password === form.new_password_confirmation &&
        Object.values(passwordRequirements.value).every(req => req)
    );
});

const checkPasswordStrength = () => {
    let strength = 0;
    
    // Length
    if (form.new_password.length >= 8) strength++;
    if (form.new_password.length >= 12) strength++;
    
    // Complexity
    if (/[A-Z]/.test(form.new_password)) strength++;
    if (/\d/.test(form.new_password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(form.new_password)) strength++;
    
    // Cap at 4
    passwordStrength.value = Math.min(strength, 4);
    
    // Set strength text
    switch (passwordStrength.value) {
        case 1:
            passwordStrengthText.value = t('password_strength.weak');
            break;
        case 2:
            passwordStrengthText.value = t('password_strength.fair');
            break;
        case 3:
            passwordStrengthText.value = t('password_strength.good');
            break;
        case 4:
            passwordStrengthText.value = t('password_strength.strong');
            break;
        default:
            passwordStrengthText.value = '';
    }
};

const resetForm = () => {
    form.current_password = '';
    form.new_password = '';
    form.new_password_confirmation = '';
    errors.current_password = '';
    errors.new_password = '';
    errors.new_password_confirmation = '';
    passwordStrength.value = 0;
    passwordStrengthText.value = '';
};

const changePassword = async () => {
    showConfirmModal.value = false;
    if (!formValid.value) return;
    
    loading.value = true;
    errors.current_password = '';
    errors.new_password = '';
    errors.new_password_confirmation = '';
    
    try {
        const response = await api.put('/auth/change-password', {
            current_password: form.current_password,
            new_password: form.new_password,
            new_password_confirmation: form.new_password_confirmation
        });

        successMessage.value = response.data.message || t('account_settings.password_changed_success');
        notificationService.success(t('account_settings.password_changed_success'));
        resetForm();
        
        // Show logout confirmation
        showLogoutModal.value = true;
        
    } catch (error) {
        if (error.response?.data?.errors) {
            const apiErrors = error.response.data.errors;
            if (apiErrors.current_password) {
                errors.current_password = apiErrors.current_password[0];
            }
            if (apiErrors.new_password) {
                errors.new_password = apiErrors.new_password[0];
            }
            if (apiErrors.new_password_confirmation) {
                errors.new_password_confirmation = apiErrors.new_password_confirmation[0];
            }
        } else {
            notificationService.error(t('account_settings.password_change_failed'));
        }
    } finally {
        loading.value = false;
    }
};

const forceLogout = async () => {
    showLogoutModal.value = false;
    await logout();
    // Redirect to login page or home page as needed
    router.push({ name: 'signin' });
};
</script>

<style scoped>
/* Custom styles if needed */
</style>