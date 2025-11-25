import * as d3 from "d3";

export function chordDiagram(data, metadata, filters, width) {
  // get unique values of countries
  const { matrix, countries, countryToRegion } = createChordMatrix(
    data,
    filters,
  );
  const colors = d3.scaleOrdinal(metadata.regions, d3.schemeCategory10);

  const outerRadius = Math.min(width, width) * 0.4 - 40;
  const innerRadius = outerRadius - 20;

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", width)
    .attr("viewBox", [-width / 2, -width / 2, width, width]);

  const chord = d3.chord().padAngle(0.02).sortSubgroups(d3.descending);
  const chords = chord(matrix);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const ribbon = d3.ribbon().radius(innerRadius);

  const group = svg.append("g").selectAll().data(chords.groups).join("g");

  group
    .append("path")
    .attr("fill", (d) => colors(countryToRegion.get(countries[d.index])))
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
    .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
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
    .attr("fill", (d) => colors(countryToRegion.get(countries[d.target.index])))
    .attr("stroke", "white")
    .append("title")
    .text(
      (d) =>
        `${d.source.value.toLocaleString("en-US")} ${countries[d.source.index]} → ${countries[d.target.index]}${d.source.index !== d.target.index ? `\n${d.target.value.toLocaleString("en-US")} ${countries[d.target.index]} → ${countries[d.source.index]}` : ``}`,
    );

  return svg.node();
}

function createChordMatrix(preAggregated, filters = {}) {
  const { year, regions, minVisits = 1 } = filters;

  const countryToRegion = new Map();
  const edgeMap = new Map(); // Use Map for O(1) lookups

  // Iterate through pre-aggregated structure
  preAggregated.forEach((yearMap, y) => {
    if (year && y !== year) return;

    yearMap.forEach((leaderRegionMap, leaderCountry) => {
      leaderRegionMap.forEach((visitedMap, leaderRegion) => {
        if (regions && regions.length > 0 && !regions.includes(leaderRegion)) {
          return;
        }

        countryToRegion.set(leaderCountry, leaderRegion);

        visitedMap.forEach((regionVisitedMap, visitedCountry) => {
          regionVisitedMap.forEach((count, visitedRegion) => {
            if (
              regions &&
              regions.length > 0 &&
              !regions.includes(visitedRegion)
            ) {
              return;
            }

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

  // Convert to matrix
  const countries = Array.from(
    new Set([
      ...Array.from(edgeMap.keys()).map((k) => k.split("->")[0]),
      ...Array.from(edgeMap.keys()).map((k) => k.split("->")[1]),
    ]),
  ).sort();

  const countryToIndex = new Map(countries.map((c, i) => [c, i]));
  const matrix = Array(countries.length)
    .fill(0)
    .map(() => Array(countries.length).fill(0));

  edgeMap.forEach((count, key) => {
    const [leader, visited] = key.split("->");
    matrix[countryToIndex.get(leader)][countryToIndex.get(visited)] = count;
  });

  return { matrix, countries, countryToRegion };
}
