import * as Plot from "@observablehq/plot";
import * as d3 from "d3";

export function stackedBarChart(
  data: {
    TripYear: number;
    RegionVisited: string;
    LeaderRegion: string;
    Count: number;
  }[],
  width: number,
  regionToggle: boolean
): any {
  return Plot.plot({
    color: {
      legend: true,
    },
    title: "Number of diplomatic visits in last 35 years",
    subtitle: regionToggle ? "By Region visited" : "By Leaders origin",
    width,
    grid: true,
    marginBottom: 50,
    x: {
      tickRotate: -45,
      label: "Year",
      tickFormat: (d) => d.toString(),
      type: "band"
    },
    y: {
      label: "Number of Visits",
    },
    marks: [
      Plot.barY(
        data,
        Plot.groupX(
          {
            // @ts-ignore
            y: (D) => d3.sum(D, (d) => d.Count),
          },
          {
            fill: regionToggle ? "RegionVisited" : "LeaderRegion",
            x: "TripYear",
            tip: {
              format: {
                x: (d) => d.toString(),
              },
            },
          }
        )
      ),
    ],
  });
}
