// Стержни
export interface Xs {
  I: number;
  J: number;
  Ig: number;
}

// Классы стержней
export interface Xc {
  A: number;
  E: number;
  S: number;
}

// Сосредоточенные силы
export interface Qr {
  I: number;
  Fx: number;
}

// Распределенные нагрузки
export interface Qs {
  I: number;
  Qx: number;
}

export interface Form {
  xr: Array<number>;
  xs: Array<Xs>;
  xc: Array<Xc>;
  nb: Array<number>;
  qr: Array<Qr>;
  qs: Array<Qs>;
}

export class Node {
  x: number;
  Fx: number;
  Nb: boolean;

  constructor(index: number, form: Form) {
    this.x = form.xr[index];
    this.Fx = form.qr.filter((value) => value.I === index + 1).reduce((sum, value) => sum + value.Fx, 0);
    this.Nb = form.nb.includes(index + 1);
  }
}

export class Bar {
  I: number;
  J: number;
  Ig: Xc;
  Qx: number;

  constructor(index: number, form: Form) {
    const item = form.xs[index];
    this.I = item.I - 1;
    this.J = item.J - 1;
    this.Ig = form.xc[item.Ig - 1];
    this.Qx = form.qs.filter((value) => value.I === index + 1).reduce((sum, value) => sum + value.Qx, 0);
    if (form.xr[this.I] > form.xr[this.J]) this.Qx = -this.Qx;
  }

  length(nodes: Node[]) {
    return Math.abs(nodes[this.I].x - nodes[this.J].x);
  }
}
