<template>
  <div class="simple-root">
    <!-- Header -->
    <header class="topbar">
      <div class="brand" @click="router.push('/')">MIRO<span>FISH</span></div>
      <div class="top-right">
        <span class="mode-badge">Simple mode</span>
        
      </div>
    </header>

    <!-- RUNNING: progress stepper -->
    <main v-if="phase !== 'done'" class="stage-wrap">
      <div class="stage-card">
        <h1>{{ stopped ? 'Simulation stopped' : (running ? 'Running your simulation' : 'Preparing…') }}</h1>
        <p class="sub">MiroFish is extracting entities, building a knowledge graph, generating personas, and simulating the scenario — all automatically.</p>

        <!-- stepper -->
        <div class="stepper">
          <div v-for="(s, i) in stages" :key="i" class="step"
               :class="{ active: i === stageIndex, done: i < stageIndex, current: i === stageIndex }">
            <div class="step-dot">{{ i < stageIndex ? '✓' : (i + 1) }}</div>
            <div class="step-label">{{ s }}</div>
          </div>
        </div>

        <!-- progress bar -->
        <div class="pbar">
          <div class="pbar-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-meta">
          <span class="stage-label">{{ currentLabel }}</span>
          <span class="pct">{{ progressPercent }}%</span>
        </div>

        <!-- live log -->
        <div class="log" ref="logBox">
          <div v-for="(l, i) in logs" :key="i" class="log-line">
            <span class="log-time">{{ l.time }}</span>{{ l.msg }}
          </div>
        </div>

        <div class="actions-row">
          <button v-if="running && !stopped && !error && stageIndex === 3" class="btn stop-btn" @click="stopRun" :disabled="stopping">
            {{ stopping ? 'Stopping…' : '■ Stop simulation' }}
          </button>
          <button v-if="error || stopped" class="btn err-btn" @click="router.push('/')">← Back to start</button>
        </div>
      </div>
    </main>

    <!-- DONE: report + chat -->
    <main v-else class="result-wrap">
      <div class="done-banner">✅ Done — here's your prediction</div>
      <div class="tabs">
        <button :class="{ active: tab === 'report' }" @click="tab = 'report'">📄 Report</button>
        <button :class="{ active: tab === 'agents' }" @click="tab = 'agents'">💬 Talk to agents ({{ personas.length }})</button>
      </div>

      <!-- REPORT -->
      <section v-if="tab === 'report'" class="report-card">
        <div class="report-head">
          <h2>Simulation report</h2>
          <a :href="reportDownloadUrl" v-if="reportDownloadUrl" class="dl" :download="'mirofish-report-' + reportId + '.md'">Download .md ↓</a>
        </div>
        <article class="md" v-html="reportHtml"></article>
      </section>

      <!-- AGENTS CHAT -->
      <section v-else class="chat-layout">
        <aside class="persona-list">
          <div class="persona-h">Agents</div>
          <button v-for="(p, i) in personas" :key="i" class="persona"
                  :class="{ active: activePersona === i }" @click="selectPersona(i)">
            <span class="avatar">{{ (p.username || p.name || 'A')[0] }}</span>
            <span class="p-info">
              <span class="p-name">{{ p.username || p.name || 'Agent ' + (i + 1) }}</span>
              <span class="p-role">{{ p.profession || p.role || 'Agent' }}</span>
            </span>
          </button>
        </aside>

        <div class="chat-panel">
          <div class="chat-head" v-if="activePersona !== null">
            <span class="avatar">{{ (personas[activePersona].username || 'A')[0] }}</span>
            <div>
              <div class="p-name">{{ personas[activePersona].username || 'Agent' }}</div>
              <div class="p-role">{{ personas[activePersona].profession || 'Agent' }}</div>
            </div>
          </div>
          <div class="messages" ref="chatBox">
            <div v-for="(m, i) in chat" :key="i" class="msg" :class="m.role">
              <span class="avatar">{{ m.role === 'user' ? 'You' : (personas[activePersona]?.username || 'A')[0] }}</span>
              <div class="bubble">{{ m.content }}</div>
            </div>
            <div v-if="chat.length === 0" class="empty-chat">Ask this agent anything about the simulation.</div>
          </div>
          <div class="chat-input">
            <textarea v-model="chatInput" rows="2" placeholder="Type a message to this agent…" @keydown.enter.exact.prevent="sendChat"></textarea>
            <button class="btn send" @click="sendChat" :disabled="sending || !chatInput.trim()">Send →</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { generateOntology, buildGraph, getTaskStatus } from '../api/graph'
