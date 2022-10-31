<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton } from "naive-ui";
import { SVG, type G, Container, Box } from "@svgdotjs/svg.js";
import type { Bar, Node } from "@/store";

const props = defineProps<{
  nodes: Node[];
  bars: Bar[];
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

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
  const loadLen = kiw / 2;
  const loadWidth = kih / 10;

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

  const loadWidth = kih / 30;
  const space = Math.ceil(toX - fromX) / Math.ceil(kw / 15);

  let x1, x2;
  for (let i = fromX; i < toX; i += space) {
    [x1, x2] = reversed ? [i + 0.7 * space, i] : [i, i + 0.7 * space];
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
  const space = kih / 3;
  const head = reversed ? -space : space;

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

  const figure =
    type === "node"
      ? group.rect(kiw / 5, kiw / 5).attr({ stroke: color, fill: "transparent" })
      : group.circle(kiw / 5).stroke(color);
  figure.cx(x);
  figure.y(y);

  const nodeText = group
    .text(text)
    .font({ size: kiw / 6 })
    .fill(color);
  nodeText.cx(x);
  nodeText.cy(figure.cy());

  return group;
}

async function render(kw: number, kh: number) {
  if (container.value === null) return;
  container.value.innerHTML = "";
  const draw = SVG().addTo(container.value).size(container.value.clientWidth, container.value.clientHeight);
  const padding = kiw / 2;
  const barColor = "#b0b0b0";

  const boxes = new Array<Box>(props.nodes.length);
  const addBox = async (index: number, value: Box) => {
    if ((boxes[index] !== undefined && boxes[index].height < value.height) || boxes[index] === undefined) {
      boxes[index] = value;
    }
  };

  for (const [index, value] of props.bars.entries()) {
    const [I, J] = [props.nodes[value.I], props.nodes[value.J]];

    const rect = draw.rect(Math.abs(J.x - I.x) * kw, value.Ig.A * kh).attr({ stroke: barColor, fill: "transparent" });
    rect.x((I.x < J.x ? I.x : J.x) * kw + padding);
    rect.cy(draw.cy());

    for (const q of value.Qx) {
      const [x1, x2] = q < 0 ? [rect.bbox().x2, rect.bbox().x] : [rect.bbox().x, rect.bbox().x2];
      await distributedLoad(draw, x1, x2, rect.bbox().cy);
    }
    await number(draw, (index + 1).toString(), rect.bbox().cx, rect.bbox().y2 + 10, "bar", barColor);

    await addBox(value.I, rect.bbox());
    await addBox(value.J, rect.bbox());
  }

  for (const [index, value] of props.nodes.entries()) {
    const pos = value.x * kw + padding;
    const box = boxes[index];

    for (const load of value.Fx) {
      await concentratedLoad(draw, pos, box.cy, load < 0);
    }

    if (value.Nb) {
      await support(draw, pos, box.y, box.y2, index !== boxes.length - 1, barColor);
    }

    await number(draw, (index + 1).toString(), pos, box.y2 + 10, "node", "#f06");
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
