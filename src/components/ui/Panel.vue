<script setup>
defineProps({
  title: String,
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'dark', 'accent'].includes(value)
  }
});
</script>

<template>
  <div
    :class="[
      'rounded-lg border-2 p-4',
      {
        'bg-bg-panel border-color-border': props.variant === 'default' || !props.variant,
        'bg-primary border-secondary': props.variant === 'dark',
        'bg-bg-panel border-accent': props.variant === 'accent'
      }
    ]"
  >
    <div v-if="title" class="mb-3 border-b border-color-border pb-2">
      <h3 class="font-gothic text-lg text-text-accent">{{ title }}</h3>
    </div>
    <slot />
  </div>
</template>
