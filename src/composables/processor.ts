import type { Bar, Node } from "@/store";

export function useProcessor(nodes: Node[], bars: Bar[]) {
  const sortedNodes = Array.from(nodes).sort((a, b) => a.x - b.x);
  const sortedBars = Array.from(bars).sort(
    (a, b) => Math.min(nodes[a.I].x, nodes[a.J].x) - Math.min(nodes[b.I].x, nodes[b.J].x)
  );

  const displacements = new Array<number>(nodes.length);
  const reactions = sortedNodes.map((value) => value.Fx);

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

  reactions[0] += (sortedBars[0].Qx * sortedBars[0].length(nodes)) / 2;
  for (let i = 1; i < reactions.length - 1; i++) {
    reactions[i] =
      (sortedBars[i - 1].Qx * sortedBars[i - 1].length(nodes) + sortedBars[i].Qx * sortedBars[i].length(nodes)) / 2;
  }
  reactions[reactions.length - 1] +=
    (sortedBars[reactions.length - 2].Qx * sortedBars[reactions.length - 2].length(nodes)) / 2;

  console.log(A);
  console.log(reactions);
}
