---
toc: false
---
```ts
import * as Inputs from "npm:@observablehq/inputs";
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";
import {horizontalBarChart} from "./components/horizontal-bar-chart.js"
import {multiLinePlot} from "./components/multi-line-chart.js"
import {stackedBarChart} from "./components/stacked-bar-chart.js"

import {chordDiagram, legend as chordLegend, aggrigateAndGenereateMeatadata} from "./components/chord-diagram.js"

import {drawer} from "./components/drawer.js"

```

# Diplomatic Travel Activity

From initial observation we can start by analyzing the data and identifying patterns or trends.


```js
const parquetData = FileAttachment("./data/diplomatic-visits/visits.json").json()

const stackedBarData = FileAttachment("./data/diplomatic-visits/stacked-bar.json").json() 
const visits = FileAttachment("./data/diplomatic-visits/visits-per-year.json").json() 
```

```js
const df = parquetData.map(d => ({
  ...d,
  LeaderID: parseInt(d.LeaderID),
  Exiled: parseInt(d.Exiled),
  TripYear: parseInt(d.TripYear)
}))

```

```js
const toggleInputRegion = Inputs.toggle({
  label: html`<i>Visited Regions</i>`,
  value: false,
  format: () => "",
})

const toggleRegion = Generators.input(toggleInputRegion);
toggleInputRegion.style.flexDirection = "row-reverse";
toggleInputRegion.style.position = "absolute";
toggleInputRegion.style.top = "30px"
toggleInputRegion.style.right = "0"
```

<div class="card" style="position: relative;">
    ${toggleInputRegion}
    ${stackedBarChart(stackedBarData, width, toggleRegion)}
</div>

The official visits have dropped significantly in 2020, even lower than the number of flights in 1990, which must have been due to the COVID-19 pandemic.

Let's take a look at the year 2020 and see which country officials made the most diplomatic visits and which country hosted the most diplomatic visitors.

```js
const visitorsByYear = d3.group(visits.sentJsonData, d => d.TripYear)
```


```js
const yearInput = Inputs.select(visitorsByYear, { 
    label: "Year", 
    format: d => d[0].toString(),
    valueof: ([year]) => year,
    value: "2020"
  })

const year = Generators.input(yearInput);
```

```js
const topVisitors = visits.sentJsonData
  .filter(d => d.TripYear == year)
  .sort((a, b) => b.count - a.count)
  .splice(0, 10)
  .map(d => {
    return {...d, count: +d.count}
  })

const topVisited = visits.receivedJsonData
  .filter(d => d.TripYear == year)
  .sort((a, b) => b.count - a.count)
  .splice(0,10)
  .map(d => {
    return {...d, count: +d.count}
  })

```

```js
const topVisitorsPlot = horizontalBarChart(topVisitors, "LeaderCountryOrIGO", "tomato",html`Top Countries that<br /><b>sent</b> Diplomatic Visitors`);
const topVisitedPlot = horizontalBarChart(topVisited, "CountryVisited", "steelblue", html`Top Countries that<br /><b>received</b> Diplomatic Visitors`);

```
<div class="card">
    ${yearInput}
    <div class="grid grid-cols-2">
        <div class="card">${topVisitorsPlot}</div>
        <div class="card">${topVisitedPlot}</div>
    </div>
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

const multiLineChartData = !toggle ? visits.sentJsonData : visits.receivedJsonData
const zDimension = !toggle ? "LeaderCountryOrIGO" : "CountryVisited"

const countries = [...new Set(visits.sentJsonData.map(d => d.LeaderCountryOrIGO))]

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
    ${multiLinePlot(searchResults, zDimension, width)}
</div>

```js
  const {preAggregated, metadata} = aggrigateAndGenereateMeatadata(df)
  
  const yearSlider = Inputs.range([1990, 2024], {step: 1, value: 1990})
  const minVisitSlider = Inputs.range([1, 50], {step: 1, value: 5})
  const changeRibbons = Inputs.toggle({label: 'Change Ribbon colors to region of visited region', value: false})
  
  const yearSliderValue = Generators.input(yearSlider)
  const minVisitSliderValue = Generators.input(minVisitSlider)
  const changeRibbonsValue = Generators.input(changeRibbons)
  
  const selectedRegions = Mutable(metadata.regions);
  const updateRegions = (d) => {
    return selectedRegions.value = selectedRegions.value.includes(d)
      ? selectedRegions.value.filter((r) => r !== d)
      : [...selectedRegions.value, d];
  }
  
  const selectedCountry = Mutable(null)
  
  const updateCountry = (d) => {
    return selectedCountry.value = d;
  }

```

```js
  const filters = {
    year: yearSliderValue,
    regions: selectedRegions,
    minVisits: minVisitSliderValue,
    changeRibbons: changeRibbonsValue,
    updateCountry: updateCountry,
  }

```

To get more detailed information or to show diplomatic flow between the countries we can use the chord diagram. Bellow we have few filters that you can use to filter what you see. 
- `Year` slider is to choose the year of the visits. 
- `Visits between the 2 countries` slider is cumulative visits between the countries and number of visits. With this slider you can filter the minimum number of visits between two countries.
- `Change Ribbon colors to region of visited region` toggle is to change the ribbon colors from leaders origin Region to visited region color. This could be useful if you want to see which region was visited by leaders in each year.
- You can also deactivate/activate regions by clicking on the region name in the legend.
- If you hover over the ribbon you can see the details of the visit and diplomatic exchange between the countries.
- You can also click on a country `title` or the `arc` that represents the country to get more details about the country itself.


<div class="card">
    <div>
        <div class="grid grid-cols-3">
            <div>
                <p>Year</p>
                ${yearSlider}
            </div>
            <div>
                <p>Visits between the 2 countries</p>
                ${minVisitSlider}
            </div>
            ${changeRibbons}
        </div>
        <div>
            ${chordLegend(metadata, updateRegions)}
        </div>
    </div>
    <div style="margin: 0 auto; max-width: 800px;">
        ${chordDiagram(preAggregated, metadata, filters, width)}
    </div>
</div>

${drawer(df, selectedCountry, updateCountry)}

<style>
 p, ul, h1 {
    margin: 30px auto;
}
</style>
