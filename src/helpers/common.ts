export const range = (start = 0, end = 0, step = 1) => {
  if (step === 0) return [start];
  if (step < 0) [start, end] = [end, start];
  return Array.from({ length: (end - start + step) / step }, (_, i) => i * step + start);
};

export function debounce<F extends (...args: any[]) => any>(fn: F, ms = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return async function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    return new Promise<ReturnType<F>>((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const result = fn.apply(this, args);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }, ms);
    });
  };
}

export async function saveFile(data: BlobPart[], type: string, fileName: string): Promise<void> {
  const blob = new Blob(data, { type: type });
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
