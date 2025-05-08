import type { RouteRecordRaw } from 'vue-router';

const systemRoutes: Array<RouteRecordRaw> = [
    {
        path: '/system/roles',
        name: 'system.roles',
        component: () => import('@/modules/system/role/views/RoleView.vue'),
        meta: { 
            title: 'menu.roles',
            requiresAuth: true, permissions: ['roles.read'] 
        },
    },
];

export default systemRoutes;
