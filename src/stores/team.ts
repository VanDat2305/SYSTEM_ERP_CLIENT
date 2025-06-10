import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Team, TeamMember, AddTeamMemberRequest, RemoveTeamMemberRequest, UpdateTeamMemberRoleRequest } from '@/types/team'
import { api } from "@/utils/api";

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([])
  const currentTeam = ref<Team | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchTeams = async (): Promise<Team[]> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get('/teams')
      
      if (response.data.status) {
        teams.value = response.data.data || response.data.teams || []
        return teams.value
      } else {
        throw new Error(response.data.message || 'Failed to fetch teams')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch teams'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.get(`/teams/${teamId}`)
      
      if (response.data.status) {
        return response.data.data.users || response.data.users || []
      } else {
        throw new Error(response.data.message || 'Failed to fetch team members')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch team members'
      throw err
    } finally {
      loading.value = false
    }
  }

  const addTeamMember = async (request: AddTeamMemberRequest): Promise<TeamMember> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post(`/teams/${request.teamId}/users`, {
        user_id: request.userId,
        role: request.role
      })
      
      if (response.data.status) {
        return response.data.data || response.data.member
      } else {
        throw new Error(response.data.message || 'Failed to add team member')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to add team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  const removeTeamMember = async (request: RemoveTeamMemberRequest): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.delete(`/teams/${request.teamId}/users/${request.userId}`)
      
      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to remove team member')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to remove team member'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeamMemberRole = async (request: UpdateTeamMemberRoleRequest): Promise<TeamMember> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(`/teams/${request.teamId}/users/${request.userId}`, {
        role: request.role
      })
      
      if (response.data.status) {
        return response.data.data || response.data.member
      } else {
        throw new Error(response.data.message || 'Failed to update member role')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update member role'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createTeam = async (teamData: Partial<Team>): Promise<Team> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.post('/teams', teamData)
      
      if (response.data.status) {
        const newTeam = response.data.data || response.data.team
        teams.value.push(newTeam)
        return newTeam
      } else {
        throw new Error(response.data.message || 'Failed to create team')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to create team'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateTeam = async (teamId: string, teamData: Partial<Team>): Promise<Team> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.put(`/teams/${teamId}`, teamData)
      
      if (response.data.status) {
        const updatedTeam = response.data.data || response.data.team
        
        // Update in local state
        const index = teams.value.findIndex((t: { id: string }) => t.id === teamId)
        if (index !== -1) {
          teams.value[index] = updatedTeam
        }
        
        return updatedTeam
      } else {
        throw new Error(response.data.message || 'Failed to update team')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to update team'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteTeam = async (teamId: string): Promise<void> => {
    try {
      loading.value = true
      error.value = null
      
      const response = await api.delete(`/teams/${teamId}`)
      
      if (response.data.status) {
        // Remove from local state
        teams.value = teams.value.filter((t: { id: string }) => t.id !== teamId)
      } else {
        throw new Error(response.data.message || 'Failed to delete team')
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || 'Failed to delete team'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    teams,
    currentTeam,
    loading,
    error,
    fetchTeams,
    fetchTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    createTeam,
    updateTeam,
    deleteTeam
  }
})