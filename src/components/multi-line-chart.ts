import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export const multiLinePlot = (data, width) => {
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Number of visits",
    },
    x: {
      tickFormat: (d) => d.toString(),
    },
    width,
    marginBottom: 20,
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(data, {
        x: (d) => d[1],
        y: (d) => d[2],
        z: (d) => d[0],
        stroke: (d) => d[0],
        channels: {
          Country: (d) => d[0],
          Count: (d) => d[2],
          Year: (d) => d[1].toString(),
        },
        tip: {
          format: {
            stroke: false,
            x: false,
            y: false,
            z: false,
          },
          render(index, scales, values, dimensions, context, next) {
            // Filter and highlight the paths with the same *z* as the hovered point.
            const path = d3
              .select(context.ownerSVGElement)
              .selectAll("[aria-label=line] path");
            if (index.length && values.z) {
              const z = values.z[index[0]];
              path
                .style("stroke", "var(--theme-foreground-faintest)")
                .filter(([i]) => values.z && values.z[i] === z)
                .style("stroke", null)
                .raise();
            } else path.style("stroke", null);
            // @ts-ignore
            return next(index, scales, values, dimensions, context);
          },
        },
      }),
    ],
  });
};
