import * as d3 from "d3";
import { html } from "htl";
import type { VisitsData } from "../utils/types";

type RegionVisitedMap = Map<string, number>; // RegionVisited -> count
type CountryVisitedMap = Map<string, RegionVisitedMap>; // CountryVisited -> RegionVisitedMap
type LeaderRegionMap = Map<string, CountryVisitedMap>; // LeaderRegion -> CountryVisitedMap
type LeaderCountryMap = Map<string, LeaderRegionMap>; // LeaderCountry -> LeaderRegionMap
type PreAggregated = Map<number, LeaderCountryMap>; // Year -> LeaderCountryMap

type Metadata = {
  years: number[];
  regions: string[];
  leaderCountries: string[];
  visitedCountries: string[];
  colors: d3.ScaleOrdinal<string, string, never>;
};

type Filters = {
  year: number;
  regions: string[];
  minVisits: number;
  changeRibbons: boolean;
};

interface ChordGroupWithAngle extends d3.ChordGroup {
  angle?: number;
}

interface ChordMatrixResult {
  matrix: number[][];
  countries: string[];
  countryToRegion: Map<string, string>;
}

export function chordDiagram(
  data: PreAggregated,
  metadata: Metadata,
  filters: Filters,
  width: number,
) {
  // get unique values of countries
  const { matrix, countries, countryToRegion } = createChordMatrix(
    data,
    filters,
  );

  const colors = metadata.colors;
  const changeRibbons = filters.changeRibbons;

  const outerRadius = Math.min(width, width) * 0.4 - 40;
  const innerRadius = outerRadius - 20;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width]);

  const chord = d3.chord().padAngle(0.04).sortSubgroups(d3.descending);
  const chords = chord(matrix);
  const arc = d3
    .arc<d3.ChordGroup>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);
  const ribbon = d3.ribbon<d3.Chord, d3.ChordSubgroup>().radius(innerRadius);

  const group = svg.append("g").selectAll().data(chords.groups).join("g");

  group
    .append("path")
    .attr("fill", (d) => {
      return colors(countryToRegion.get(countries[d.index]) as string);
    })
    .attr("d", arc);
  // .on("mouseover", (event, d) => {
  // console.log(`Mouseover event on ${countries[d.index]}`);
  // ribbons.transition().style("opacity", 0.1);
  // ribbons
  //   .filter((r) => r.source.index === d.index || r.target.index === d.index)
  //   .transition()
  //   .style("opacity", 1);
  // })
  // .on("mouseout", (event, d) => {
  //   console.log(`Mouseout event on ${countries[d.index]}`);
  // });
  // .append("title")
  // .text((d) => `${d.value.toLocaleString("en-US")} ${countries[d.index]}`)

  group
    .append("text")
    .each(
      (d: ChordGroupWithAngle) => (d.angle = (d.startAngle + d.endAngle) / 2),
    )
    .attr("dy", "0.35em")
    .attr(
      "transform",
      (d) => `
            rotate(${((d as any).angle * 180) / Math.PI - 90})
            translate(${outerRadius + 10})
            ${(d as any).angle > Math.PI ? "rotate(180)" : ""}
          `,
    )
    .attr("text-anchor", (d) => ((d as any).angle > Math.PI ? "end" : "start"))
    .text((d) => countries[d.index])
    .style("font-size", "10px")
    .style("fill", "#333")
    .style("width", "20px");

  svg
    .append("g")
    .attr("fill-opacity", 0.7)
    .selectAll()
    .data(chords)
    .join("path")
    .attr("d", ribbon)
    .attr("fill", (d) => {
      if (changeRibbons) {
        return colors(countryToRegion.get(countries[d.target.index]) as string);
      }
      return colors(countryToRegion.get(countries[d.source.index]) as string);
    })
    .attr("stroke", "white")
    .append("title")
    .text(
      (d) =>
        `${d.source.value.toLocaleString("en-US")} ${countries[d.source.index]} → ${countries[d.target.index]}${d.source.index !== d.target.index ? `\n${d.target.value.toLocaleString("en-US")} ${countries[d.target.index]} → ${countries[d.source.index]}` : ``}`,
    );

  return svg.node();
}

