<template>
    <div class="loading-overlay" v-if="isLoading">
        <!-- <div class="loading-spinner"></div> -->
        <span class="loader"></span>
    </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
    props: {
        isLoading: {
            type: Boolean as PropType<boolean>,
            required: true
        }
    }
});
</script>

<style scoped>
.loader {
    width: 50px;
    aspect-ratio: 1;
    border-radius: 50%;
    background:
        radial-gradient(farthest-side, #465FFF 94%, #0000) top/8px 8px no-repeat,
        conic-gradient(#0000 30%, #465FFF);
    -webkit-mask: radial-gradient(farthest-side, #0000 calc(100% - 8px), #000 0);
    animation: l13 1s infinite linear;
}

@keyframes l13 {
    100% {
        transform: rotate(1turn)
    }
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
}
</style>