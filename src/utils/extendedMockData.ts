// This file contains extended mock data to simulate a large fleet of batteries

export const generateExtendedFleetData = (vehicleCount = 300, depotCount = 6) => {
  // Use the specified depot names
  const depots = ['Baner Depot', 'Wagholi Depot', 'Swargate Depot', 'Nigdi', 'Wagholi', 'Katraj'];
  
  // Generate vehicles across depots
  const extendedFleetData = [];
  
  for (let i = 1; i <= vehicleCount; i++) {
    const id = `BAT-${i.toString().padStart(3, '0')}`;
    const depotIndex = Math.floor(Math.random() * depots.length);
    const depot = depots[depotIndex];
    
    // Generate random values with some patterns based on depot
    // Different depots have different characteristics
    let sohBase;
    let tempBase;
    let socBase;
    let cyclesBase;
    
    switch (depot) {
      case 'Baner Depot':
        sohBase = 85 + Math.random() * 15; // Higher SoH
        tempBase = 25 + Math.random() * 10; // Normal temps
        socBase = 50 + Math.random() * 40; // Higher SoC
        cyclesBase = 300 + Math.random() * 400; // Lower cycles
        break;
      case 'Wagholi Depot':
        sohBase = 70 + Math.random() * 20; // Moderate SoH
        tempBase = 35 + Math.random() * 10; // Higher temps
        socBase = 50 + Math.random() * 40;
        cyclesBase = 500 + Math.random() * 600;
        break;
      case 'Swargate Depot':
        sohBase = 60 + Math.random() * 25; // Wide range of SoH
        tempBase = 27 + Math.random() * 8; // Normal temps
        socBase = 40 + Math.random() * 50;
        cyclesBase = 700 + Math.random() * 500;
        break;
      case 'Nigdi':
        sohBase = 75 + Math.random() * 20; // Good SoH
        tempBase = 28 + Math.random() * 7; // Normal temps
        socBase = 30 + Math.random() * 60;
        cyclesBase = 400 + Math.random() * 300;
        break;
      case 'Katraj':
        sohBase = 55 + Math.random() * 35; // Very wide range
        tempBase = 30 + Math.random() * 15; // Higher temps
        socBase = 20 + Math.random() * 70;
        cyclesBase = 800 + Math.random() * 700;
        break;
      default:
        sohBase = 70 + Math.random() * 20;
        tempBase = 30 + Math.random() * 10;
        socBase = 50 + Math.random() * 40;
        cyclesBase = 500 + Math.random() * 500;
    }
    
    // Round values to reasonable precision
    const soh = Math.round(sohBase * 10) / 10;
    const temperature = Math.round(tempBase * 10) / 10;
    const soc = Math.round(socBase);
    const cycleCount = Math.round(cyclesBase);
    
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

// Generate historical SOH data for vehicles with 6 months of data
export const generateSohHistorical = (vehicleIds) => {
  const sohHistoricalData = {};
  
  for (const batteryId of vehicleIds) {
    // Generate SOH history - last 6 months with daily data
    const sohData = [];
    // Start from higher SOH (6 months ago) and trend down to current
    const currentSoh = 70 + Math.random() * 25; // Current SOH between 70-95%
    const startSoh = Math.min(100, currentSoh + 3 + Math.random() * 5);
    
    // Generate daily data for 6 months (180 days)
    for (let day = 180; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      const progress = (180 - day) / 180; // 0 to 1 as we get closer to present
      
      // Create some natural fluctuation
      const noise = (Math.random() - 0.5) * 0.2;
      const soh = startSoh - progress * (startSoh - currentSoh) + noise;
      
      // Add thermal effect - higher temperatures accelerate degradation
      const thermalEffect = day % 30 < 5 ? -0.2 : 0; // Occasional thermal stress
      
      // Add cycle effect - more cycles accelerate degradation
      const cycleEffect = -(Math.floor(day / 15) * 0.05);
      
      sohData.push({
        timestamp: date.toISOString(),
        value: Math.round((soh + thermalEffect + cycleEffect) * 10) / 10,
        temperature: 25 + (Math.random() * 20), // Temperature between 25-45°C
        cycles: Math.floor(day / 2) // Approximation of cycle count increase
      });
    }
    sohHistoricalData[batteryId] = sohData;
  }
  
  return sohHistoricalData;
};

// Generate historical SOC data for vehicles
export const generateSocHistorical = (vehicleIds) => {
  const socHistoricalData = {};
  
  for (const batteryId of vehicleIds) {
    // Generate SOC history - last 24 hours
    const socData = [];
    for (let hour = 24; hour >= 0; hour--) {
      const date = new Date();
      date.setHours(date.getHours() - hour);
      
      // Create some patterns in SOC data
      let socValue;
      if (hour % 8 < 3) {
        // Charging period
        socValue = 40 + ((3 - (hour % 8)) / 3) * 55;
      } else if (hour % 8 >= 3 && hour % 8 < 6) {
        // High SOC period
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
        value: Math.round(socValue),
        temperature: 25 + (Math.random() * 20) // Temperature between 25-45°C
      });
    }
    socHistoricalData[batteryId] = socData;
  }
  
  return socHistoricalData;
};

// Generate degradation prediction data
export const generateDegradationPrediction = (vehicleIds) => {
  const degradationPredictionData = {};
  
  for (const batteryId of vehicleIds) {
    // Random cycle count between 100 and 1500
    const cycleCount = Math.round(100 + Math.random() * 1400);
    const degradationData = [];
    
    // Historical capacity vs cycles
    for (let cycle = 0; cycle <= cycleCount; cycle += Math.max(1, Math.floor(cycleCount / 40))) {
      const progress = cycle / 2000; // Assuming 2000 cycles is 100% of life
      const capacity = 100 - progress * 40 - Math.random() * 3 + Math.random() * 3;
      
      // Add thermal effect - occasional thermal stress
      const thermalEffect = (cycle % 200 < 50) ? -2 * Math.random() : 0;
      
      degradationData.push({
        cycles: cycle,
        capacity: Math.round(Math.max(50, capacity + thermalEffect) * 10) / 10,
        temperature: 25 + (Math.random() * 20) // Temperature between 25-45°C
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
        capacity: Math.round(Math.max(30, predictedCapacity) * 10) / 10,
        temperature: 25 + (Math.random() * 20), // Temperature between 25-45°C
        isPrediction: true
      });
    }
    
    degradationPredictionData[batteryId] = degradationData;
  }
  
  return degradationPredictionData;
};

// Generate thermal data maps with history
export const generateThermalHistory = (vehicleIds: string[]) => {
  const thermalHistory: Record<string, Array<{ timestamp: string; temperature: number }>> = {};
  
  vehicleIds.forEach(vehicleId => {
    const baseTemp = 20 + Math.random() * 25; // Base temperature between 20-45°C
    const data: Array<{ timestamp: string; temperature: number }> = [];
    
    // Generate 24 hours of thermal data (every 2 hours)
    for (let i = 0; i < 12; i++) {
      const date = new Date('2025-05-19T00:00:00Z');
      date.setHours(i * 2);
      
      // Simulate daily temperature variation with some randomness
      const timeOfDay = (i * 2) / 24; // 0 to 1
      const dailyVariation = Math.sin(timeOfDay * 2 * Math.PI - Math.PI/2) * 8; // ±8°C variation
      const randomNoise = (Math.random() - 0.5) * 4; // ±2°C random noise
      
      const temperature = Math.max(15, Math.min(50, baseTemp + dailyVariation + randomNoise));
      
      data.push({
        timestamp: date.toISOString(),
        temperature: Math.round(temperature * 10) / 10
      });
    }
    
    thermalHistory[vehicleId] = data;
  });
  
  return thermalHistory;
};

// Generate cycle count history
export const generateCycleHistory = (vehicleIds) => {
  const cycleHistory = {};
  
  for (const batteryId of vehicleIds) {
    const history = [];
    // Generate 6 months of weekly cycle data
    const totalCycles = 100 + Math.round(Math.random() * 1500); // Different max cycles per vehicle
    
    // Distribute cycles over 26 weeks (6 months)
    let accumulatedCycles = 0;
    
    for (let week = 26; week >= 0; week--) {
      const date = new Date();
      date.setDate(date.getDate() - (week * 7));
      
      // Weekly cycles - higher at the beginning, tapering off
      const weeklyCycles = Math.round(5 + Math.random() * 15 * (1 + week/26));
      accumulatedCycles += weeklyCycles;
      
      // Ensure we don't exceed total cycles
      const adjustedCycles = Math.min(weeklyCycles, totalCycles - (accumulatedCycles - weeklyCycles));
      
      history.push({
        timestamp: date.toISOString(),
        cycles: adjustedCycles,
        totalCycles: accumulatedCycles
      });
    }
    
    cycleHistory[batteryId] = history;
  }
  
  return cycleHistory;
};

// Generate data for temperature vs SOH correlation
export const generateTempVsSohData = (vehicleIds) => {
  const tempVsSohData = {};
  
  for (const batteryId of vehicleIds) {
    const data = [];
    
    // Generate various temperature points and their effect on SOH
    for (let i = 0; i < 50; i++) {
      const temperature = 20 + Math.random() * 30; // 20-50°C
      
      // SOH decreases more at higher temperatures
      const sohReduction = 0.05 * Math.pow(temperature - 20, 1.5);
      const soh = Math.max(60, 100 - sohReduction - Math.random() * 5);
      
      data.push({
        temperature: Math.round(temperature * 10) / 10,
        soh: Math.round(soh * 10) / 10
      });
    }
    
    tempVsSohData[batteryId] = data;
  }
  
  return tempVsSohData;
};

// Generate data for cycles vs SOH correlation
export const generateCyclesVsSohData = (vehicleIds) => {
  const cyclesVsSohData = {};
  
  for (const batteryId of vehicleIds) {
    const data = [];
    const maxCycles = 1000 + Math.round(Math.random() * 1000); // Different max cycles per vehicle
    
    // Generate various cycle points and their effect on SOH
    for (let cycles = 0; cycles <= maxCycles; cycles += Math.max(50, Math.floor(maxCycles / 40))) {
      // SOH decreases with cycles (non-linear)
      const sohReduction = 20 * (cycles / maxCycles) + 10 * Math.pow(cycles / maxCycles, 2);
      const soh = Math.max(60, 100 - sohReduction - Math.random() * 3);
      
      data.push({
        cycles,
        soh: Math.round(soh * 10) / 10
      });
    }
    
    cyclesVsSohData[batteryId] = data;
  }
  
  return cyclesVsSohData;
};

// Generate thermal map data (for heatmap)
export const generateThermalMapData = (vehicleIds) => {
  const thermalMapData = {};
  
  for (const batteryId of vehicleIds) {
    // Create random thermal map 5x5
    const thermalMap = [];
    
    // Different temperature profiles based on the battery ID
    const isHighTemp = parseInt(batteryId.slice(4)) % 5 === 0; // Every 5th battery has high temp
    const baseTemp = isHighTemp ? 38 : 25;
    
    for (let row = 0; row < 5; row++) {
      const rowData = [];
      for (let col = 0; col < 5; col++) {
        // Center cells typically hotter
        const distFromCenter = Math.sqrt(Math.pow(row - 2, 2) + Math.pow(col - 2, 2));
        const tempOffset = isHighTemp ? -distFromCenter : 2 - distFromCenter;
        
        // Add some random variation
        const temp = baseTemp + tempOffset + (Math.random() * 3 - 1.5);
        
        rowData.push(Math.round(temp * 10) / 10);
      }
      thermalMap.push(rowData);
    }
    
    thermalMapData[batteryId] = thermalMap;
  }
  
  return thermalMapData;
};

// Get the list of vehicles with minimum and maximum battery temperatures
export const getMinMaxTemperatureVehicles = (fleetData) => {
  if (!fleetData || fleetData.length === 0) return { min: [], max: [] };
  
  // Sort by temperature
  const sortedByTemp = [...fleetData].sort((a, b) => a.temperature - b.temperature);
  
  // Get 5 vehicles with lowest temperatures
  const minTempVehicles = sortedByTemp.slice(0, 5);
  
  // Get 5 vehicles with highest temperatures
  const maxTempVehicles = sortedByTemp.slice(-5).reverse();
  
  return {
    min: minTempVehicles,
    max: maxTempVehicles
  };
};

// Get vehicles with potential thermal issues
export const getVehiclesWithThermalIssues = (fleetData) => {
  if (!fleetData || fleetData.length === 0) return [];
  
  // Filter vehicles with high temperatures or thermal risk
  return fleetData.filter(vehicle => 
    vehicle.temperature > 40 || 
    vehicle.thermalRisk === 'warning' || 
    vehicle.thermalRisk === 'danger'
  );
};
