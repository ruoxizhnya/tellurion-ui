<template>
  <n-modal
    :show="show"
    :mask-closable="true"
    :auto-focus="false"
    transform-origin="center"
    @update:show="(v: boolean) => emit('update:show', v)"
  >
    <div class="command-panel" data-testid="command-palette" @keydown.esc.stop="close">
      <!-- data-testid 落在 n-input 根节点，e2e 取其中的 input 再 fill -->
      <n-input
        ref="inputRef"
        v-model:value="keyword"
        data-testid="command-input"
        placeholder="跳转到页面…（↑↓ 选择，Enter 打开，Esc 关闭）"
        @keydown="onKeydown"
      />
      <div class="command-list" role="listbox" aria-label="页面">
        <button
          v-for="(item, index) in filtered"
          :key="item.path"
          type="button"
          role="option"
          class="command-item"
          :class="{ active: index === cursor }"
          :aria-selected="index === cursor"
          :data-testid="commandItemTestId(item.path)"
          @mouseenter="cursor = index"
          @click="choose(item.path)"
        >
          <n-icon class="item-icon"><component :is="item.icon" /></n-icon>
          <span class="item-label">{{ item.label }}</span>
          <span class="item-path">{{ item.path }}</span>
        </button>
        <div v-if="filtered.length === 0" class="command-empty" data-testid="command-empty">
          没有匹配的页面
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NInput, NModal } from 'naive-ui'
import { commandItemTestId, filterNavItems } from './navItems'

/**
 * A-04 断言 5：⌘K / Ctrl+K 命令面板。
 *
 * 列表与侧栏同源（`navItems.ts`），不另抄一份标签 —— 否则就是 A-04 断言 3
 * 点名的"同一入口四处各写一遍"。
 */
const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [boolean] }>()

const router = useRouter()
const keyword = ref('')
const cursor = ref(0)
const inputRef = ref<{ focus: () => void } | null>(null)

const filtered = computed(() => filterNavItems(keyword.value))

watch(
  () => props.show,
  (open) => {
    if (!open) return
    keyword.value = ''
    cursor.value = 0
    void nextTick(() => inputRef.value?.focus())
  },
)

watch(filtered, () => {
  cursor.value = 0
})

function close() {
  emit('update:show', false)
}

function choose(path: string) {
  close()
  void router.push(path)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    cursor.value = Math.min(cursor.value + 1, filtered.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    cursor.value = Math.max(cursor.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = filtered.value[cursor.value]
    if (item) choose(item.path)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

/**
 * 全局热键挂在 window：面板未打开时组件也常驻（AppLayout 内），
 * 否则"没打开就监听不到打开它的键"。
 */
function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('update:show', !props.show)
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
onUnmounted(() => window.removeEventListener('keydown', onGlobalKeydown))
</script>

<style scoped>
.command-panel {
  width: 520px;
  max-width: calc(100vw - 32px);
  background: var(--q-surface);
  border: 1px solid var(--q-border);
  border-radius: var(--q-radius);
  padding: 12px;
  box-shadow: 0 12px 32px rgb(0 0 0 / 24%);
}

.command-list {
  margin-top: 8px;
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--q-radius-sm);
  background: transparent;
  color: var(--q-text2);
  cursor: pointer;
  text-align: left;
  font: inherit;
}

.command-item.active {
  background: var(--q-primary-soft);
  color: var(--q-primary);
}

.command-item .item-icon { font-size: 16px; flex-shrink: 0; }
.command-item .item-label { font-size: 13px; }
.command-item .item-path { font-size: 11px; color: var(--q-text3); margin-left: auto; }

.command-empty {
  padding: 12px 10px;
  font-size: 12px;
  color: var(--q-text3);
}
</style>
