<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NPagination } from "naive-ui";
import { AutoScaleAxis, LineChart } from "chartist";
import "chartist/dist/index.css";
import { ctLineLabels } from "@/helpers/chartist";
import { range } from "@/helpers/common";
import type { ComputationResult } from "@/helpers/processor";
import type { Bar } from "@/store";

const props = defineProps<{
  bars: Bar[];
  computation: ComputationResult | null;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const barsData = computed(() => {
  if (props.computation === null) return [];
  const { Nx, Ux, Sx } = props.computation;
  return props.bars
    .map((bar, index) => ({
      label: bar.label,
      Nx: Nx[index],
      Ux: Ux[index],
      Sx: Sx[index],
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
});

const pageCount = computed(() => props.bars.length);

async function handlePageUpdate(page: number) {
  await render(page - 1);
}

const chartRef = ref<HTMLDivElement | null>(null);

async function render(index: number) {
  if (chartRef.value === null || barsData.value.length === 0) return;

  const a = -10,
    b = 10;

  const { Nx, Ux, Sx } = barsData.value[index];

  new LineChart(
    chartRef.value,
    {
      series: [
        {
          name: "N\u2093",
          data: [
            { x: a, y: Nx(a) },
            { x: b, y: Nx(b) },
          ],
        },
        {
          name: "\u03C3\u2093",
          data: [
            { x: a, y: Sx(a) },
            { x: b, y: Sx(b) },
          ],
        },
        {
          name: "U\u2093",
          data: range(a, b, 0.5).map((value) => ({ x: value, y: Ux(value) })),
        },
      ],
    },
    {
      showPoint: false,
      axisX: {
        type: AutoScaleAxis,
        onlyInteger: true,
      },
      plugins: [ctLineLabels({})],
    }
  );
}

onMounted(async () => {
  await render(0);
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; flex: auto">
    <div style="display: flex; justify-content: space-between; gap: 1rem">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <n-pagination :default-page="1" :page-count="pageCount" @update:page="handlePageUpdate" />
    </div>
    <div ref="chartRef" style="flex: auto"></div>
  </div>
</template>

<style>
.ct-label {
  color: rgba(255, 255, 255, 0.5);
}

.ct-grid {
  stroke: rgba(255, 255, 255, 0.5);
}
</style>
