import { Svg, extend, LineChart, type SeriesObject } from "chartist";

interface Options {
  offset: {
    x: number;
    y: number;
  };
  textAnchor: "start" | "middle" | "end";
  fontSize: string;
  fontWeight: number | string;
}

export function ctLineLabels(options: Partial<Options>) {
  return function ctLineLabels(chart: Svg) {
    const defaultOptions: Options = {
      offset: {
        x: 25,
        y: 25,
      },
      textAnchor: "end",
      fontSize: "1.1rem",
      fontWeight: "bold",
    };

    const opt = extend({}, defaultOptions, options);

    if (chart instanceof LineChart) {
      chart.on("draw", function (data) {
        if (data.type === "line") {
          const pathElement = data.path.pathElements[0];
          data.group
            .elem("text", {
              x: pathElement.x + opt.offset.x,
              y: pathElement.y + opt.offset.y,
              style: `text-anchor: ${opt.textAnchor}; fill: ${
                getComputedStyle(data.element.getNode()).stroke
              }; font-size: ${opt.fontSize}; font-weight: ${opt.fontWeight}`,
            })
            .text((data.series as SeriesObject).name ?? "");
        }
      });
    }
  };
}
