<template>
  <nav aria-label="Primary">
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/schedule">Schedule</NuxtLink>
  </nav>
</template>

<style scoped lang="scss">
nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: $surface;
  border-top: 1px solid #e2e5ea;
  padding-bottom: env(safe-area-inset-bottom);
}

a {
  flex: 1;
  padding: 16px 0;
  text-align: center;
  text-decoration: none;
  color: $text-secondary;
  font-size: 14px;
  font-weight: 700;

  &.router-link-exact-active {
    color: $navy;
  }
}
</style>
