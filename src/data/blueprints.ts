export interface BlueprintItem {
  id: string;
  name: string;
  category: 'T1 Ship' | 'T2 Module' | 'Capital Component' | 'T1 Frigate';
  outputTypeId: number;
  outputName: string;
  outputQuantity: number;
  baseBuildTimeSeconds: number; // in seconds
  materials: {
    typeId: number;
    name: string;
    quantity: number;
  }[];
}

export const SAMPLE_BLUEPRINTS: BlueprintItem[] = [
  {
    id: 'thorax',
    name: 'Thorax (T1 Cruiser)',
    category: 'T1 Ship',
    outputTypeId: 622,
    outputName: 'Thorax',
    outputQuantity: 1,
    baseBuildTimeSeconds: 3000, // 50 mins
    materials: [
      { typeId: 34, name: 'Tritanium', quantity: 245000 },
      { typeId: 35, name: 'Pyerite', quantity: 72000 },
      { typeId: 36, name: 'Mexallon', quantity: 18500 },
      { typeId: 37, name: 'Isogen', quantity: 4200 },
      { typeId: 38, name: 'Nocxium', quantity: 450 },
      { typeId: 39, name: 'Zydrine', quantity: 120 },
      { typeId: 40, name: 'Megacyte', quantity: 35 },
    ],
  },
  {
    id: 'warp-disruptor-2',
    name: 'Warp Disruptor II (T2 Module)',
    category: 'T2 Module',
    outputTypeId: 32800,
    outputName: 'Warp Disruptor II',
    outputQuantity: 1,
    baseBuildTimeSeconds: 1800, // 30 mins
    materials: [
      { typeId: 34, name: 'Tritanium', quantity: 12500 },
      { typeId: 35, name: 'Pyerite', quantity: 3400 },
      { typeId: 36, name: 'Mexallon', quantity: 850 },
      { typeId: 37, name: 'Isogen', quantity: 210 },
      { typeId: 38, name: 'Nocxium', quantity: 45 },
      { typeId: 39, name: 'Zydrine', quantity: 12 },
      { typeId: 40, name: 'Megacyte', quantity: 4 },
      { typeId: 11399, name: 'Morphite', quantity: 8 },
    ],
  },
  {
    id: 'capital-core-temp-regulator',
    name: 'Capital Core Temperature Regulator',
    category: 'Capital Component',
    outputTypeId: 3330,
    outputName: 'Capital Core Temperature Regulator',
    outputQuantity: 1,
    baseBuildTimeSeconds: 7200, // 2 hours
    materials: [
      { typeId: 34, name: 'Tritanium', quantity: 1500000 },
      { typeId: 35, name: 'Pyerite', quantity: 450000 },
      { typeId: 36, name: 'Mexallon', quantity: 120000 },
      { typeId: 37, name: 'Isogen', quantity: 35000 },
      { typeId: 38, name: 'Nocxium', quantity: 8500 },
      { typeId: 39, name: 'Zydrine', quantity: 2100 },
      { typeId: 40, name: 'Megacyte', quantity: 850 },
      { typeId: 11399, name: 'Morphite', quantity: 350 },
    ],
  },
  {
    id: 'atron',
    name: 'Atron (T1 Frigate)',
    category: 'T1 Frigate',
    outputTypeId: 582,
    outputName: 'Atron',
    outputQuantity: 1,
    baseBuildTimeSeconds: 900, // 15 mins
    materials: [
      { typeId: 34, name: 'Tritanium', quantity: 18500 },
      { typeId: 35, name: 'Pyerite', quantity: 4200 },
      { typeId: 36, name: 'Mexallon', quantity: 950 },
      { typeId: 37, name: 'Isogen', quantity: 180 },
      { typeId: 38, name: 'Nocxium', quantity: 25 },
    ],
  },
];
