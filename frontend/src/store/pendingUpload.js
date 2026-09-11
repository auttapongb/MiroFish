/**
 * 临时存储待上传的文件、需求和确定性参数
 * 用于首页点击启动引擎后立即跳转，在Process页面再进行API调用
 */
import { reactive } from 'vue'

const state = reactive({
  files: [],
  simulationRequirement: '',
  durationValue: null,
  durationUnit: 'months',
  frequency: 'weekly',
  isPending: false
})

export function setPendingUpload(files, requirement, duration = {}) {
  state.files = files
  state.simulationRequirement = requirement
  state.durationValue = duration.durationValue ?? null
  state.durationUnit = duration.durationUnit ?? 'months'
  state.frequency = duration.frequency ?? 'weekly'
  state.isPending = true
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
  state.durationValue = null
  state.durationUnit = 'months'
  state.frequency = 'weekly'
  state.isPending = false
}

export default state
