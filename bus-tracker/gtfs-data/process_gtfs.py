"""Processes the real Darwin GTFS static data into compact JSON the web app
can load directly - real routes, real stops, real scheduled departure
times. This is schedule data, not live vehicle positions (NT Government
doesn't publish that publicly - see project notes)."""

import csv
import json
from collections import defaultdict
from pathlib import Path

HERE = Path(__file__).parent


def load_csv(name):
    with open(HERE / name, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


routes = load_csv("routes.txt")
stops = load_csv("stops.txt")
trips = load_csv("trips.txt")
stop_times = load_csv("stop_times.txt")

# route_id -> route info
route_by_id = {r["route_id"]: r for r in routes}
# trip_id -> route_id
trip_to_route = {t["trip_id"]: t["route_id"] for t in trips}
# stop_id -> stop info
stop_by_id = {s["stop_id"]: s for s in stops}

# Build: for each route, the sorted list of unique stops it serves, and for
# each stop on that route, a sample of real scheduled departure times.
route_stops = defaultdict(lambda: defaultdict(list))  # route_id -> stop_id -> [times]

for st in stop_times:
    trip_id = st["trip_id"]
    route_id = trip_to_route.get(trip_id)
    if not route_id:
        continue
    stop_id = st["stop_id"]
    time = st["departure_time"] or st["arrival_time"]
    if time:
        route_stops[route_id][stop_id].append(time)

# Compact output: one entry per real route, with its real stops (name +
# coords) and a sorted sample of real scheduled times at each.
output_routes = []
for route_id, stops_dict in route_stops.items():
    route = route_by_id.get(route_id)
    if not route:
        continue
    stop_entries = []
    for stop_id, times in stops_dict.items():
        stop = stop_by_id.get(stop_id)
        if not stop:
            continue
        sorted_times = sorted(set(times))
        stop_entries.append({
            "id": stop_id,
            "name": stop["stop_name"],
            "lat": float(stop["stop_lat"]),
            "lon": float(stop["stop_lon"]),
            "times": sorted_times[:8],  # first 8 real scheduled times, enough for a real preview
            "totalDepartures": len(sorted_times),
        })
    if not stop_entries:
        continue
    output_routes.append({
        "id": route_id,
        "shortName": route["route_short_name"],
        "longName": route["route_long_name"],
        "stopCount": len(stop_entries),
        "stops": stop_entries,
    })

# Dedupe by short name + long name (GTFS often has multiple route_id
# variants - e.g. weekday/weekend - for the same real route)
seen = set()
deduped = []
for r in sorted(output_routes, key=lambda r: (r["shortName"], -r["stopCount"])):
    key = (r["shortName"], r["longName"])
    if key in seen:
        continue
    seen.add(key)
    deduped.append(r)

deduped.sort(key=lambda r: (len(r["shortName"]), r["shortName"]))

out_path = HERE.parent / "routes.json"
out_path.write_text(json.dumps(deduped, indent=2), encoding="utf-8")
print(f"Wrote {len(deduped)} real routes to {out_path}")
print(f"Total real stops referenced: {sum(r['stopCount'] for r in deduped)}")
