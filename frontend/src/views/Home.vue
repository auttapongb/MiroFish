<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <nav class="navbar">
      <div class="nav-brand">MIROFISH</div>
      <div class="nav-links">
        <LanguageSwitcher />
        
      </div>
    </nav>

    <div class="main-content">
      <!-- 上半部分：Hero 区域 -->
      <section class="hero-section">
        <div class="hero-left">
          <div class="tag-row">
            <span class="orange-tag">{{ $t('home.tagline') }}</span>
            <span class="version-text">{{ $t('home.version') }}</span>
          </div>
          
          <h1 class="main-title">
            {{ $t('home.heroTitle1') }}<br>
            <span class="gradient-text">{{ $t('home.heroTitle2') }}</span>
          </h1>
          
          <div class="hero-desc">
            <p>
              <i18n-t keypath="home.heroDesc" tag="span">
                <template #brand><span class="highlight-bold">{{ $t('home.heroDescBrand') }}</span></template>
                <template #agentScale><span class="highlight-orange">{{ $t('home.heroDescAgentScale') }}</span></template>
                <template #optimalSolution><span class="highlight-code">{{ $t('home.heroDescOptimalSolution') }}</span></template>
              </i18n-t>
            </p>
            <p class="slogan-text">
              {{ $t('home.slogan') }}<span class="blinking-cursor">_</span>
            </p>
          </div>
           
          <div class="decoration-square"></div>
        </div>
        
        <div class="hero-right">
          <!-- Logo 区域 -->
          <div class="logo-container">
            <img src="../assets/logo/MiroFish_logo_left.jpeg" alt="MiroFish Logo" class="hero-logo" />
          </div>
          
          <button class="scroll-down-btn" @click="scrollToBottom">
            ↓
          </button>
        </div>
      </section>

      <!-- 下半部分：双栏布局 -->
      <section class="dashboard-section">
        <!-- 左栏：状态与步骤 -->
        <div class="left-panel">
          <div class="panel-header">
            <span class="status-dot">■</span> {{ $t('home.systemStatus') }}
          </div>
          
          <h2 class="section-title">{{ $t('home.systemReady') }}</h2>
          <p class="section-desc">
            {{ $t('home.systemReadyDesc') }}
          </p>
          
          <!-- 数据指标卡片 -->
          <div class="metrics-row">
            <div class="metric-card">
              <div class="metric-value">{{ $t('home.metricLowCost') }}</div>
              <div class="metric-label">{{ $t('home.metricLowCostDesc') }}</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">{{ $t('home.metricHighAvail') }}</div>
              <div class="metric-label">{{ $t('home.metricHighAvailDesc') }}</div>
            </div>
          </div>

          <!-- 项目模拟步骤介绍 (新增区域) -->
          <div class="steps-container">
            <div class="steps-header">
               <span class="diamond-icon">◇</span> {{ $t('home.workflowSequence') }}
            </div>
            <div class="workflow-list">
              <div class="workflow-item">
                <span class="step-num">01</span>
                <div class="step-info">
                  <div class="step-title">{{ $t('home.step01Title') }}</div>
                  <div class="step-desc">{{ $t('home.step01Desc') }}</div>
                </div>
              </div>
              <div class="workflow-item">
                <span class="step-num">02</span>
                <div class="step-info">
                  <div class="step-title">{{ $t('home.step02Title') }}</div>
                  <div class="step-desc">{{ $t('home.step02Desc') }}</div>
                </div>
              </div>
              <div class="workflow-item">
                <span class="step-num">03</span>
                <div class="step-info">
                  <div class="step-title">{{ $t('home.step03Title') }}</div>
                  <div class="step-desc">{{ $t('home.step03Desc') }}</div>
                </div>
              </div>
              <div class="workflow-item">
                <span class="step-num">04</span>
                <div class="step-info">
                  <div class="step-title">{{ $t('home.step04Title') }}</div>
                  <div class="step-desc">{{ $t('home.step04Desc') }}</div>
                </div>
              </div>
              <div class="workflow-item">
                <span class="step-num">05</span>
                <div class="step-info">
                  <div class="step-title">{{ $t('home.step05Title') }}</div>
                  <div class="step-desc">{{ $t('home.step05Desc') }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右栏：交互控制台 -->
        <div class="right-panel">
          <div class="console-box">
            <!-- 上传区域 -->
            <div class="console-section">
              <div class="console-header">
                <span class="console-label">{{ $t('home.realitySeed') }}</span>
                <span class="console-meta">{{ $t('home.supportedFormats') }}</span>
              </div>
              
              <div 
                class="upload-zone"
                :class="{ 'drag-over': isDragOver, 'has-files': files.length > 0 }"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.md,.markdown,.txt"
                  @change="handleFileSelect"
                  style="display: none"
                  :disabled="loading"
                />
                
                <div v-if="files.length === 0" class="upload-placeholder">
                  <div class="upload-icon">↑</div>
                  <div class="upload-title">{{ $t('home.dragToUpload') }}</div>
                  <div class="upload-hint">{{ $t('home.orBrowse') }}</div>
                </div>
                
                <div v-else class="file-list">
                  <div v-for="(file, index) in files" :key="index" class="file-item">
                    <span class="file-icon">📄</span>
                    <span class="file-name">{{ file.name }}</span>
                    <button @click.stop="removeFile(index)" class="remove-btn">×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 示例下载 + 最佳实践 -->
            <div class="console-section seed-guide">
              <div class="console-header">
                <span class="console-label">📥 Example seeds</span>
                <span class="console-meta">best results: 5–15 numbered people</span>
              </div>
              <div class="seed-tip">Upload <strong>one</strong> .md / .txt / .pdf "reality seed" + one simulation prompt. Each <code>### N. Name — Role</code> person becomes a distinct agent.</div>
              <div class="seed-downloads">
                <a class="seed-link" href="/examples/launch-date-conflict.md" download>⬇️ Launch-date conflict — personas</a>
                <a class="seed-link" href="/examples/launch-date-conflict-scenario.md" download>⬇️ Launch-date conflict — scenario</a>
                <a class="seed-link" href="/examples/market-entry-thailand.md" download>⬇️ Market entry (Thailand) — personas</a>
                <a class="seed-link" href="/examples/market-entry-thailand-scenario.md" download>⬇️ Market entry (Thailand) — scenario</a>
                <a class="seed-link" href="/examples/ride-hailing-ban.md" download>⬇️ Ride-hailing ban — personas</a>
                <a class="seed-link" href="/examples/ride-hailing-ban-scenario.md" download>⬇️ Ride-hailing ban — scenario</a>
              </div>
              <div class="seed-sub">Full project — Khlong Toei (Bangkok):</div>
              <div class="seed-downloads">
                <a class="seed-link" href="/examples/khlong-toei-20-personas.md" download>⬇️ 20 personas (reality seed)</a>
                <a class="seed-link" href="/examples/khlong-toei-12-personas.md" download>⬇️ 12 personas (trimmed)</a>
                <a class="seed-link" href="/examples/khlong-toei-scenario.md" download>⬇️ Scenario (simulation prompt)</a>
                <a class="seed-link" href="/examples/khlong-toei-casino-scenario.md" download>⬇️ Casino scenario (prompt)</a>
                <a class="seed-link" href="/examples/khlong-toei-casino-report.md" download>⬇️ Casino report (output)</a>
              </div>
              <div class="seed-sub">More scenarios — personas + scenario + report:</div>
              <div class="seed-downloads">
                <a class="seed-link" href="/examples/chiang-mai-flood-personas.md" download>⬇️ Chiang Mai flood — personas</a>
                <a class="seed-link" href="/examples/chiang-mai-flood-scenario.md" download>⬇️ Chiang Mai flood — scenario</a>
                <a class="seed-link" href="/examples/chiang-mai-flood-report.md" download>⬇️ Chiang Mai flood — report</a>
                <a class="seed-link" href="/examples/rayong-ai-layoffs-personas.md" download>⬇️ Rayong AI layoffs — personas</a>
                <a class="seed-link" href="/examples/rayong-ai-layoffs-scenario.md" download>⬇️ Rayong AI layoffs — scenario</a>
                <a class="seed-link" href="/examples/rayong-ai-layoffs-report.md" download>⬇️ Rayong AI layoffs — report</a>
                <a class="seed-link" href="/examples/pai-tourism-boom-personas.md" download>⬇️ Pai tourism boom — personas</a>
                <a class="seed-link" href="/examples/pai-tourism-boom-scenario.md" download>⬇️ Pai tourism boom — scenario</a>
                <a class="seed-link" href="/examples/pai-tourism-boom-report.md" download>⬇️ Pai tourism boom — report</a>
              </div>
            </div>

            <!-- 分割线 -->
            <div class="console-divider">
              <span>{{ $t('home.inputParams') }}</span>
            </div>

            <!-- 输入区域 -->
            <div class="console-section">
              <div class="console-header">
                <span class="console-label">{{ $t('home.simulationPrompt') }}</span>
              </div>
              <div class="input-wrapper">
                <textarea
                  v-model="formData.simulationRequirement"
                  class="code-input"
                  :placeholder="$t('home.promptPlaceholder')"
                  rows="6"
                  :disabled="loading"
                ></textarea>
                <div class="model-badge">{{ $t('home.engineBadge') }}</div>
              </div>
              <div
                class="prompt-upload"
                :class="{ 'drag-over': isPromptDragOver }"
                @dragover.prevent="isPromptDragOver = true"
                @dragleave.prevent="isPromptDragOver = false"
                @drop.prevent="handleScenarioDrop"
                @click="triggerScenarioFileInput"
              >
                <input
                  ref="scenarioFileInput"
                  type="file"
                  accept=".md,.markdown,.txt"
                  @change="handleScenarioFileSelect"
                  style="display: none"
                  :disabled="loading"
                />
                <span v-if="!formData.simulationRequirement" class="pu-text">📄 Upload scenario file (.md / .markdown / .txt) — or drag & drop</span>
                <span v-else class="pu-text">📄 Scenario loaded — click to replace with another file</span>
              </div>
            </div>

            <!-- 时长与频率（确定性） -->
            <div class="console-section">
              <div class="console-header">
                <span class="console-label">⏱ Simulation Duration (deterministic)</span>
              </div>
              <div class="duration-row">
                <input
                  v-model.number="formData.durationValue"
                  type="number" min="1" max="240"
                  class="duration-input"
                  :disabled="loading"
                />
                <select v-model="formData.durationUnit" class="duration-select" :disabled="loading">
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                </select>
                <span class="duration-sep">@</span>
                <select v-model="formData.frequency" class="duration-select" :disabled="loading">
                  <option value="weekly">weekly (1 round = 1 week)</option>
                  <option value="monthly">monthly (1 round = 1 month)</option>
                </select>
              </div>
              <div class="duration-hint">→ {{ computedRounds }} simulation rounds total</div>
            </div>

            <!-- 启动按钮 -->
            <div class="console-section">
              <div class="console-header">
                <span class="console-label">{{ $t('home.modeLabel') }}</span>
              </div>
              <div class="mode-selector">
                <button type="button" class="mode-option" :class="{ active: mode === 'simple' }" @click="mode = 'simple'">
                  <span class="mode-name">{{ $t('home.modeSimple') }}</span>
                  <span class="mode-desc">{{ $t('home.modeSimpleDesc') }}</span>
                </button>
                <button type="button" class="mode-option" :class="{ active: mode === 'detail' }" @click="mode = 'detail'">
                  <span class="mode-name">{{ $t('home.modeDetail') }}</span>
                  <span class="mode-desc">{{ $t('home.modeDetailDesc') }}</span>
                </button>
              </div>
            </div>

            <div v-if="error" class="error-banner">{{ error }}</div>

            <div class="console-section btn-section">
              <button 
                class="start-engine-btn"
                @click="startSimulation"
                :disabled="!canSubmit || loading"
              >
                <span v-if="!loading">{{ $t('home.startEngine') }}</span>
                <span v-else>{{ $t('home.initializing') }}</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 历史项目数据库 -->
      <HistoryDatabase />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import HistoryDatabase from '../components/HistoryDatabase.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const router = useRouter()

// 表单数据
const formData = ref({
  simulationRequirement: '',
  durationValue: 12,
  durationUnit: 'months',
  frequency: 'weekly'
})

// 文件列表
const files = ref([])

// 状态
const loading = ref(false)
const error = ref('')
const isDragOver = ref(false)
const mode = ref('simple') // 'simple' | 'detail'

// 文件输入引用
const fileInput = ref(null)

// 场景（simulation prompt）文件上传引用
const scenarioFileInput = ref(null)
const isPromptDragOver = ref(false)

// 计算属性:是否可以提交
const canSubmit = computed(() => {
  return formData.value.simulationRequirement.trim() !== '' && files.value.length > 0
})

// 确定性轮次：1个月=4周，1轮=1周
const computedRounds = computed(() => {
  const v = Number(formData.value.durationValue) || 0
  const weeks = formData.value.durationUnit === 'months' ? v * 4 : v
  return formData.value.frequency === 'monthly' ? Math.max(1, Math.floor(weeks / 4)) : weeks
})

// 触发文件选择
const triggerFileInput = () => {
  if (!loading.value) {
    fileInput.value?.click()
  }
}

// 处理文件选择
const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  addFiles(selectedFiles)
}

