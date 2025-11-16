import * as Plot from "@observablehq/plot";

export function horizontalBarChart(data, fill) {
  return Plot.plot({
    title: "Top Countries that sent Diplomatic Visitors",

    height: 600,

    marks: [
      Plot.barX(data, {
        x: "visitCount",
        y: "country",
        fill: fill ?? "tomato",
        sort: {
          y: "x",
          reverse: true,
        },
      }),
      Plot.text(data, {
        text: "country",
        x: 0,
        y: "country",
        textAnchor: "start",
        lineWidth: 6,
        dx: 10,
        fontSize: 16,
        fontWeight: "bold",
        fill: "white",
      }),
      Plot.text(data, {
        text: (d) => `${d.visitCount}`,
        x: "visitCount",
        y: "country",
        dx: 20,
        fontSize: 16,
        fontWeight: "bold",
        lineAnchor: "middle",
        fill: "black",
      }),
      Plot.ruleX([0]),
      Plot.axisX({
        label: "Number of Visits",
        labelOffset: 50,
        fontSize: 16,
        fontWeight: "bold",
        fill: "black",
        dx: 15,
        marginBottom: 50,
      }),
      Plot.axisY({
        label: "Country",
        fontSize: 16,
        fontWeight: "bold",
        fill: "black",
        dx: 15,
        tickFormat: (d) => "",
        tickSize: 0,
      }),
    ],
  });
}
