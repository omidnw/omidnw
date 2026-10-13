# Digital Earth assets

Geographic data: Natural Earth, public domain.
https://www.naturalearthdata.com/about/terms-of-use/

- earth-surface-mask.png: 2048×1024 equirectangular mask. Red = land, green = coastline, blue = land. Rasterized from 1:50m land polygons, excluding holes.
- earth-land-points.json: interleaved longitude, latitude degrees, sampled at 0.4° latitude with equal-distance longitudinal spacing against the same land mask. Tablet/mobile subsample this array at runtime.
- earth-city-lights.json: [longitude, latitude, pop_max] entries from 1:10m populated places, population ≥1,000. City positions are real; sprite size/intensity is an artistic encoding of population, not satellite-measured radiance. No invented city clusters.

Sources:
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_populated_places_simple.geojson

All assets bundled locally; no third-party runtime texture service. The 1:50m mask omits some tiny islands, and city coverage reflects this cartographic dataset rather than a complete census. Decorative network nodes do not imply user residency.
