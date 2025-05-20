
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardHeader from '@/components/DashboardHeader';
import SummaryDashboard from '@/components/SummaryDashboard';
import DetailPanel from '@/components/DetailPanel';
import Filters from '@/components/Filters';
import ComparisonTab from '@/components/ComparisonTab';
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
  
  // Get unique depot list from fleet data
  const depots = Array.from(new Set(extendedFleetData.map(vehicle => vehicle.depot)));
  const vehicles = extendedFleetData.map(vehicle => vehicle.id);
  
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
  
  // Ensure we have safe access to the first vehicle's data
  const firstVehicleId = filteredFleetData.length > 0 ? filteredFleetData[0].id : 'BAT-001';
  
  // Get chart data safely with fallback
  const getSafeChartData = (dataMap: Record<string, any>, id: string) => {
    return dataMap[id] || dataMap['BAT-001'] || [];
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <DashboardHeader
        title="Battery Analytics Dashboard"
        onTabChange={setActiveTab}
        activeTab={activeTab}
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
            chartData={getSafeChartData(sohHistoricalData, firstVehicleId)}
            panelTitle="State of Health (SoH) Analysis"
            panelDescription="Detailed analysis of battery state of health based on charge cycles, total energy, internal resistance, and temperature stress."
            chartTitle="SoH Trend Over Time"
            chartYLabel="State of Health (%)"
            additionalData={{
              tempVsSoh: getSafeChartData(tempVsSohData, firstVehicleId),
              cyclesVsSoh: getSafeChartData(cyclesVsSohData, firstVehicleId)
            }}
          />
        </TabsContent>
        
        <TabsContent value="degradation" className="space-y-4">
          <DetailPanel 
            fleetData={filteredFleetData}
            chartData={getSafeChartData(degradationPredictionData, firstVehicleId)}
            panelTitle="Battery Degradation Analysis"
            panelDescription="Detailed analysis of battery degradation based on charge cycles, total energy, internal resistance, and temperature stress."
            chartTitle="Degradation Trend Over Time"
            chartYLabel="Capacity (%)"
            cycleHistory={getSafeChartData(cycleHistoryData, firstVehicleId)}
          />
        </TabsContent>
        
        <TabsContent value="thermal" className="space-y-4">
          <DetailPanel 
            fleetData={filteredFleetData}
            chartData={getSafeChartData(thermalHistoryData, firstVehicleId)}
            thermalMapData={getSafeChartData(thermalMapData, firstVehicleId)}
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
  );
};

export default Index;
