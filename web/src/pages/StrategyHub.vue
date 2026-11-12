<template>
  <div class="strategy-hub-page" data-testid="strategy-hub">
    <n-page-header
      title="策略库"
      subtitle="策略管理 · 可视化编辑器 · Copilot（B-04：三页合一）"
    />
    <n-alert type="default" :bordered="false" class="copilot-dep" data-testid="copilot-dependency">
      Copilot 提案流依赖 <code>ai-service</code>（:8086）与
      <code>POST /api/copilot/generate</code>。服务未就绪时任务终态会返回
      <code>llm_failed</code>，页面展示真实原因——不伪造成功态。
    </n-alert>
    <n-tabs
      :value="tab"
      type="line"
      animated
      display-directive="show"
      data-testid="strategy-tabs"
      @update:value="onTabChange"
    >
      <n-tab-pane name="lab" tab="策略库">
        <StrategyLab />
      </n-tab-pane>
      <n-tab-pane name="builder" tab="编辑器">
        <StrategyBuilder />
      </n-tab-pane>
      <n-tab-pane name="copilot" tab="Copilot">
        <Copilot />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAlert, NPageHeader, NTabPane, NTabs } from 'naive-ui'
import StrategyLab from './StrategyLab.vue'
import StrategyBuilder from './StrategyBuilder.vue'
import Copilot from './Copilot.vue'
import {
  resolveStrategyTab,
  strategyTabLocation,
  type StrategyTab,
} from '@/utils/strategyHub'

const route = useRoute()
const router = useRouter()

const tab = computed<StrategyTab>(() =>
  resolveStrategyTab(route.path, route.query.tab),
)

function onTabChange(name: string | number) {
  const next = name as StrategyTab
  const target = strategyTabLocation(next)
  if (target !== route.fullPath) router.replace(target)
}
</script>

<style scoped>
.strategy-hub-page {
  padding: 16px;
}

.copilot-dep {
  margin-bottom: 12px;
}
</style>
