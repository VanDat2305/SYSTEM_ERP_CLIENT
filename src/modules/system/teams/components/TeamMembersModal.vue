<template>
  <BaseModal :show="show" :close="closeModal" size="xl" :closeOnClickOutside="false">
    <template #header>
      <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
        {{ t('teams.manage_members') }} - {{ team?.name }}
      </h3>
    </template>

    <template #body>
      <div class="mx-4">
        <!-- Add Member Section -->
        <div class="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">
            {{ t('teams.add_member') }}
          </h4>
          <div class="flex gap-3">
            <div class="flex-1">
              <SelectSearch v-model="selectedUserId" :options="availableUsers" :placeholder="t('teams.select_user')"
                :search-placeholder="t('common.search')" size="sm" :loading="loadingUsers" />
            </div>
            <div class="flex gap-2">
              <select v-model="selectedRole"
                class="w-32 text-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button @click="addMember" :disabled="!selectedUserId || isAddingMember"
                class="px-4 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isAddingMember ? t('common.adding') : t('common.add') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Current Members -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ t('teams.current_members') }} ({{ teamMembers.length }})
            </h4>
            <button @click="fetchMembers" class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              :title="t('common.refresh')">
              <RefreshIcon class="h-4 w-4" />
            </button>
          </div>

          <!-- Members List -->
          <div v-if="loadingMembers" class="text-center py-4">
            <span class="text-sm text-gray-500">{{ t('common.loading') }}...</span>
          </div>

          <div v-else-if="teamMembers.length === 0" class="text-center py-4">
            <span class="text-sm text-gray-500">{{ t('teams.no_members') }}</span>
          </div>

          <div v-else class="space-y-2 max-h-60 overflow-y-auto">
            <div v-for="member in teamMembers" :key="member.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center space-x-3 flex-1">
                <div class="flex-shrink-0">
                  <div class="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span class="text-xs font-medium text-blue-600 dark:text-blue-300">
                      {{ getInitials(member.name) }}
                    </span>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ member.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ member.email }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <select v-if="member.id !== currentUserId" v-model="member.pivot.role"
                    @change="updateMemberRole(member)" :disabled="isUpdatingRole === member.id"
                    class="w-34 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option v-for="option in roleOptions" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <span v-else class="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                    {{ member.role }}
                  </span>
                </div>
              </div>
              <button v-if="member.id !== currentUserId" @click="showDeleteMemberModalFunction(member)"
                :disabled="isRemovingMember === member.id"
                class="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 disabled:opacity-50 ml-2"
                :title="t('teams.remove_member')">
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <!-- <div v-if="successMessage" class="mt-4 rounded-md bg-green-50 dark:bg-green-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
                {{ t('common.success') }}
              </h3>
              <div class="mt-2 text-xs text-green-700 dark:text-green-300">
                <p>{{ successMessage }}</p>
              </div>
            </div>
          </div>
        </div> -->

        <!-- Error Message -->
        <!-- <div v-if="error" class="mt-4 rounded-md bg-red-50 dark:bg-red-900/30 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
                {{ t('common.error') }}
              </h3>
              <div class="mt-2 text-xs text-red-700 dark:text-red-300">
                <p>{{ error }}</p>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button type="button" @click="closeModal"
          class="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
          {{ t('common.close') }}
        </button>
      </div>
    </template>
  </BaseModal>
  <ConfirmModal :show="showDeleteMemberModal" :close="closeDeleteModal" :onConfirm="confirmDelete" type="danger"
    :closeOnClickOutside="false" :title="t('common.confirm')" :message="t('common.confirm_delete')"
    :confirmText="t('common.yes')" :cancelText="t('common.no')" />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { TrashIcon, RefreshIcon } from '@/icons'
import SelectSearch from '@/components/forms/SelectSearch.vue'
// import Select from '@/components/forms/formsElements/SelectInput.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import { getInitials } from '@/utils/helpers'
import { useTeamStore } from '@/stores/team'
import { useUserStore } from '@/stores/user'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { notificationService } from '@/services/notification'


const props = defineProps({
  show: Boolean,
  team: Object,
  categorySystem: {
    type: Object
  }
})

const emit = defineEmits(['close'])

