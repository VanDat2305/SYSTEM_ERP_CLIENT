<template>
    <AdminLayout>
        <PageBreadcrumb :pageTitle="currentPageTitle" />
        <VerticalTabs :tabs="tabs" initial-tab="two-factor" @tab-changed="handleTabChange"
            @tab-event="handleTabEvent" />
    </AdminLayout>

</template>

<script setup>
import { ref, markRaw } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VerticalTabs from '@/components/tabs/VerticalTabs.vue';
import PageBreadcrumb from "@/components/common/PageBreadcrumb.vue"
import TwoFactorAuthentication from '@/modules/settings/components/TwoFactorAuthentication.vue';
import History from '@/modules/settings/components/History.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const currentPageTitle = ref('account_settings_title');
const tabs = [
    {
        id: 'two-factor',
        label: 'account_settings.two_factor_authentication',
        component: markRaw(TwoFactorAuthentication),
    },
    {
        id: 'history',
        label: 'account_settings.history.activity_history',
        component: markRaw(History),
    }
];

const handleTabEvent = (event) => {
  try {
    // Logic xử lý tab
    // console.log(event.detail);
  } catch (error) {
    // console.error('Tab event error:', error);
  }
};
const handleTabChange = (event) => {
  try {
    // Logic xử lý tab
    // console.log(event.detail);
  } catch (error) {
    // console.error('Tab event error:', error);
  }
};




</script>