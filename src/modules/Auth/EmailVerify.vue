<template>
  <div class="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
    <common-grid-shape />

    <div class="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
      <div class="mx-auto mb-10 w-full max-w-[100px] text-center sm:max-w-[160px]">
        <img
          v-if="status === 'success'"
          src="/images/error/success.svg"
          alt="Success"
          class="dark:hidden"
        />
        <img
          v-if="status === 'success'"
          src="/images/error/success-dark.svg"
          alt="Success"
          class="hidden dark:block"
        />

        <!-- <img
          v-if="status === 'error'"
          src="/images/error/error.svg"
          alt="Error"
          class="dark:hidden"
        />
        <img
          v-if="status === 'error'"
          src="/images/error/error-dark.svg"
          alt="Error"
          class="hidden dark:block"
        /> -->
      </div>

      <h1 class="mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
        {{ title }}
      </h1>

      <p class="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
        {{ message }}
      </p>

      <router-link
        to="/signin"
        class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
      >
        {{ t("forgot_password.back_to") }}
      </router-link>
    </div>

    <p class="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
      &copy; {{ currentYear }} - ERPAdmin
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import CommonGridShape from "@/components/common/CommonGridShape.vue";
import api from "@/plugins/axios";

const { t } = useI18n();
const route = useRoute();

const currentYear = ref(new Date().getFullYear());
const status = ref("loading"); // loading | success | error
const message = ref("");
const title = ref("");

onMounted(async () => {
  const { id, hash } = route.params;
  const { expires, signature } = route.query;

  try {
    const res = await api.get(`/email/verify/${id}/${hash}`, {
      params: { expires, signature },
      withCredentials: true
    });
    status.value = "success";
    title.value = t("success");
    // title.value = t("pages.email_verify.success_title");
    message.value = res.data.message || t("pages.email_verify.success_message");
  } catch (error) {
    status.value = "error";
    title.value = t("error");
    
    message.value =
      error.response?.data?.message || t("pages.email_verify.failed_message");
  }
});
</script>
