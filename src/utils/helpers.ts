export const getInitials = (name: string): string => {
  if (!name) return ''
  
  const names = name.trim().split(' ')
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase()
  }
  
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
}

export const formatDate = (date: string | Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const capitalizeFirst = (str: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// composables/useTeamManagement.ts
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTeamStore } from '@/stores/team'
import { useUserStore } from '@/stores/user'
import type { Team, TeamMember, User, SelectOption } from '@/types/team'

export const useTeamManagement = (team: Team) => {
  const { t } = useI18n()
  const teamStore = useTeamStore()
  const userStore = useUserStore()

  const selectedUserId = ref<string | null>(null)
  const selectedRole = ref<'member' | 'lead' | 'owner'>('member')
  const teamMembers = ref<TeamMember[]>([])
  const availableUsers = ref<SelectOption[]>([])
  const loadingUsers = ref(false)
  const loadingMembers = ref(false)
  const isAddingMember = ref(false)
  const isRemovingMember = ref<string | null>(null)
  const isUpdatingRole = ref<string | null>(null)
  const error = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const currentUserId = computed(() => userStore.currentUser?.id)

  const roleOptions = computed(() => [
    { value: 'member', label: t('roles.member') },
    { value: 'lead', label: t('roles.lead') },
    { value: 'owner', label: t('roles.owner') }
  ])

  const fetchMembers = async (): Promise<void> => {
    try {
      loadingMembers.value = true
      teamMembers.value = await teamStore.fetchTeamMembers(team.id)
      error.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('teams.errors.fetch_members_failed')
    } finally {
      loadingMembers.value = false
    }
  }

  const fetchAvailableUsers = async (): Promise<void> => {
    try {
      loadingUsers.value = true
      const users = await userStore.fetchUsers()
      
      // Filter out users already in the team
      availableUsers.value = users
        .filter((user: { id: any }) => !teamMembers.value.some((member: { id: any }) => member.id === user.id))
        .map((user: { id: any; name: any; email: any }) => ({
          value: user.id,
          label: user.name,
          subLabel: user.email
        }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('teams.errors.fetch_users_failed')
    } finally {
      loadingUsers.value = false
    }
  }

  const addMember = async (): Promise<void> => {
    if (!selectedUserId.value) return

    try {
      isAddingMember.value = true
      resetMessages()
      
      await teamStore.addTeamMember({
        teamId: team.id,
        userId: selectedUserId.value,
        role: selectedRole.value as 'member' | 'lead' | 'owner'
      })
      
      successMessage.value = t('teams.member_added_successfully')
      await fetchMembers()
      await fetchAvailableUsers()
      selectedUserId.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('teams.errors.add_member_failed')
    } finally {
      isAddingMember.value = false
    }
  }

  const removeMember = async (member: TeamMember): Promise<void> => {
    if (!confirm(t('teams.confirm_remove_member', { name: member.name }))) return

    try {
      isRemovingMember.value = member.id
      resetMessages()
      
      await teamStore.removeTeamMember({
        teamId: team.id,
        userId: member.id
      })
      
      successMessage.value = t('teams.member_removed_successfully')
      await fetchMembers()
      await fetchAvailableUsers()
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('teams.errors.remove_member_failed')
    } finally {
      isRemovingMember.value = null
    }
  }

  const updateMemberRole = async (member: TeamMember): Promise<void> => {
    try {
      isUpdatingRole.value = member.id
      resetMessages()
      
      await teamStore.updateTeamMemberRole({
        teamId: team.id,
        userId: member.id,
        role: member.role as 'member' | 'lead' | 'owner'
      })
      
      successMessage.value = t('teams.role_updated_successfully')
    } catch (err) {
      error.value = err instanceof Error ? err.message : t('teams.errors.update_role_failed')
      // Revert the role change in UI
      await fetchMembers()
    } finally {
      isUpdatingRole.value = null
    }
  }

  const resetMessages = (): void => {
    error.value = null
    successMessage.value = null
  }

  const resetForm = (): void => {
    selectedUserId.value = null
    selectedRole.value = 'member'
    resetMessages()
  }

  return {
    selectedUserId,
    selectedRole,
    teamMembers,
    availableUsers,
    loadingUsers,
    loadingMembers,
    isAddingMember,
    isRemovingMember,
    isUpdatingRole,
    error,
    successMessage,
    currentUserId,
    roleOptions,
    fetchMembers,
    fetchAvailableUsers,
    addMember,
    removeMember,
    updateMemberRole,
    resetMessages,
    resetForm
  }
}