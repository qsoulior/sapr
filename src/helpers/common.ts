export const range = (start = 0, end = 0, step = 1) => {
  if (step === 0) return [start];
  if (step < 0) [start, end] = [end, start];
  return Array.from({ length: (end - start + step) / step }, (_, i) => i * step + start);
};
