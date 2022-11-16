<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton, NPagination } from "naive-ui";
import { AutoScaleAxis, LineChart } from "chartist";
import type { ComputationResult } from "@/helpers/processor";
import type { Bar } from "@/store";
import { range } from "@/helpers/common";

const props = defineProps<{
  bars: Bar[];
  computation: ComputationResult | null;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const epureRef = ref<HTMLDivElement | null>(null);

async function handlePageUpdate(page: number) {
  await render(page - 1);
}

async function render(n: number) {
  if (epureRef.value === null || props.computation === null) return;

  const { Nx, Ux, Sx } = props.computation;

  const Fx = n === 0 ? Nx : n === 1 ? Sx : Ux;

  new LineChart(
    epureRef.value,
    {
      series: [
        props.bars
          .map((bar, index) =>
            n <= 1
              ? [
                  { x: bar.start, y: Fx[index](0) },
                  { x: bar.end, y: Fx[index](bar.length) },
                ]
              : range(bar.start, bar.end, bar.length / 100).map((x) => ({ x: x, y: Fx[index](x - bar.start) }))
          )
          .reduce((prev, current) => prev.concat(current), []),
      ],
    },
    {
      showArea: true,
      showPoint: false,
      axisX: {
        type: AutoScaleAxis,
        onlyInteger: true,
      },
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
      <n-pagination :default-page="1" :page-count="3" @update:page="handlePageUpdate" />
    </div>
    <div ref="epureRef" style="flex: auto"></div>
  </div>
</template>

<style>
.ct-area {
  fill-opacity: 0.35;
}
</style>
