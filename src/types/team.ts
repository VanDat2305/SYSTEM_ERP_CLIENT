export interface User {
  id: string
  name: string
  email: string
  created_at?: string
  updated_at?: string
}

export interface TeamMember extends User {
  role: 'member' | 'lead' | 'owner'
  joined_at?: string
}

export interface Team {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  members_count?: number
  owner_id?: string
}

export interface AddTeamMemberRequest {
  teamId: string
  userId: string
  role: 'member' | 'lead' | 'owner'
}

export interface RemoveTeamMemberRequest {
  teamId: string
  userId: string
}

export interface UpdateTeamMemberRoleRequest {
  teamId: string
  userId: string
  role: 'member' | 'lead' | 'owner'
}

export interface SelectOption {
  value: string
  label: string
  subLabel?: string
}