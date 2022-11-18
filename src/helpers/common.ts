export const range = (start = 0, end = 0, step = 1) => {
  if (step === 0) return [start];
  if (step < 0) [start, end] = [end, start];
  return Array.from({ length: (end - start + step) / step }, (_, i) => i * step + start);
};

export const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: ThisParameterType<typeof fn>, ...args: any[]) {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => resolve(fn.apply(this, args)), ms);
    });
  };
};
