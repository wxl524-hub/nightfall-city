<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue';

const props = defineProps({
  scene: Object,
  bonusInfo: {
    type: String,
    default: ''
  },
  typingSpeed: {
    type: Number,
    default: 28
  }
});

const emit = defineEmits(['complete', 'choice']);

const displayText = ref('');
const isTyping = ref(false);
const showChoices = ref(false);
const boxEl = ref(null);
let typingTimer = null;

watch(
  () => props.scene,
  () => {
    startTyping();
  },
  { immediate: true }
);

function startTyping() {
  if (!props.scene) return;
  if (typingTimer) clearTimeout(typingTimer);

  displayText.value = '';
  isTyping.value = true;
  showChoices.value = false;

  // GSAP 容器淡入（尊重 reduced-motion）
  nextTick(() => {
    if (!boxEl.value) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    import('gsap').then(({ gsap }) => {
      gsap.fromTo(
        boxEl.value,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      );
    });
  });

  const text = props.scene.text || props.scene.narrative || '';

  if (!text) {
    isTyping.value = false;
    showChoices.value = true;
    return;
  }

  let i = 0;
  const tick = () => {
    if (i <= text.length) {
      displayText.value = text.slice(0, i);
      i++;
      typingTimer = setTimeout(tick, props.typingSpeed);
    } else {
      isTyping.value = false;
      showChoices.value = true;
    }
  };
  tick();
}

function handleSkipOrContinue() {
  if (isTyping.value) {
    // 点击立即显示全文
    if (typingTimer) clearTimeout(typingTimer);
    displayText.value = props.scene?.text || props.scene?.narrative || '';
    isTyping.value = false;
    showChoices.value = true;
  } else {
    // 无选项的场景：触发继续
    emit('complete');
  }
}

function handleChoice(choice) {
  emit('choice', choice);
}

onUnmounted(() => {
  if (typingTimer) clearTimeout(typingTimer);
});
</script>

<template>
  <div ref="boxEl" class="narrative-box bg-bg-panel/95 backdrop-blur-sm rounded-lg border border-color-border p-6 max-w-3xl mx-auto gothic-border">
    <div v-if="scene?.title" class="text-center mb-4">
      <h2 class="font-gothic text-accent text-xl">{{ scene.title }}</h2>
    </div>

    <div
      class="narrative-text font-body text-text-primary text-lg leading-relaxed min-h-[100px] cursor-pointer whitespace-pre-line"
      @click="handleSkipOrContinue"
    >
      {{ displayText }}
      <span v-if="isTyping" class="animate-blink">|</span>
    </div>

    <!-- 奖励信息 / 线索 -->
    <div v-if="bonusInfo && !isTyping" class="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
      <div class="flex items-start gap-2">
        <span class="text-accent">🔍</span>
        <div>
          <div class="text-accent text-sm font-bold mb-1">获得线索</div>
          <div class="text-text-primary text-sm">{{ bonusInfo }}</div>
        </div>
      </div>
    </div>

    <!-- 选项 -->
    <div v-if="showChoices && scene?.options?.length > 0" class="mt-6 space-y-3">
      <button
        v-for="choice in scene.options"
        :key="choice.id"
        class="w-full text-left px-4 py-3 bg-bg-dark border border-color-border hover:border-accent hover:bg-bg-hover transition-all duration-300 rounded-lg group"
        @click="handleChoice(choice)"
      >
        <span class="text-text-primary group-hover:text-accent transition-colors">
          {{ choice.text }}
        </span>
        <span v-if="choice.requirement" class="text-secondary text-xs ml-2">
          〔需检定〕
        </span>
        <span v-else-if="choice.requiredBackground" class="text-text-secondary text-xs ml-2">
          〔专属〕
        </span>
      </button>
    </div>

    <!-- 无选项：继续按钮 -->
    <div v-if="!isTyping && showChoices && (!scene?.options || scene.options.length === 0)" class="text-center mt-6">
      <button
        class="text-text-accent hover:text-yellow-400 transition-colors font-ui uppercase tracking-wider"
        @click="handleSkipOrContinue"
      >
        继续 ▶
      </button>
    </div>
  </div>
</template>
