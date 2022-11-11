import { lusolve, number, isComplex } from "mathjs";
import type { Bar, Node } from "@/store";

type NumberFunction = (x: number) => number;

interface Result {
  Ux: NumberFunction[];
  Nx: NumberFunction[];
  Sx: NumberFunction[];
}

export async function useProcessor(nodes: Node[], bars: Bar[]): Promise<Result> {
  const sortedNodes = Array.from(nodes).sort((a, b) => a.x - b.x);
  const sortedBars = Array.from(bars).sort(
    (a, b) => Math.min(nodes[a.I].x, nodes[a.J].x) - Math.min(nodes[b.I].x, nodes[b.J].x)
  );

  const b = sortedNodes.map((value) => value.Fx);
  const EAL = sortedBars.map((value) => (value.Ig.E * value.Ig.A) / value.length(nodes));
  const A = Array.from({ length: nodes.length }, () => Array<number>(nodes.length).fill(0));

  for (let i = 0; i < A.length - 1; i++) {
    A[i + 1][i + 1] = EAL[i];
    if (sortedNodes[i].Nb) {
      A[i][i] = 1;
      A[i][i + 1] = A[i + 1][i] = 0;
      if (i > 0) {
        A[i][i - 1] = A[i - 1][i] = 0;
      }
    } else {
      A[i][i] += EAL[i];
      A[i][i + 1] = A[i + 1][i] = -EAL[i];
    }
  }

  const last = A.length - 1;
  if (sortedNodes[last].Nb) {
    A[last][last] = 1;
    A[last][last - 1] = A[last - 1][last] = 0;
  }

  b[0] += (sortedBars[0].Qx * sortedBars[0].length(nodes)) / 2;
  for (let i = 1; i < b.length - 1; i++) {
    b[i] +=
      (sortedBars[i - 1].Qx * sortedBars[i - 1].length(nodes) + sortedBars[i].Qx * sortedBars[i].length(nodes)) / 2;
  }
  b[b.length - 1] += (sortedBars[b.length - 2].Qx * sortedBars[b.length - 2].length(nodes)) / 2;

  for (let i = 0; i < b.length; i++) {
    if (sortedNodes[i].Nb) b[i] = 0;
  }

  const d = lusolve(A, b)
    .map((value) => (Array.isArray(value) ? value[0] : value))
    .map((value) => {
      if (isComplex(value)) throw new Error("Calculation error");
      return number(value);
    });

  const Nx = new Array<NumberFunction>(d.length - 1);
  const Ux = new Array<NumberFunction>(d.length - 1);
  const Sx = new Array<NumberFunction>(d.length - 1);

  for (let i = 0; i < d.length - 1; i++) {
    const bar = sortedBars[i];
    const [L, E, A, q] = [bar.length(nodes), bar.Ig.E, bar.Ig.A, bar.Qx];
    Ux[i] = (x) => d[i] + (x / L) * (d[i + 1] - d[i]) + ((q * L * x) / (2 * E * A)) * (1 - x / L);
    Nx[i] = (x) => ((E * A) / L) * (d[i + 1] - d[i]) + ((q * L) / 2) * (1 - (2 * x) / L);
    Sx[i] = (x) => Nx[i](x) / A;
  }
  return { Ux, Nx, Sx };
}
