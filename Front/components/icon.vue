<template>
  <svg :class="className" :viewBox="viewBox" :fill="fill">
    <slot />
  </svg>
</template>

<script>
export default {
  props: {
    className: { type: String, default: '' },
    viewBox: { type: String, default: '0 0 24 24' },
    fill: { type: String, default: 'currentColor' },
  },
};
</script>