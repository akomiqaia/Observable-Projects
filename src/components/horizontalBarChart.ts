import * as Plot from "@observablehq/plot";

export async function horizontalBarChart(data, fill, title) {
  return Plot.plot({
    title: title,
    height: 600,
    marginRight: 150,
    marks: [
      Plot.barX(data, {
        x: (d) => d[1],
        y: (d) => d[0],
        fill: fill ?? "tomato",
        sort: {
          reverse: true,
          y: "x",
        },
      }),
      Plot.text(data, {
        text: (d) => d[0],
        x: (d) => d[1],
        y: (d) => d[0],
        textAnchor: "start",
        lineWidth: 10,
        dx: 10,
        fontSize: 16,
        fontWeight: "bold",
        fill: "var(--theme-foreground)",
      }),
      Plot.text(data, {
        text: (d) => `${d[1]}`,
        x: (d) => d[1],
        y: (d) => d[0],
        dx: -20,
        fontSize: 16,
        fontWeight: "bold",
        lineAnchor: "middle",
        fill: "var(--theme-foreground)",
      }),
      Plot.ruleX([0]),
      Plot.axisX({
        label: "Number of Visits",
        labelOffset: 30,
        labelAnchor: "center",
        labelArrow: false,
        fontSize: 16,
        fontWeight: "bold",
        dx: 15,
        marginBottom: 50,
        tickFormat: () => "",
        tickSize: 0,
      }),
      Plot.axisY({
        label: "Country",
        fontSize: 16,
        fontWeight: "bold",
        dx: 15,
        tickFormat: () => "",
        tickSize: 0,
      }),
    ],
  });
}
