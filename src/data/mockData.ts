
// Mock data for battery analytics dashboard

// Fleet data
export const fleetData = [
  {
    id: 'BAT-001',
    name: 'Battery Pack #1',
    location: 'Building A',
    status: 'optimal', // optimal, good, moderate, warning, critical
    soh: 98, // State of Health (%)
    soc: 84, // State of Charge (%)
    temperature: 25.3, // Celsius
    thermalRisk: 'safe', // safe, elevated, caution, warning, danger
    cycleCount: 124,
    estimatedLifeRemaining: '4.2 years',
    lastUpdated: '2025-05-20T10:32:00Z'
  },
  {
    id: 'BAT-002',
    name: 'Battery Pack #2',
    location: 'Building B',
    status: 'good',
    soh: 91,
    soc: 65,
    temperature: 28.7,
    thermalRisk: 'elevated',
    cycleCount: 342,
    estimatedLifeRemaining: '3.7 years',
    lastUpdated: '2025-05-20T10:35:00Z'
  },
  {
    id: 'BAT-003',
    name: 'Battery Pack #3',
    location: 'Building A',
    status: 'moderate',
    soh: 82,
    soc: 73,
    temperature: 31.2,
    thermalRisk: 'caution',
    cycleCount: 578,
    estimatedLifeRemaining: '2.8 years',
    lastUpdated: '2025-05-20T10:30:00Z'
  },
  {
    id: 'BAT-004',
    name: 'Battery Pack #4',
    location: 'Building C',
    status: 'warning',
    soh: 71,
    soc: 92,
    temperature: 35.8,
    thermalRisk: 'warning',
    cycleCount: 826,
    estimatedLifeRemaining: '1.5 years',
    lastUpdated: '2025-05-20T10:29:00Z'
  },
  {
    id: 'BAT-005',
    name: 'Battery Pack #5',
    location: 'Building C',
    status: 'critical',
    soh: 56,
    soc: 25,
    temperature: 42.1,
    thermalRisk: 'danger',
    cycleCount: 1203,
    estimatedLifeRemaining: '0.7 years',
    lastUpdated: '2025-05-20T10:33:00Z'
  },
];

// Historical SoH data for trend analysis
export const sohHistoricalData = {
  'BAT-001': [
    { timestamp: '2025-01-01', value: 99.5 },
    { timestamp: '2025-01-15', value: 99.2 },
    { timestamp: '2025-02-01', value: 99.0 },
    { timestamp: '2025-02-15', value: 98.9 },
    { timestamp: '2025-03-01', value: 98.7 },
    { timestamp: '2025-03-15', value: 98.6 },
    { timestamp: '2025-04-01', value: 98.4 },
    { timestamp: '2025-04-15', value: 98.2 },
    { timestamp: '2025-05-01', value: 98.1 },
    { timestamp: '2025-05-15', value: 98.0 },
  ],
  'BAT-002': [
    { timestamp: '2025-01-01', value: 93.2 },
    { timestamp: '2025-01-15', value: 92.8 },
    { timestamp: '2025-02-01', value: 92.5 },
    { timestamp: '2025-02-15', value: 92.3 },
    { timestamp: '2025-03-01', value: 91.9 },
    { timestamp: '2025-03-15', value: 91.7 },
    { timestamp: '2025-04-01', value: 91.5 },
    { timestamp: '2025-04-15', value: 91.2 },
    { timestamp: '2025-05-01', value: 91.0 },
    { timestamp: '2025-05-15', value: 90.8 },
  ]
};

// Historical SoC data
export const socHistoricalData = {
  'BAT-001': [
    { timestamp: '2025-05-19T07:00:00Z', value: 100 },
    { timestamp: '2025-05-19T09:00:00Z', value: 97 },
    { timestamp: '2025-05-19T11:00:00Z', value: 93 },
    { timestamp: '2025-05-19T13:00:00Z', value: 90 },
    { timestamp: '2025-05-19T15:00:00Z', value: 85 },
    { timestamp: '2025-05-19T17:00:00Z', value: 91 },
    { timestamp: '2025-05-19T19:00:00Z', value: 97 },
    { timestamp: '2025-05-19T21:00:00Z', value: 92 },
    { timestamp: '2025-05-19T23:00:00Z', value: 87 },
    { timestamp: '2025-05-20T01:00:00Z', value: 85 },
    { timestamp: '2025-05-20T03:00:00Z', value: 84 },
    { timestamp: '2025-05-20T05:00:00Z', value: 83 },
    { timestamp: '2025-05-20T07:00:00Z', value: 82 },
    { timestamp: '2025-05-20T09:00:00Z', value: 84 },
  ]
};

// Thermal data map (for heatmap)
export const thermalMapData = {
  'BAT-001': [
    [24.2, 24.5, 24.8, 25.0, 25.3],
    [24.4, 24.7, 25.0, 25.4, 25.6],
    [24.6, 24.9, 25.3, 25.6, 25.9],
    [24.7, 25.0, 25.5, 25.8, 26.1],
    [24.5, 24.8, 25.1, 25.4, 25.7],
  ],
  'BAT-004': [
    [34.2, 34.8, 35.3, 36.1, 36.0],
    [34.5, 35.2, 35.8, 36.5, 36.2],
    [34.9, 35.7, 37.2, 37.8, 36.5],
    [34.7, 35.5, 36.7, 36.9, 36.3],
    [34.3, 34.9, 35.4, 35.8, 35.6],
  ],
  'BAT-005': [
    [40.2, 40.9, 41.5, 42.3, 42.1],
    [40.7, 41.5, 43.2, 43.8, 42.7],
    [41.3, 42.5, 44.8, 44.2, 43.1],
    [40.9, 42.0, 43.5, 43.6, 42.5],
    [40.4, 41.2, 41.8, 42.0, 41.5],
  ]
};

// Degradation prediction data
export const degradationPredictionData = {
  'BAT-001': [
    { cycles: 0, capacity: 100 },
    { cycles: 200, capacity: 97 },
    { cycles: 400, capacity: 95 },
    { cycles: 600, capacity: 92 },
    { cycles: 800, capacity: 88 },
    { cycles: 1000, capacity: 85 },
    { cycles: 1200, capacity: 81 },
    { cycles: 1400, capacity: 76 },
    { cycles: 1600, capacity: 70 },
    { cycles: 1800, capacity: 63 },
    { cycles: 2000, capacity: 55 },
  ]
};

// Key factors affecting battery health
export const healthFactorsData = {
  'BAT-001': {
    deepDischarges: { count: 2, impact: 'low' },
    highChargeRates: { count: 5, impact: 'low' },
    highTemperature: { count: 0, impact: 'none' },
    socExtremes: { count: 3, impact: 'low' },
    highSocResting: { hours: 124, impact: 'medium' },
  },
  'BAT-004': {
    deepDischarges: { count: 15, impact: 'medium' },
    highChargeRates: { count: 28, impact: 'high' },
    highTemperature: { count: 12, impact: 'high' },
    socExtremes: { count: 32, impact: 'medium' },
    highSocResting: { hours: 756, impact: 'high' },
  }
};
