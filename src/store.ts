import { reactive } from "vue";

interface Store {
  cn: {
    xr: Array<number[]>;
    xs: Array<number[]>;
    xc: Array<number[]>;
  };
  ld: {
    nb: Array<number[]>;
    qr: Array<number[]>;
    qs: Array<number[]>;
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
