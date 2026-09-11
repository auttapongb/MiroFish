<template>
  <div class="stance-dashboard">
    <div class="sd-header">
      <div>
        <h2 class="sd-title">Community Stance</h2>
        <span class="sd-subtitle">{{ personas.length }} personas · Makkasan integrated resort</span>
      </div>
    </div>

    <div class="sd-top">
      <div class="sd-chart-card">
        <div ref="stanceChartRef" class="sd-chart"></div>
      </div>
      <div class="sd-stats">
        <div v-for="s in stats" :key="s.key" class="sd-stat" :class="s.key">
          <span class="sd-stat-count">{{ s.count }}</span>
          <span class="sd-stat-label">{{ s.label }}</span>
        </div>
        <p class="sd-stat-note">Click any persona below for their full profile &amp; rationale.</p>
      </div>
    </div>

    <div class="sd-middle">
      <div class="sd-chart-card">
        <div class="sd-card-title">Where the conversation happened</div>
        <div ref="platformChartRef" class="sd-chart sd-chart-sm"></div>
      </div>
      <div class="sd-chart-card">
        <div class="sd-card-title">Most active voices</div>
        <div ref="personaBarRef" class="sd-chart sd-chart-sm"></div>
      </div>
    </div>

    <div class="sd-chart-card sd-timeline-card">
      <div class="sd-card-title">Activity over time (24 rounds)</div>
      <div ref="timelineRef" class="sd-chart sd-chart-sm"></div>
    </div>

    <div class="sd-persona-grid">
      <div v-for="p in personas" :key="p.name" class="sd-persona-card" :class="p.stance" @click="selected = p">
        <span class="pc-dot"></span>
        <div class="pc-body">
          <span class="pc-name">{{ p.name }}</span>
          <span class="pc-profession">{{ p.profession }}</span>
        </div>
        <span class="pc-stance">{{ p.stance }}</span>
      </div>
    </div>

    <div v-if="selected" class="sd-modal-overlay" @click.self="selected = null">
      <div class="sd-modal">
        <button class="sd-modal-close" @click="selected = null">×</button>
        <span class="sd-modal-stance" :class="selected.stance">{{ selected.stance }}</span>
        <h3 class="sd-modal-name">{{ selected.name }}</h3>
        <p class="sd-modal-profession">{{ selected.profession }}</p>
        <p class="sd-modal-rationale">"{{ selected.rationale }}"</p>
        <p class="sd-modal-bio">{{ selected.bio }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { getStanceAnalysis } from '../api/report'

const props = defineProps({
  simulationId: { type: String, required: true }
})

const stanceChartRef = ref(null)
const platformChartRef = ref(null)
const personaBarRef = ref(null)
const timelineRef = ref(null)
const personas = ref([])
const distribution = ref({})
const platforms = ref({})
const topPersonas = ref([])
const timeline = ref([])
const selected = ref(null)

const STANCE_META = {
  for: { label: 'For', color: '#22c55e' },
  against: { label: 'Against', color: '#ef4444' },
  neutral: { label: 'Neutral', color: '#f59e0b' }
}

const stats = computed(() => [
  { key: 'for', label: 'For', count: distribution.value.for || 0 },
  { key: 'against', label: 'Against', count: distribution.value.against || 0 },
  { key: 'neutral', label: 'Neutral', count: distribution.value.neutral || 0 }
])

const charts = {}

function initChart(ref) {
  if (!ref.value) return null
  const c = echarts.init(ref.value)
  return c
}

function renderStance() {
  const c = charts.stance = charts.stance || initChart(stanceChartRef)
  if (!c) return
  const data = stats.value.map(s => ({ value: s.count, name: s.label, itemStyle: { color: STANCE_META[s.key].color } }))
  c.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#cbd5e1', fontSize: 12 }, icon: 'circle' },
    series: [{
      type: 'pie', radius: ['52%', '78%'], center: ['50%', '46%'],
      itemStyle: { borderRadius: 10, borderColor: '#0f172a', borderWidth: 3 },
      label: { show: true, color: '#e2e8f0', formatter: '{b}\n{d}%', fontSize: 12 },
      emphasis: { scaleSize: 6 },
      data
    }]
  })
}

function renderPlatform() {
  const c = charts.platform = charts.platform || initChart(platformChartRef)
  if (!c) return
  const r = platforms.value.reddit || 0
  const t = platforms.value.twitter || 0
  c.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#cbd5e1', fontSize: 11 }, icon: 'circle' },
    series: [{
      type: 'pie', radius: ['55%', '80%'], center: ['50%', '44%'],
      itemStyle: { borderRadius: 8, borderColor: '#0f172a', borderWidth: 2 },
      label: { show: false },
      data: [
        { value: r, name: 'Reddit', itemStyle: { color: '#ff4500' } },
        { value: t, name: 'Twitter', itemStyle: { color: '#1d9bf0' } }
      ]
    }]
  })
}

