<template>
  <div class="app-layout">
    <AppSidebar :collapsed="collapsed" />
    <div class="app-main">
      <AppHeader @toggle-sidebar="collapsed = !collapsed" />
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

// UI-03：≤768px 视口默认收起侧栏（visual.md §5.2），桌面端维持展开；header 的汉堡开关仍可手动切换。
const SMALL_VIEWPORT = '(max-width: 768px)'
const collapsed = ref(window.matchMedia(SMALL_VIEWPORT).matches)
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
