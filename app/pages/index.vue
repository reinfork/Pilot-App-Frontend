<script setup lang="ts">
import { Chart } from 'chart.js/auto'

interface SummaryPoint { date: string; value: number }
interface Summary { range: string; today: string; limit: number; max: number; series: SummaryPoint[] }
interface Pilot { name: string; total_flight_hours: number; avatar_url: string }
interface Doc { id: string; label: string; expiryDate: string; daysRemaining: number; status: 'expired' | 'soon' | 'safe' }

type Range = '1w' | '1m' | '3m' | '6m' | '1y'
const ranges: Range[] = ['1w', '1m', '3m', '6m', '1y']

const { $api } = useNuxtApp()
const range = ref<Range>('1w')

const { data: home, pending: homePending, error: homeError } = await useAsyncData('home', async () => {
  const [me, docs, w, m, y] = await Promise.all([
    $api<Pilot>('/pilot/me'),
    $api<{ today: string; documents: Doc[] }>('/documents'),
    $api<Summary>('/flight-hours/summary?range=1w'),
    $api<Summary>('/flight-hours/summary?range=1m'),
    $api<Summary>('/flight-hours/summary?range=1y'),
  ])
  const [day] = await $api<{ hours: number }[]>(`/flight-hours?from=${w.today}&to=${w.today}`)
  return { me, docs, w, m, y, dayHours: day?.hours ?? 0 }
})

const { data: chart } = await useAsyncData('chart', () => $api<Summary>(`/flight-hours/summary?range=${range.value}`), { watch: [range] })

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

const at = (s: Summary) => s.series.find(p => p.date === s.today)?.value ?? 0
const cards = computed(() => {
  if (!home.value) return []
  const { w, m, y, dayHours } = home.value
  return [
    { label: 'Daily', value: dayHours, limit: 8 },
    { label: 'Weekly', value: at(w), limit: w.limit },
    { label: 'Monthly', value: at(m), limit: m.limit },
    { label: 'Annual', value: at(y), limit: y.limit },
  ]
})

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

function docLine(d: Doc) {
  return d.status === 'expired' ? `Expired ${Math.abs(d.daysRemaining)} days ago` : `${d.daysRemaining} days left`
}

const canvas = ref<HTMLCanvasElement | null>(null)
let chartJs: Chart | null = null

function draw() {
  const el = canvas.value
  const s = chart.value
  if (!el || !s) return
  chartJs?.destroy()
  chartJs = new Chart(el, {
    type: 'line',
    data: {
      labels: s.series.map(p => fmtDate(p.date)),
      datasets: [
        {
          data: s.series.map(p => p.value),
          borderColor: '#22C5E8',
          backgroundColor: '#22C5E8',
          tension: 0.3,
          pointRadius: s.series.map(p => (p.date === s.today ? 5 : 0)),
          pointHoverRadius: 5,
        },
        {
          data: s.series.map(() => s.limit),
          borderColor: '#E63757',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: Math.max(s.max, Math.ceil(Math.max(...s.series.map(p => p.value)))) },
        x: { ticks: { maxTicksLimit: 5, maxRotation: 0 } },
      },
    },
  })
}

onMounted(draw)
watch(chart, draw)
</script>

<template>
  <main class="home">
    <p v-if="homePending">Loading…</p>
    <p v-else-if="homeError || !home" class="error" role="alert">Couldn't load pilot data.</p>
    <template v-else>
      <header>
        <img :src="home.me.avatar_url" alt="Pilot avatar" width="48" height="48" />
        <div>
          <p class="greet">{{ greeting }}</p>
          <h1>{{ home.me.name }}</h1>
          <p class="total">{{ home.me.total_flight_hours }} total hours</p>
        </div>
      </header>

      <section aria-label="Hours to limit">
        <h2>Hours to limit</h2>
        <ul class="cards">
          <li v-for="c in cards" :key="c.label" :class="{ over: c.value > c.limit }">
            <span class="label">{{ c.label }}</span>
            <span class="value">{{ c.value }}</span>
            <span class="limit">of {{ c.limit }} h</span>
          </li>
        </ul>
        <div class="ranges" role="group" aria-label="Chart range">
          <button v-for="r in ranges" :key="r" :class="{ active: r === range }" @click="range = r">{{ r }}</button>
        </div>
        <div class="chart">
          <canvas ref="canvas" aria-label="Rolling flight hours trend" role="img" />
        </div>
      </section>

      <section aria-label="My documents">
        <h2>My documents</h2>
        <ul class="docs">
          <li v-for="d in home.docs.documents" :key="d.id">
            <div>
              <p class="doc-label">{{ d.label }}</p>
              <p class="doc-date">{{ fmtDate(d.expiryDate) }} · {{ docLine(d) }}</p>
            </div>
            <span class="badge" :data-status="d.status">{{ d.status }}</span>
          </li>
        </ul>
      </section>
    </template>
    <BottomNav />
  </main>
</template>

<style scoped lang="scss">
.home {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px 96px;
  display: grid;
  gap: 20px;
}

header {
  display: flex;
  gap: 12px;
  align-items: center;

  img {
    border-radius: 50%;
  }
}

.greet {
  color: $text-secondary;
  font-size: 13px;
}

h1 {
  color: $navy;
  font-size: 20px;
  font-weight: 800;
}

.total {
  font-size: 13px;
  font-weight: 700;
}

h2 {
  color: $navy;
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 10px;
}

section {
  display: grid;
}

.cards {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  li {
    background: $surface;
    border-radius: $radius-sm;
    box-shadow: $shadow-card;
    padding: 14px;
    display: grid;
    gap: 2px;
  }
}

.label {
  font-size: 12px;
  font-weight: 700;
  color: $text-secondary;
}

.value {
  font-size: 24px;
  font-weight: 800;
  color: $navy;
}

.over .value {
  color: $danger;
}

.limit {
  font-size: 12px;
  color: $text-secondary;
}

.ranges {
  display: flex;
  gap: 6px;
  margin: 14px 0 10px;

  button {
    flex: 1;
    height: 36px;
    border: 1px solid #e2e5ea;
    border-radius: 999px;
    background: $surface;
    color: $text-secondary;
    font-size: 13px;
    font-weight: 800;

    &.active {
      background: $navy;
      border-color: $navy;
      color: #fff;
    }
  }
}

.chart {
  position: relative;
  height: 220px;
  background: $surface;
  border-radius: $radius-sm;
  box-shadow: $shadow-card;
  padding: 12px 8px 8px;
}

.docs {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 10px;

  li {
    background: $surface;
    border-radius: $radius-sm;
    box-shadow: $shadow-card;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
}

.doc-label {
  font-size: 14px;
  font-weight: 700;
}

.doc-date {
  font-size: 12px;
  color: $text-secondary;
}

.badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 800;
  text-transform: capitalize;
  padding: 4px 10px;
  border-radius: 999px;
  color: #fff;

  &[data-status='expired'] { background: $danger; }
  &[data-status='soon'] { background: $warning; }
  &[data-status='safe'] { background: $success; }
}

.error {
  color: $danger;
  font-weight: 700;
}
</style>
