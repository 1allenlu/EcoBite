export const MAPBOX_STYLE = 'mapbox://styles/mapbox/dark-v11'
// Centered between Greenwich Village and Downtown Brooklyn
export const NYC_CENTER = [-73.9920, 40.7080]
export const NYC_ZOOM = 13

// Corridor: West 4th St (Greenwich Village) ↔ Downtown Brooklyn
export const AREA_BOUNDS = [[-74.030, 40.675], [-73.955, 40.743]]

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
