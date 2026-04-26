export const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11'

// Centered between Greenwich Village and Downtown Brooklyn
export const NYC_CENTER = [-73.9970, 40.7160]
export const NYC_ZOOM = 12.3

// Corridor: West 4th St (Greenwich Village) ↔ Downtown Brooklyn
export const AREA_BOUNDS = [[-74.030, 40.675], [-73.955, 40.743]]

// [name, lat, lon] — used for flyTo on search selection
export const NEIGHBORHOOD_CENTROIDS = [
  ['West Village',                          40.7367, -74.0093],
  ['Greenwich Village',                     40.7301, -73.9950],
  ['East Village',                          40.7236, -73.9758],
  ['SoHo-Little Italy-Hudson Square',       40.7241, -74.0043],
  ['Tribeca-Civic Center',                  40.7161, -74.0074],
  ['Lower East Side',                       40.7156, -73.9827],
  ['Chinatown-Two Bridges',                 40.7116, -73.9943],
  ['Financial District-Battery Park City',  40.7056, -74.0105],
  ['Downtown Brooklyn-DUMBO-Boerum Hill',   40.6980, -73.9861],
  ['Brooklyn Heights',                      40.6966, -73.9947],
]

// Exact neighborhoods that are clickable in the app
export const ALLOWED_NEIGHBORHOODS = [
  'West Village',
  'Greenwich Village',
  'East Village',
  'SoHo-Little Italy-Hudson Square',
  'Tribeca-Civic Center',
  'Lower East Side',
  'Chinatown-Two Bridges',
  'Financial District-Battery Park City',
  'Downtown Brooklyn-DUMBO-Boerum Hill',
  'Brooklyn Heights',
]

// NYC Neighborhood Tabulation Areas — served locally from public/
export const NTA_GEOJSON_URL = '/neighborhoods.geojson'
