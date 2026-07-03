<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { audioManager } from '../../services/AudioManager';

const emit = defineEmits(['close']);

const settings = reactive({
  soundEnabled: true,
  soundVolume: 0.5,
  typingSpeed: 28,
  reducedMotion: false
});

onMounted(() => {
  // 从 localStorage 恢复
  try {
    const saved = JSON.parse(localStorage.getItem('nightfall_settings'));
    if (saved) Object.assign(settings, saved);
  } catch {}
  applySettings();
});

function applySettings() {
  audioManager.setEnabled(settings.soundEnabled);
  audioManager.setVolume(settings.soundVolume);
  document.documentElement.style.setProperty('--typing-speed', settings.typingSpeed + 'ms');
  document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
}

watch(settings, () => {
  localStorage.setItem('nightfall_settings', JSON.stringify({ ...settings }));
  applySettings();
}, { deep: true });

function testSound() {
  audioManager.init();
  audioManager.playDiceRoll();
}

function resetDefaults() {
  settings.soundEnabled = true;
  settings.soundVolume = 0.5;
  settings.typingSpeed = 28;
  settings.reducedMotion = false;
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-bg-panel border border-color-border rounded-lg p-6 max-w-md w-full mx-4 gothic-border">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-gothic text-accent text-xl">设置</h3>
        <button @click="emit('close')" class="text-text-secondary hover:text-accent text-xl transition-colors">✕</button>
      </div>

      <div class="space-y-5">
        <!-- 音效 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-text-primary font-ui">音效</label>
            <button
              @click="settings.soundEnabled = !settings.soundEnabled"
              :class="[
                'w-12 h-6 rounded-full transition-colors relative',
                settings.soundEnabled ? 'bg-accent' : 'bg-bg-dark border border-color-border'
              ]"
            >
              <span
                :class="[
                  'absolute top-0.5 w-5 h-5 rounded-full transition-all',
                  settings.soundEnabled ? 'left-6 bg-primary' : 'left-0.5 bg-text-secondary'
                ]"
              />
            </button>
          </div>

          <div v-if="settings.soundEnabled" class="flex items-center gap-3 mt-2">
            <input
              v-model.number="settings.soundVolume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="flex-1 accent-accent"
            />
            <span class="text-text-secondary text-sm w-10 text-right">{{ Math.round(settings.soundVolume * 100) }}%</span>
            <button
              @click="testSound"
              class="text-xs px-2 py-1 bg-bg-dark border border-color-border rounded text-text-secondary hover:border-accent transition-colors"
            >
              🔊 试听
            </button>
          </div>
        </div>

        <!-- 打字速度 -->
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="text-text-primary font-ui">文字速度</label>
          </div>
          <div class="flex items-center gap-3">
            <input
              v-model.number="settings.typingSpeed"
              type="range"
              min="5"
              max="80"
              step="1"
              class="flex-1 accent-accent"
            />
            <span class="text-text-secondary text-sm w-16 text-right">
              {{ settings.typingSpeed <= 15 ? '极快' : settings.typingSpeed <= 30 ? '正常' : settings.typingSpeed <= 50 ? '慢' : '极慢' }}
            </span>
          </div>
        </div>

        <!-- 减弱动效 -->
        <div class="flex justify-between items-center">
          <div>
            <label class="text-text-primary font-ui">减弱动效</label>
            <p class="text-text-secondary text-xs mt-0.5">减少动画与音效</p>
          </div>
          <button
            @click="settings.reducedMotion = !settings.reducedMotion"
            :class="[
              'w-12 h-6 rounded-full transition-colors relative',
              settings.reducedMotion ? 'bg-accent' : 'bg-bg-dark border border-color-border'
            ]"
          >
            <span
              :class="[
                'absolute top-0.5 w-5 h-5 rounded-full transition-all',
                settings.reducedMotion ? 'left-6 bg-primary' : 'left-0.5 bg-text-secondary'
              ]"
            />
          </button>
        </div>

        <!-- 恢复默认 -->
        <div class="pt-2 border-t border-color-border">
          <button
            @click="resetDefaults"
            class="text-sm text-text-secondary hover:text-accent transition-colors"
          >
            恢复默认设置
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