import { createSimulation, prepareSimulation, getPrepareStatus, startSimulation, getRunStatus, stopSimulation, getSimulationProfilesRealtime, interviewAgents } from '../api/simulation'
import { generateReport, getReport } from '../api/report'
import { getPendingUpload, clearPendingUpload } from '../store/pendingUpload'

const router = useRouter()

const stages = ['Analyze', 'Knowledge graph', 'Generate agents', 'Simulate', 'Report']
const stageIndex = ref(0)
const running = ref(false)
const error = ref('')
const logs = ref([])
const logBox = ref(null)
const phase = ref('run') // run | done
const stopped = ref(false)
const stopping = ref(false)
const stopRequested = ref(false)

const projectId = ref(null)
const simulationId = ref(null)
const reportId = ref(null)
const reportMarkdown = ref('')
const reportDownloadUrl = ref('')
const personas = ref([])
const tab = ref('report')

// chat
const activePersona = ref(null)
const chat = ref([])
const chatInput = ref('')
const sending = ref(false)
const chatBox = ref(null)

const progressPercent = computed(() => {
  // weight run phase heavier
  const base = [10, 28, 46, 60, 90][stageIndex.value] || 90
  return Math.min(base, 99)
})
const currentLabel = computed(() => {
  const labels = ['Analyzing documents', 'Building knowledge graph', 'Generating personas', 'Running simulation', 'Writing report']
  return labels[stageIndex.value] || 'Running'
})

