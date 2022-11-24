import { round } from "mathjs";
import type { Content, Table, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Bar, Node } from "@/store";
import type { ComputationResult } from "@/helpers/processor";
import { range } from "@/helpers/common";
import { renderConstruction, renderEpure } from "@/helpers/render";
import { type Element, Text, type Svg } from "@svgdotjs/svg.js";

async function generateData(nodes: Node[], bars: Bar[]): Promise<Table[]> {
  const sortedNodes = [...nodes].sort((a, b) => parseInt(a.label) - parseInt(b.label));
  const sortedBars = [...bars].sort((a, b) => parseInt(a.label) - parseInt(b.label));

  const tables = new Array<Table>(2);
  const header1: TableCell[] = ["№", "x", "F", "Опора"].map((value) => ({ text: value, bold: true }));
  const header2: TableCell[] = ["№", "L", "E", "A", "[\u03C3]", "q"].map((value) => ({ text: value, bold: true }));

  const body1: TableCell[][] = sortedNodes.map((node) => [
    { text: node.label, bold: true },
    node.x,
    node.Fx,
    node.Nb ? "есть" : "нет",
  ]);
  const body2: TableCell[][] = sortedBars.map((bar) => [
    { text: bar.label, bold: true },
    bar.length,
    bar.Ig.E,
    bar.Ig.A,
    bar.Ig.S,
    bar.Qx,
  ]);

  tables[0] = {
    headerRows: 1,
    widths: ["*", "*", "*", "*"],
    body: [header1, ...body1],
  };

  tables[1] = {
    headerRows: 1,
    widths: ["*", "*", "*", "*", "*", "*"],
    body: [header2, ...body2],
  };

  return tables;
}

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
  const svg = await renderConstruction(nodes, bars, {
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

async function generateComputations(bars: Bar[], computation: ComputationResult, n: number): Promise<Table[]> {
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

    const header: TableCell[] = ["x", "Nx", "Ux", "\u03C3x", "[\u03C3]"].map((value) => ({ text: value, bold: true }));
    const body: TableCell[][] = points.map((point) =>
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

async function generateEpure(bars: Bar[], computation: ComputationResult, index: number): Promise<Element | null> {
  const width = 595 - 80,
    height = 300;

  const el = document.createElement("div");
  el.style.opacity = "0";
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  document.body.append(el);

  const svg = await renderEpure(bars, computation, index, { el: el });

  if (svg === null) return null;
  svg.each((index, children) => {
    if (children[index].type === "foreignObject") {
      const x = children[index].bbox().x;
      const y = children[index].bbox().y2;
      const text = children[index].node.firstElementChild?.innerHTML ?? "";

      const textElement = new Text().addTo(svg).text(text).font({ family: "sans-serif", size: 10 });
      textElement.amove(x, y);

      children[index].remove();
    }
    const styles = getComputedStyle(children[index].node);
    const style = Array.from(styles).reduce((prev, current) => {
      let property = styles.getPropertyValue(current);
      if (property === "rgba(255, 255, 255, 0.5)") property = "black";
      prev += `${current}: ${property}; `;
      return prev;
    }, "");
    children[index].node.setAttribute("style", style);
    children[index].node.removeAttribute("xmlns");
  }, true);

  el.remove();
  return svg.size(width, height);
}

export async function generatePdf(nodes: Node[], bars: Bar[], computation: ComputationResult) {
  const content: Content = [];

  content.push({
    text: "Отчет по вычислениям компонент напряженно-деформированного состояния конструкции",
    alignment: "center",
    bold: true,
    marginBottom: 30,
  });

  const data = await generateData(nodes, bars);
  const dataTitles = ["узлов", "стержней"];
  const dataMargins = [30, 10];

  for (const [index, item] of data.entries()) {
    content.push(
      { text: `Таблица ${index + 1}.`, alignment: "right", italics: true },
      { text: `Исходные параметры ${dataTitles[index]}`, alignment: "center", marginBottom: 10 },
      {
        layout: "lightHorizontalLines",
        table: item,
        marginBottom: dataMargins[index],
      }
    );
  }

  const construction = await generateConstruction(nodes, bars);
  content.push(
    {
      svg: construction?.svg() ?? "",
      marginBottom: 10,
    },
    {
      text: "Рисунок 1. Визуализация исходной конструкции",
      alignment: "center",
      italics: true,
      marginBottom: 30,
    }
  );

  const tables = await generateComputations(bars, computation, 10);
  for (const [index, table] of tables.entries()) {
    content.push(
      { text: `Таблица ${index + 3}.`, alignment: "right", italics: true },
      { text: `Значения компонент в стержне №${index + 1}`, alignment: "center", marginBottom: 10 },
      {
        layout: "lightHorizontalLines",
        table: table,
        marginBottom: 30,
      }
    );
  }

  const epureTitles = ["продольных сил", "нормальных напряжений", "перемещений"];

  for (let i = 0; i < 3; i++) {
    const epure = await generateEpure(bars, computation, i);
    content.push(
      {
        svg: epure?.svg() ?? "",
        marginBottom: 10,
      },
      {
        text: `Рис. ${i + 2}. Визуализация эпюры ${epureTitles[i]}`,
        alignment: "center",
        italics: true,
        marginBottom: 30,
      }
    );
  }

  const doc: TDocumentDefinitions = {
    info: {
      title: "Отчет по вычислениям",
    },
    pageSize: "A4",
    content: content,
  };

  const pdfMake = (await import("pdfmake/build/pdfmake.min")).default;
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;

  return pdfMake.createPdf(doc);
}
