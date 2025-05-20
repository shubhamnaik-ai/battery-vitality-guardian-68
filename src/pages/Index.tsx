
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardHeader from '@/components/DashboardHeader';
import SummaryDashboard from '@/components/SummaryDashboard';
import DetailPanel from '@/components/DetailPanel';
import Filters from '@/components/Filters';
import ComparisonTab from '@/components/ComparisonTab';
import BatteryCalculator from './BatteryCalculator';
import { 
  generateExtendedFleetData, 
  generateSohHistorical, 
  generateSocHistorical, 
  generateDegradationPrediction,
  generateThermalMapData,
  generateThermalHistory,
  generateCycleHistory,
  generateTempVsSohData,
  generateCyclesVsSohData
} from '@/utils/extendedMockData';

const Index = () => {
  // Generate extended fleet data with 300 vehicles across 6 depots
  const extendedFleetData = generateExtendedFleetData(300, 6);
  
  // State management
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepots, setSelectedDepots] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const navigate = useNavigate();
  
  // Get unique depot list from fleet data
  const depots = Array.from(new Set(extendedFleetData.map(vehicle => vehicle.depot)));
  const vehicles = extendedFleetData.map(vehicle => vehicle.id);

  // Default select first two vehicles when component mounts
  useEffect(() => {
    if (vehicles.length >= 2 && selectedVehicles.length === 0) {
      setSelectedVehicles([vehicles[0], vehicles[1]]);
    }
  }, []);
  
  // Generate historical and prediction data
  const sohHistoricalData = generateSohHistorical(vehicles);
  const socHistoricalData = generateSocHistorical(vehicles);
  const degradationPredictionData = generateDegradationPrediction(vehicles);
  const thermalMapData = generateThermalMapData(vehicles);
  const thermalHistoryData = generateThermalHistory(vehicles);
  const cycleHistoryData = generateCycleHistory(vehicles);
  const tempVsSohData = generateTempVsSohData(vehicles);
  const cyclesVsSohData = generateCyclesVsSohData(vehicles);
  
  // Filter data based on selections
  const filteredFleetData = extendedFleetData.filter(vehicle => {
    const depotMatch = selectedDepots.length === 0 || selectedDepots.includes(vehicle.depot);
    const vehicleMatch = selectedVehicles.length === 0 || selectedVehicles.includes(vehicle.id);
    return depotMatch && vehicleMatch;
  });
  
  // Get vehicle IDs for filtered data
  const filteredVehicleIds = filteredFleetData.map(vehicle => vehicle.id);
  
  // Prepare multi-vehicle chart data for SOH analysis
  const prepareMultiVehicleSohData = () => {
    if (filteredVehicleIds.length === 0) return [];
    
    // For multiple vehicles, combine their data with vehicle identifiers
    const combinedData: any[] = [];
    
    // Get the first vehicle's data to use as reference for timestamps
    const baseVehicleId = filteredVehicleIds[0];
    const baseTimestamps = sohHistoricalData[baseVehicleId]?.map(entry => entry.timestamp) || [];
    
    baseTimestamps.forEach((timestamp, index) => {
      const dataPoint: any = { timestamp };
      
      // Add data for each filtered vehicle
      filteredVehicleIds.forEach(vehicleId => {
        const vehicle = extendedFleetData.find(v => v.id === vehicleId);
        const vehicleData = sohHistoricalData[vehicleId] || [];
        if (vehicleData[index]) {
          dataPoint[vehicleId] = vehicleData[index].value;
          
          // Store vehicle name for legend display
          dataPoint[`${vehicleId}_name`] = vehicle?.name || vehicleId;
        }
      });
      
      combinedData.push(dataPoint);
    });
    
    return combinedData;
  };
  
  // Prepare multi-vehicle chart data for degradation prediction
  const prepareMultiVehicleDegradationData = () => {
    if (filteredVehicleIds.length === 0) return [];
    
    // For multiple vehicles, combine their data with vehicle identifiers
    const combinedData: any[] = [];
    
    // Get the first vehicle's data to use as reference for cycles
    const baseVehicleId = filteredVehicleIds[0];
    const baseCycles = degradationPredictionData[baseVehicleId]?.map(entry => entry.cycles) || [];
    
    baseCycles.forEach((cycle, index) => {
      const dataPoint: any = { cycles: cycle };
      
      // Add data for each filtered vehicle
      filteredVehicleIds.forEach(vehicleId => {
        const vehicle = extendedFleetData.find(v => v.id === vehicleId);
        const vehicleData = degradationPredictionData[vehicleId] || [];
        if (vehicleData[index]) {
          dataPoint[vehicleId] = vehicleData[index].capacity;
          
          // Store vehicle name for legend display
          dataPoint[`${vehicleId}_name`] = vehicle?.name || vehicleId;
        }
      });
      
      combinedData.push(dataPoint);
    });
    
    return combinedData;
  };
  
  // Prepare multi-vehicle chart data for thermal history
  const prepareMultiVehicleThermalData = () => {
    if (filteredVehicleIds.length === 0) return [];
    
    // For multiple vehicles, combine their data with vehicle identifiers
    const combinedData: any[] = [];
    
    // Get the first vehicle's data to use as reference for timestamps
    const baseVehicleId = filteredVehicleIds[0];
    const baseTimestamps = thermalHistoryData[baseVehicleId]?.map(entry => entry.timestamp) || [];
    
    baseTimestamps.forEach((timestamp, index) => {
      const dataPoint: any = { timestamp };
      
      // Add data for each filtered vehicle
      filteredVehicleIds.forEach(vehicleId => {
        const vehicle = extendedFleetData.find(v => v.id === vehicleId);
        const vehicleData = thermalHistoryData[vehicleId] || [];
        if (vehicleData[index]) {
          dataPoint[vehicleId] = vehicleData[index].temperature;
          
          // Store vehicle name for legend display
          dataPoint[`${vehicleId}_name`] = vehicle?.name || vehicleId;
        }
      });
      
      combinedData.push(dataPoint);
    });
    
    return combinedData;
  };
  
  // Prepare filtered thermal map data
  const prepareFilteredThermalMapData = () => {
    const filteredThermalMapData: Record<string, number[][]> = {};
    
    filteredVehicleIds.forEach(vehicleId => {
      if (thermalMapData[vehicleId]) {
        filteredThermalMapData[vehicleId] = thermalMapData[vehicleId];
      }
    });
    
    return filteredThermalMapData;
  };
  
  // Get multi-vehicle datasets
  const multiVehicleSohData = prepareMultiVehicleSohData();
  const multiVehicleDegradationData = prepareMultiVehicleDegradationData();
  const multiVehicleThermalData = prepareMultiVehicleThermalData();
  const filteredThermalMapData = prepareFilteredThermalMapData();
  
  // Handle navigation to calculator page
  const handleCalculatorClick = () => {
    navigate('/calculator');
  };
  
  return (
    <Routes>
      <Route path="/" element={
        <div className="container mx-auto p-4 max-w-7xl">
          <DashboardHeader
            title="Battery Analytics Dashboard"
            onTabChange={setActiveTab}
            activeTab={activeTab}
            onCalculatorClick={handleCalculatorClick}
          />
          
          <Filters 
            depots={depots}
            vehicles={vehicles}
            selectedDepots={selectedDepots}
            selectedVehicles={selectedVehicles}
            onDepotFilterChange={setSelectedDepots}
            onVehicleFilterChange={setSelectedVehicles}
          />
          
          <Tabs value={activeTab} className="space-y-4">
            <TabsContent value="overview" className="space-y-4">
              <SummaryDashboard 
                fleetData={filteredFleetData}
                sohHistoricalData={sohHistoricalData}
                depots={depots}
                selectedDepots={selectedDepots} 
              />
            </TabsContent>
            
            <TabsContent value="soh" className="space-y-4">
              <DetailPanel 
                fleetData={filteredFleetData}
                chartData={multiVehicleSohData}
                panelTitle="State of Health (SoH) Analysis"
                panelDescription="Detailed analysis of battery state of health based on charge cycles, total energy, internal resistance, and temperature stress."
                chartTitle="SoH Trend Over Time"
                chartYLabel="State of Health (%)"
                additionalData={{
                  tempVsSoh: filteredVehicleIds.length === 1 ? tempVsSohData[filteredVehicleIds[0]] : tempVsSohData[filteredFleetData[0]?.id || ''],
                  cyclesVsSoh: filteredVehicleIds.length === 1 ? cyclesVsSohData[filteredVehicleIds[0]] : cyclesVsSohData[filteredFleetData[0]?.id || '']
                }}
              />
            </TabsContent>
            
            <TabsContent value="degradation" className="space-y-4">
              <DetailPanel 
                fleetData={filteredFleetData}
                chartData={multiVehicleDegradationData}
                panelTitle="Battery Degradation Analysis"
                panelDescription="Detailed analysis of battery degradation based on charge cycles, total energy, internal resistance, and temperature stress."
                chartTitle="Degradation Trend Over Time"
                chartYLabel="Capacity (%)"
                cycleHistory={filteredVehicleIds.length === 1 ? cycleHistoryData[filteredVehicleIds[0]] : cycleHistoryData[filteredFleetData[0]?.id || '']}
              />
            </TabsContent>
            
            <TabsContent value="thermal" className="space-y-4">
              <DetailPanel 
                fleetData={filteredFleetData}
                chartData={multiVehicleThermalData}
                thermalMapData={filteredThermalMapData}
                panelTitle="Thermal Risk Analysis"
                panelDescription="Detailed analysis of battery thermal risk based on charge cycles, total energy, internal resistance, and temperature stress."
                chartTitle="Thermal Risk Overview"
                chartYLabel="Temperature (°C)"
              />
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-4">
              <ComparisonTab 
                fleetData={filteredFleetData}
                sohHistoricalData={sohHistoricalData}
                socHistoricalData={socHistoricalData}
                degradationPredictionData={degradationPredictionData}
                cycleHistoryData={cycleHistoryData}
                thermalHistoryData={thermalHistoryData}
                cyclesVsSohData={cyclesVsSohData}
                tempVsSohData={tempVsSohData}
              />
            </TabsContent>
          </Tabs>
        </div>
      } />
      <Route path="/calculator" element={<BatteryCalculator />} />
    </Routes>
  );
};

export default Index;
