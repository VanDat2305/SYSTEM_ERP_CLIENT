// src/types/activityLog.d.ts
declare module '@/types/activityLog' {
  export interface ActivityLog {
    id: number
    log_name: string
    description: string
    subject_id: string | null
    subject_type: string | null
    event: string | null
    causer_id: string | null
    causer_type: string | null
    properties: {
      ip: string
      user_agent: string
      note?: string
      roles?: string[]
      permissions?: string[]
      old_attributes?: Record<string, any>
      changed_attributes?: Record<string, any>
    }
    batch_uuid: string | null
    created_at: string
    updated_at: string
    causer?: {
      id: string
      name: string
      email: string
      email_verified_at: string | null
      remember_token: string | null
      created_at: string
      updated_at: string
      status: string
      last_login_at: string | null
      two_factor_enabled: number
    } | null
  }

  export interface ActivityLogResponse {
    status: boolean
    data: {
      items: ActivityLog[]
      pagination: {
        current_page: number
        per_page: number
        total: number
        last_page: number
      }
    }
    message: string
    errors: any[]
    code: number
  }
}