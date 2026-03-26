<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import type { AxiosError } from 'axios'

const auth = useAuthStore()
const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const isForced = auth.mustChangePassword

async function handleSubmit() {
  error.value = ''
  success.value = ''

  if (newPassword.value.length < 6) {
    error.value = '新密碼至少需要 6 個字元'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    error.value = '新密碼與確認密碼不一致'
    return
  }

  loading.value = true
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    success.value = '密碼修改成功'
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    setTimeout(() => router.push('/'), 1500)
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>
    error.value = e.response?.data?.message || '密碼修改失敗'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="change-pwd-page">
    <div class="change-pwd-card">
      <h2>修改密碼</h2>
      <p v-if="isForced" class="forced-notice">首次登入請先修改密碼後才能繼續使用</p>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="current-pwd">目前密碼</label>
          <input id="current-pwd" v-model="currentPassword" type="password" autocomplete="current-password" required />
        </div>
        <div class="field">
          <label for="new-pwd">新密碼</label>
          <input id="new-pwd" v-model="newPassword" type="password" autocomplete="new-password" required />
        </div>
        <div class="field">
          <label for="confirm-pwd">確認新密碼</label>
          <input id="confirm-pwd" v-model="confirmPassword" type="password" autocomplete="new-password" required />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>
        <div class="form-actions">
          <button v-if="!isForced" type="button" class="btn btn-outline" @click="router.push('/')">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            {{ loading ? '處理中...' : '修改密碼' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.change-pwd-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.change-pwd-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 4px 24px rgba(61, 46, 34, 0.08);

  h2 {
    margin: 0 0 0.5rem;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 1.3rem;
  }
}

.forced-notice {
  color: var(--color-danger);
  font-size: 0.88rem;
  margin-bottom: 1.2rem;
  padding: 0.6rem 0.8rem;
  background: rgba(192, 57, 43, 0.06);
  border-radius: 8px;
}

.field {
  margin-bottom: 1rem;

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
      box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.12);
    }
  }
}

.error {
  color: var(--color-danger);
  font-size: 0.85rem;
}

.success {
  color: #27ae60;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