// 处理拖拽相关
const handleDragOver = (e) => {
  if (!loading.value) {
    isDragOver.value = true
  }
}

const handleDragLeave = (e) => {
  isDragOver.value = false
}

const handleDrop = (e) => {
  isDragOver.value = false
  if (loading.value) return
  
  const droppedFiles = Array.from(e.dataTransfer.files)
  addFiles(droppedFiles)
}

// 文件类型检测：规范化扩展名 → 'md' | 'txt' | 'pdf' | null
const detectFileType = (name) => {
  const n = (name || '').trim().toLowerCase()
  if (n.endsWith('.markdown') || n.endsWith('.md')) return 'md'
  if (n.endsWith('.txt')) return 'txt'
  if (n.endsWith('.pdf')) return 'pdf'
  return null
}

// 添加文件（带明确错误反馈，不再静默丢弃）
const addFiles = (newFiles) => {
  const validFiles = []
  const rejected = []
  newFiles.forEach(file => {
    if (detectFileType(file.name)) validFiles.push(file)
    else rejected.push(file.name)
  })
  files.value.push(...validFiles)
  if (rejected.length) {
    error.value = `Unsupported file type: ${rejected.join(', ')} (allowed: .pdf, .md, .markdown, .txt)`
  } else {
    error.value = ''
  }
}

