<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <VerticalTabs :tabs="tabs" :initial-tab="activeTab" @tab-changed="handleTabChange"
            @tab-event="handleTabEvent" />
    </AdminLayout>

</template>

<script setup>
import { ref, markRaw } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VerticalTabs from '@/components/tabs/VerticalTabs.vue';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import TwoFactorAuthentication from '@/modules/settings/components/TwoFactorAuthentication.vue';
import History from '@/modules/settings/components/History.vue';
import ChangePassword from '@/modules/settings/components/ChangePassword.vue';

import { useI18n } from 'vue-i18n';
const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const currentPageTitle = ref('account_settings_title');
const tabs = [
    {
        id: 'two-factor',
        label: 'account_settings.two_factor_authentication',
        component: markRaw(TwoFactorAuthentication),
    },
    {
        id: 'change-password',
        label: 'account_settings.change_password',
        component: markRaw(ChangePassword),
    },
    {
        id: 'history',
        label: 'account_settings.history.activity_history',
        component: markRaw(History),
    }
];

// Lấy tab từ query ?tab=...
const defaultTab = tabs.find(tab => tab.id === route.query.tab) ? route.query.tab : 'two-factor';
const activeTab = ref(defaultTab);

// Khi user chuyển tab → update URL
const handleTabChange = (newTabId) => {
  activeTab.value = newTabId;
  router.replace({ query: { ...route.query, tab: newTabId } });
};

const handleTabEvent = (event) => {
  // Xử lý logic khác nếu cần
};

</script>