function createChordMatrix(
  preAggregated: PreAggregated,
  filters: Filters,
): ChordMatrixResult {
  const { year, regions, minVisits = 1 } = filters;

  const countryToRegion = new Map<string, string>();
  const edgeMap = new Map<string, number>();

  const regionSet = regions && regions.length > 0 ? new Set(regions) : null;

  // Iterate through pre-aggregated structure
  preAggregated.forEach((yearMap, y) => {
    // Skip if year filter doesn't match
    if (year && y !== year) return;

    yearMap.forEach((leaderRegionMap, leaderCountry) => {
      leaderRegionMap.forEach((visitedMap, leaderRegion) => {
        // Skip if region filter doesn't match
        if (regions && regions.length > 0 && !regions.includes(leaderRegion)) {
          return;
        }

        countryToRegion.set(leaderCountry, leaderRegion);

        visitedMap.forEach((regionVisitedMap, visitedCountry) => {
          regionVisitedMap.forEach((count, visitedRegion) => {
            if (regionSet && !regionSet.has(visitedRegion)) return;

            countryToRegion.set(visitedCountry, visitedRegion);

            if (count >= minVisits) {
              const key = `${leaderCountry}->${visitedCountry}`;
              edgeMap.set(key, (edgeMap.get(key) || 0) + count);
            }
          });
        });
      });
    });
  });

  return buildMatrix(edgeMap, countryToRegion);
}

// Separate matrix building logic
function buildMatrix(
  edgeMap: Map<string, number>,
  countryToRegion: Map<string, string>,
): ChordMatrixResult {
  // Extract unique countries more efficiently
  const countriesSet = new Set<string>();
  edgeMap.forEach((_, key) => {
    const [leader, visited] = key.split("->");
    countriesSet.add(leader);
    countriesSet.add(visited);
  });

  const countries = Array.from(countriesSet).sort();
  const countryToIndex = new Map<string, number>(
    countries.map((c, i) => [c, i]),
  );

  // Initialize matrix
  const size = countries.length;
  const matrix: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(0),
  );

  // Populate matrix
  edgeMap.forEach((count, key) => {
    const [leader, visited] = key.split("->");
    const leaderIndex = countryToIndex.get(leader);
    const visitedIndex = countryToIndex.get(visited);

    if (leaderIndex !== undefined && visitedIndex !== undefined) {
      matrix[leaderIndex][visitedIndex] = count;
    }
  });

  return { matrix, countries, countryToRegion };
}

export function legend(metadata: Metadata, updateRegions) {
  return html`
    <div
      style="display: flex; width: 100%; gap: 8px; flex-wrap: wrap; font-size: 10px;"
      id="chord-legend"
    >
      ${metadata.regions.map((d) => {
        return html`
          <div
            style="display: flex; align-items: center; cursor: pointer;"
            onclick=${() => updateRegions(d)}
          >
            <div
              style="width: 15px; height: 15px; background-color: ${metadata.colors(
                d,
              )}; border-radius: 10%; margin-right: 0.5rem;"
            ></div>
            <div>${d}</div>
          </div>
        `;
      })}
    </div>
  `;
}

export function aggrigateAndGenereateMeatadata(df: VisitsData): {
  metadata: Metadata;
  preAggregated: PreAggregated;
} {
  const preAggregated = d3.rollup(
    df,
    (v) => v.length,
    (d) => d.TripYear,
    (d) => d.LeaderCountryOrIGO,
    (d) => d.LeaderRegion,
    (d) => d.CountryVisited,
    (d) => d.RegionVisited,
  );
  const regions = Array.from(
    new Set([
      ...df.map((d) => d.LeaderRegion),
      ...df.map((d) => d.RegionVisited),
    ]),
  ).sort();
  const metadata = {
    years: Array.from(new Set(df.map((d) => d.TripYear))).sort((a, b) => b - a),
    regions: regions,
    leaderCountries: Array.from(
      new Set(df.map((d) => d.LeaderCountryOrIGO)),
    ).sort(),
    visitedCountries: Array.from(
      new Set(df.map((d) => d.CountryVisited)),
    ).sort(),
    colors: d3.scaleOrdinal(regions, d3.schemeObservable10),
  };

  return {
    metadata,
    preAggregated,
  };
}
