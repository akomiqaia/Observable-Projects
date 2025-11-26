import * as d3 from "d3";
import { html } from "htl";

import type { VisitsData } from "../utils/types";

export function drawer(df: VisitsData, selectedCountry, updateCountry) {
  // 1. Unpack & Validate
  const targetCountry =
    selectedCountry &&
    typeof selectedCountry === "object" &&
    "value" in selectedCountry
      ? selectedCountry.value
      : selectedCountry;
  const isOpen = targetCountry != null;

  if (!isOpen) return "";

  // 2. Process Data
  const validVisits = df.filter((d) => {
    if (d.LeaderCountryOrIGO !== targetCountry) return false;
    return !isNaN(new Date(d.TripStartDate).getTime());
  });

  // Group By Leader
  const visitsByLeader = d3.groups(validVisits, (d) => d.LeaderFullName);

  // Group By Year
  const yearsStats = d3
    .rollups(
      validVisits,
      (v) => v.length,
      (d) => d.TripYear,
    )
    .sort((a, b) => a[0] - b[0]);

  // 3. Helpers
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-UK", {
      year: "numeric",
      month: "short",
    });
  const getBarWidth = (days) => {
    const d = days || 1;
    // Scale: Min 4px, Max 50px
    return Math.min(50, 4 + d * 4);
  };
  const slugify = (str) => str.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

  const scrollToTarget = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Flash Highlight
      el.style.transition = "background 0.5s";
      const originalBg = el.style.background;
      el.style.background = "var(--theme-foreground-focus)";
      setTimeout(() => {
        el.style.background = originalBg;
      }, 600);
    }
  };

  // AUTO-HIGHLIGHT LOGIC (Insert this before returning)
  if (isOpen) {
    // Timeout ensures DOM is rendered
    setTimeout(() => {
      const container = document.querySelector(".content-area");
      if (!container) return;

      // A. Observer for YEARS (Top Chart)
      // triggers when a year anchor hits the top 20% of the drawer
      const yearObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const year = entry.target.id.split("-")[1]; // id is "year-2005-anchor"

              // Reset all active bars
              document
                .querySelectorAll(".chart-bar")
                .forEach((el) => el.classList.remove("active"));

              // Highlight current year bar
              const activeBar = document.querySelector(
                `.chart-bar[data-year="${year}"]`,
              );
              if (activeBar) activeBar.classList.add("active");
            }
          });
        },
        { root: container, rootMargin: "0px 0px -80% 0px" },
      );

      // B. Observer for visits (Sidebar)
      const visitObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Get the ID of the visible card (e.g., "visit-123")
            const id = entry.target.id;

            // Find the corresponding bar in the sidebar
            const sidebarBar = document.querySelector(
              `.nav-bar[data-visit-id="${id}"]`,
            );

            if (sidebarBar) {
              if (entry.isIntersecting) {
                sidebarBar.classList.add("active");
                sidebarBar.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              } else {
                sidebarBar.classList.remove("active");
              }
            }
          });
        },
        {
          root: container,
          threshold: 0.5, // Trigger when 50% of the card is visible
          rootMargin: "-10% 0px -10% 0px", // Slight offset to avoid flickering at edges
        },
      );

      // Attach to all visit rows
      document
        .querySelectorAll(".visit-row")
        .forEach((el) => visitObserver.observe(el));

      // Attach observers
      document
        .querySelectorAll(".year-anchor")
        .forEach((el) => yearObserver.observe(el));
    }, 100);
  }

  // 4. Render
  return html`
    <div
      class="drawer-backdrop ${isOpen ? "open" : ""}"
      onclick=${() => updateCountry(null)}
    ></div>

    <div class="drawer-panel ${isOpen ? "open" : ""}">
      ${isOpen
        ? html`
            <!-- HEADER -->
            <div class="drawer-top-section">
              <div style="display:flex; justify-content:space-between;">
                <div>
                  <h1 style="margin:0; font-size:1.8rem; line-height:1;">
                    ${targetCountry}
                  </h1>
                  <div
                    style="color:var(--theme-foreground-muted); margin-top:4px; font-size:0.9rem"
                  >
                    Timeline: ${validVisits[0]?.TripYear} —
                    ${validVisits[validVisits.length - 1]?.TripYear}
                  </div>
                </div>
                <button
                  onclick=${() => updateCountry(null)}
                  style="border:none; background:transparent; font-size:1.5rem; cursor:pointer; color:var(--theme-foreground);"
                >
                  ✕
                </button>
              </div>

              <!-- CHART -->
              <div class="activity-chart-container">
                ${(() => {
                  const maxCount = d3.max(yearsStats, (d) => d[1]) || 1;
                  return yearsStats.map(([year, count]) => {
                    const heightPct = (count / maxCount) * 100;
                    return html.fragment` <div
                      class="chart-bar"
                      style="height: ${heightPct}%; flex:1;"
                      data-year="${year}"
                      data-count="${count}"
                      onclick=${() => scrollToTarget(`year-${year}-anchor`)}
                    ></div>`;
                  });
                })()}
              </div>

              <!-- LEGEND -->
              <div class="legend-row">
                <div class="legend-item">
                  <div class="legend-dot" style="background: #22c55e;"></div>
                  <span>Agreement</span>
                </div>
                <div class="legend-item">
                  <div class="legend-dot" style="background: #3b82f6;"></div>
                  <span>Summit</span>
                </div>
                <div class="legend-item" style="margin-left: auto;">
                  <span>Length = Duration in days</span>
                </div>
              </div>
            </div>

            <!-- BODY GRID -->
            <div class="drawer-body-grid">
              <!-- SIDEBAR (STICKY NAMES) -->
              <div class="timeline-sidebar">
                ${visitsByLeader.map(([leader, visits]) => {
                  const leaderId = `leader-${slugify(leader)}`;
                  // Compact Label: Last name only
                  const lastName = leader.split(" ").slice(-1)[0];

                  return html`
                    <div class="sidebar-group">
                      <!-- 1. NAME (LEFT, STICKY) -->
                      <div
                        class="sidebar-label"
                        title="Jump to ${leader}"
                        data-leader-target="${leaderId}"
                        onclick=${() => scrollToTarget(leaderId)}
                      >
                        ${lastName}
                      </div>

                      <!-- 2. BARS (RIGHT) -->
                      <div class="sidebar-bars-container">
                        ${visits.map((v, i) => {
                          let barClass = "nav-bar";
                          if (v.SignedAgreement) barClass += " agreement";
                          else if (v.AttendedMultilatEvent)
                            barClass += " multilat";

                          const visitId = `visit-${v.TripID || i}`;
                          // Bars grow based on duration
                          return html` <div
                            class="${barClass}"
                            style="width: ${getBarWidth(v.TripDuration)}px;"
                            data-visit-id="${visitId}"
                            title="${formatDate(
                              v.TripStartDate,
                            )}: ${v.TripDuration} days"
                            onclick=${() => scrollToTarget(visitId)}
                          ></div>`;
                        })}
                      </div>
                    </div>
                  `;
                })}
              </div>

              <!-- CONTENT -->
              <div class="content-area">
                ${visitsByLeader.map(([leader, visits]) => {
                  const leaderId = `leader-${slugify(leader)}`;
                  const dateRange = `${visits[0].TripYear} - ${visits[visits.length - 1].TripYear}`;

                  return html`
                    <div id="${leaderId}" class="leader-block">
                      <div class="leader-title">
                        <span>${leader}</span>
                        <span class="leader-years-span">${dateRange}</span>
                      </div>

                      ${visits.map((v, i) => {
                        const visitId = `visit-${v.TripID || i}`;
                        const yearAnchorId = `year-${v.TripYear}-anchor`;

                        let rowClass = "visit-row";
                        if (v.SignedAgreement) rowClass += " agreement";
                        else if (v.AttendedMultilatEvent)
                          rowClass += " multilat";

                        return html`
                          <div id="${yearAnchorId}" class="year-anchor"></div>
                          <div id="${visitId}" class="${rowClass}">
                            <div style="text-align:right; font-size:0.85rem;">
                              <div style="font-weight:700;">
                                ${formatDate(v.TripStartDate)}
                              </div>
                              <div style="color:var(--theme-foreground-muted);">
                                ${v.TripDuration}d
                              </div>
                            </div>
                            <div>
                              <div style="margin-bottom:4px;">
                                ${v.SignedAgreement
                                  ? html`<span class="tag agreement"
                                      >Agreement</span
                                    >`
                                  : ""}
                                ${v.AttendedMultilatEvent
                                  ? html`<span class="tag multilat"
                                      >Summit</span
                                    >`
                                  : ""}
                              </div>
                              <div style="font-weight:600; font-size:1rem;">
                                ${v.CountryVisited}
                              </div>
                              <div style="font-size:0.9rem; opacity:0.9;">
                                ${v.Notes ||
                                v.NameMultilatEvent ||
                                "Official Visit"}
                              </div>
                            </div>
                          </div>
                        `;
                      })}
                    </div>
                  `;
                })}
                ${validVisits.length === 0
                  ? html`<div
                      style="padding:2rem; text-align:center; opacity:0.5"
                    >
                      No data
                    </div>`
                  : ""}
              </div>
            </div>
          `
        : ""}
    </div>
  `;
}
