<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import SideNav from './layout/SideNav.vue'
import TopBar from './layout/TopBar.vue'

const auth = useAuthStore()
</script>

<template>
  <div v-if="auth.isLoggedIn()" class="app-layout">
    <SideNav />
    <div class="app-content">
      <TopBar />
      <main class="app-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
  <router-view v-else />
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.2s ease; 
}

.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}
</style>
