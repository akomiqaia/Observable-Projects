```ts
import * as Inputs from "npm:@observablehq/inputs";
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
import {horizontalBarChart} from "../components/horizontal-bar-chart.js"
import {multiLinePlot} from "../components/multi-line-chart.js"
import {stackedBarChart} from "../components/stacked-bar-chart.js"

```

# Diplomatic Travel Activity

From initial observation we can start by analyzing the data and identifying patterns or trends.

> | Goal: Understand where, when, and how much travel occurred.

```js
const parquetData = FileAttachment("../data/visits.json").json();
```

```js
const df = parquetData.map(d => ({
  ...d,
  LeaderID: parseInt(d.LeaderID),
  Exiled: parseInt(d.Exiled),
  TripYear: parseInt(d.TripYear),
  TripStartDate: new Date(d).toLocaleDateString(),
  TripEndDate: new Date(d).toLocaleDateString()
}))
```


<div class=card>
    ${stackedBarChart(df)}
</div>

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

looking beyond 2020 and investigating other years it seems that **Palestine** has sent most diplomatic visitors in 11 out of 35 years in each year.

in terms of who received the most diplomatic visitors it seems that the **United States** has received the most diplomatic visitors in 25 out of 35 years.

```js
const toggleInput = Inputs.toggle({
  label: html`<i>Show countries who received diplomatic visitors</i>`,
  value: false,
  format: () => "",
})

const toggle = Generators.input(toggleInput);
toggleInput.style.flexDirection = "row-reverse";

```

```js

const multiLineChartData = d3.flatRollup(df,
  v => v.length,
  d => toggle ? d.CountryVisited : d.LeaderCountryOrIGO,
  d => d.TripYear
)


const countries = [...new Set(multiLineChartData.map(d => d[0]))]


const searchResultsInput = Inputs.search(multiLineChartData, {
  label: "Country",
  placeholder: "Filter countries",
  datalist: countries,
  format: () => "",
})

const searchResults = Generators.input(searchResultsInput);

searchResultsInput.style.display = "flex";
searchResultsInput.style.flexDirection = "column";
searchResultsInput.style.gap = "0.5rem";


```

<div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex;  gap: 1rem;">
        ${searchResultsInput}
        ${toggleInput}
    </div>
    ${multiLinePlot(searchResults)}
</div>


TODO:


Trip duration distribution (histogram) – TripDuration.

Timeline of each leader’s trips (Gantt-style chart).
