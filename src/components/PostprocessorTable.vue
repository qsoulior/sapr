<script setup lang="ts">
import { computed, h, ref } from "vue";
import { NButton, NDataTable, NInputNumber, NText, NCheckbox, type DataTableColumns } from "naive-ui";
import { round } from "mathjs";
import type { Bar } from "@/store";
import type { ComputationResult } from "@/helpers/processor";
import { range } from "@/helpers/common";

const props = defineProps<{
  bars: Bar[];
  computation: ComputationResult | null;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const storedPointsCount = parseInt(localStorage.getItem("pointsCount") ?? "");
const pointsCount = ref(storedPointsCount >= 2 && storedPointsCount <= 10 ? storedPointsCount : 2);

function updateInputHandle(value: number | null) {
  if (value === null) pointsCount.value = 2;
  const storedValue = parseInt(localStorage.getItem("pointsCount") ?? "");
  if (pointsCount.value !== storedValue) {
    localStorage.setItem("pointsCount", pointsCount.value.toString());
  }
}

interface TableData {
  x: number;
  Nx: number;
  Ux: number;
  Sx: number;
  S: number;
}

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
      S: bar.Ig.S,
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));
});

const tableData = computed<TableData[]>(() => {
  const data: TableData[] = [];
  for (const bar of barsData.value) {
    const step = bar.L / (pointsCount.value - 1);
    const points: Array<number> = maxChecked.value
      ? Math.abs(bar.Sx(0)) > Math.abs(bar.Sx(bar.L))
        ? [0]
        : [bar.L]
      : range(0, bar.L + step / 10, step);
    for (const x of points) {
      data.push({
        x: round(x, 2),
        Nx: round(bar.Nx(x), 8),
        Ux: round(bar.Ux(x), 8),
        Sx: round(bar.Sx(x), 8),
        S: round(bar.S, 8),
      });
    }
  }
  return data;
});

const tableColumns = ref<DataTableColumns<TableData>>([
  { key: "x", title: "x" },
  { key: "Nx", title: () => ["N", h("sub", "x")], width: "22.5%" },
  { key: "Ux", title: () => ["U", h("sub", "x")], width: "22.5%" },
  {
    key: "Sx",
    title: () => ["\u03C3", h("sub", "x")],
    width: "22.5%",
    render: (rowData) =>
      h(NText, { type: Math.abs(rowData.Sx) > rowData.S ? "error" : "default" }, { default: () => rowData.Sx }),
  },
  { key: "S", title: "[\u03C3]", width: "22.5%" },
]);

const maxChecked = ref(false);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <div style="display: flex; justify-content: space-between; gap: 1rem">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <div style="display: flex; align-items: center; gap: 1rem">
        <n-checkbox v-model:checked="maxChecked">max|&#963;<sub>x</sub>|</n-checkbox>
        <n-input-number
          v-model:value="pointsCount"
          :disabled="maxChecked"
          :min="2"
          :max="10"
          placeholder=""
          style="max-width: 5rem"
          @update:value="updateInputHandle"
        />
      </div>
    </div>
    <n-data-table
      :columns="tableColumns"
      :data="tableData"
      :single-line="false"
      :pagination="{ pageSize: maxChecked ? 1 : pointsCount }"
    />
  </div>
</template>