function renderPersonaBar() {
  const c = charts.personaBar = charts.personaBar || initChart(personaBarRef)
  if (!c) return
  const list = topPersonas.value.slice().reverse()
  c.setOption({
    backgroundColor: 'transparent',
    grid: { left: 6, right: 24, top: 4, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: { type: 'category', data: list.map(p => p.name), axisLabel: { color: '#cbd5e1', fontSize: 10, width: 90, overflow: 'truncate' } },
    series: [{
      type: 'bar', data: list.map(p => p.actions),
      barWidth: 9, itemStyle: { color: '#38bdf8', borderRadius: [0, 5, 5, 0] }
    }]
  })
}

function renderTimeline() {
  const c = charts.timeline = charts.timeline || initChart(timelineRef)
  if (!c) return
  const rounds = timeline.value.map(t => t.round)
  const acts = timeline.value.map(t => t.actions)
  c.setOption({
    backgroundColor: 'transparent',
    grid: { left: 8, right: 16, top: 12, bottom: 4, containLabel: true },
    tooltip: { trigger: 'axis', formatter: 'Round {b}<br/>Actions: {c}' },
    xAxis: { type: 'category', data: rounds, axisLabel: { color: '#64748b', fontSize: 10, interval: 2 }, axisLine: { lineStyle: { color: '#1e293b' } } },
    yAxis: { type: 'value', axisLabel: { color: '#64748b', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e293b' } } },
    series: [{
      type: 'line', data: acts, smooth: true, symbol: 'circle', symbolSize: 5,
      lineStyle: { color: '#38bdf8', width: 2.5 },
      itemStyle: { color: '#38bdf8' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(56,189,248,.35)' }, { offset: 1, color: 'rgba(56,189,248,0)' }] } }
    }]
  })
}

function renderAll() { renderStance(); renderPlatform(); renderPersonaBar(); renderTimeline() }

function onResize() { Object.values(charts).forEach(c => c && c.resize()) }

onMounted(async () => {
  try {
    const res = await getStanceAnalysis(props.simulationId)
    if (res.success && res.data) {
      personas.value = res.data.personas || []
      distribution.value = res.data.distribution || {}
      platforms.value = res.data.platforms || {}
      topPersonas.value = res.data.top_personas || []
      timeline.value = res.data.timeline || []
      await nextTick()
      renderAll()
    }
  } catch (e) {
    console.error('stance analysis failed', e)
  }
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => { window.removeEventListener('resize', onResize); Object.values(charts).forEach(c => c && c.dispose()) })
</script>

<style scoped>
.stance-dashboard { display: flex; flex-direction: column; gap: 16px; }
.sd-header { display: flex; align-items: center; justify-content: space-between; }
.sd-title { margin: 0; font-size: 18px; font-weight: 700; color: #f1f5f9; }
.sd-subtitle { font-size: 12px; color: #94a3b8; }
.sd-card-title { font-size: 12px; color: #94a3b8; margin: 4px 0 0 8px; }

.sd-top { display: flex; gap: 16px; align-items: stretch; }
.sd-middle { display: flex; gap: 16px; align-items: stretch; }
.sd-timeline-card { flex: 1; min-height: 220px; }
.sd-chart-card {
  flex: 1;
  background: linear-gradient(145deg, #111c2f, #0b1220);
  border: 1px solid #1e293b; border-radius: 14px; padding: 8px;
  min-height: 240px;
}
.sd-chart { width: 100%; height: 240px; }
.sd-chart-sm { height: 190px; }

.sd-stats { flex: 0.8; display: flex; flex-direction: column; gap: 10px; justify-content: center; }
.sd-stat { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 10px; background: #0f172a; border: 1px solid #1e293b; }
.sd-stat-count { font-size: 24px; font-weight: 800; }
.sd-stat-label { font-size: 13px; color: #94a3b8; }
.sd-stat.for .sd-stat-count { color: #22c55e; }
.sd-stat.against .sd-stat-count { color: #ef4444; }
.sd-stat.neutral .sd-stat-count { color: #f59e0b; }
.sd-stat-note { font-size: 11px; color: #64748b; margin: 4px 0 0; }

.sd-persona-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px; }
.sd-persona-card { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; background: #0f172a; border: 1px solid #1e293b; cursor: pointer; transition: transform .12s, border-color .12s; }
.sd-persona-card:hover { transform: translateY(-2px); border-color: #334155; }
.pc-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.sd-persona-card.for .pc-dot { background: #22c55e; }
.sd-persona-card.against .pc-dot { background: #ef4444; }
.sd-persona-card.neutral .pc-dot { background: #f59e0b; }
.pc-body { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.pc-name { font-size: 13px; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-profession { font-size: 11px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pc-stance { font-size: 10px; text-transform: uppercase; letter-spacing: .4px; font-weight: 700; }
.sd-persona-card.for .pc-stance { color: #22c55e; }
.sd-persona-card.against .pc-stance { color: #ef4444; }
.sd-persona-card.neutral .pc-stance { color: #f59e0b; }

.sd-modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.72); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.sd-modal { position: relative; width: min(480px, 92vw); max-height: 82vh; overflow-y: auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px; }
.sd-modal-close { position: absolute; top: 12px; right: 14px; background: none; border: none; color: #94a3b8; font-size: 26px; cursor: pointer; }
.sd-modal-stance { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; }
.sd-modal-stance.for { background: rgba(34,197,94,.15); color: #22c55e; }
.sd-modal-stance.against { background: rgba(239,68,68,.15); color: #ef4444; }
.sd-modal-stance.neutral { background: rgba(245,158,11,.15); color: #f59e0b; }
.sd-modal-name { margin: 12px 0 4px; font-size: 20px; color: #f1f5f9; }
.sd-modal-profession { margin: 0 0 10px; font-size: 13px; color: #94a3b8; }
.sd-modal-rationale { font-size: 14px; color: #e2e8f0; font-style: italic; border-left: 3px solid #334155; padding-left: 12px; margin: 0 0 12px; }
.sd-modal-bio { font-size: 13px; color: #cbd5e1; line-height: 1.6; white-space: pre-wrap; }
</style>
