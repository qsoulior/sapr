<script setup lang="ts">
import { onMounted, ref } from "vue";
import { NButton } from "naive-ui";
import { SVG, type Svg, type G } from "@svgdotjs/svg.js";
import PreprocessorForm from "@/components/PreprocessorForm.vue";

const formRef = ref<InstanceType<typeof PreprocessorForm> | null>(null);

function arrow(svg: Svg | G, fromX: number, fromY: number, toX: number, toY: number): G {
  const arrow = svg.group();
  const headW = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  arrow.line(fromX, fromY, toX, toY);
  arrow.line(toX, toY, toX - headW * Math.cos(angle - Math.PI / 7), toY - headW * Math.sin(angle - Math.PI / 7));
  arrow.line(toX, toY, toX - headW * Math.cos(angle + Math.PI / 7), toY - headW * Math.sin(angle + Math.PI / 7));
  return arrow;
}

function concentratedLoad(svg: Svg | G, x: number, y: number, reversed: boolean): G {
  const [fromX, toX] = reversed ? [x + 40, x] : [x, x + 40];
  return arrow(svg, fromX, y, toX, y);
}

function distributedLoad(svg: Svg | G, fromX: number, toX: number, y: number): G {
  const arrows = svg.group();
  let reversed = false;
  if (toX < fromX) {
    [toX, fromX] = [fromX, toX];
    reversed = true;
  }
  const d = (toX - fromX) / 5;

  let x1, x2;
  for (let i = fromX; i < toX; i += d) {
    [x1, x2] = reversed ? [i + 0.7 * d, i] : [i, i + 0.7 * d];
    arrow(arrows, x1, y, x2, y);
  }
  return arrows;
}

function support(svg: Svg | G, x: number, fromY: number, toY: number): G {
  const z = svg.group();
  const d = (toY - fromY) / 10;
  for (let i = fromY + d; i < toY; i += d) {
    z.line(x, i, x + 8, i - 8);
  }
  return z;
}

let container: HTMLElement | null, kw: number, kh: number;
onMounted(() => {
  container = document.getElementById("container");
  kw = container ? container.clientWidth * 0.06 : 0;
  kh = container ? container.clientHeight * 0.06 : 0;
});

async function increase() {
  kh *= 1.25;
  kw *= 1.25;
  await draw(kw, kh);
}

async function degrease() {
  kh /= 1.25;
  kw /= 1.25;
  await draw(kw, kh);
}

async function draw(kw: number, kh: number) {
  if (formRef.value === null) return;
  const bars = await formRef.value.validate();

  if (container === null) return;
  container.innerHTML = "";
  const draw = SVG().addTo(container).size(container.clientWidth, container.clientHeight);

  const used: number[] = [];
  for (const bar of bars) {
    const rect = draw.rect((bar.J.x - bar.I.x) * kw, bar.Ig.A * kh).attr({ stroke: "#f06", fill: "transparent" });
    console.log(container.clientWidth);
    rect.x(bar.I.x * kw);
    rect.cy(draw.cy());

    for (const q of bar.Qx) {
      if (q < 0) {
        distributedLoad(draw, rect.bbox().x2, rect.bbox().x, rect.bbox().cy).stroke("#f06");
      } else {
        distributedLoad(draw, rect.bbox().x, rect.bbox().x2, rect.bbox().cy).stroke("#f06");
      }
    }

    if (!used.includes(bar.I.x)) {
      for (const f of bar.I.Fx) {
        concentratedLoad(draw, rect.bbox().x, rect.bbox().cy, f < 0).stroke({ color: "blue", width: 2 });
      }
      if (bar.I.Nb) {
        support(draw, rect.bbox().x, rect.bbox().y, rect.bbox().y2).stroke("#f06");
      }
      used.push(bar.I.x);
    }

    if (!used.includes(bar.J.x)) {
      for (const f of bar.J.Fx) {
        concentratedLoad(draw, rect.bbox().x2, rect.bbox().cy, f < 0).stroke({ color: "blue", width: 2 });
      }
      if (bar.J.Nb) {
        support(draw, rect.bbox().x2, rect.bbox().y, rect.bbox().y2).stroke("#f06");
      }
      used.push(bar.J.x);
    }
  }
}
</script>

<template>
  <div>
    <h3>Препроцессор</h3>
    <div id="container" style="height: 500px"></div>
    <div>
      <n-button tertiary @click="increase">+</n-button>
      <n-button tertiary @click="degrease">-</n-button>
    </div>
    <preprocessor-form ref="formRef" />
  </div>
</template>
