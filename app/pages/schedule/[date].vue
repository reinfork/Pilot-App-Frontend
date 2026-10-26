<script setup lang="ts">
const date = computed(() => String(useRoute().params.date))
</script>

<template>
  <main class="detail">
    <NuxtLink to="/schedule">‹ Schedule</NuxtLink>
    <h1>{{ date }}</h1>
    <p>Logbook entry coming soon.</p>
    <BottomNav />
  </main>
</template>

<style scoped lang="scss">
.detail {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 96px;
  display: grid;
  gap: 10px;

  a {
    color: $navy;
    font-weight: 800;
    text-decoration: none;
  }

  h1 {
    color: $navy;
    font-size: 22px;
    font-weight: 800;
  }

  p {
    color: $text-secondary;
    font-size: 14px;
  }
}
</style>
