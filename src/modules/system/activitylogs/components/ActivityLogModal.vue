<template>
    <BaseModal :show="isModalOpen" :close="closeModal" size="xl" :closeOnClickOutside="true"
        aria-labelledby="activity-log-details-title" >
        <template #header>
            <h3 id="activity-log-details-title" class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                {{ t('activity_logs.details') }}
            </h3>
        </template>

        <template #body>
            <div class="space-y-6 mx-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.name') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.log_name ? logData.log_name :
                                t('common.not_available') }}
                        </p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.description') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.description || t('common.not_available') }}
                        </p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.user') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.causer?.name || t('activity_logs.system') }}
                        </p>
                    </div>


                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.time') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.created_at ? formatDateTime(logData.created_at) : t('common.not_available') }}
                        </p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.ip') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.properties?.ip || t('common.not_available') }}
                        </p>
                    </div>

                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {{ t('activity_logs.fields.user_agent') }}
                        </label>
                        <p
                            class="mt-1 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            {{ logData?.properties?.user_agent || t('common.not_available') }}
                        </p>
                    </div>
                </div>

                <div v-if="logData?.properties?.changed_attributes" class="mt-4">
                    <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{ t('activity_logs.changes') }}
                    </h4>
                    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h5 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    {{ t('activity_logs.before') }}
                                </h5>
                                <pre class="text-xs text-gray-700 dark:text-gray-400 p-2 bg-white dark:bg-gray-700 rounded-lg overflow-x-auto">{{
                                    JSON.stringify(logData.properties.old_attributes || {}, null, 2)
                                }}</pre>
                            </div>
                            <div>
                                <h5 class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    {{ t('activity_logs.after') }}
                                </h5>
                                <pre class="text-xs text-gray-700 dark:text-gray-400 p-2 bg-white dark:bg-gray-700 rounded-lg overflow-x-auto">{{
                                    JSON.stringify(logData.properties.changed_attributes || {}, null, 2)
                                }}</pre>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="logData?.properties?.note" class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {{ t('activity_logs.note') }}
                    </label>
                    <p
                        class="mt-1 text-sm text-gray-900 dark:text-gray-200 whitespace-pre-line bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        {{ logData.properties.note }}
                    </p>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="flex justify-end">
                <Button type="button" variant="outline" @click="closeModal" size="md">
                    {{ t('common.close') }}
                </Button>
            </div>
        </template>
    </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from '@/components/modals/BaseModal.vue'
import Button from '@/components/ui/Button.vue'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true
    },
    logData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['close'])

const closeModal = () => {
    emit('close')
}

const formatDateTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}
</script>