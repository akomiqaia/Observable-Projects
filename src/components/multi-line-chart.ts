import type { ChartData } from "./horizontal-bar-chart";

import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export const multiLinePlot = (data: ChartData[], zDimension: string, width: number) => {
  return Plot.plot({
    y: {
      grid: true,
      label: "↑ Number of visits",
    },
    x: {
      tickFormat: (d) => d,
      tickRotate: -45,
      type: "band"
    },
    width,
    marginBottom: 50,
    marks: [
      Plot.ruleY([0]),
      Plot.lineY(data, {
        x: "TripYear",
        y: d => +d.count,
        z: zDimension,
        stroke: zDimension,
        channels: {
          Country: zDimension,
          Count: "count",
          Year: "TripYear",
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
                // @ts-ignore
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
