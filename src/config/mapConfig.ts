export interface TileProvider {
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string[];
}

export const MAP_CONFIG = {
  defaultCenter: [12.9719, 77.6412] as [number, number], // Bengaluru Central
  defaultZoom: 13,
  minZoom: 10,
  maxZoom: 19,
  providers: {
    osm: {
      name: 'OpenStreetMap Standard',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: ['a', 'b', 'c']
    },
    cartoVoyager: {
      name: 'CartoDB Voyager (Road Mobility)',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
      subdomains: ['a', 'b', 'c', 'd']
    },
    cartoPositron: {
      name: 'CartoDB Light',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 20,
      subdomains: ['a', 'b', 'c', 'd']
    }
  } as Record<string, TileProvider>,
  primaryProvider: 'osm'
};

export function getActiveTileProvider(): TileProvider {
  const envUrl = import.meta.env.VITE_MAP_TILE_URL;
  const envAttr = import.meta.env.VITE_MAP_ATTRIBUTION;
  if (envUrl) {
    return {
      name: 'Custom Tile Provider',
      url: envUrl,
      attribution: envAttr || MAP_CONFIG.providers.osm.attribution,
      maxZoom: 19
    };
  }
  return MAP_CONFIG.providers[MAP_CONFIG.primaryProvider] || MAP_CONFIG.providers.osm;
}
