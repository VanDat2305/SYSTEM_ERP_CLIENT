import type { RouteRecordRaw } from 'vue-router';

const systemRoutes: Array<RouteRecordRaw> = [
    {
        path: '/system/roles',
        name: 'SystemRole',
        component: () => import('@/modules/system/views/RoleView.vue'),
        meta: { requiresAuth: true, permissions: ['manage:roles'] },
    },
];

export default systemRoutes;