// 移除文件
const removeFile = (index) => {
  files.value.splice(index, 1)
}

// 触发场景文件选择
const triggerScenarioFileInput = () => {
  if (!loading.value) scenarioFileInput.value?.click()
}

const handleScenarioFileSelect = (event) => {
  const f = event.target.files && event.target.files[0]
  if (f) readScenarioFile(f)
  if (event.target) event.target.value = ''
}

const handleScenarioDrop = (e) => {
  isPromptDragOver.value = false
  const f = Array.from(e.dataTransfer.files)[0]
  if (f) readScenarioFile(f)
}

// 读取场景文件内容，填充到 prompt 文本框（.md/.txt，前端 FileReader，不改后端）
const readScenarioFile = (f) => {
  const type = detectFileType(f.name)
  if (type === 'pdf') {
    error.value = 'PDF not supported for the scenario — paste its text instead'
    return
  }
  if (type !== 'md' && type !== 'txt') {
    error.value = 'Scenario file must be .md, .markdown, or .txt'
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    formData.value.simulationRequirement = String(reader.result || '')
    error.value = ''
  }
  reader.onerror = () => { error.value = 'Failed to read scenario file' }
  reader.readAsText(f)
}

// 滚动到底部
const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  })
}

// 开始模拟 - 立即跳转，API调用在Process页面进行
const startSimulation = () => {
  if (!canSubmit.value || loading.value) return
  
  // 存储待上传的数据
  import('../store/pendingUpload.js').then(({ setPendingUpload }) => {
    setPendingUpload(files.value, formData.value.simulationRequirement, {
      durationValue: Number(formData.value.durationValue) || null,
      durationUnit: formData.value.durationUnit,
      frequency: formData.value.frequency
    })
    
    // 立即跳转到Process页面（使用特殊标识表示新建项目）
    router.push({
      name: mode.value === 'simple' ? 'SimpleRun' : 'Process',
      params: { projectId: 'new' }
    })
  })
}
</script>

