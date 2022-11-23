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

interface StoredOptions {
  points?: number;
  max?: boolean;
}

const getStoredOptions = (): StoredOptions => JSON.parse(localStorage.getItem("tableOptions") ?? "{}");
const setStoredOptions = (storedOptions: StoredOptions): void => {
  localStorage.setItem("tableOptions", JSON.stringify(storedOptions));
};

const storedOptions = getStoredOptions();
const pointsCount = ref(
  storedOptions.points !== undefined && storedOptions.points >= 2 && storedOptions.points <= 10
    ? storedOptions.points
    : 2
);
const maxChecked = ref(storedOptions.max !== undefined ? storedOptions.max : false);

function handleInputUpdate(value: number | null) {
  if (value === null) pointsCount.value = 2;
  const storedOptions = getStoredOptions();
  if (pointsCount.value !== storedOptions.points) {
    setStoredOptions({ points: pointsCount.value, max: storedOptions.max });
  }
}

function handleCheckboxUpdate(checked: boolean) {
  const storedOptions = getStoredOptions();
  if (checked !== storedOptions.max) {
    setStoredOptions({ points: storedOptions.points, max: checked });
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
        Nx: round(bar.Nx(x), 2),
        Ux: round(bar.Ux(x), 2),
        Sx: round(bar.Sx(x), 2),
        S: round(bar.S, 2),
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
      h(
        NText,
        { type: Math.abs(rowData.Sx) > rowData.S ? "error" : "default" },
        { default: () => rowData.Sx.toFixed(2) }
      ),
  },
  { key: "S", title: "[\u03C3]", width: "22.5%" },
]);

function renderCell(value: number) {
  return value.toFixed(2);
}
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <div style="display: flex; justify-content: space-between; gap: 1rem">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <div style="display: flex; align-items: center; gap: 1rem">
        <n-checkbox v-model:checked="maxChecked" @update:checked="handleCheckboxUpdate">
          max|&#963;<sub>x</sub>|
        </n-checkbox>
        <n-input-number
          v-model:value="pointsCount"
          :disabled="maxChecked"
          :min="2"
          :max="10"
          placeholder=""
          style="max-width: 5rem"
          @update:value="handleInputUpdate"
        />
      </div>
    </div>
    <n-data-table
      :columns="tableColumns"
      :data="tableData"
      :single-line="false"
      :render-cell="renderCell"
      :pagination="{ pageSize: maxChecked ? 1 : pointsCount }"
    />
  </div>
</template>
