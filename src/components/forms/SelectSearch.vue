<template>
  <div class="relative w-full" ref="dropdownRef">
    <!-- Trigger -->
      <div
        class="border px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed flex justify-between items-center"
        :class="[
          disabled ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800 cursor-pointer',
        ]"
        @click="!disabled && toggleDropdown()"
      >
      <span class="truncate text-xs text-gray-800 dark:text-gray-200">
        {{ selectedLabel || placeholder }}
      </span>
      <button
        v-if="clearable && modelValue"
        @click.stop="clearValue"
        class="ml-2 text-gray-400 hover:text-red-500 text-lg leading-none"
        aria-label="Clear"
      >
        ×
      </button>
    </div>

    <!-- Dropdown -->
    <div
      v-if="open"
      class="absolute mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10"
    >
      <!-- Search -->
      <input    
        v-model="searchQuery"
        type="text"
        class="w-full px-3 py-2 rounded-t-lg border-none text-xs focus:outline-none dark:bg-gray-700 dark:text-gray-100"
        :placeholder="searchPlaceholder"
      />

      <!-- Options -->
      <ul class="max-h-48 overflow-y-auto">
        <li
          v-for="option in filteredOptions"
          :key="option.value"
          @click="select(option)"
          class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-xs text-gray-700 dark:text-gray-100"
        >
          {{ option.label }}
        </li>

        <!-- Allow Custom -->
        <li
          v-if="allowCustom && searchQuery && !filteredOptions.length"
          @click="select({ value: searchQuery, label: searchQuery })"
          class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-xs italic text-blue-500"
        >
          Thêm mới: "{{ searchQuery }}"
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps<{
  options: { label: string; value: string }[],
  modelValue: string | null | undefined,
  disabled?: boolean,
  clearable?: boolean,
  allowCustom?: boolean,
  placeholder?: string,
  searchPlaceholder?: string
}>();

const emit = defineEmits(['update:modelValue']);

const open = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLElement | null>(null);

// Computed: Tìm label theo modelValue
const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue);
  return found?.label || '';
});

// Lọc danh sách theo input search
const filteredOptions = computed(() => {
  return props.options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Chọn option
const select = (option: { value: string, label: string }) => {
  emit('update:modelValue', option.value);
  open.value = false;
};

// Xóa chọn
const clearValue = () => {
  emit('update:modelValue', '');
  searchQuery.value = '';
};

// Toggle dropdown
const toggleDropdown = () => {
  if (!props.disabled) open.value = !open.value;
};

// Đóng khi click ngoài
const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
