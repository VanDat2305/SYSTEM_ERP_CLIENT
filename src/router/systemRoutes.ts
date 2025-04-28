import type { RouteRecordRaw } from 'vue-router';

const systemRoutes: Array<RouteRecordRaw> = [
    {
        path: '/system/roles',
        name: 'system.roles',
        component: () => import('@/modules/system/views/RoleView.vue'),
        meta: { requiresAuth: true, permissions: ['roles.read'] },
    },
];

export default systemRoutes;
