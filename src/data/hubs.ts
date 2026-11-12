export interface TradeHub {
  id: string;
  name: string;
  regionId: number;
  regionName: string;
  stationId: number;
  stationName: string;
}

export const TRADE_HUBS: Record<string, TradeHub> = {
  dodixie: {
    id: 'dodixie',
    name: 'Dodixie',
    regionId: 10000032,
    regionName: 'Sinq Laison',
    stationId: 60011866,
    stationName: 'Dodixie IX - Moon 20 - Federation Navy Assembly Plant',
  },
  jita: {
    id: 'jita',
    name: 'Jita',
    regionId: 10000002,
    regionName: 'The Forge',
    stationId: 60003760,
    stationName: 'Jita IV - Moon 4 - Caldari Navy Assembly Plant',
  },
  amarr: {
    id: 'amarr',
    name: 'Amarr',
    regionId: 10000043,
    regionName: 'Domain',
    stationId: 60008494,
    stationName: 'Amarr VIII (Oris) - Emperor Family Academy',
  },
  rens: {
    id: 'rens',
    name: 'Rens',
    regionId: 10000030,
    regionName: 'Heimatar',
    stationId: 60004588,
    stationName: 'Rens VI - Moon 8 - Brutor Tribe Treasury',
  },
  hek: {
    id: 'hek',
    name: 'Hek',
    regionId: 10000042,
    regionName: 'Metropolis',
    stationId: 60005686,
    stationName: 'Hek VIII - Moon 12 - Boundless Creation Factory',
  },
};

export const DEFAULT_HUB_ID = 'dodixie';
