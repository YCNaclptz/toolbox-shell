<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { UserInfo } from '../stores/auth'
import type { AxiosError } from 'axios'

const auth = useAuthStore()
const users = ref<UserInfo[]>([])
const loading = ref(false)
const showForm = ref(false)

const form = ref({ username: '', displayName: '', password: '', role: 'User' })
const formError = ref('')
const formLoading = ref(false)

async function loadUsers() {
  loading.value = true
  try {
    users.value = await auth.fetchUsers()
  } finally {
    loading.value = false
  }
}

function openForm() {
  form.value = { username: '', displayName: '', password: '', role: 'User' }
  formError.value = ''
  showForm.value = true
}

async function handleRegister() {
  formError.value = ''
  if (!form.value.username || !form.value.password || !form.value.displayName) {
    formError.value = '請填寫所有欄位'
    return
  }
  if (form.value.password.length < 6) {
    formError.value = '密碼至少需要 6 個字元'
    return
  }
  formLoading.value = true
  try {
    await auth.register(form.value)
    showForm.value = false
    await loadUsers()
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>
    formError.value = e.response?.data?.message || '建立使用者失敗'
  } finally {
    formLoading.value = false
  }
}

function roleName(role: string) {
  return role === 'Admin' ? '管理員' : '一般使用者'
}

onMounted(loadUsers)
</script>

<template>
  <div class="user-mgmt">
    <div class="page-header">
      <h2>使用者管理</h2>
      <button class="btn btn-primary" @click="openForm">新增使用者</button>
    </div>

    <p v-if="loading" class="loading-text">載入中...</p>

    <div v-else class="user-list">
      <div v-for="u in users" :key="u.id" class="user-card">
        <div class="user-info">
          <span class="user-display-name">{{ u.displayName }}</span>
          <span class="user-username">@{{ u.username }}</span>
        </div>
        <div class="user-meta">
          <span :class="['role-badge', u.role === 'Admin' ? 'role-admin' : 'role-user']">{{ roleName(u.role) }}</span>
          <span v-if="u.mustChangePassword" class="pwd-flag">待改密碼</span>
        </div>
      </div>
      <p v-if="!users.length" class="empty-text">尚無使用者</p>
    </div>

    <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
      <div class="modal-card">
        <h3>新增使用者</h3>
        <form @submit.prevent="handleRegister">
          <div class="field">
            <label>帳號</label>
            <input v-model="form.username" type="text" required autofocus />
          </div>
          <div class="field">
            <label>顯示名稱</label>
            <input v-model="form.displayName" type="text" required />
          </div>
          <div class="field">
            <label>密碼</label>
            <input v-model="form.password" type="password" required />
          </div>
          <div class="field">
            <label>角色</label>
            <div class="role-options">
              <button type="button" :class="['chip', { active: form.role === 'User' }]" @click="form.role = 'User'">一般使用者</button>
              <button type="button" :class="['chip', { active: form.role === 'Admin' }]" @click="form.role = 'Admin'">管理員</button>
            </div>
          </div>
          <p v-if="formError" class="error">{{ formError }}</p>
          <div class="form-actions">
            <button type="button" class="btn btn-outline" @click="showForm = false">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="formLoading">
              {{ formLoading ? '建立中...' : '建立' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.user-mgmt {
  max-width: 600px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.2rem;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: var(--color-primary);
    font-weight: 700;
  }
}

.loading-text,
.empty-text {
  text-align: center;
  color: var(--color-muted);
  padding: 2rem 0;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-card {
  background: var(--color-card);
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(61, 46, 34, 0.05);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(61, 46, 34, 0.1);
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.user-display-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.user-username {
  font-size: 0.8rem;
  color: var(--color-muted);
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.role-badge {
  font-size: 0.78rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-weight: 500;
}

.role-admin {
  background: rgba(166, 124, 82, 0.12);
  color: var(--color-primary);
}

.role-user {
  background: rgba(156, 139, 122, 0.12);
  color: var(--color-muted);
}

.pwd-flag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  background: rgba(192, 57, 43, 0.08);
  color: var(--color-danger);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(61, 46, 34, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 1rem;
  backdrop-filter: blur(2px);
}

.modal-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 1.8rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(61, 46, 34, 0.15);

  h3 {
    margin: 0 0 1.2rem;
    color: var(--color-primary);
    font-weight: 600;
  }
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
    padding: 0.6rem 0.8rem;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    font-size: 0.95rem;
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

.role-options {
  display: flex;
  gap: 0.5rem;
}

.chip {
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  border: 1px solid var(--color-border);
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s, border-color 0.2s, color 0.2s;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  &.active {
    background: var(--color-primary);
    color: #fff;
    border-color: var(--color-primary);
  }
}

.error {
  color: var(--color-danger);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>
