import "chartist/dist/index.css";
import { AutoScaleAxis, LineChart } from "chartist";
import type { Node, Bar } from "@/store";
import { SVG, type Box, type Container, type G, type Svg } from "@svgdotjs/svg.js";
import type { ComputationResult } from "@/helpers/processor";
import { range } from "@/helpers/common";

interface ConstructionOptions {
  width: number;
  height: number;
  barWidthRatio: number;
  barHeightRatio: number;
  widthRatio: number;
  heightRatio: number;
  barColor: string;
  padding: number;
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

export async function renderConstruction(
  nodes: Node[],
  bars: Bar[],
  options: ConstructionOptions
): Promise<Svg | null> {
  const svg = SVG().size(options.width, options.height);

  async function concentratedLoad(x: number, y: number, reversed = false): Promise<G> {
    const maxImmutableRatio = Math.max(options.widthRatio, options.heightRatio + 20);
    const loadLen = maxImmutableRatio / 2;
    const loadWidth = Math.min(options.widthRatio, options.heightRatio) / 10;

    const [fromX, toX] = reversed ? [x + loadLen, x] : [x, x + loadLen];
    return (await arrow(svg, fromX, y, toX, y)).stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
  }

  async function distributedLoad(fromX: number, toX: number, y: number): Promise<G> {
    const arrows = svg.group();
    let reversed = false;
    if (toX < fromX) {
      [toX, fromX] = [fromX, toX];
      reversed = true;
    }

    const loadWidth = Math.min(options.widthRatio, options.heightRatio) / 30;
    const space = Math.floor(Math.max(options.widthRatio, options.heightRatio + 15) / 2);

    for (let x = fromX; x + 0.7 * space <= toX; x += space) {
      const [x1, x2] = reversed ? [x + 0.7 * space, x] : [x, x + 0.7 * space];
      arrow(arrows, x1, y, x2, y);
    }
    return arrows.stroke({ color: reversed ? "blue" : "#f06", width: loadWidth });
  }

  async function support(x: number, fromY: number, toY: number, reversed = false, color: string): Promise<G> {
    const support = svg.group();
    const space = Math.min(options.widthRatio, options.heightRatio) / 3;
    const head = reversed ? -space : space;

    support.line(x, fromY, x, toY);

    for (let i = fromY; Math.floor(i) <= Math.ceil(toY); i += space) {
      support.line(x, i, x + head, i - head);
    }
    return support.stroke(color);
  }

  async function number(text: string, x: number, y: number, type: "bar" | "node", color: string): Promise<G> {
    const group = svg.group();

    const maxImmutableRatio = Math.max(options.widthRatio, options.heightRatio, 60);

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

  async function renderBars(color: string) {
    const boxes = new Map<number, Box>();
    const addBox = async (x: number, value: Box) => {
      const box = boxes.get(x);
      if ((box !== undefined && box.height < value.height) || box === undefined) {
        boxes.set(x, value);
      }
    };

    for (const bar of bars) {
      const rect = svg
        .rect(Math.max(0.01, bar.length * options.barWidthRatio), Math.max(0.01, bar.Ig.A * options.barHeightRatio))
        .attr({ stroke: color, fill: "transparent" });
      rect.x(bar.start * options.barWidthRatio + options.padding);
      rect.cy(svg.cy());

      if (bar.Qx !== 0) {
        const [x1, x2] = bar.Qx < 0 ? [rect.bbox().x2, rect.bbox().x] : [rect.bbox().x, rect.bbox().x2];
        await distributedLoad(x1, x2, rect.bbox().cy);
      }
      await number(bar.label, rect.bbox().cx, rect.bbox().y2 + 10, "bar", color);

      await addBox(bar.x1, rect.bbox());
      await addBox(bar.x2, rect.bbox());
    }
    return boxes;
  }

  async function renderNodes(boxes: Map<number, Box>, color: string) {
    for (const [index, node] of nodes.entries()) {
      const pos = node.x * options.barWidthRatio + options.padding;
      const box = boxes.get(node.x);
      if (box === undefined) break;

      const minHeight = options.heightRatio * 1.8;
      let [fromY, toY] = [box.y, box.y2];

      if (toY - fromY < minHeight) {
        [fromY, toY] = [svg.cy() - minHeight / 2, svg.cy() + minHeight / 2];
      }

      if (node.Nb) {
        await support(pos, fromY, toY, index !== nodes.length - 1, color);
      }

      await number(node.label, pos, toY + 10, "node", "#f06");

      if (node.Fx !== 0) {
        await concentratedLoad(pos, box.cy, node.Fx < 0);
      }
    }
  }

  const boxes = await renderBars(options.barColor);
  await renderNodes(boxes, options.barColor);
  return svg;
}

interface EpureOptions {
  el: Element;
}

export async function renderEpure(bars: Bar[], computation: ComputationResult, index: number, options: EpureOptions) {
  const { Nx, Ux, Sx } = computation;
  const Fx = index === 0 ? Nx : index === 1 ? Sx : Ux;

  const chart = new LineChart(
    options.el,
    {
      series: [
        bars
          .map((bar, i) =>
            index <= 1
              ? [
                  { x: bar.start, y: Fx[i](0) },
                  { x: bar.end, y: Fx[i](bar.length) },
                ]
              : range(bar.start, bar.end, bar.length / 100).map((x) => ({ x: x, y: Fx[i](x - bar.start) }))
          )
          .reduce((prev, current) => prev.concat(current), []),
      ],
    },
    {
      showArea: true,
      showPoint: false,
      axisX: {
        type: AutoScaleAxis,
        onlyInteger: true,
      },
    }
  );

  chart.initialize();
  const svgElement = <SVGElement>options.el.firstElementChild;
  if (svgElement === null) return null;

  return SVG(svgElement);
}
