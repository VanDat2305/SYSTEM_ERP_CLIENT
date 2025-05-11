import type { RouteRecordRaw } from 'vue-router';

const settingRouters: Array<RouteRecordRaw> = [
    {
        path: '/settings/account',
        name: 'settings.account',
        component: () => import('@/modules/settings/views/AccountPanel.vue'),
        meta: { 
            title: 'menu.account',
            requiresAuth: true, permissions: ['account.panel'] 
        },
    },
];

export default settingRouters;
