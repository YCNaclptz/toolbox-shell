<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import type { AppInfo } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const defaultApps = [
  { 
    id: 'swear-jar', 
    name: '髒話罐', 
    icon: 'icon-money-bag', 
    routePrefix: '/swear-jar',
    description: '追蹤與管理髒話罰款紀錄'
  }
]

const apps = computed(() => auth.apps.length ? auth.apps : defaultApps)

function navigateToApp(app: AppInfo) {
  router.push(app.routePrefix)
}
</script>

<template>
  <div class="home-view">
    <div class="welcome-section">
      <h1 class="welcome-title">歡迎回來，{{ auth.displayName }}</h1>
      <p class="welcome-subtitle">選擇一個應用程式開始使用</p>
    </div>

    <div class="apps-grid">
      <div 
        v-for="app in apps" 
        :key="app.id"
        class="app-card"
        @click="navigateToApp(app)"
      >
        <div :class="['app-icon', app.icon || 'icon-package']"></div>
        <h3 class="app-name">{{ app.name }}</h3>
        <p class="app-description">{{ app.description || '點擊進入應用' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-view {
  padding: 1rem 0;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 0.5rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: var(--color-muted);
  margin: 0;
}

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.app-card {
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 2rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(61, 46, 34, 0.1);
    border-color: var(--color-primary);
  }
}

.app-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
}

.app-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.app-description {
  font-size: 0.9rem;
  color: var(--color-muted);
  margin: 0;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .apps-grid {
    grid-template-columns: 1fr;
  }
}
</style>
