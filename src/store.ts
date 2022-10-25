import { reactive } from "vue";

export interface Xs {
  I: number;
  J: number;
  Ig: number;
}

export interface Xc {
  L: number;
  A: number;
  E: number;
  S: number;
}

export interface Qr {
  I: number;
  Fx: number;
}

export interface Qs {
  I: number;
  Qx: number;
}

export interface Store {
  cn: {
    xr: number[];
    xs: Xs[];
    xc: Xc[];
  };
  ld: {
    nb: number[];
    qr: Qr[];
    qs: Qs[];
  };
}

export const store: Store = reactive({
  cn: {
    xr: [],
    xs: [],
    xc: [],
  },
  ld: {
    nb: [],
    qr: [],
    qs: [],
  },
});
