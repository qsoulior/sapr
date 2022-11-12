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
  label: string;
  x: number;
  Fx: number;
  Nb: boolean;

  constructor(index: number, form: Form) {
    this.label = (index + 1).toString();
    this.x = form.xr[index];
    this.Fx = form.qr.filter((value) => value.I === index + 1).reduce((sum, value) => sum + value.Fx, 0);
    this.Nb = form.nb.includes(index + 1);
  }
}

export class Bar {
  label: string;
  x1: number;
  x2: number;
  Ig: Xc;
  Qx: number;

  constructor(index: number, form: Form) {
    const item = form.xs[index];
    this.label = (index + 1).toString();
    this.x1 = form.xr[item.I - 1];
    this.x2 = form.xr[item.J - 1];
    this.Ig = form.xc[item.Ig - 1];
    this.Qx = form.qs.filter((value) => value.I === index + 1).reduce((sum, value) => sum + value.Qx, 0);
    if (this.x1 > this.x2) this.Qx = -this.Qx;
  }

  get length() {
    return Math.abs(this.x1 - this.x2);
  }

  get start() {
    return Math.min(this.x1, this.x2);
  }

  get end() {
    return Math.max(this.x1, this.x2);
  }
}
