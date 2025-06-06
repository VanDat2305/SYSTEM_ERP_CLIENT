import { defineStore } from 'pinia';
import { api } from '@/utils/api';

const LOCAL_KEY = 'categorySystem';

export const useCategorySystem = defineStore('categorySystem', {
  state: () => ({
    categories: [] as {
      type: {
        id: string;
        code: string;
        name: string;
      };
      items: any[];
    }[],
    loaded: false,
  }),

  actions: {
    /**
     * Ưu tiên lấy từ localStorage, nếu không có thì gọi API
     */
    async initCategories() {
      const fromStorage = localStorage.getItem(LOCAL_KEY);
      if (fromStorage) {
        try {
          this.categories = JSON.parse(fromStorage);
          this.loaded = true;
          return;
        } catch (e) {
          console.warn(' Failed to parse localStorage categories:', e);
        }
      }

      await this.fetchCategories();
    },

    async fetchCategories() {
      try {
        const res = await api('/objects-cache');
        const json = await res.data;
        this.categories = json.data;
        this.loaded = true;
        localStorage.setItem(LOCAL_KEY, JSON.stringify(this.categories));
      } catch (e) {
        console.error(' Failed to fetch categories:', e);
      }
    },

    setCategories(data: any[]) {
      this.categories = data;
      this.loaded = true;
      localStorage.setItem(LOCAL_KEY, JSON.stringify(this.categories));
    },

    clearCategories() {
      this.categories = [];
      this.loaded = false;
      localStorage.removeItem(LOCAL_KEY);
    },
  },

  getters: {
    getItemsByTypeCode: (state) => {
      return (code: string) => {
        if (!state.loaded) return [];
        const found = state.categories.find((c) => c.type.code === code);
        return found?.items ?? [];
      };
    },
    getAllItemsByCodes: (state) => {
      return (codes: string[]) => {
        const result: Record<string, any[]> = {};
        for (const code of codes) {
          const match = state.categories.find((c) => c.type.code === code);
          if (match) result[code] = match.items;
        }
        return result;
      };
    },
  },
});
