// parsePromoteTarget 的判据：坐标只从 agent 的资产登记语里取，取不到就返回 null。
// 这里钉住的是**不许凑数**：任何"猜一个 id"的实现都会让 promote 打到别的版本上。

import { describe, it, expect } from 'vitest'
import { parsePromoteTarget } from './copilot'

const GATE_ERROR =
  '编译通过并已登记资产坐标（carrier=wasm strategy_id=st_9f3c2a1b version_hash=4d2e8c1f）；' +
  '未过 promote 人工闸门，不进回测（QT-32）。人工放行后由策略服务 promote。'

describe('parsePromoteTarget', () => {
  it('从闸门拦下的 build_error 里取出策略 id 与版本 hash', () => {
    expect(parsePromoteTarget(GATE_ERROR)).toEqual({
      strategyId: 'st_9f3c2a1b',
      versionHash: '4d2e8c1f',
    })
  })

  it('坐标不完整就返回 null，不拼一半', () => {
    expect(parsePromoteTarget('carrier=wasm strategy_id=st_1）。')).toBeNull()
    expect(parsePromoteTarget('carrier=wasm version_hash=abc）。')).toBeNull()
    expect(parsePromoteTarget('沙箱未装配：copilot.working_dir is not configured')).toBeNull()
    expect(parsePromoteTarget(undefined)).toBeNull()
    expect(parsePromoteTarget('')).toBeNull()
  })

  it('不会被半角括号/逗号后的杂字带进来', () => {
    expect(parsePromoteTarget('strategy_id=st_1, version_hash=ab12) x')).toEqual({
      strategyId: 'st_1',
      versionHash: 'ab12',
    })
  })
})
