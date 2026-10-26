<script setup lang="ts">
const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)
const showPassword = ref(false)

async function signIn() {
  if (pending.value) return
  pending.value = true
  error.value = ''
  try {
    const { token } = await useNuxtApp().$api<{ token: string }>('/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    auth.setToken(token)
    await navigateTo('/')
  } catch (e) {
    error.value = (e as { data?: { message?: string } }).data?.message ?? 'Sign in failed'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="signin">
    <form class="card" @submit.prevent="signIn">
      <h1>Susi Air</h1>
      <p class="sub">Pilot sign in</p>
      <label>
        Username
        <input v-model="username" name="username" autocomplete="username" required />
      </label>
      <label>
        Password
        <span class="pw">
          <input v-model="password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required />
          <button type="button" class="toggle" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </span>
      </label>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button type="submit" :disabled="pending">
        {{ pending ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </main>
</template>

<style scoped lang="scss">
.signin {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.card {
  width: 100%;
  max-width: 380px;
  background: $surface;
  border-radius: $radius-card;
  box-shadow: $shadow-card;
  padding: 28px 24px;
  display: grid;
  gap: 14px;
}

h1 {
  color: $navy;
  font-size: 24px;
  font-weight: 800;
}

.sub {
  color: $text-secondary;
  font-size: 14px;
  margin-top: -10px;
}

label {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: $text-primary;
}

input {
  height: 48px;
  border: 1px solid #e2e5ea;
  border-radius: $radius-sm;
  padding: 0 14px;
  font: inherit;
  font-weight: 400;
  background: $surface;
  color: $text-primary;

  &:focus-visible {
    outline: 2px solid $navy;
    outline-offset: 1px;
  }
}

.pw {
  position: relative;
  display: block;
}

.pw input {
  width: 100%;
  padding-right: 76px;
}

.toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: $navy;
  font-size: 13px;
}

.error {
  color: $danger;
  font-size: 13px;
  font-weight: 700;
}

button {
  height: 48px;
  border: 0;
  border-radius: 999px;
  background: $navy;
  color: #fff;
  font-weight: 800;

  &:disabled {
    opacity: 0.6;
  }
}
</style>
