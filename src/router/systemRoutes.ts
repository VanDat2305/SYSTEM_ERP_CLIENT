import type { RouteRecordRaw } from 'vue-router';

const systemRoutes: Array<RouteRecordRaw> = [
    {
        path: '/system/roles',
        name: 'system.roles',
        component: () => import('@/modules/system/roles/views/RoleView.vue'),
        meta: { 
            title: 'menu.roles',
            requiresAuth: true, permissions: ['roles.view'] 
        },
    },
    {
        path: '/system/permissions',
        name: 'system.permissions',
        component: () => import('@/modules/system/permissions/views/PermissionView.vue'),
        meta: { 
            title: 'menu.permissions',
            requiresAuth: true, permissions: ['permissions.view'] 
        },
    },
    {
        path: '/system/users',
        name: 'system.users',
        component: () => import('@/modules/system/users/views/UserList.vue'),
        meta: { 
            title: 'menu.users',
            requiresAuth: true, permissions: ['users.view'] 
        },
    },
    {
        path: '/system/logs',
        name: 'system.logs',
        component: () => import('@/modules/system/activitylogs/views/ActivityLogView.vue'),
        meta: { 
            title: 'menu.activity_logs',
            requiresAuth: true, permissions: ['logs.view'] 
        },
    },
    
];

export default systemRoutes;
