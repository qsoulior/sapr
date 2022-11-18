<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NButtonGroup, NIcon } from "naive-ui";
import { SVG, type G, Container, Box } from "@svgdotjs/svg.js";
import type { Bar, Node } from "@/store";
import { debounce } from "@/helpers/common";
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

async function arrow(svg: Container, fromX: number, fromY: number, toX: number, toY: number): Promise<G> {
  const arrow = svg.group();
  const headLen = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  arrow.line(fromX, fromY, toX, toY);
  arrow
    .line(toX, toY, toX - headLen * Math.cos(angle - Math.PI / 7), toY - headLen * Math.sin(angle - Math.PI / 7))
    .stroke({ linecap: "round" });
  arrow
    .line(toX, toY, toX - headLen * Math.cos(angle + Math.PI / 7), toY - headLen * Math.sin(angle + Math.PI / 7))
    .stroke({ linecap: "round" });
  return arrow;
}

async function concentratedLoad(svg: Container, x: number, y: number, reversed = false): Promise<G> {
  const maxImmutableRatio = Math.max(immutableWidthRatio.value, immutableHeightRatio.value + 20);
  const loadLen = maxImmutableRatio / 2;
  const loadWidth = Math.min(immutableWidthRatio.value, immutableHeightRatio.value) / 10;

  const [fromX, toX] = reversed ? [x + loadLen, x] : [x, x + loadLen];
  return (await arrow(svg, fromX, y, toX, y)).stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
}

async function distributedLoad(svg: Container, fromX: number, toX: number, y: number): Promise<G> {
  const arrows = svg.group();
  let reversed = false;
  if (toX < fromX) {
    [toX, fromX] = [fromX, toX];
    reversed = true;
  }

  const loadWidth = Math.min(immutableWidthRatio.value, immutableHeightRatio.value) / 30;
  const space = Math.floor(Math.max(immutableWidthRatio.value, immutableHeightRatio.value + 15) / 2);

  for (let x = fromX; x + 0.7 * space <= toX; x += space) {
    const [x1, x2] = reversed ? [x + 0.7 * space, x] : [x, x + 0.7 * space];
    arrow(arrows, x1, y, x2, y);
  }
  return arrows.stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
}

async function support(
  svg: Container,
  x: number,
  fromY: number,
  toY: number,
  reversed = false,
  color: string
): Promise<G> {
  const support = svg.group();
  const space = Math.min(immutableWidthRatio.value, immutableHeightRatio.value) / 3;
  const head = reversed ? -space : space;

  support.line(x, fromY, x, toY);

  for (let i = fromY; Math.floor(i) <= Math.ceil(toY); i += space) {
    support.line(x, i, x + head, i - head);
  }
  return support.stroke(color);
}

async function number(
  svg: Container,
  text: string,
  x: number,
  y: number,
  type: "bar" | "node",
  color: string
): Promise<G> {
  const group = svg.group();

  const maxImmutableRatio = Math.max(immutableWidthRatio.value, immutableHeightRatio.value, 60);

  const figureSize = maxImmutableRatio / 4;

  const figure =
    type === "node"
      ? group.rect(figureSize, figureSize).attr({ stroke: color, fill: "transparent" })
      : group.circle(figureSize).attr({ stroke: color, fill: "transparent" });
  figure.cx(x);
  figure.y(y);

  const nodeText = group
    .text(text)
    .font({ size: maxImmutableRatio / 6 })
    .fill(color);
  nodeText.cx(x);
  nodeText.cy(figure.cy());

  return group;
}

async function renderBars(svg: Container, padding: number, color: string) {
  const boxes = new Map<number, Box>();
  const addBox = async (x: number, value: Box) => {
    const box = boxes.get(x);
    if ((box !== undefined && box.height < value.height) || box === undefined) {
      boxes.set(x, value);
    }
  };

  for (const bar of props.bars) {
    const rect = svg
      .rect(Math.max(0.01, bar.length * mutableWidthRatio.value), Math.max(0.01, bar.Ig.A * mutableHeightRatio.value))
      .attr({ stroke: color, fill: "transparent" });
    rect.x(bar.start * mutableWidthRatio.value + padding);
    rect.cy(svg.cy());

    if (bar.Qx !== 0) {
      const [x1, x2] = bar.Qx < 0 ? [rect.bbox().x2, rect.bbox().x] : [rect.bbox().x, rect.bbox().x2];
      await distributedLoad(svg, x1, x2, rect.bbox().cy);
    }
    await number(svg, bar.label, rect.bbox().cx, rect.bbox().y2 + 10, "bar", color);

    await addBox(bar.x1, rect.bbox());
    await addBox(bar.x2, rect.bbox());
  }
  return boxes;
}

async function renderNodes(svg: Container, boxes: Map<number, Box>, padding: number, color: string) {
  for (const [index, node] of props.nodes.entries()) {
    const pos = node.x * mutableWidthRatio.value + padding;
    const box = boxes.get(node.x);
    if (box === undefined) break;

    const minHeight = immutableHeightRatio.value * 1.8;
    let [fromY, toY] = [box.y, box.y2];

    if (toY - fromY < minHeight) {
      [fromY, toY] = [svg.cy() - minHeight / 2, svg.cy() + minHeight / 2];
    }

    if (node.Nb) {
      await support(svg, pos, fromY, toY, index !== props.nodes.length - 1, color);
    }

    await number(svg, node.label, pos, toY + 10, "node", "#f06");

    if (node.Fx !== 0) {
      await concentratedLoad(svg, pos, box.cy, node.Fx < 0);
    }
  }
}

async function render() {
  if (container.value === null) return;
  container.value.innerHTML = "";
  const draw = SVG().addTo(container.value).size(containerWidth.value, containerHeight.value);
  const barColor = "#b0b0b0";
  const padding = immutableWidthRatio.value / 2 - Math.min(...xr.value) * mutableWidthRatio.value;

  const boxes = await renderBars(draw, padding, barColor);
  await renderNodes(draw, boxes, padding, barColor);
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
