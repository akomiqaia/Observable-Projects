```ts
import * as Inputs from "npm:@observablehq/inputs";
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
```

# Travel Activity

From initial observation we can start by analyzing the data and identifying patterns or trends.

> | Goal: Understand where, when, and how much travel occurred.

```js
const tripPerYear = FileAttachment("../data/visits/visits-by-year.json").json()
```

```js

const tripPerYearChart = Plot.barY(tripPerYear, {
  x: "TripYear",
  y: "visitCount",
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
The official visits have dropped significantly in 2020, even lover then number of flights in 1990. Which must have been due to the COVID-19 pandemic.

```js
const visitors2020 = FileAttachment("../data/visits/diplomatic-activity-2020.json").json()
```
```js
const topVisitors = visitors2020.topVisitors.splice(0, 10)
const topVisited = visitors2020.topVisited.splice(0, 10)
```
```js

const topVisitorsPlot = Plot.plot({
  title: "Top Countries that sent Diplomatic Visitors",
  x: {
    label: "Number of visits"
  },
  y: {
    label: "Country"
  },
  marginLeft: 170,
  marks: [
    Plot.barX(topVisitors, {
      x: "visitCount",
      y: "country",
      fill: "tomato",
      sort: {
        y: "x",
        order: "descending"
      }
    }),
    Plot.text(topVisitors, {
      text: d => `${d.visitCount}`,
      x: "visitCount",
      y: "country",
      dx: -15,
      fontSize: 12,
      fontWeight: "bold",
      lineAnchor: "middle",
      fill: "white"
    }),
    Plot.ruleX([0])
  ]
})


const topVisitedPlot = Plot.plot({
  title: "Top Countries Visited by Diplomatic Officials",
  x: {
    label: "Number of visits"
  },
  y: {
    label: "Country"
  },
  marginLeft: 170,
  marks: [
    Plot.barX(topVisited, {
      x: "visitCount",
      y: "country",
      fill: "steelblue",
      sort: {
        y: "x",
        order: "descending"
      }
    }),
    Plot.text(topVisited, {
      text: d => `${d.visitCount}`,
      x: "visitCount",
      y: "country",
      dx: -15,
      fontSize: 12,
      fontWeight: "bold",
      lineAnchor: "middle",
      fill: "white"
    }),
    Plot.ruleX([0])
  ]
})
```



Let's take a look at the year 2020 and see which country officials made the most diplomatic visits and which country was most visited.

<div class="grid grid-cols-2">
    <div class="card">${topVisitorsPlot}</div>
  <div class="card">${topVisitedPlot}</div>
</div>



Trips by leader (bar chart) – LeaderFullName or LeaderCountryISO.

Trips by region visited (stacked bar chart) – RegionVisited / SubRegionVisited.

Trip duration distribution (histogram) – TripDuration.

Timeline of each leader’s trips (Gantt-style chart).
