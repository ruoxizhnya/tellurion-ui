<template>
  <div v-if="verdict" class="verdict-bars" data-testid="verdict-bars">
    <div v-for="dim in DIMENSION_ORDER" :key="dim" class="bar-row" :data-testid="`verdict-row-${dim}`">
      <span class="dim-label">{{ dimensionLabel(dim) }}</span>
      <span class="track">
        <span
          v-if="isAssessed(dim)"
          class="fill"
          :style="{ width: `${fillPercent(dim)}%` }"
          :data-testid="`verdict-fill-${dim}`"
        ></span>
        <span v-else class="unassessed" :data-testid="`verdict-unassessed-${dim}`">未评估</span>
      </span>
      <span class="value" :data-testid="`verdict-value-${dim}`">
        {{ isAssessed(dim) ? valueOf(dim).toFixed(2) : '—' }}
      </span>
    </div>

    <!-- 未评估不等于 0 分：一维没查，整张卡的把握就不能按「已查过的几维」算 -->
    <n-text v-if="hasUnassessed" depth="3" class="veto" data-testid="verdict-veto">
      未评估维度行使否决权：综合概率只取已评估维度的最小值（未评估 ≠ 0 分）。
    </n-text>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NText } from 'naive-ui'
import { DIMENSION_ORDER, dimensionLabel, type Verdict } from '@/api/explore'

/**
 * A-14 候选卡六维微条。
 *
 * 只做展示：概率口径仍由 `assessedProbability`（min + 否决）决定，卡片上的 P 与这里
 * 不各算一遍。`unassessed` 维**不画 0 长度的条**，而是直接把「未评估」写在轨道上 ——
 * 一条贴着底线的条会被读成「已经评估过、得 0 分」，那是相反的意思。
 */
const props = defineProps<{ verdict: Verdict | null }>()

const skipped = computed(() => new Set(props.verdict?.unassessed ?? []))

function isAssessed(dim: string): boolean {
  if (skipped.value.has(dim)) return false
  const p = props.verdict?.dimensions[dim]
  return typeof p === 'number' && Number.isFinite(p)
}

function valueOf(dim: string): number {
  return props.verdict?.dimensions[dim] ?? 0
}

function fillPercent(dim: string): number {
  const p = valueOf(dim)
  return Math.max(0, Math.min(100, Math.round(p * 100)))
}

const hasUnassessed = computed(() => DIMENSION_ORDER.some((dim) => !isAssessed(dim)))
</script>

<style scoped>
.verdict-bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 420px;
}

.bar-row {
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.dim-label {
  color: var(--q-text3);
}

.track {
  position: relative;
  display: block;
  height: 6px;
  border-radius: 3px;
  background: var(--q-surface3);
  overflow: hidden;
}

.fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  /* --q-primary 明令不可作填充（variables.css:25），这里用数据系列色 */
  background: var(--q-series-1);
}

/* 「未评估」占满轨道：它是状态，不是分数 */
.unassessed {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  line-height: 1;
  color: var(--q-warning);
  border: 1px dashed var(--q-border);
  border-radius: 3px;
  background: transparent;
}

.value {
  color: var(--q-text2);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.veto {
  display: block;
  font-size: 10px;
  margin-top: 2px;
}
</style>
