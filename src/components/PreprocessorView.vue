<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NButtonGroup, NIcon } from "naive-ui";
import type { Bar, Node } from "@/store";
import { debounce } from "@/helpers/common";
import { renderConstruction } from "@/helpers/render";
import IconAdd from "@/components/icons/IconAdd.vue";
import IconRemove from "@/components/icons/IconRemove.vue";

const props = defineProps<{
  nodes: Node[];
  bars: Bar[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const xr = computed(() => props.nodes.map((value) => value.x));
const constructionWidth = computed(() => Math.max(...xr.value) - Math.min(...xr.value));
const areas = computed(() => props.bars.map((value) => value.Ig.A));
const constructionHeight = computed(() => Math.max(...areas.value));

const percentageStep = 5;
const widthPercentage = ref(100);
const heightPercentage = ref(25);

const container = ref<HTMLDivElement | null>(null);
const containerWidth = ref(0);
const containerHeight = ref(0);

const immutableWidthRatio = computed(() => containerWidth.value * 0.06);
const immutableHeightRatio = computed(() => containerHeight.value * 0.06);

const mutableWidthRatio = computed(() =>
  container.value
    ? ((containerWidth.value - immutableWidthRatio.value * 1.2) / constructionWidth.value) *
      (widthPercentage.value / 100)
    : 0
);
const mutableHeightRatio = computed(() =>
  container.value
    ? ((containerHeight.value - immutableHeightRatio.value * 3) / constructionHeight.value) *
      (heightPercentage.value / 100)
    : 0
);

async function increaseSize({ widthFactor = percentageStep, heightFactor = percentageStep } = {}) {
  if (widthPercentage.value + widthFactor <= 100 && heightPercentage.value + heightFactor <= 100) {
    widthPercentage.value += widthFactor;
    heightPercentage.value += heightFactor;
    await render();
  }
}

async function decreaseSize({ widthFactor = percentageStep, heightFactor = percentageStep } = {}) {
  if (widthPercentage.value > 5 * widthFactor && heightPercentage.value > 2 * heightFactor) {
    widthPercentage.value -= widthFactor;
    heightPercentage.value -= heightFactor;
    await render();
  }
}

const padding = computed(() => immutableWidthRatio.value / 2 - Math.min(...xr.value) * mutableWidthRatio.value);

async function render() {
  if (container.value === null) return;
  const svg = await renderConstruction(props.nodes, props.bars, {
    width: containerWidth.value,
    height: containerHeight.value,
    barWidthRatio: mutableWidthRatio.value,
    barHeightRatio: mutableHeightRatio.value,
    widthRatio: immutableWidthRatio.value,
    heightRatio: immutableHeightRatio.value,
    padding: padding.value,
    barColor: "#b0b0b0",
  });
  container.value.innerHTML = svg?.svg() ?? "";
}

const debouncedRender = debounce(render, 100);

onMounted(async () => {
  if (container.value !== null) {
    containerWidth.value = container.value.clientWidth;
    containerHeight.value = container.value.clientHeight;
    await render();

    const observer = new ResizeObserver(async (entries) => {
      const entry = entries[0];
      containerWidth.value = entry.contentRect.width;
      containerHeight.value = entry.contentRect.height;
      debouncedRender();
    });
    observer.observe(container.value);
  }
});
</script>

<template>
  <div style="display: flex; flex-direction: column; flex: auto">
    <div style="display: flex; justify-content: space-between; flex: 0 1 auto">
      <n-button tertiary @click="emit('back')">Назад</n-button>
      <div style="display: flex; gap: 1rem">
        <div>
          <n-button-group style="margin-bottom: 0.5rem">
            <n-button ghost @click="increaseSize({ heightFactor: 0 })">
              <template #icon>
                <n-icon size="1rem"><icon-add /></n-icon>
              </template>
            </n-button>
            <n-button ghost @click="decreaseSize({ heightFactor: 0 })">
              <template #icon>
                <n-icon size="1rem"><icon-remove /></n-icon>
              </template>
            </n-button>
          </n-button-group>
          <div style="text-align: center">Ширина</div>
        </div>
        <div>
          <n-button-group style="margin-bottom: 0.5rem">
            <n-button ghost @click="increaseSize({ widthFactor: 0 })">
              <template #icon>
                <n-icon size="1rem"><icon-add /></n-icon>
              </template>
            </n-button>
            <n-button ghost @click="decreaseSize({ widthFactor: 0 })">
              <template #icon>
                <n-icon size="1rem"><icon-remove /></n-icon>
              </template>
            </n-button>
          </n-button-group>
          <div style="text-align: center">Высота</div>
        </div>
      </div>
    </div>
    <div ref="container" style="display: flex; flex: auto"></div>
  </div>
</template>
