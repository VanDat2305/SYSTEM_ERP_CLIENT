<template>
    <div class="max-w mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            {{ t('account_settings.two_factor_authentication') }}
        </h2>

        <!-- Disabled State -->
        <div v-if="!enabled" class="space-y-6">
            <div class="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                <p class="text-blue-800 dark:text-blue-200">
                    {{ t('account_settings.two_factor_authentication_description') }}
                    <!-- Two-factor authentication adds an extra layer of security to your account. -->
                </p>
            </div>

            <button v-if="!showQrCode" @click="enable2FA"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                {{ t('account_settings.enable_2fa') }}
                <!-- Enable 2FA -->
            </button>

            <!-- QR Code Section -->
            <div v-if="showQrCode" class="space-y-4 mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white">
                    <!-- Set Up Two-Factor Authentication -->
                    {{ t('account_settings.setup_2fa') }}
                    <!-- Set Up 2FA -->
                </h3>

                <div class="flex justify-center p-2 bg-white dark:bg-gray-700 rounded">
                    <div v-html="qrCode"
                        class="w-48 h-48 [&_svg]:w-full [&_svg]:h-full [&_svg]:max-w-full [&_svg]:max-h-full"></div>
                </div>


                <div class="bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                    <p class="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                        {{ secret }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ t('account_settings.scan_qr_code') }}
                        <!-- Scan the QR code with your authenticator app. -->
                        <!-- Scan the QR code above or enter this code manually into your authenticator app. -->
                    </p>
                </div>

                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <!-- Verification Code -->
                        <!-- Enter the verification code from your authenticator app. -->
                        {{ t('account_settings.verification_code') }}
                    </label>
                    <input v-model="verificationCode" type="text"
                        :placeholder="t('account_settings.verification_code_placeholder')"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white">
                    <button @click="confirm2FA" :disabled="!verificationCode"
                        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg transition-colors mt-2">
                        <!-- Confirm and Enable -->
                        {{ t('account_settings.confirm_and_enable') }}
                        <!-- Confirm and Enable 2FA -->
                    </button>
                </div>
            </div>
        </div>

        <!-- Enabled State -->
        <div v-else class="space-y-6">
            <div class="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                <p class="text-green-800 dark:text-green-200 flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    <!-- Two-factor authentication is enabled. -->
                    {{ t('account_settings.2fa_enabled') }}
                </p>
            </div>

            <div class="flex space-x-3">
                <button @click="showRecoveryCodes"
                    class="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 px-4 rounded-lg transition-colors">
                    <!-- Show Recovery Codes -->
                    {{ t('account_settings.show_recovery_codes') }}
                </button>
                <button @click="showModal = true"
                    class="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                    <!-- Disable 2FA -->
                    {{ t('account_settings.disable_2fa') }}
                </button>
            </div>

            <!-- Recovery Codes -->
            <div v-if="recoveryCodes.length > 0"
                class="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-3">
                    <!-- Recovery Codes -->
                    {{ t('account_settings.recovery_codes') }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <!-- Store these codes in a secure place. Each code can be used only once. -->
                    {{ t('account_settings.recovery_codes_description') }}
                </p>

                <ul class="grid grid-cols-2 gap-2 font-mono">
                    <li v-for="code in recoveryCodes" :key="code"
                        class="p-2 bg-gray-50 dark:bg-gray-700 rounded text-center text-sm">
                        {{ code }}
                    </li>
                </ul>

                <div class="mt-4 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded">
                    <p class="text-sm text-yellow-800 dark:text-yellow-200">
                        <!-- If you lose your device and don't have recovery codes, you'll lose access to your account. -->
                        {{ t('account_settings.recovery_codes_warning') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
    <ConfirmModal 
        :show="showModal" 
        :close="() => showModal = false" 
        :onConfirm="disable2FA" 
        type="danger"
        :closeOnClickOutside="false" 
        :title="t('account_settings.confirm_disable_2fa')" 
        :message="t('account_settings.confirm_disable_2fa_message')"
        :confirmText="t('common.yes')" 
        :cancelText="t('common.no')" 
      />
</template>

<script setup>
import { ref, onMounted , inject} from 'vue';
import { notificationService } from '@/services/notification'
import { api } from '@/utils/api'
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const { t } = useI18n();

const enabled = ref(false);
const showQrCode = ref(false);
const qrCode = ref('');
const secret = ref('');
const verificationCode = ref('');
const recoveryCodes = ref([]);
const loading = ref(false);
const authStore = useAuthStore();
const showModal = ref(false)

const setLoading = inject("setLoading");

// Check 2FA status
const check2FAStatus = async () => {
    if (typeof setLoading === "function") {
      setLoading(true);
    }
    try {
        loading.value = true;
        const response = await api.get('/users/' + authStore.user.id);

        enabled.value = response.data.data.two_factor_enabled;
    } catch (error) {
        notificationService.error(t('account_settings.check_2fa_failed'))
        console.error(error);
    } finally {
        loading.value = false;
        if (typeof setLoading === "function") {
            setLoading(false);
        }
    }
};

// Enable 2FA
const enable2FA = async () => {
    
    try {
        if (typeof setLoading === "function") {
            setLoading(true);
        }
        loading.value = true;
        const response = await api.post('/two-factor-authentication');
        qrCode.value = response.data.data.qr_code;
        secret.value = response.data.data.secret;
        showQrCode.value = true;
    } catch (error) {
        notificationService.error(t('account_settings.enable_2fa_failed'))
        console.error(error);
    } finally {
        loading.value = false;
        if (typeof setLoading === "function") {
            setLoading(false);
        }
    }
};



// Confirm 2FA
const confirm2FA = async () => {
    if (!verificationCode.value) {
        notificationService.warning(t('account_settings.enter_verification_code'))
        return;
    }

    try {
        if (typeof setLoading === "function") {
            setLoading(true);
        }
        loading.value = true;
        const response = await api.post('/confirmed-two-factor-authentication', {
            code: verificationCode.value
        });

        recoveryCodes.value = response.data.data.recovery_codes;
        enabled.value = true;
        showQrCode.value = false;
        notificationService.success(t('account_settings.2fa_enabled_successfully'))
    } catch (error) {
        notificationService.error(t('account_settings.invalid_verification_code'))
        console.error(error);
    } finally {
        loading.value = false;
        if (typeof setLoading === "function") {
            setLoading(false);
        }
    }
};

// Disable 2FA
const disable2FA = async () => {
    showModal.value = false
    try {
        if (typeof setLoading === "function") {
            setLoading(true);
        }
        loading.value = true;
        const res = await api.delete('/two-factor-authentication');
        enabled.value = false;
        recoveryCodes.value = [];
        notificationService.success(res.data.data.message || t('account_settings.2fa_disabled_successfully'))
        // toast.success('Two-factor authentication disabled');
    } catch (error) {
        // toast.error('Failed to disable 2FA');
        notificationService.success(error.response.data.message || t('account_settings.2fa_disabled_failed'))
        console.error(error);
    } finally {
        loading.value = false;
        if (typeof setLoading === "function") {
            setLoading(false);
        }
    }
};

// Show recovery codes
const showRecoveryCodes = async () => {
    try {
        if (typeof setLoading === "function") {
            setLoading(true);
        }
        loading.value = true;
        const response = await api.get('/two-factor-recovery-codes');
        recoveryCodes.value = response.data.data.recovery_codes;
        notificationService.success(response.data.data.message || t('account_settings.recovery_codes_success'))
        
    } catch (error) {
        // toast.error('Failed to get recovery codes');
        console.error(error);
    } finally {
        loading.value = false;
        if (typeof setLoading === "function") {
            setLoading(false);
        }
    }
};
const handleTabEvent = (event) => {
  try {
    // Logic xử lý tab
    console.log(event.detail);
  } catch (error) {
    console.error('Tab event error:', error);
  }
};

const handleAsyncAction = async () => {
  try {
    await someAsyncCall();
  } catch (error) {
    console.error('Async error:', error);
  }
};
onMounted(() => {
    check2FAStatus();
});
const emit = defineEmits(['tab-event']);

</script>

<style scoped>
/* Custom styles if needed */
</style>