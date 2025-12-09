import * as Plot from "@observablehq/plot";

type SharedTypes = {
  TripYear: string
  count: number
}

type SentDataType = SharedTypes & {
  LeaderCountryOrIGO: string

}

type ReceivedDataType = SharedTypes & {
  CountryVisited: string 
}

export type ChartData = SentDataType | ReceivedDataType

export function horizontalBarChart(
  data: ChartData[],
  field: "LeaderCountryOrIGO" | "CountryVisited",
  fill?: string,
  title?: string
) {
  return Plot.plot({
    title: title,
    height: 600,
    marginRight: 150,
    marks: [
      Plot.barX(data, {
        x: 'count',
        y: field,
        fill: fill ?? "tomato",
        sort: {
          reverse: true,
          y: "x",
        },
      }),
      Plot.text(data, {
        text: field,
        x: "count",
        y: field,
        textAnchor: "start",
        lineWidth: 10,
        dx: 10,
        fontSize: 16,
        fontWeight: "bold",
        fill: "var(--theme-foreground)",
      }),
      Plot.text(data, {
        text: "count",
        x: "count",
        y: field,
        dx: -20,
        fontSize: 16,
        fontWeight: "bold",
        textAnchor: "end",
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
