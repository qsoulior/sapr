<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton } from "naive-ui";
import { SVG, type Svg, type G } from "@svgdotjs/svg.js";
import type { Bar } from "@/store";

const props = defineProps<{
  bars: Bar[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

async function arrow(svg: Svg | G, fromX: number, fromY: number, toX: number, toY: number): Promise<G> {
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

async function concentratedLoad(svg: Svg | G, x: number, y: number, reversed = false): Promise<G> {
  const loadLen = kiw / 2;
  const loadWidth = kih / 10;

  const [fromX, toX] = reversed ? [x + loadLen, x] : [x, x + loadLen];
  return (await arrow(svg, fromX, y, toX, y)).stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
}

async function distributedLoad(svg: Svg | G, fromX: number, toX: number, y: number): Promise<G> {
  const arrows = svg.group();
  let reversed = false;
  if (toX < fromX) {
    [toX, fromX] = [fromX, toX];
    reversed = true;
  }

  const loadWidth = kih / 30;
  const space = Math.ceil(toX - fromX) / Math.ceil(kw / 15);

  let x1, x2;
  for (let i = fromX; i < toX; i += space) {
    [x1, x2] = reversed ? [i + 0.7 * space, i] : [i, i + 0.7 * space];
    arrow(arrows, x1, y, x2, y);
  }
  return arrows.stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
}

async function support(svg: Svg | G, x: number, fromY: number, toY: number, reversed = false): Promise<G> {
  const support = svg.group();
  const space = kih / 3;
  const head = reversed ? -space : space;

  for (let i = fromY; Math.floor(i) <= Math.ceil(toY); i += space) {
    support.line(x, i, x + head, i - head);
  }
  return support;
}

async function render(kw: number, kh: number) {
  if (container.value === null) return;
  container.value.innerHTML = "";
  const draw = SVG().addTo(container.value).size(container.value.clientWidth, container.value.clientHeight);
  const padding = kih / 3;
  const barColor = "#b0b0b0";

  const usedNodes = new Set<number>();
  for (const bar of props.bars) {
    const rect = draw
      .rect(Math.abs(bar.J.x - bar.I.x) * kw, bar.Ig.A * kh)
      .attr({ stroke: barColor, fill: "transparent" });
    rect.x((bar.I.x < bar.J.x ? bar.I.x : bar.J.x) * kw + padding);
    rect.cy(draw.cy());

    for (const q of bar.Qx) {
      const [x1, x2] = q < 0 ? [rect.bbox().x2, rect.bbox().x] : [rect.bbox().x, rect.bbox().x2];
      await distributedLoad(draw, x1, x2, rect.bbox().cy);
    }

    if (!usedNodes.has(bar.I.x)) {
      for (const f of bar.I.Fx) {
        await concentratedLoad(draw, rect.bbox().x, rect.bbox().cy, f < 0);
      }
      if (bar.I.Nb) {
        (await support(draw, rect.bbox().x, rect.bbox().y, rect.bbox().y2, true)).stroke(barColor);
      }
      usedNodes.add(bar.I.x);
    }

    if (!usedNodes.has(bar.J.x)) {
      for (const f of bar.J.Fx) {
        await concentratedLoad(draw, rect.bbox().x2, rect.bbox().cy, f < 0);
      }
      if (bar.J.Nb) {
        (await support(draw, rect.bbox().x2, rect.bbox().y, rect.bbox().y2)).stroke(barColor);
      }
      usedNodes.add(bar.J.x);
    }
  }
}

const container = ref<HTMLDivElement | null>(null);
let kw = 0,
  kh = 0,
  kiw = 0,
  kih = 0;

onMounted(async () => {
  if (container.value) {
    kw = container.value.clientWidth * 0.06;
    kh = container.value.clientHeight * 0.06;
    kiw = kw;
    kih = kh;
  }
  await render(kw, kh);
});

const sizeFactor = 1.1;

async function increaseSize({ widthFactor = sizeFactor, heightFactor = sizeFactor } = {}) {
  kw *= widthFactor;
  kh *= heightFactor;
  await render(kw, kh);
}

async function decreaseSize({ widthFactor = sizeFactor, heightFactor = sizeFactor } = {}) {
  kw /= widthFactor;
  kh /= heightFactor;
  await render(kw, kh);
}
</script>

<template>
  <div>
    <div>
      <n-button tertiary @click="emit('back')">Назад</n-button>
    </div>
    <div ref="container" style="height: 500px"></div>
    <div>
      <div>Zoom</div>
      <n-button tertiary @click="increaseSize()">+</n-button>
      <n-button tertiary @click="decreaseSize()">-</n-button>
    </div>
    <div>
      <div>A</div>
      <n-button tertiary @click="increaseSize({ widthFactor: 1 })">+</n-button>
      <n-button tertiary @click="decreaseSize({ widthFactor: 1 })">-</n-button>
    </div>
  </div>
</template>
