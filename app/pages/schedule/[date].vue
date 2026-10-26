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

<style scoped lang="scss" src="./[date].scss"></style>
