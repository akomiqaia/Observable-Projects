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
const topVisitorsPlot = horizontalBarChart(topVisitors);
const topVisitedPlot = horizontalBarChart(topVisited, "steelblue");

```



Let's take a look at the year 2020 and see which country officials made the most diplomatic visits and which country was most visited.

<div class="grid grid-cols-2">
    <div class="card">${topVisitorsPlot}</div>
    <div class="card">${topVisitedPlot}</div>
</div>


TODO:

Trips by leader (bar chart) – LeaderFullName or LeaderCountryISO.

Trips by region visited (stacked bar chart) – RegionVisited / SubRegionVisited.

Trip duration distribution (histogram) – TripDuration.

Timeline of each leader’s trips (Gantt-style chart).
