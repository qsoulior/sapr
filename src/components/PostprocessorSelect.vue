<script setup lang="ts">
import { computed, ref } from "vue";
import { NSelect, NInputNumber, NTable, type SelectOption } from "naive-ui";
import { round } from "mathjs";
import type { Bar } from "@/store";
import type { NumberFunction, ComputationResult } from "@/helpers/processor";

const props = defineProps<{
  bars: Bar[];
  computation: ComputationResult | null;
}>();

const selectValue = ref<string | null>(null);
const selectOptions = computed<SelectOption[]>(() =>
  props.bars
    .map((value) => ({ value: value.label, label: value.label }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label))
);

const inputValue = ref<number | null>(null);

const barIndex = computed(() => {
  const index = props.bars.findIndex((value) => value.label === selectValue.value);
  if (index === -1) return 0;
  return index;
});

const Fx = (f?: NumberFunction[]) =>
  computed(() =>
    f && props.computation !== null && selectValue.value !== null && inputValue.value !== null
      ? round(f[barIndex.value](inputValue.value), 8)
      : "\u2013"
  );

const Nx = Fx(props.computation?.Nx);
const Ux = Fx(props.computation?.Ux);
const Sx = Fx(props.computation?.Sx);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem">
    <div>Значения в произвольном сечении</div>
    <div style="display: flex; gap: 1rem">
      <n-select
        v-model:value="selectValue"
        :options="selectOptions"
        placeholder="Выберите стержень"
        @update:value="inputValue = null"
      />
      <n-input-number
        v-model:value="inputValue"
        :show-button="false"
        placeholder="x"
        :disabled="selectValue === null"
        :min="0"
        :max="bars[barIndex].length"
      />
    </div>
    <n-table size="small" :single-line="false">
      <thead>
        <tr>
          <th>N<sub>x</sub></th>
          <th>U<sub>x</sub></th>
          <th>&#963;<sub>x</sub></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ Nx }}</td>
          <td>{{ Ux }}</td>
          <td>{{ Sx }}</td>
        </tr>
      </tbody>
    </n-table>
  </div>
</template>
