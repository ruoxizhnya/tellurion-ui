<script setup lang="ts">
import { NH1 } from 'naive-ui'
import FactorCitation from '@/components/factor/FactorCitation.vue'
</script>

<template>
  <div class="factor-citation-page">
    <!-- UI-FACTOR-RESEARCH-LABEL：标题必须与侧栏/标签页同名（nav-labels.test.ts 逐字校验）。
         这页按 ADR-037 退役后只是说明页，标题里要能看出「已退役」。 -->
    <NH1>因子证据（已退役）</NH1>
    <FactorCitation />
  </div>
</template>

<style scoped>
.factor-citation-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>