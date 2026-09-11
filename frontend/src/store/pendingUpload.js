/**
 * 临时存储待上传的文件、需求和确定性参数
 * 用于首页点击启动引擎后立即跳转，在Process页面再进行API调用
 */
import { reactive } from 'vue'

const state = reactive({
  files: [],
  simulationRequirement: '',
  durationValue: 12,
  durationUnit: 'months',
  frequency: 'weekly',
  isPending: false
})

// 持久化的模拟设置（跨 simple/detail 模式共享，clearPendingUpload 不清空）
export const simulationSettings = reactive({
  durationValue: 12,
  durationUnit: 'months',
  frequency: 'weekly',
  graphMemoryEnabled: true,
  reportFormat: 'summary'
})

// 持久化到 localStorage，避免页面刷新/跳转后确定性参数被重置
const SETTINGS_KEY = 'mirofish_simulation_settings'
function persistSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      durationValue: simulationSettings.durationValue,
      durationUnit: simulationSettings.durationUnit,
      frequency: simulationSettings.frequency,
      graphMemoryEnabled: simulationSettings.graphMemoryEnabled,
      reportFormat: simulationSettings.reportFormat
    }))
  } catch (e) { /* ignore */ }
}
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      simulationSettings.durationValue = parsed.durationValue ?? 12
      simulationSettings.durationUnit = parsed.durationUnit ?? 'months'
      simulationSettings.frequency = parsed.frequency ?? 'weekly'
      simulationSettings.graphMemoryEnabled = parsed.graphMemoryEnabled ?? true
      simulationSettings.reportFormat = parsed.reportFormat ?? 'summary'
    }
  } catch (e) { /* ignore */ }
}
loadSettings()

export function setPendingUpload(files, requirement, duration = {}) {
  state.files = files
  state.simulationRequirement = requirement
  state.durationValue = duration.durationValue ?? 12
  state.durationUnit = duration.durationUnit ?? 'months'
  state.frequency = duration.frequency ?? 'weekly'
  state.isPending = true
  simulationSettings.durationValue = duration.durationValue ?? 12
  simulationSettings.durationUnit = duration.durationUnit ?? 'months'
  simulationSettings.frequency = duration.frequency ?? 'weekly'
  simulationSettings.graphMemoryEnabled = duration.graphMemoryEnabled ?? true
  persistSettings()
}

export function getPendingUpload() {
  return {
    files: state.files,
    simulationRequirement: state.simulationRequirement,
    durationValue: state.durationValue,
    durationUnit: state.durationUnit,
    frequency: state.frequency,
    isPending: state.isPending
  }
}

export function clearPendingUpload() {
  state.files = []
  state.simulationRequirement = ''
  state.durationValue = 12
  state.durationUnit = 'months'
  state.frequency = 'weekly'
  state.isPending = false
}

export default state
