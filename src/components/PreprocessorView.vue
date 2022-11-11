<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { NButton, NButtonGroup, NIcon } from "naive-ui";
import { SVG, type G, Container, Box } from "@svgdotjs/svg.js";
import type { Bar, Node } from "@/store";
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
const widthPercentage = ref(50);
const heightPercentage = ref(20);

const container = ref<HTMLDivElement | null>(null);

const immutableWidthRatio = computed(() => (container.value ? container.value.clientWidth * 0.06 : 0));
const immutableHeightRatio = computed(() => (container.value ? container.value.clientHeight * 0.06 : 0));

const mutableWidthRatio = computed(() =>
  container.value
    ? ((container.value.clientWidth - immutableWidthRatio.value * 1.2) / constructionWidth.value) *
      (widthPercentage.value / 100)
    : 0
);
const mutableHeightRatio = computed(() =>
  container.value
    ? ((container.value.clientHeight - immutableHeightRatio.value * 3) / constructionHeight.value) *
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
  const loadLen = immutableWidthRatio.value / 2;
  const loadWidth = Math.max(immutableWidthRatio.value, immutableHeightRatio.value) / 25;

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

  const loadWidth = immutableHeightRatio.value / 30;
  const space = Math.floor(immutableWidthRatio.value / 2);

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
  const space = immutableHeightRatio.value / 3;
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

  const maxImmutableRatio = Math.max(immutableWidthRatio.value, immutableHeightRatio.value);

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
  const boxes = new Array<Box>(props.nodes.length);
  const addBox = async (index: number, value: Box) => {
    if ((boxes[index] !== undefined && boxes[index].height < value.height) || boxes[index] === undefined) {
      boxes[index] = value;
    }
  };

  for (const [index, value] of props.bars.entries()) {
    const [I, J] = [props.nodes[value.I], props.nodes[value.J]];

    const rect = svg
      .rect(
        Math.max(0.01, Math.abs(J.x - I.x) * mutableWidthRatio.value),
        Math.max(0.01, value.Ig.A * mutableHeightRatio.value)
      )
      .attr({ stroke: color, fill: "transparent" });
    rect.x((I.x < J.x ? I.x : J.x) * mutableWidthRatio.value + padding);
    rect.cy(svg.cy());

    if (value.Qx !== 0) {
      const [x1, x2] = value.Qx < 0 ? [rect.bbox().x2, rect.bbox().x] : [rect.bbox().x, rect.bbox().x2];
      await distributedLoad(svg, x1, x2, rect.bbox().cy);
    }
    await number(svg, (index + 1).toString(), rect.bbox().cx, rect.bbox().y2 + 10, "bar", color);

    await addBox(value.I, rect.bbox());
    await addBox(value.J, rect.bbox());
  }
  return boxes;
}

async function renderNodes(svg: Container, boxes: Box[], padding: number, color: string) {
  for (const [index, value] of props.nodes.entries()) {
    const pos = value.x * mutableWidthRatio.value + padding;
    const box = boxes[index];

    const minHeight = immutableHeightRatio.value * 1.8;
    let [fromY, toY] = [box.y, box.y2];

    if (toY - fromY < minHeight) {
      [fromY, toY] = [svg.cy() - minHeight / 2, svg.cy() + minHeight / 2];
    }

    if (value.Nb) {
      await support(svg, pos, fromY, toY, index !== boxes.length - 1, color);
    }

    await number(svg, (index + 1).toString(), pos, toY + 10, "node", "#f06");

    if (value.Fx !== 0) {
      await concentratedLoad(svg, pos, box.cy, value.Fx < 0);
    }
  }
}

async function render() {
  if (container.value === null) return;
  container.value.innerHTML = "";
  const draw = SVG().addTo(container.value).size(container.value.clientWidth, container.value.clientHeight);
  const barColor = "#b0b0b0";
  const padding = immutableWidthRatio.value / 2 - Math.min(...xr.value) * mutableWidthRatio.value;

  const boxes = await renderBars(draw, padding, barColor);
  await renderNodes(draw, boxes, padding, barColor);
}

onMounted(async () => {
  await render();
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
