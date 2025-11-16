# Diplomatic Visits


1. Travel Activity

Goal: Understand where, when, and how much travel occurred.

Trips per year (line chart) – using TripYear.

Trips by leader (bar chart) – LeaderFullName or LeaderCountryISO.

Trips by region visited (stacked bar chart) – RegionVisited / SubRegionVisited.

Trip duration distribution (histogram) – TripDuration.

Timeline of each leader’s trips (Gantt-style chart).

2. Geography / Networks

Goal: Map or visualize international relationships.

World map of visited countries – CountryVisited.

Chord diagram of leader country → country visited – LeaderCountryISO → CountryVisitedISO.

Network graph of diplomatic meetings – linking:

LeaderFullName

HostHOGSName

MetNonhostHOGS, etc.

3. Diplomatic Interaction Patterns

Goal: Analyze who met whom and under what conditions.

Number of meetings with host Heads of Government/State – MetHostHoGS.

Most frequently met leaders – HostHOGSName, NonhostHOGSNames.

Meetings with IGO leaders – MetIGOLeader, IGOLeaderName.

4. Event Participation

Goal: Track multilateral engagement.

Attendance at multilateral events – AttendedMultilatEvent.

Attendance at ministerial events – AttendedMultilatMinisterialEvent.

Most common event names – NameMultilatEvent.

5. Purpose / Type of Activities

Goal: Identify the purpose of foreign travel.

Frequency of public addresses – PublicAddress.

Number of signed agreements – SignedAgreement.

Trips involving business forums – BusinessLeaderOrForum.

Ceremonial/cultural events – CulturalSiteOrCeremony.

6. Regional or political focus

Goal: Determine where diplomatic energy is concentrated.

Leader’s preferred regions – compare LeaderRegion vs RegionVisited.

Does geographic proximity drive travel?
(e.g., heatmap of visits by subregion)

7. Data Quality Assessment

If needed, you can visualize the dataset’s reliability:

Histogram of confidence scores – Confidence(1-5).
