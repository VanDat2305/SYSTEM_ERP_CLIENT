<template>
    <div class="relative" ref="dropdownRef">
        <!-- Nút chọn ngôn ngữ -->
        <button
            class="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-dark-900 h-11 w-11 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            @click.prevent="toggleDropdown"
            @keydown.esc="dropdownOpen = false">
            <img :src="'/images/country/' + selectedFlag + '.svg'" alt="Selected flag" class="w-5 h-5 rounded-full" />
        </button>

        <!-- Dropdown -->
        <div v-if="dropdownOpen"
            class="absolute right-0 mt-3 w-40 rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-800 dark:bg-gray-dark">
            <ul class="flex flex-col gap-1">
                <li v-for="lang in translatedLanguages" :key="lang.code" @click="changeLanguage(lang)"
                    class="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <img :src="'/images/country/' + lang.flag + '.svg'" alt="" class="w-5 h-5 rounded-full" />
                    <span class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">{{ lang.label }}</span>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();
const dropdownOpen = ref(false);
const dropdownRef = ref(null);

const languages = ref([
  { code: 'en', flag: 'en_flag' },
  { code: 'vi', flag: 'vi_flag' }
]);

const translatedLanguages = computed(() => {
  return languages.value.map(lang => ({
    ...lang,
    label: t(`languages.${lang.code}`)
  }));
});

const selectedLanguage = computed(() =>
  languages.value.find(lang => lang.code === locale.value) || languages.value[0]
);

const selectedFlag = computed(() => selectedLanguage.value?.flag || 'en_flag');

const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
};

const changeLanguage = (lang) => {
    locale.value = lang.code;
    localStorage.setItem('lang', lang.code);
    dropdownOpen.value = false;
};

// Đóng dropdown khi click bên ngoài
const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        dropdownOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
button img {
    transition: transform 0.2s;
}

button:hover img {
    transform: scale(1.1);
}
</style>
