<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'

const error = ref('')
const loading = ref(true)
const loadKey = ref(0)

function loadRemote() {
  return import('swearJar/App').then(m => {
    loading.value = false
    return m.default || m
  })
}

const RemoteApp = defineAsyncComponent({
  loader: async () => {
    loading.value = true
    let lastError: Error | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await loadRemote()
      } catch (e: any) {
        lastError = e
        console.warn(`Remote load attempt ${attempt + 1} failed:`, e)
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
      }
    }
    loading.value = false
    error.value = '無法載入應用程式：' + (lastError?.message || '未知錯誤')
    console.error('Failed to load remote app after 3 attempts:', lastError)
    return { template: '' }
  },
  loadingComponent: {
    template: '<div class="remote-loading">載入應用程式中...</div>'
  },
  errorComponent: {
    template: '<div class="remote-error">應用程式載入失敗</div>'
  },
})

function retry() {
  error.value = ''
  loadKey.value++
}
</script>

<template>
  <div class="remote-app-container">
    <div v-if="error" class="remote-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="retry">重新載入</button>
    </div>
    <Suspense v-else :key="loadKey">
      <template #default>
        <RemoteApp />
      </template>
      <template #fallback>
        <div class="remote-loading">載入應用程式中...</div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
.remote-app-container { 
  min-height: 400px; 
}

.remote-loading { 
  text-align: center; 
  padding: 3rem; 
  color: var(--color-muted); 
  font-size: 1.1rem;
}

.remote-error { 
  text-align: center; 
  padding: 3rem; 
  color: var(--color-danger); 
  background: var(--color-card);
  border-radius: 14px;
  border: 1px solid var(--color-border);
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card);
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--color-bg);
  }
}
</style>