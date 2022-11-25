<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NPagination, NCheckbox } from "naive-ui";
import { AutoScaleAxis, LineChart, type SeriesObject } from "chartist";
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
      L: bar.length,
      Nx: Nx[index],
      Ux: Ux[index],
      Sx: Sx[index],
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
});

const pageCount = computed(() => props.bars.length);
const pageValue = ref(1);

async function handlePageUpdate() {
  await render(pageValue.value - 1);
}

const chartRef = ref<HTMLDivElement | null>(null);

const nxChecked = ref(true);
const sxChecked = ref(true);
const uxChecked = ref(true);

async function handleCheckboxUpdate() {
  await render(pageValue.value - 1);
}

async function render(index: number) {
  if (chartRef.value === null || barsData.value.length === 0) return;

  const a = 0,
    b = barsData.value[index].L;

  const { Nx, Ux, Sx } = barsData.value[index];

  const series: SeriesObject[] = [];

  if (nxChecked.value) {
    series.push({
      name: "N\u2093",
      data: [
        { x: a, y: Nx(a) },
        { x: b, y: Nx(b) },
      ],
    });
  }

  if (sxChecked.value) {
    series.push({
      name: "\u03C3\u2093",
      data: [
        { x: a, y: Sx(a) },
        { x: b, y: Sx(b) },
      ],
    });
  }

  if (uxChecked.value) {
    series.push({
      name: "U\u2093",
      data: range(a, b, (b - a) / 100).map((value) => ({ x: value, y: Ux(value) })),
    });
  }

  new LineChart(
    chartRef.value,
    {
      series: series,
    },
    {
      showPoint: false,
      axisX: {
        type: AutoScaleAxis,
        scaleMinSpace: 50,
      },
      axisY: {
        type: AutoScaleAxis,
        scaleMinSpace: 40,
        offset: 50,
      },
      plugins: [ctLineLabels({})],
    }
  );
}

onMounted(async () => {
  await render(pageValue.value - 1);
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; flex: auto">
    <div style="display: flex; justify-content: space-between; gap: 1rem">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <div style="display: flex; align-items: center; justify-content: end; gap: 1rem; flex-wrap: wrap-reverse">
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <n-checkbox v-model:checked="nxChecked" @update:checked="handleCheckboxUpdate">N<sub>x</sub></n-checkbox>
          <n-checkbox v-model:checked="sxChecked" @update:checked="handleCheckboxUpdate">&#963;<sub>x</sub></n-checkbox>
          <n-checkbox v-model:checked="uxChecked" @update:checked="handleCheckboxUpdate">U<sub>x</sub></n-checkbox>
        </div>
        <n-pagination v-model:page="pageValue" :page-count="pageCount" @update:page="handlePageUpdate" />
      </div>
    </div>
    <div ref="chartRef" style="flex: auto"></div>
  </div>
</template>
