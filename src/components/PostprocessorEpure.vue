<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton, NPagination } from "naive-ui";
import type { ComputationResult } from "@/helpers/processor";
import type { Bar } from "@/store";
import { renderEpure } from "@/helpers/render";

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

async function render(index: number) {
  if (epureRef.value === null || props.computation === null) return;

  await renderEpure(props.bars, props.computation, index, {
    el: epureRef.value,
  });
}

onMounted(async () => {
  await render(0);
});
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1rem; flex: auto">
    <div style="display: flex; justify-content: space-between; gap: 1rem">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <n-pagination :default-page="1" :page-count="3" @update:page="handlePageUpdate">
        <template #label="value">
          <span v-if="value.node === 1">N<sub>x</sub></span>
          <span v-else-if="value.node === 2">&#963;<sub>x</sub></span>
          <span v-else-if="value.node === 3">U<sub>x</sub></span>
          <span v-else>{{ value.node }}</span>
        </template>
      </n-pagination>
    </div>
    <div ref="epureRef" style="flex: auto"></div>
  </div>
</template>
