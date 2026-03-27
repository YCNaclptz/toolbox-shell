<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { AxiosError } from 'axios'

const auth = useAuthStore()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>
    error.value = e.response?.data?.message || '登入失敗，請檢查帳號密碼'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>個人工具平台</h1>
      <p class="subtitle">請登入以繼續</p>
      <form @submit.prevent="handleLogin">
        <div class="field">
          <label for="username">帳號</label>
          <input id="username" v-model="username" type="text" autocomplete="username" required autofocus />
        </div>
        <div class="field">
          <label for="password">密碼</label>
          <input id="password" v-model="password" type="password" autocomplete="current-password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '登入中...' : '登入' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.login-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 4px 24px var(--color-shadow);
  text-align: center;

  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.25rem;
    color: var(--color-primary);
    font-weight: 700;
  }
}

.subtitle {
  color: var(--color-muted);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.field {
  margin-bottom: 1rem;
  text-align: left;

  label {
    display: block;
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
    color: var(--color-muted);
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    font-size: 1rem;
    box-sizing: border-box;
    background: var(--color-bg);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-focus-ring);
    }
  }
}

.error {
  color: var(--color-danger);
  font-size: 0.85rem;
}
</style>