function addLog(msg) {
  const t = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logs.value.push({ time: t, msg })
  if (logs.value.length > 60) logs.value.shift()
  nextTick(() => { if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function stopRun() {
  if (!simulationId.value || stopping.value) return
  stopping.value = true
  stopRequested.value = true
  addLog('Stop requested — terminating simulation…')
  try {
    const res = await stopSimulation({ simulation_id: simulationId.value })
    if (res.success) addLog('Simulation stopped.')
    else addLog('Stop call returned: ' + (res.error || 'unknown'))
  } catch (e) {
    addLog('Stop failed: ' + (e.message || 'unknown'))
  } finally {
    stopping.value = false
  }
}

async function poll(fn, isDone, interval = 3000, timeout = 20 * 60 * 1000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const res = await fn()
    if (isDone(res)) return res
    await sleep(interval)
  }
  throw new Error('Timed out waiting for task')
}

async function runPipeline() {
  const pending = getPendingUpload()
  if (!pending.isPending || pending.files.length === 0) {
    error.value = 'No input files found. Please go back and upload a reality seed.'
    return
  }
  try {
    // 1. Ontology
    stageIndex.value = 0; running.value = true
    addLog('Uploading documents & extracting reality seeds…')
    const fd = new FormData()
    pending.files.forEach(f => fd.append('files', f))
    fd.append('simulation_requirement', pending.simulationRequirement)
    const ores = await generateOntology(fd)
    if (!ores.success) throw new Error(ores.error || 'Ontology generation failed')
    projectId.value = ores.data.project_id
    clearPendingUpload()
    addLog('Reality seeds extracted. Project ' + projectId.value)

    // 2. Build graph
    stageIndex.value = 1
    addLog('Building knowledge graph (GraphRAG + memory)…')
    const bres = await buildGraph({ project_id: projectId.value })
    if (!bres.success) throw new Error(bres.error || 'Graph build failed')
    const taskId = bres.data.task_id
    const gres = await poll(() => getTaskStatus(taskId), r => r.success && ['completed', 'failed'].includes(r.data?.status), 4000, 60 * 60 * 1000)
    if (gres.data?.status !== 'completed') throw new Error('Knowledge graph build failed: ' + (gres.data?.status || 'unknown'))
    addLog('Knowledge graph complete.')

    // 3. Create simulation
    const cres = await createSimulation({ project_id: projectId.value, enable_twitter: true, enable_reddit: true })
    if (!cres.success) throw new Error(cres.error || 'Simulation create failed')
    simulationId.value = cres.data.simulation_id
    addLog('Simulation environment created (' + simulationId.value + ').')

    // 4. Prepare (personas)
    stageIndex.value = 2
    addLog('Generating agent personas from the seed…')
    const pres = await prepareSimulation({
      simulation_id: simulationId.value,
      use_llm_for_profiles: true,
      duration_value: pending.durationValue ?? null,
      duration_unit: pending.durationUnit ?? 'months',
      frequency: pending.frequency ?? 'weekly'
    })
    if (!pres.success) throw new Error(pres.error || 'Prepare failed')
    if (pres.data && pres.data.task_id) {
      const pres2 = await poll(() => getPrepareStatus({ task_id: pres.data.task_id, simulation_id: simulationId.value }),
                 r => { const s = r.data?.status || r.data?.state; return ['ready', 'completed', 'failed'].includes(s) }, 4000, 60 * 60 * 1000)
      const s = pres2.data?.status || pres2.data?.state
      if (s === 'failed') throw new Error('Agent preparation failed')
    }
    addLog('Personas ready.')

    // 5. Start simulation
    stageIndex.value = 3
    addLog('Starting parallel simulation…')
    await startSimulation({ simulation_id: simulationId.value, platform: 'parallel' })
    await poll(async () => {
      const r = await getRunStatus(simulationId.value)
      if (r.success && r.data) {
        addLog(`Round ${r.data.current_round ?? 0}/${r.data.total_rounds ?? '?'} — ${r.data.progress_percent ?? 0}%`)
      }
      return r
    }, r => {
      const s = r.data?.runner_status
      if (stopRequested.value && s === 'stopped') return true
      return ['completed', 'stopped'].includes(s)
    }, 5000, 3 * 60 * 60 * 1000)

    if (stopRequested.value) {
      stopped.value = true
      addLog('Simulation stopped — report skipped.')
      running.value = false
      return
    }

    // 6. Report
    stageIndex.value = 4
    addLog('Writing the report…')
    let rres = null
    for (let i = 0; i < 30; i++) {
      rres = await generateReport({ simulation_id: simulationId.value })
      if (rres.success && rres.data?.report_id) break
      if (rres.ingestion_pending) { addLog('Graph ingestion still in progress — waiting…'); await sleep(5000); continue }
      break
    }
    if (!rres?.success) throw new Error(rres?.error || 'Report generation failed')
    reportId.value = rres.data.report_id
    // report is generated async — poll getReport until markdown_content is ready
    let rep = null
    for (let i = 0; i < 720; i++) {
      try {
        const r = await getReport(reportId.value)
        if (r?.success && r?.data?.markdown_content) { rep = r; break }
      } catch (e) { /* report not ready yet */ }
      await sleep(5000)
    }
    if (!rep) throw new Error('Report generation timed out')
    reportMarkdown.value = rep.data.markdown_content
    reportDownloadUrl.value = URL.createObjectURL(new Blob([reportMarkdown.value], { type: 'text/markdown' }))
    addLog('Report generated.')

    // 7. Load personas
    const prof = await getSimulationProfilesRealtime(simulationId.value)
    personas.value = prof.data?.profiles || []
    addLog(personas.value.length + ' agents ready to talk to.')

    phase.value = 'done'
    running.value = false
  } catch (e) {
    error.value = e.message || String(e)
    addLog('ERROR: ' + error.value)
    running.value = false
  }
}

// simple markdown → html
function mdToHtml(md) {
  if (!md) return ''
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const lines = md.split('\n')
  let html = '', inCode = false, inList = false
  for (const line of lines) {
    const raw = line.trimEnd()
    if (raw.trim().startsWith('```')) { inCode = !inCode; html += inCode ? '<pre><code>' : '</code></pre>'; continue }
    if (inCode) { html += esc(raw) + '\n'; continue }
    if (/^#{1,4}\s/.test(raw)) { const h = raw.match(/^(#+)/)[1].length; html += `<h${h}>${esc(raw.replace(/^#+\s*/, ''))}</h${h}>`; continue }
    if (/^[-*]\s/.test(raw)) { if (!inList) { html += '<ul>'; inList = true } html += `<li>${inline(raw.replace(/^[-*]\s/, ''))}</li>`; continue }
    else if (inList) { html += '</ul>'; inList = false }
    if (raw.trim() === '') { html += ''; continue }
    if (/^\d+\.\s/.test(raw)) { html += `<p>${esc(raw)}</p>`; continue }
    html += `<p>${inline(raw)}</p>`
  }
  if (inList) html += '</ul>'
  if (inCode) html += '</code></pre>'
  return html
}
function inline(s) {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
const reportHtml = computed(() => mdToHtml(reportMarkdown.value))

function selectPersona(i) { activePersona.value = i; chat.value = []; nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = 0 }) }

async function sendChat() {
  const msg = chatInput.value.trim()
  if (!msg || activePersona.value === null || sending.value) return
  chat.value.push({ role: 'user', content: msg })
  chatInput.value = ''
  sending.value = true
  nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
  try {
    const res = await interviewAgents({ simulation_id: simulationId.value, interviews: [{ agent_id: activePersona.value, prompt: msg }] })
    const resultData = res.data?.result || res.data
    const resultsDict = resultData?.results || resultData
    let content = null
    const id = activePersona.value
    if (resultsDict && typeof resultsDict === 'object' && !Array.isArray(resultsDict)) {
      const hit = resultsDict[`reddit_${id}`] || resultsDict[`twitter_${id}`] || Object.values(resultsDict)[0]
      if (hit) content = hit.response || hit.answer
    } else if (Array.isArray(resultsDict) && resultsDict.length) {
      content = resultsDict[0].response || resultsDict[0].answer
    }
    chat.value.push({ role: 'assistant', content: content || '(no response)' })
  } catch (e) {
    chat.value.push({ role: 'assistant', content: '⚠️ ' + (e.message || 'request failed') })
  } finally {
    sending.value = false
    nextTick(() => { if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight })
  }
}

onMounted(runPipeline)
</script>

<style scoped>
:root { --ink:#0f172a; --muted:#64748b; --blue:#2563eb; --line:#e2e8f0; --bg:#f6f8fb; --card:#fff; }
* { box-sizing: border-box; }
.simple-root { min-height: 100vh; background: var(--bg); color: var(--ink); font-family: 'Inter','Segoe UI',system-ui,sans-serif; }

.topbar { height: 56px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; position: sticky; top: 0; z-index: 20; }
.brand { font-weight: 800; letter-spacing: .5px; font-size: 1.05rem; cursor: pointer; }
.brand span { color: #38bdf8; }
.top-right { display: flex; align-items: center; gap: 14px; }
.mode-badge { background: #38bdf8; color: #0f172a; font-size: .72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.gh { color: #cbd5e1; text-decoration: none; font-size: .85rem; }

.stage-wrap { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
.stage-card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; padding: 34px 32px; box-shadow: 0 10px 40px -18px rgba(15,23,42,.15); }
.stage-card h1 { font-size: 1.7rem; margin: 0 0 8px; }
.sub { color: var(--muted); font-size: .95rem; margin: 0 0 26px; line-height: 1.55; }

.stepper { display: flex; justify-content: space-between; margin-bottom: 22px; }
.step { display: flex; flex-direction: column; align-items: center; gap: 7px; flex: 1; position: relative; }
.step::before { content:''; position: absolute; top: 13px; left: -50%; width: 100%; height: 2px; background: var(--line); z-index: 0; }
.step:first-child::before { display: none; }
.step-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--line); color: #94a3b8; display: grid; place-items: center; font-size: .8rem; font-weight: 700; z-index: 1; }
.step.active .step-dot { background: var(--blue); color: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.15); }
.step.done .step-dot { background: #16a34a; color: #fff; }
.step-label { font-size: .72rem; color: var(--muted); font-weight: 600; }
.step.active .step-label { color: var(--blue); }

.pbar { height: 10px; background: var(--line); border-radius: 999px; overflow: hidden; }
.pbar-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #38bdf8); border-radius: 999px; transition: width .5s ease; }
.progress-meta { display: flex; justify-content: space-between; margin-top: 8px; font-size: .85rem; }
.stage-label { color: var(--blue); font-weight: 600; }
.pct { color: var(--muted); }

.log { margin-top: 22px; background: #0f172a; border-radius: 12px; padding: 14px 16px; height: 200px; overflow-y: auto; font-family: 'JetBrains Mono', monospace; font-size: .78rem; }
.log-line { color: #94a3b8; padding: 3px 0; line-height: 1.5; }
.log-time { color: #38bdf8; margin-right: 8px; }

.btn { font-family: inherit; border: none; cursor: pointer; font-weight: 600; border-radius: 10px; }
.actions-row { display: flex; gap: 10px; margin-top: 16px; }
.stop-btn { background: #ef4444; color: #fff; padding: 10px 18px; }
.stop-btn:disabled { opacity: .6; cursor: not-allowed; }
.err-btn { background: #fee2e2; color: #b91c1c; padding: 10px 18px; }

.result-wrap { max-width: 1080px; margin: 0 auto; padding: 28px 24px 60px; }
.tabs { display: flex; gap: 8px; margin-bottom: 18px; }
.tabs button { font-family: inherit; padding: 10px 18px; border-radius: 10px; border: 1px solid var(--line); background: #fff; color: var(--muted); font-weight: 600; cursor: pointer; font-size: .9rem; }
.tabs button.active { background: var(--blue); color: #fff; border-color: var(--blue); }

.report-card { background: #fff; border: 1px solid var(--line); border-radius: 16px; padding: 30px 34px; }
.report-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.report-head h2 { font-size: 1.3rem; margin: 0; }
.dl { color: var(--blue); text-decoration: none; font-weight: 600; font-size: .88rem; }
.md { line-height: 1.7; font-size: .96rem; color: #1e293b; }
.md :deep(h1), .md :deep(h2), .md :deep(h3), .md :deep(h4) { margin: 1.2em 0 .5em; color: var(--ink); }
.md :deep(h1) { font-size: 1.5rem; } .md :deep(h2) { font-size: 1.25rem; } .md :deep(h3) { font-size: 1.05rem; }
.md :deep(p) { margin: .6em 0; }
.md :deep(ul) { margin: .5em 0; padding-left: 1.4em; }
.md :deep(li) { margin: .25em 0; }
.md :deep(code) { background: #f1f5f9; padding: 2px 6px; border-radius: 5px; font-size: .85em; }
.md :deep(pre) { background: #0f172a; color: #e2e8f0; padding: 14px; border-radius: 10px; overflow-x: auto; }

.chat-layout { display: grid; grid-template-columns: 260px 1fr; gap: 18px; align-items: start; }
.persona-list { background: #fff; border: 1px solid var(--line); border-radius: 14px; overflow: hidden; }
.persona-h { padding: 12px 16px; font-weight: 700; font-size: .85rem; color: var(--muted); border-bottom: 1px solid var(--line); }
.persona { display: flex; align-items: center; gap: 11px; width: 100%; padding: 12px 16px; border: none; background: transparent; cursor: pointer; text-align: left; font-family: inherit; border-bottom: 1px solid #f1f5f9; }
.persona:hover { background: #f8fafc; }
.persona.active { background: #eff6ff; border-left: 3px solid var(--blue); }
.avatar { width: 34px; height: 34px; border-radius: 50%; background: #e0e7ff; color: #4338ca; display: grid; place-items: center; font-weight: 700; flex: 0 0 auto; }
.p-info { display: flex; flex-direction: column; min-width: 0; }
.p-name { font-weight: 600; font-size: .88rem; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.p-role { font-size: .75rem; color: var(--muted); }

.chat-panel { background: #fff; border: 1px solid var(--line); border-radius: 14px; display: flex; flex-direction: column; height: 620px; }
.chat-head { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-bottom: 1px solid var(--line); }
.messages { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.msg { display: flex; gap: 10px; max-width: 80%; }
.msg.user { align-self: flex-end; flex-direction: row-reverse; }
.msg .avatar { width: 30px; height: 30px; font-size: .8rem; background: #fbbf24; color: #7c2d12; }
.msg.user .avatar { background: var(--blue); color: #fff; }
.bubble { padding: 10px 14px; border-radius: 12px; background: #f1f5f9; font-size: .9rem; line-height: 1.55; white-space: pre-wrap; }
.msg.user .bubble { background: var(--blue); color: #fff; }
.empty-chat { color: var(--muted); text-align: center; margin: auto; font-size: .9rem; }
.chat-input { display: flex; gap: 10px; padding: 14px; border-top: 1px solid var(--line); }
.chat-input textarea { flex: 1; border: 1px solid var(--line); border-radius: 10px; padding: 11px 13px; font-family: inherit; font-size: .9rem; resize: none; }
.chat-input textarea:focus { outline: 2px solid var(--blue); border-color: transparent; }
.send { background: var(--blue); color: #fff; padding: 0 20px; }
.send:disabled { opacity: .5; cursor: not-allowed; }

@media (max-width: 720px) { .chat-layout { grid-template-columns: 1fr; } .stepper { flex-wrap: wrap; gap: 8px; } }

.done-banner { margin-bottom: 16px; padding: 14px 18px; background: #ecfdf5; border: 1px solid #86efac; color: #047857; border-radius: 12px; font-weight: 700; font-size: 1rem; }
</style>
