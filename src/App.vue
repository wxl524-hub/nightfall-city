<template>
  <div id="app" class="min-h-screen bg-bg-dark text-text-primary" @click="onFirstClick">
    <router-view />
    <!-- 全局设置按钮 -->
    <button
      @click="showSettings = true"
      class="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-bg-panel border border-color-border hover:border-accent text-text-secondary hover:text-accent transition-all flex items-center justify-center z-40"
      title="设置"
    >
      ⚙
    </button>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { audioManager } from './services/AudioManager';
import SettingsModal from './components/ui/SettingsModal.vue';

const showSettings = ref(false);
let firstClickDone = false;

// 用户首次交互时初始化 AudioContext（浏览器安全策略）
function onFirstClick() {
  if (firstClickDone) return;
  firstClickDone = true;
  audioManager.init();
}
</script>

<style>
#app {
  min-height: 100vh;
}

/* 减弱动效：尊重用户偏好 */
.reduced-motion *,
.reduced-motion *::before,
.reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}
</style>
