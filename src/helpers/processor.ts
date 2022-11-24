import type { Bar, Node } from "@/store";

export type NumberFunction = (x: number) => number;

export interface ComputationResult {
  Ux: NumberFunction[];
  Nx: NumberFunction[];
  Sx: NumberFunction[];
}

export async function computeComponents(nodes: Node[], bars: Bar[]): Promise<ComputationResult> {
  const b = nodes.map((value) => value.Fx);
  const EAL = bars.map((value) => (value.Ig.E * value.Ig.A) / value.length);
  const A = Array.from({ length: nodes.length }, () => Array<number>(nodes.length).fill(0));

  for (let i = 0; i < A.length - 1; i++) {
    A[i + 1][i + 1] = EAL[i];
    if (nodes[i].Nb) {
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
  if (nodes[last].Nb) {
    A[last][last] = 1;
    A[last][last - 1] = A[last - 1][last] = 0;
  }

  b[0] += (bars[0].Qx * bars[0].length) / 2;
  for (let i = 1; i < b.length - 1; i++) {
    b[i] += (bars[i - 1].Qx * bars[i - 1].length + bars[i].Qx * bars[i].length) / 2;
  }
  b[b.length - 1] += (bars[b.length - 2].Qx * bars[b.length - 2].length) / 2;

  for (let i = 0; i < b.length; i++) {
    if (nodes[i].Nb) b[i] = 0;
  }

  const { lusolve, number, isComplex } = await import("mathjs");

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
    const bar = bars[i];
    const [L, E, A, q] = [bar.length, bar.Ig.E, bar.Ig.A, bar.Qx];
    const [U0, UL] = bar.x1 < bar.x2 ? [d[i], d[i + 1]] : [d[i + 1], d[i]];

    Ux[i] = (x) => U0 + (x / L) * (UL - U0) + ((q * L * x) / (2 * E * A)) * (1 - x / L);
    Nx[i] = (x) => ((E * A) / L) * (UL - U0) + ((q * L) / 2) * (1 - (2 * x) / L);
    Sx[i] = (x) => Nx[i](x) / A;
  }
  return { Ux, Nx, Sx };
}
