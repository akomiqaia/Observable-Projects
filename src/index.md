---
toc: false
---

```js
// import {chordDiagram, legend as chordLegend, aggrigateAndGenereateMeatadata} from "./components/chord-diagram.js"
// import {drawer} from "./components/drawer.js"}
import {drawer} from "./components/drawer.js"
import {chordDiagram, aggrigateAndGenereateMeatadata, legend as chordLegend} from "./components/chord-diagram.js"
```

```js
const parquetData = FileAttachment("./data/visits.json").json()


```

```js
const df = parquetData.map(d => ({
  ...d,
  LeaderID: parseInt(d.LeaderID),
  Exiled: parseInt(d.Exiled),
  TripYear: parseInt(d.TripYear)
}))

 const {preAggregated, metadata} = aggrigateAndGenereateMeatadata(df)
 
 const selectedRegions = Mutable(metadata.regions);
 const updateRegions = (d) => {
   return selectedRegions.value = selectedRegions.value.includes(d)
     ? selectedRegions.value.filter((r) => r !== d)
     : [...selectedRegions.value, d];
 }
 ```
 
 ```js
const filters = {
  year: 2000,
  regions: selectedRegions,
  minVisits: 6,
}
```

<div class="hero">
  <h1>Hello Visitor!</h1>
  <h2>Welcome to a page where you can see personal data visualization exploration, ideas and work.</h2>
</div>

<div  style="max-width: 800px; margin: 0 auto;">
    <p>
        <a href="./diplomatic-visits/travel-activity">Chord chart</a> To show diplomatic visits between countries and organizations.
    </p>
    <div class="card">
        <div>
            ${chordLegend(metadata, updateRegions)}
        </div>
        ${chordDiagram(preAggregated, metadata, filters, width)}
        <p>* The chart shows the number of visits between countries and organizations in 2000. where at least 6 diplomatic visits happened between the countries.</p>
    </div>
</div>

---

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
  margin: 0 auto;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