const { t } = useI18n()
const teamStore = useTeamStore()
const userStore = useUserStore()

const selectedUserId = ref(null)
const selectedRole = ref('member')
const teamMembers = ref([])
const availableUsers = ref([])
const loadingUsers = ref(false)
const loadingMembers = ref(false)
const isAddingMember = ref(false)
const isRemovingMember = ref(null)
const isUpdatingRole = ref(null)
const error = ref(null)
const successMessage = ref(null)
const currentUserId = computed(() => userStore.currentUser?.id)

const roleOptions = ref([]);

const showDeleteMemberModal = ref(false)
const closeDeleteModal = () => {
  showDeleteMemberModal.value = false
}
const selectedMember = ref(null)

const confirmDelete = () => {
  removeMember(selectedMember.value)
  showDeleteMemberModal.value = false
}

const showDeleteMemberModalFunction = (member) => {
  selectedMember.value = member
  showDeleteMemberModal.value = true
}

watch(() => props.show, (show) => {
  if (show) {
    fetchMembers()
    fetchAvailableUsers()
    resetMessages()
  }
})
watch(() => props.categorySystem, (newSystem) => {
  roleOptions.value = newSystem.getItemsByTypeCode('role_team_option').map((item) => ({
    label: item.name,
    value: item.code
  }));
}, { immediate: true })

const fetchMembers = async () => {
  try {
    loadingMembers.value = true
    teamMembers.value = await teamStore.fetchTeamMembers(props.team.id)
    error.value = null
  } catch (err) {
    error.value = err.message || t('teams.errors.fetch_members_failed')
  } finally {
    loadingMembers.value = false
  }
}

const fetchAvailableUsers = async () => {
  try {
    loadingUsers.value = true
    const users = await userStore.fetchUsers()
    availableUsers.value = users
      .filter(user => !teamMembers.value.some(member => member.id === user.id))
      .map(user => ({
        value: user.id,
        label: user.name + ' - ' + user.email,
        subLabel: user.email
      }))


  } catch (err) {
    error.value = err.message || t('teams.messages.fetch_users_failed')
  } finally {
    loadingUsers.value = false
  }
}

const addMember = async () => {
  if (!selectedUserId.value) return

  try {
    isAddingMember.value = true
    resetMessages()

    await teamStore.addTeamMember({
      teamId: props.team.id,
      userId: selectedUserId.value,
      role: selectedRole.value
    })
    notificationService.success(t('teams.messages.member_added_successfully'))
    // successMessage.value = t('teams.messages.member_added_successfully')
    await fetchMembers()
    await fetchAvailableUsers()
    selectedUserId.value = null
  } catch (err) {
    error.value = err.message || t('teams.messages.add_member_failed')
    notificationService.error(error)
  } finally {
    isAddingMember.value = false
  }
}

const removeMember = async (member) => {
  try {
    isRemovingMember.value = member.id
    resetMessages()

    await teamStore.removeTeamMember({
      teamId: props.team.id,
      userId: member.id
    })
    notificationService.success(t('teams.messages.member_removed_successfully'))
    // successMessage.value = t('teams.messages.member_removed_successfully')
    await fetchMembers()
    await fetchAvailableUsers()
  } catch (err) {
    error.value = err.message || t('teams.messages.remove_member_failed')
    notificationService.error(error)
  } finally {
    isRemovingMember.value = null
  }
}

const updateMemberRole = async (member) => {
  try {
    isUpdatingRole.value = member.id
    resetMessages()

    await teamStore.updateTeamMemberRole({
      teamId: props.team.id,
      userId: member.id,
      role: member.pivot.role
    })

    // successMessage.value = t('teams.messages.role_updated_successfully')
    notificationService.success(t('teams.messages.role_updated_successfully'))
  } catch (err) {
    // error.value = err.message || t('teams.messages.update_role_failed')
    notificationService.error(error)
    // Revert the role change in UI
    await fetchMembers()
  } finally {
    isUpdatingRole.value = null
  }
}

const resetMessages = () => {
  error.value = null
  successMessage.value = null
}

const closeModal = () => {
  resetMessages()
  selectedUserId.value = null
  teamMembers.value = []
  availableUsers.value = []
  emit('close')
}
</script>
