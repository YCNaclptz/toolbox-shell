<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const defaultApps = [
  { id: 'swear-jar', name: '髒話罐', icon: 'icon-money-bag', routePrefix: '/swear-jar' }
]

const apps = computed(() => auth.apps.length ? auth.apps : defaultApps)

function isActive(prefix: string) {
  return route.path.startsWith(prefix)
}
</script>

<template>
  <aside :class="['side-nav', { collapsed }]">
    <div class="nav-header">
      <span v-if="!collapsed" class="nav-title">工具平台</span>
      <button class="collapse-btn" @click="collapsed = !collapsed">
        {{ collapsed ? '→' : '←' }}
      </button>
    </div>
    
    <nav class="nav-links">
      <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
        <span class="nav-icon icon-home"></span>
        <span v-if="!collapsed" class="nav-label">首頁</span>
      </router-link>
      
      <div class="nav-section" v-if="!collapsed">
        <span class="nav-section-title">應用程式</span>
      </div>
      
      <router-link 
        v-for="app in apps" 
        :key="app.id"
        :to="app.routePrefix"
        class="nav-item"
        :class="{ active: isActive(app.routePrefix) }"
      >
        <span :class="['nav-icon', app.icon || 'icon-package']"></span>
        <span v-if="!collapsed" class="nav-label">{{ app.name }}</span>
      </router-link>
      
      <template v-if="auth.isAdmin">
        <div class="nav-divider"></div>
        <div class="nav-section" v-if="!collapsed">
          <span class="nav-section-title">管理</span>
        </div>
        <router-link to="/admin/users" class="nav-item" :class="{ active: route.path === '/admin/users' }">
          <span class="nav-icon icon-users"></span>
          <span v-if="!collapsed" class="nav-label">使用者管理</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.side-nav {
  width: 240px;
  background: var(--color-card);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;

  &.collapsed {
    width: 60px;
  }
}

.nav-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.nav-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.collapse-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  color: var(--color-muted);
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
}

.nav-links {
  flex: 1;
  padding: 0.5rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.65rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
  border-left: 3px solid transparent;
  gap: 0.75rem;

  &:hover {
    background: var(--color-bg);
  }

  &.active {
    border-left-color: var(--color-primary);
    background: var(--color-bg);
    color: var(--color-primary);
  }
}

.nav-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.nav-label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.nav-section {
  padding: 0.75rem 1rem 0.25rem;
  margin-top: 0.5rem;
}

.nav-section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-muted);
  letter-spacing: 0.05em;
}

.nav-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0.75rem 1rem;
}

@media (max-width: 768px) {
  .side-nav:not(.collapsed) {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }
}
</style>
