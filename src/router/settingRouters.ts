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
    {
        path: '/settings/dynamic-lists',
        name: 'settings.dynamiclists',
        component: () => import('@/modules/settings/dynamiclists/DynamicView.vue'),
        meta: { 
            title: 'menu.dynamiclists',
            requiresAuth: true, permissions: ['objects.view'] 
        },
    },
];

export default settingRouters;
