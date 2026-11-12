<script setup lang="ts">
// 因子证据坐标 —— 能力退役后的**说明页**。
//
// 2026-11-11 core 按 ADR-037 §5 / ADR-041 把 `GET /api/factors/:factor_name`
// 收回为 `410 Gone` + 机器码 `factor_http_surface_retired`，不再反代 data；
// 因子值改由 core 按需求值。产品裁决（2026-11-12）：**不删这个入口**——
// 用户问「这个因子数字从哪来」时需要一条可见的落点，而不是让抽屉静默消失
// 或者把 410 渲染成一条带状态码的通用错误。
//
// 因此本组件不再发任何 `/api/factors` 请求，也不再展示任何因子数值（退役后
// 前端没有任何合法来源，编一个出来就是伪造）。保留的可回溯路径写在下面。
import { NCard, NSpace, NAlert, NDescriptions, NDescriptionsItem, NText } from 'naive-ui'

const ADR_037 = 'tellurion-docs:docs/adr/adr-037-factor-value-ownership.md'
</script>

<template>
  <NCard title="因子证据坐标" embedded>
    <NSpace vertical>
      <NAlert
        type="info"
        data-testid="factor-retired-notice"
        title="该能力已按 ADR-037 退役"
      >
        该能力已按 ADR-037 退役：因子值由 core 按需求值。core 已于 2026-11-11 把
        <NText code>GET /api/factors/:factor_name</NText>
        收回为 410 Gone（机器码 <NText code>factor_http_surface_retired</NText>），
        不再反代 data —— 本页因而不再读取 factor_cache，也不显示任何因子数值。
      </NAlert>

      <NDescriptions label-placement="left" :column="2" size="small" bordered>
        <NDescriptionsItem label="状态">已退役（410 Gone）</NDescriptionsItem>
        <NDescriptionsItem label="机器码">factor_http_surface_retired</NDescriptionsItem>
        <NDescriptionsItem label="裁决">ADR-037 · 因子值归属</NDescriptionsItem>
        <NDescriptionsItem label="落点">{{ ADR_037 }}</NDescriptionsItem>
        <NDescriptionsItem label="因子值">由 core 按需求值（前端不缓存、不推导）</NDescriptionsItem>
        <NDescriptionsItem label="本页用途">解释「这个能力去哪了」，不作查询入口</NDescriptionsItem>
      </NDescriptions>

      <NText depth="3">
        仍然可用的回溯路径：回测报告与回测对比页的质问入口（每个指标旁的来源按钮），
        以及证据页深链 <NText code>/evidence?content_hash=&lt;hash&gt;</NText>。
      </NText>
    </NSpace>
  </NCard>
</template>