<style scoped>
/* 全局变量与重置 */
:root {
  --black: #000000;
  --white: #FFFFFF;
  --orange: #FF4500;
  --gray-light: #F5F5F5;
  --gray-text: #666666;
  --border: #E5E5E5;
  /* 
    使用 Space Grotesk 作为主要标题字体，JetBrains Mono 作为代码/标签字体
    确保已在 index.html 引入这些 Google Fonts 
  */
  --font-mono: 'JetBrains Mono', monospace;
  --font-sans: 'Space Grotesk', 'Noto Sans SC', system-ui, sans-serif;
  --font-cn: 'Noto Sans SC', system-ui, sans-serif;
}

.home-container {
  min-height: 100vh;
  background: var(--white);
  font-family: var(--font-sans);
  color: var(--black);
}

/* 顶部导航 */
.navbar {
  height: 60px;
  background: var(--black);
  color: var(--white);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
}

.nav-brand {
  font-family: var(--font-mono);
  font-weight: 800;
  letter-spacing: 1px;
  font-size: 1.2rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.arrow {
  font-family: sans-serif;
}

/* 主要内容区 */
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 60px 40px;
}

/* Hero 区域 */
.hero-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 80px;
  position: relative;
}

.hero-left {
  flex: 1;
  padding-right: 60px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.orange-tag {
  background: var(--orange);
  color: var(--white);
  padding: 4px 10px;
  font-weight: 700;
  letter-spacing: 1px;
  font-size: 0.75rem;
}

.version-text {
  color: #999;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.main-title {
  font-size: 4.5rem;
  line-height: 1.2;
  font-weight: 500;
  margin: 0 0 40px 0;
  letter-spacing: -2px;
  color: var(--black);
}

.gradient-text {
  background: linear-gradient(90deg, #000000 0%, #444444 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.hero-desc {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--gray-text);
  max-width: 640px;
  margin-bottom: 50px;
  font-weight: 400;
  text-align: justify;
}

.hero-desc p {
  margin-bottom: 1.5rem;
}

.highlight-bold {
  color: var(--black);
  font-weight: 700;
}

.highlight-orange {
  color: var(--orange);
  font-weight: 700;
  font-family: var(--font-mono);
}

.highlight-code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--black);
  font-weight: 600;
}

