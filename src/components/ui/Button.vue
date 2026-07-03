<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  disabled: Boolean
});

defineEmits(['click']);
</script>

<template>
  <button
    :class="[
      'font-ui uppercase tracking-wider transition-all duration-300 rounded',
      {
        'bg-accent text-primary hover:bg-yellow-500 hover:shadow-lg hover:shadow-accent/30': props.variant === 'primary',
        'bg-bg-panel text-text-primary hover:bg-bg-hover border border-color-border hover:border-accent': props.variant === 'secondary',
        'bg-secondary text-white hover:bg-red-800': props.variant === 'danger',
        'bg-transparent text-text-secondary hover:text-text-accent': props.variant === 'ghost',
        'px-4 py-2 text-sm': props.size === 'sm',
        'px-6 py-3 text-base': props.size === 'md',
        'px-8 py-4 text-lg': props.size === 'lg',
        'opacity-50 cursor-not-allowed': props.disabled
      }
    ]"
    :disabled="props.disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>
