import * as Plot from "@observablehq/plot";

export function stackedBarChart(data: any[], width: number): any {
  return Plot.plot({
    color: {
      legend: true,
    },
    title: "Number of diplomatic visits in last 35 years",
    width,
    grid: true,
    marginBottom: 50,
    x: {
      tickRotate: -45,
      label: "Year",
      tickFormat: (d) => d.toString(),
    },
    y: {
      label: "Number of Visits",
    },
    marks: [
      Plot.barY(
        data,
        Plot.groupX(
          {
            y: "count",
          },
          {
            fill: "RegionVisited",
            x: "TripYear",
            tip: {
              format: {
                x: (d) => d.toString(),
              },
            },
          },
        ),
      ),
    ],
  });
}