.slogan-text {
  font-size: 1.2rem;
  font-weight: 520;
  color: var(--black);
  letter-spacing: 1px;
  border-left: 3px solid var(--orange);
  padding-left: 15px;
  margin-top: 20px;
}

.blinking-cursor {
  color: var(--orange);
  animation: blink 1s step-end infinite;
  font-weight: 700;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.decoration-square {
  width: 16px;
  height: 16px;
  background: var(--orange);
}

.hero-right {
  flex: 0.8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

.logo-container {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;
}

.hero-logo {
  max-width: 500px; /* 调整logo大小 */
  width: 100%;
}

.scroll-down-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--orange);
  font-size: 1.2rem;
  transition: all 0.2s;
}

.scroll-down-btn:hover {
  border-color: var(--orange);
}

/* Dashboard 双栏布局 */
.dashboard-section {
  display: flex;
  gap: 60px;
  border-top: 1px solid var(--border);
  padding-top: 60px;
  align-items: flex-start;
}

.dashboard-section .left-panel,
.dashboard-section .right-panel {
  display: flex;
  flex-direction: column;
}

/* 左侧面板 */
.left-panel {
  flex: 0.8;
}

.panel-header {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.status-dot {
  color: var(--orange);
  font-size: 0.8rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 520;
  margin: 0 0 15px 0;
}

.section-desc {
  color: var(--gray-text);
  margin-bottom: 25px;
  line-height: 1.6;
}

.metrics-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.metric-card {
  border: 1px solid var(--border);
  padding: 20px 30px;
  min-width: 150px;
}

.metric-value {
  font-family: var(--font-mono);
  font-size: 1.8rem;
  font-weight: 520;
  margin-bottom: 5px;
}

.metric-label {
  font-size: 0.85rem;
  color: #999;
}

/* 项目模拟步骤介绍 */
.steps-container {
  border: 1px solid var(--border);
  padding: 30px;
  position: relative;
}

.steps-header {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.diamond-icon {
  font-size: 1.2rem;
  line-height: 1;
}

.workflow-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.workflow-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.step-num {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--black);
  opacity: 0.3;
}

.step-info {
  flex: 1;
}

.step-title {
  font-weight: 520;
  font-size: 1rem;
  margin-bottom: 4px;
}

.step-desc {
  font-size: 0.85rem;
  color: var(--gray-text);
}

/* 右侧交互控制台 */
.right-panel {
  flex: 1.2;
}

.console-box {
  border: 1px solid #CCC; /* 外部实线 */
  padding: 8px; /* 内边距形成双重边框感 */
}

.console-section {
  padding: 20px;
}

.console-section.btn-section {
  padding-top: 0;
}

.console-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #666;
}

