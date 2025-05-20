
// This file contains extended mock data to simulate a large fleet of batteries

export const generateExtendedFleetData = () => {
  const depots = ['North Depot', 'South Depot', 'East Depot', 'West Depot', 'Central Depot', 'Metro Depot'];
  
  // Generate 300 vehicles across 6 depots
  const extendedFleetData = [];
  
  for (let i = 1; i <= 300; i++) {
    const id = `BAT-${i.toString().padStart(3, '0')}`;
    const depotIndex = Math.floor(Math.random() * depots.length);
    const depot = depots[depotIndex];
    
    // Generate random values with some patterns based on depot
    // Different depots have different characteristics
    let sohBase;
    let tempBase;
    let socBase;
    
    switch (depot) {
      case 'North Depot':
        sohBase = 85 + Math.random() * 15; // Higher SoH
        tempBase = 25 + Math.random() * 10; // Normal temps
        socBase = 50 + Math.random() * 40; // Higher SoC
        break;
      case 'South Depot':
        sohBase = 70 + Math.random() * 20; // Moderate SoH
        tempBase = 35 + Math.random() * 10; // Higher temps
        socBase = 50 + Math.random() * 40;
        break;
      case 'East Depot':
        sohBase = 60 + Math.random() * 25; // Wide range of SoH
        tempBase = 27 + Math.random() * 8; // Normal temps
        socBase = 40 + Math.random() * 50;
        break;
      case 'West Depot':
        sohBase = 75 + Math.random() * 20; // Good SoH
        tempBase = 28 + Math.random() * 7; // Normal temps
        socBase = 30 + Math.random() * 60;
        break;
      case 'Central Depot':
        sohBase = 55 + Math.random() * 35; // Very wide range
        tempBase = 30 + Math.random() * 15; // Higher temps
        socBase = 20 + Math.random() * 70;
        break;
      case 'Metro Depot':
        sohBase = 80 + Math.random() * 15; // Higher SoH
        tempBase = 25 + Math.random() * 5; // Controlled temps
        socBase = 60 + Math.random() * 30; // Higher SoC
        break;
      default:
        sohBase = 70 + Math.random() * 20;
        tempBase = 30 + Math.random() * 10;
        socBase = 50 + Math.random() * 40;
    }
    
    // Round values to reasonable precision
    const soh = Math.round(sohBase * 10) / 10;
    const temperature = Math.round(tempBase * 10) / 10;
    const soc = Math.round(socBase);
    
    // Determine status based on SoH
    let status;
    if (soh >= 90) status = 'optimal';
    else if (soh >= 80) status = 'good';
    else if (soh >= 70) status = 'moderate';
    else if (soh >= 60) status = 'warning';
    else status = 'critical';
    
    // Determine thermal risk based on temperature
    let thermalRisk;
    if (temperature < 30) thermalRisk = 'safe';
    else if (temperature < 35) thermalRisk = 'elevated';
    else if (temperature < 40) thermalRisk = 'caution';
    else if (temperature < 45) thermalRisk = 'warning';
    else thermalRisk = 'danger';
    
    // Cycle count increases with decreasing SoH
    const cycleCount = Math.round(((100 - soh) / 30) * 2000 + Math.random() * 200);
    
    // Estimated life remaining decreases with decreasing SoH
    const yearsRemaining = Math.max(0.5, (soh - 50) / 10);
    const monthsRemaining = Math.round(yearsRemaining * 12);
    const estimatedLifeRemaining = monthsRemaining >= 12 ? 
      `${Math.floor(monthsRemaining / 12)} years ${monthsRemaining % 12} months` : 
      `${monthsRemaining} months`;
    
    extendedFleetData.push({
      id,
      name: `Vehicle ${i.toString().padStart(3, '0')}`,
      soh,
      soc,
      status,
      temperature,
      thermalRisk,
      cycleCount,
      estimatedLifeRemaining,
      depot
    });
  }
  
  return extendedFleetData;
};

// Generate historical data for first 10 vehicles
export const generateHistoricalData = (fleetData: any[]) => {
  const sohHistoricalData: Record<string, any[]> = {};
  const socHistoricalData: Record<string, any[]> = {};
  const degradationPredictionData: Record<string, any[]> = {};
  
  // Generate for first 10 batteries
  for (let i = 0; i < Math.min(10, fleetData.length); i++) {
    const batteryId = fleetData[i].id;
    const currentSoH = fleetData[i].soh;
    
    // Generate SoH history - last 12 months
    const sohData = [];
    // Start from higher SoH (12 months ago) and trend down to current
    const startSoH = Math.min(100, currentSoH + 5 + Math.random() * 5);
    
    for (let month = 12; month >= 0; month--) {
      const date = new Date();
      date.setMonth(date.getMonth() - month);
      
      const progress = (12 - month) / 12; // 0 to 1 as we get closer to present
      const soh = startSoH - progress * (startSoH - currentSoH);
      
      sohData.push({
        timestamp: date.toISOString(),
        value: Math.round(soh * 10) / 10
      });
    }
    sohHistoricalData[batteryId] = sohData;
    
    // Generate SoC history - last 24 hours
    const socData = [];
    for (let hour = 24; hour >= 0; hour--) {
      const date = new Date();
      date.setHours(date.getHours() - hour);
      
      // Create some patterns in SoC data
      let socValue;
      if (hour % 8 < 3) {
        // Charging period
        socValue = 40 + ((3 - (hour % 8)) / 3) * 55;
      } else if (hour % 8 >= 3 && hour % 8 < 6) {
        // High SoC period
        socValue = 90 - ((hour % 8 - 3) / 3) * 10;
      } else {
        // Discharging period
        socValue = 80 - ((hour % 8 - 6) / 2) * 40;
      }
      
      // Add some noise
      socValue = socValue + (Math.random() * 10 - 5);
      socValue = Math.max(5, Math.min(100, socValue));
      
      socData.push({
        timestamp: date.toISOString(),
        value: Math.round(socValue)
      });
    }
    socHistoricalData[batteryId] = socData;
    
    // Generate degradation prediction data
    const cycleCount = fleetData[i].cycleCount;
    const degradationData = [];
    
    // Historical capacity vs cycles
    for (let cycle = 0; cycle <= cycleCount; cycle += Math.max(1, Math.floor(cycleCount / 20))) {
      const progress = cycle / 2000; // Assuming 2000 cycles is 100% of life
      const capacity = 100 - progress * 40 - Math.random() * 3 + Math.random() * 3;
      
      degradationData.push({
        cycles: cycle,
        capacity: Math.round(Math.max(50, capacity) * 10) / 10
      });
    }
    
    // Future prediction
    const futureSteps = 5;
    const lastCapacity = degradationData[degradationData.length - 1].capacity;
    const lastCycle = cycleCount;
    
    for (let i = 1; i <= futureSteps; i++) {
      const futureCycle = lastCycle + (i * 200);
      const progress = futureCycle / 2000;
      const predictedCapacity = 100 - progress * 40 - Math.random() * 2;
      
      degradationData.push({
        cycles: futureCycle,
        capacity: Math.round(Math.max(30, predictedCapacity) * 10) / 10
      });
    }
    
    degradationPredictionData[batteryId] = degradationData;
  }
  
  return { sohHistoricalData, socHistoricalData, degradationPredictionData };
};
