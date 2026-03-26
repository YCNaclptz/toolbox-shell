<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRoute, useRouter } from 'vue-router'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from 'reka-ui'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const roleLabel = (role: string) => role === 'Admin' ? '管理員' : '使用者'

function getInitials(name: string) {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-inner">
      <div class="page-info">
        <h1 class="page-title">{{ route.meta.title || route.name || '首頁' }}</h1>
      </div>
      
      <div class="top-bar-right">
        <DropdownMenuRoot>
          <DropdownMenuTrigger class="avatar-trigger" aria-label="使用者選單">
            <div class="avatar">
              <img v-if="auth.avatarUrl" :src="auth.avatarUrl" :alt="auth.displayName" class="avatar-img" />
              <span v-else class="avatar-fallback">{{ getInitials(auth.displayName) }}</span>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <DropdownMenuContent class="dropdown-content" :side-offset="8" side="bottom" align="end">
              <DropdownMenuLabel class="dropdown-user-header">
                <div class="dropdown-user-name">{{ auth.displayName }}</div>
                <div class="dropdown-user-role">{{ roleLabel(auth.role) }}</div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator class="dropdown-separator" />

              <DropdownMenuItem class="dropdown-item" @select="router.push('/profile')">
                <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                使用者資訊設定
              </DropdownMenuItem>

              <DropdownMenuItem class="dropdown-item" @select="router.push('/change-password')">
                <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                修改密碼
              </DropdownMenuItem>

              <DropdownMenuSeparator class="dropdown-separator" />

              <DropdownMenuItem class="dropdown-item dropdown-item--danger" @select="auth.logout()">
                <svg class="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuRoot>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.top-bar {
  background: var(--color-card);
  border-bottom: 1px solid var(--color-border);
  padding: 0.75rem 1.5rem;
  box-shadow: 0 1px 4px rgba(61,46,34,0.04);
}

.top-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-trigger {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  transition: box-shadow 0.2s;

  &:hover, &[data-state="open"] {
    box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.2);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.3);
  }
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .top-bar {
    padding: 0.6rem 1rem;
  }
  
  .page-title {
    font-size: 1rem;
  }
}
</style>

<style lang="scss">
/* Non-scoped: DropdownMenuPortal renders outside component DOM */
.dropdown-content {
  min-width: 200px;
  background: var(--color-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.4rem;
  box-shadow: 0 8px 30px rgba(61, 46, 34, 0.12), 0 2px 8px rgba(61, 46, 34, 0.06);
  z-index: 1000;
  animation: dropdown-in 0.15s ease-out;
}

@keyframes dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-user-header {
  padding: 0.6rem 0.75rem;
  cursor: default;
}

.dropdown-user-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
}

.dropdown-user-role {
  font-size: 0.78rem;
  color: var(--color-muted);
  margin-top: 0.1rem;
}

.dropdown-separator {
  height: 1px;
  background: var(--color-border-light);
  margin: 0.25rem 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
  outline: none;

  &[data-highlighted] {
    background: rgba(166, 124, 82, 0.08);
  }

  &--danger {
    color: var(--color-danger);

    &[data-highlighted] {
      background: rgba(192, 57, 43, 0.06);
    }
  }
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>