.upload-zone {
  border: 1px dashed #CCC;
  height: 200px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #FAFAFA;
}

.upload-zone.has-files {
  align-items: flex-start;
}

.upload-zone:hover {
  background: #F0F0F0;
  border-color: #999;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  width: 40px;
  height: 40px;
  border: 1px solid #DDD;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  color: #999;
}

.upload-title {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.upload-hint {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: #999;
}

.file-list {
  width: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  background: var(--white);
  padding: 8px 12px;
  border: 1px solid #EEE;
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.file-name {
  flex: 1;
  margin: 0 10px;
}

.remove-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #999;
}

.console-divider {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.console-divider::before,
.console-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #EEE;
}

.console-divider span {
  padding: 0 15px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: #BBB;
  letter-spacing: 1px;
}

.input-wrapper {
  position: relative;
  border: 1px solid #DDD;
  background: #FAFAFA;
}

.code-input {
  width: 100%;
  border: none;
  background: transparent;
  padding: 20px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  min-height: 150px;
}

.model-badge {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: #AAA;
}

.start-engine-btn {
  width: 100%;
  background: var(--black);
  color: var(--white);
  border: none;
  padding: 20px;
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

/* 可点击状态（非禁用） */
.start-engine-btn:not(:disabled) {
  background: var(--black);
  border: 1px solid var(--black);
  animation: pulse-border 2s infinite;
}

.start-engine-btn:hover:not(:disabled) {
  background: var(--orange);
  border-color: var(--orange);
  transform: translateY(-2px);
}

.start-engine-btn:active:not(:disabled) {
  transform: translateY(0);
}

.start-engine-btn:disabled {
  background: #E5E5E5;
  color: #999;
  cursor: not-allowed;
  transform: none;
  border: 1px solid #E5E5E5;
}

/* 引导动画：微妙的边框脉冲 */
@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.2); }
  70% { box-shadow: 0 0 0 6px rgba(0, 0, 0, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .dashboard-section {
    flex-direction: column;
  }
  
  .hero-section {
    flex-direction: column;
  }
  
  .hero-left {
    padding-right: 0;
    margin-bottom: 40px;
  }
  
  .hero-logo {
    max-width: 200px;
    margin-bottom: 20px;
  }
}

/* mode selector */
.mode-selector { display: flex; gap: 10px; }
.mode-option { flex: 1; text-align: left; background: #fafafa; border: 1px solid var(--border, #e5e5e5); border-radius: 10px; padding: 12px 14px; cursor: pointer; font-family: inherit; transition: border-color .15s, background .15s; }
.mode-option:hover { border-color: #333; }
.mode-option.active { border-color: #000; background: #fff; box-shadow: 0 0 0 1px #000; }
.mode-name { display: block; font-weight: 700; font-size: .92rem; font-family: var(--font-mono, monospace); }
.mode-desc { display: block; font-size: .74rem; color: var(--gray-text, #666); margin-top: 3px; line-height: 1.4; }

/* seed guide + example downloads */
.seed-guide { border-top: 1px dashed var(--border, #e5e5e5); padding-top: 4px; }
.seed-tip { font-size: .8rem; color: var(--gray-text, #666); line-height: 1.5; margin: 4px 0 10px; }
.seed-tip code { font-family: var(--font-mono, monospace); background: #f4f4f4; padding: 1px 5px; border-radius: 4px; font-size: .74rem; }
.seed-sub { font-size: .72rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--gray-text, #666); margin: 10px 0 4px; }
.seed-downloads { display: flex; flex-direction: column; gap: 6px; }
.seed-link { display: flex; align-items: center; gap: 8px; font-size: .82rem; font-weight: 600; color: #000; text-decoration: none; padding: 8px 12px; border: 1px solid var(--border, #e5e5e5); border-radius: 8px; transition: border-color .15s, background .15s; }
.seed-link:hover { border-color: #000; background: #fafafa; }

.duration-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.duration-input { width: 90px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; font-family: var(--font-mono); font-size: 1rem; background: var(--white); color: var(--black); }
.duration-select { padding: 10px 12px; border: 1px solid var(--border); border-radius: 10px; font-family: var(--font-mono); font-size: .9rem; background: var(--white); color: var(--black); }
.duration-sep { color: var(--gray-text); font-weight: 700; }
.duration-hint { margin-top: 8px; font-family: var(--font-mono); font-size: .8rem; color: var(--orange); }

.prompt-upload { margin-top: 10px; padding: 12px 16px; border: 1px dashed var(--border); border-radius: 10px; cursor: pointer; text-align: center; font-family: var(--font-mono); font-size: .8rem; color: var(--gray-text); transition: all .2s; }
.prompt-upload:hover, .prompt-upload.drag-over { border-color: var(--orange); color: var(--orange); background: #fff5f0; }

.error-banner { margin: 12px 0; padding: 10px 14px; border: 1px solid #fca5a5; background: #fef2f2; color: #b91c1c; border-radius: 10px; font-family: var(--font-mono); font-size: .8rem; }
</style>

<style>
/* English locale adjustments (unscoped to target html[lang]) */
html[lang="en"] .main-title {
  font-size: 3.5rem;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: -1px;
}

html[lang="en"] .hero-desc {
  text-align: left;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0;
}

html[lang="en"] .slogan-text {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  letter-spacing: 0;
}

html[lang="en"] .tag-row {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html[lang="en"] .navbar .nav-links {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Left pane: system status + workflow */
html[lang="en"] .status-section {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html[lang="en"] .status-section .status-ready {
  font-size: 1.6rem;
}

html[lang="en"] .status-section .metric-value {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.4rem;
}

html[lang="en"] .workflow-list .step-title {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

html[lang="en"] .workflow-list .step-desc {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  font-size: 0.72rem !important;
  line-height: 1.4 !important;
}

html[lang="en"] .workflow-list {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
