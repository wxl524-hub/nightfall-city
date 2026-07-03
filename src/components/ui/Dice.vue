<script setup>
import { ref, computed } from 'vue';
import { useDice } from '../../composables/useDice';

const props = defineProps({
  type: {
    type: String,
    default: 'd20',
    validator: (value) => ['d20', 'd12', 'd10', 'd8', 'd6'].includes(value)
  },
  disabled: Boolean,
  animated: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['roll']);

const { rollD20, rollD6, rollD12, isRolling, lastResult } = useDice();

const diceValue = computed(() => lastResult.value?.value || '?');
const isCritical = computed(() => lastResult.value?.isCritical);
const isFumble = computed(() => lastResult.value?.isFumble);

async function handleRoll() {
  if (props.disabled || isRolling.value) return;
  
  let result;
  if (props.type === 'd20') {
    result = await rollD20();
  } else if (props.type === 'd12') {
    result = { value: rollD12(), isCritical: false, isFumble: false };
  } else if (props.type === 'd6') {
    result = { value: rollD6(), isCritical: false, isFumble: false };
  }
  
  if (result) {
    emit('roll', result);
  }
}
</script>

<template>
  <div class="dice-container flex flex-col items-center gap-3">
    <div
      :class="[
        'w-20 h-20 rounded-lg flex items-center justify-center text-3xl font-bold',
        'bg-bg-panel border-2 border-color-border-accent',
        'transition-all duration-300 cursor-pointer select-none',
        {
          'animate-dice-roll': isRolling && animated,
          'hover:border-accent hover:shadow-lg hover:shadow-accent/30': !disabled && !isRolling,
          'opacity-50 cursor-not-allowed': disabled,
          'bg-accent text-primary animate-pulse-glow': isCritical && !isRolling,
          'bg-secondary text-white': isFumble && !isRolling
        }
      ]"
      :disabled="disabled"
      @click="handleRoll"
    >
      <span class="font-gothic">{{ diceValue }}</span>
    </div>
    
    <button
      v-if="!isRolling"
      class="px-4 py-2 bg-accent text-primary font-ui uppercase tracking-wider rounded hover:bg-yellow-500 transition-colors"
      :disabled="disabled"
      @click="handleRoll"
    >
      掷{{ type }}
    </button>
    
    <div v-else class="text-text-secondary font-ui animate-pulse">
      掷骰中...
    </div>
  </div>
</template>

<style scoped>
@keyframes dice-roll {
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(90deg) scale(1.1); }
  50% { transform: rotate(180deg) scale(1); }
  75% { transform: rotate(270deg) scale(1.1); }
  100% { transform: rotate(360deg) scale(1); }
}

.animate-dice-roll {
  animation: dice-roll 0.5s ease-out;
}
</style>
