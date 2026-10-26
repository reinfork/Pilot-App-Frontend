<script setup lang="ts">
interface LegendItem { code: string; label: string; color: string }
interface Entry { id: string; duty_date: string; status: number; base_name: string; base_color: string; duty_type: string; count_schedules: number; count_logbooks: number }
interface Month { year: number; month: number; today: string; legend: LegendItem[]; schedules: Entry[] }

const { $api } = useNuxtApp()

const seed = await $api<{ today: string }>('/documents')
const [sy, sm] = seed.today.split('-').map(Number)
const year = ref(sy)
const month = ref(sm)

const { data, pending, error } = await useAsyncData('sched-month', () => $api<Month>(`/schedules?year=${year.value}&month=${month.value}`), { watch: [year, month] })

const title = computed(() => new Date(Date.UTC(year.value, month.value - 1, 1)).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }))

function step(d: number) {
  const m = month.value - 1 + d
  year.value += Math.floor(m / 12)
  month.value = ((m % 12) + 12) % 12 + 1
}

const pad = (n: number) => String(n).padStart(2, '0')

const cells = computed(() => {
  if (!data.value) return []
  const lead = (new Date(Date.UTC(year.value, month.value - 1, 1)).getUTCDay() + 6) % 7
  const days = new Date(Date.UTC(year.value, month.value, 0)).getUTCDate()
  const byDate = new Map(data.value.schedules.map(e => [e.duty_date, e]))
  const out: ({ iso: string; day: number; entry: Entry | null } | null)[] = []
  for (let i = 0; i < lead; i++) out.push(null)
  for (let d = 1; d <= days; d++) {
    const iso = `${year.value}-${pad(month.value)}-${pad(d)}`
    out.push({ iso, day: d, entry: byDate.get(iso) ?? null })
  }
  return out
})

function ink(hex: string) {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#0E2138' : '#FFFFFF'
}
</script>

<template>
  <main class="sched">
    <div class="bar">
      <button aria-label="Previous month" @click="step(-1)">‹</button>
      <h1>{{ title }}</h1>
      <button aria-label="Next month" @click="step(1)">›</button>
    </div>
    <p v-if="pending">Loading…</p>
    <p v-else-if="error || !data" class="error" role="alert">Couldn't load schedules.</p>
    <template v-else>
      <div class="grid" role="grid" aria-label="Monthly schedule">
        <span v-for="w in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="w" class="week">{{ w }}</span>
        <template v-for="(c, i) in cells" :key="i">
          <span v-if="!c" class="blank" />
          <NuxtLink v-else :to="`/schedule/${c.iso}`" class="day" :class="{ today: c.iso === data.today }" :style="c.entry ? { background: c.entry.base_color, color: ink(c.entry.base_color) } : {}" :aria-label="c.entry ? `${c.iso}: ${c.entry.duty_type}, ${c.entry.base_name}` : c.iso">
            <span class="num">{{ c.day }}</span>
            <span v-if="c.entry" class="base">{{ c.entry.base_name }}</span>
            <span v-if="c.entry" class="mark">{{ c.entry.count_logbooks === c.entry.count_schedules ? '✓' : c.entry.count_schedules - c.entry.count_logbooks }}</span>
          </NuxtLink>
        </template>
      </div>
      <ul class="legend">
        <li v-for="l in data.legend" :key="l.code">
          <span class="dot" :style="{ background: l.color }" />{{ l.label }}
        </li>
      </ul>
    </template>
    <BottomNav />
  </main>
</template>

<style scoped lang="scss" src="./index.scss"></style>
