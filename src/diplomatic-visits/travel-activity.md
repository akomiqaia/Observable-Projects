```ts
import * as Inputs from "npm:@observablehq/inputs";
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
import {horizontalBarChart} from "../components/horizontalBarChart.js"
```

# Diplomatic Travel Activity

From initial observation we can start by analyzing the data and identifying patterns or trends.

> | Goal: Understand where, when, and how much travel occurred.

```js
const parquetData = FileAttachment("../data/visits.parquet").parquet()
```

```js
const df = parquetData.toArray().map(d => ({
  ...d,
  LeaderID: parseInt(d.LeaderID),
  Exiled: parseInt(d.Exiled),
  TripYear: parseInt(d.TripYear),
  TripStartDate: new Date(d).toLocaleDateString(),
  TripEndDate: new Date(d).toLocaleDateString()
}))
```

```js
const tripPerYear = d3.rollups(df, v => v.length, d => d.TripYear)
const tripPerYearChart = Plot.barY(tripPerYear, {
  x: d => d[0],
  y: d => d[1],
  fill: "steelblue",
}).plot({
  title: "Number of Visits by Year",
  width: 800,
  grid: true,
  marginBottom: 50,
  x: { 
    tickRotate: -45,
    label: "Year",
    tickFormat: d => d.toString()
  },
  y: {
    label: "Number of Visits"
  }
})
display(tripPerYearChart)
```
The official visits have dropped significantly in 2020, even lower than the number of flights in 1990, which must have been due to the COVID-19 pandemic.

Let's take a look at the year 2020 and see which country officials made the most diplomatic visits and which country hosted the most diplomatic visitors.

```js
const visitorsByYear = d3.group(df, d => d.TripYear)
```

<div class="tip">You can see the other years by changing the year selection.</div>

```js
const year = view(
  Inputs.select(visitorsByYear, { 
    label: "Year", 
    format: d => d[0].toString(),
    valueof: ([year]) => year,
    value: 2020
  })
)
```

```js
const visitors = d3.rollup(visitorsByYear.get(year), v => v.length, d => d.LeaderCountryOrIGO)
const visited = d3.rollup(visitorsByYear.get(year), v => v.length, d => d.CountryVisited)
```

```js
const topVisitors = Array.from(visitors.entries())
  .sort((a, b) => b[1] - a[1]) 
  .slice(0, 10);
const topVisited = Array.from(visited.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
```

```js
const topVisitorsPlot = horizontalBarChart(topVisitors, "tomato",html`Top Countries that<br /><b>sent</b> Diplomatic Visitors`);
const topVisitedPlot = horizontalBarChart(topVisited, "steelblue", html`Top Countries that<br /><b>received</b> Diplomatic Visitors`);

```

<div class="grid grid-cols-2">
    <div class="card">${topVisitorsPlot}</div>
    <div class="card">${topVisitedPlot}</div>
</div>

TODO:

Trips by leader (bar chart) – LeaderFullName or LeaderCountryISO.

Trips by region visited (stacked bar chart) – RegionVisited / SubRegionVisited.

Trip duration distribution (histogram) – TripDuration.

Timeline of each leader’s trips (Gantt-style chart).
