import { round } from "mathjs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, Table, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Bar, Node } from "@/store";
import type { ComputationResult } from "@/helpers/processor";
import { range } from "@/helpers/common";
import { render } from "@/helpers/render";
import type { Svg } from "@svgdotjs/svg.js";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

async function generateConstruction(nodes: Node[], bars: Bar[]): Promise<Svg | null> {
  const xr = nodes.map((value) => value.x);
  const width = 595 - 80;
  const height = 150;
  const widthRatio = width * 0.1;
  const heightRatio = height * 0.1;
  const constructionWidth = Math.max(...xr) - Math.min(...xr);
  const constructionHeight = Math.max(...bars.map((value) => value.Ig.A));
  const barWidthRatio = (width - widthRatio) / constructionWidth;
  const barHeightRatio = (height - heightRatio * 4) / constructionHeight;
  const padding = width * 0.03 - Math.min(...xr) * barWidthRatio;
  const svg = await render(nodes, bars, {
    width: width,
    height: height,
    barWidthRatio: barWidthRatio,
    barHeightRatio: barHeightRatio,
    widthRatio: widthRatio,
    heightRatio: heightRatio,
    barColor: "black",
    padding: padding,
  });
  return svg;
}

async function generateTables(bars: Bar[], computation: ComputationResult, n: number): Promise<Table[]> {
  const tables: Table[] = [];

  const { Nx, Ux, Sx } = computation;
  const barsData = bars
    .map((bar, index) => ({
      label: bar.label,
      L: bar.length,
      Nx: Nx[index],
      Ux: Ux[index],
      Sx: Sx[index],
      S: bar.Ig.S,
    }))
    .sort((a, b) => parseInt(a.label) - parseInt(b.label));

  for (const bar of barsData) {
    const step = bar.L / (n - 1);
    const points = range(0, bar.L + step / 10, step).map((x) => [
      round(x, 2),
      round(bar.Nx(x), 2),
      round(bar.Ux(x), 2),
      round(bar.Sx(x), 2),
      round(bar.S, 2),
    ]);

    const header = ["x", "Nx", "Ux", "\u03C3x", "\u03C3"].map((value) => ({ text: value, bold: true }));
    const body = points.map((point) =>
      point.map((value, index, arr) => ({
        text: value.toFixed(2),
        color: index === 3 && Math.abs(value) > arr[index + 1] ? "red" : "black",
      }))
    );

    tables.push({
      headerRows: 1,
      widths: ["*", "*", "*", "*", "*"],
      body: [header, ...body],
    });
  }

  return tables;
}

export async function generatePdf(nodes: Node[], bars: Bar[], computation: ComputationResult) {
  const content: Content = [];

  content.push({
    text: "Отчет по вычислениям компонент напряженно-деформированного состояния конструкции",
    alignment: "center",
    bold: true,
    marginBottom: 30,
  });

  const construction = await generateConstruction(nodes, bars);
  content.push({
    text: "Визуализация исходной конструкции",
  });
  content.push({
    svg: construction?.svg() ?? "",
    marginBottom: 20,
  });

  const tables = await generateTables(bars, computation, 10);
  for (const [index, table] of tables.entries()) {
    content.push({ text: `Стержень №${index + 1}`, marginBottom: 5 });
    content.push({
      layout: "lightHorizontalLines",
      table: table,
      marginBottom: 30,
    });
  }

  const doc: TDocumentDefinitions = {
    info: {
      title: "Отчет по вычислениям",
    },
    pageSize: "A4",
    content: content,
  };
  return pdfMake.createPdf(doc);
}
