<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import type { UserProfile } from '../stores/auth'
import type { AxiosError } from 'axios'

const auth = useAuthStore()

const profile = ref<UserProfile | null>(null)
const displayName = ref('')
const email = ref('')
const loading = ref(false)
const saving = ref(false)
const uploadingAvatar = ref(false)
const error = ref('')
const success = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const dragOver = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    profile.value = await auth.fetchProfile()
    displayName.value = profile.value.displayName
    email.value = profile.value.email || ''
  } catch {
    error.value = '無法載入使用者資料'
  } finally {
    loading.value = false
  }
})

function getInitials(name: string) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

async function handleSave() {
  error.value = ''
  success.value = ''

  if (!displayName.value.trim()) {
    error.value = '顯示名稱不能為空'
    return
  }

  saving.value = true
  try {
    const result = await auth.updateProfile({
      displayName: displayName.value.trim(),
      email: email.value.trim() || null,
    })
    success.value = result.message || '個人資料更新成功'
    if (profile.value) {
      profile.value.displayName = displayName.value.trim()
      profile.value.email = email.value.trim() || null
    }
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>
    error.value = e.response?.data?.message || '更新失敗'
  } finally {
    saving.value = false
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files?.[0]) {
    await uploadFile(input.files[0])
    input.value = ''
  }
}

function handleDrop(event: DragEvent) {
  dragOver.value = false
  const file = event.dataTransfer?.files[0]
  if (file) uploadFile(file)
}

async function uploadFile(file: File) {
  error.value = ''
  success.value = ''

  if (file.size > 2 * 1024 * 1024) {
    error.value = '檔案大小不能超過 2MB'
    return
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    error.value = '僅支援 JPEG、PNG、WebP 格式'
    return
  }

  uploadingAvatar.value = true
  try {
    const result = await auth.uploadAvatar(file)
    if (profile.value) {
      profile.value.avatarUrl = result.avatarUrl
    }
    success.value = '頭像上傳成功'
    setTimeout(() => success.value = '', 3000)
  } catch (err) {
    const e = err as AxiosError<{ message?: string }>
    error.value = e.response?.data?.message || '頭像上傳失敗'
  } finally {
    uploadingAvatar.value = false
  }
}

async function handleRemoveAvatar() {
  error.value = ''
  success.value = ''
  try {
    await auth.removeAvatar()
    if (profile.value) {
      profile.value.avatarUrl = null
    }
    success.value = '頭像已移除'
    setTimeout(() => success.value = '', 3000)
  } catch {
    error.value = '移除頭像失敗'
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-card">
      <h2>使用者資訊設定</h2>

      <div v-if="loading" class="loading-text">載入中...</div>

      <template v-else-if="profile">
        <!-- Avatar Section -->
        <div class="avatar-section">
          <div
            class="avatar-upload"
            :class="{ 'drag-over': dragOver }"
            @click="triggerFileSelect"
            @dragover.prevent="dragOver = true"
            @dragleave="dragOver = false"
            @drop.prevent="handleDrop"
          >
            <div class="avatar-large">
              <img v-if="auth.avatarUrl" :src="auth.avatarUrl" :alt="profile.displayName" class="avatar-img" />
              <span v-else class="avatar-fallback">{{ getInitials(profile.displayName) }}</span>
            </div>
            <div class="avatar-hint" v-if="!uploadingAvatar">
              點擊或拖曳上傳頭像
            </div>
            <div class="avatar-hint" v-else>上傳中...</div>
          </div>
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style="display: none"
            @change="handleFileSelect"
          />
          <button
            v-if="auth.avatarUrl"
            class="btn btn-sm btn-danger"
            @click="handleRemoveAvatar"
            type="button"
          >移除頭像</button>
          <p class="avatar-note">支援 JPEG、PNG、WebP，最大 2MB</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSave">
          <div class="field">
            <label for="display-name">顯示名稱</label>
            <input id="display-name" v-model="displayName" type="text" maxlength="100" required />
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" v-model="email" type="email" maxlength="255" placeholder="選填" />
          </div>

          <!-- Read-only Info -->
          <div class="readonly-section">
            <div class="readonly-row">
              <span class="readonly-label">帳號</span>
              <span class="readonly-value">{{ profile.username }}</span>
            </div>
            <div class="readonly-row">
              <span class="readonly-label">身分</span>
              <span class="readonly-value">{{ profile.role === 'Admin' ? '管理員' : '使用者' }}</span>
            </div>
            <div class="readonly-row">
              <span class="readonly-label">建立時間</span>
              <span class="readonly-value">{{ formatDate(profile.createdAt) }}</span>
            </div>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">{{ success }}</p>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? '儲存中...' : '儲存變更' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 60vh;
  padding-top: 1rem;
}

.profile-card {
  background: var(--color-card);
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 4px 24px rgba(61, 46, 34, 0.08);

  h2 {
    margin: 0 0 1.5rem;
    color: var(--color-primary);
    font-weight: 700;
    font-size: 1.3rem;
  }
}

.loading-text {
  color: var(--color-muted);
  text-align: center;
  padding: 2rem 0;
}

// Avatar upload area
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 0.6rem;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem;
  border: 2px dashed var(--color-border);
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  width: 100%;

  &:hover, &.drag-over {
    border-color: var(--color-primary);
    background: rgba(166, 124, 82, 0.04);
  }
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
  font-size: 2rem;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  line-height: 1;
}

.avatar-hint {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.avatar-note {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0;
}

// Form fields
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

// Read-only info
.readonly-section {
  margin: 1.2rem 0;
  padding: 0.8rem 1rem;
  background: var(--color-bg);
  border-radius: 10px;
}

.readonly-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.35rem 0;

  & + & {
    border-top: 1px solid var(--color-border-light);
  }
}

.readonly-label {
  font-size: 0.82rem;
  color: var(--color-muted);
}

.readonly-value {
  font-size: 0.85rem;
  color: var(--color-text);
  font-weight: 500;
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
  justify-content: flex-end;
  margin-top: 1.5rem;
}
</style>