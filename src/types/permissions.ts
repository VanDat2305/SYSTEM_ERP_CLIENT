// Định nghĩa tất cả các permission trong hệ thống
export const Permission = {
    DASHBOARD_VIEW: 'dashboard.view',
    USER_CREATE: 'user.create',
    USER_READ: 'user.read',
    USER_UPDATE: 'user.update',
    USER_DELETE: 'user.delete',
    ROLE_CREATE: 'role.create',
    ROLE_READ: 'role.read',
    ROLE_UPDATE: 'role.update',
    ROLE_DELETE: 'role.delete',
    FILE_UPLOAD: 'files.upload',
    FILE_DOWNLOAD: 'files.download',
    FILE_DELETE: 'files.delete',
    FILE_VIEW: 'files.view',
    FILE_UPADTE: 'files.update',
    FILe_CREATE: 'files.create',
    FOLDER_CREATE: 'folders.create',
    FOLDER_DELETE: 'folders.delete'

  } as const;

  export interface MenuItem {
    title: string;
    icon?: string;
    routeName?: string; // Sử dụng routeName thay vì route
    permission?: string;
    isDefault?: boolean;
    children?: MenuItem[];
  }
  
  export type Menu = MenuItem[];
  
  export type PermissionKeys = keyof typeof Permission;
  export type PermissionValues = typeof Permission[PermissionKeys];