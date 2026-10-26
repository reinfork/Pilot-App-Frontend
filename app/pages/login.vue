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

<style scoped lang="scss" src="./login.scss"></style>
