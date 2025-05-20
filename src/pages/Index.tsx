
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from "@/components/ui/tabs";
import DashboardHeader from '@/components/DashboardHeader';
import SummaryDashboard from '@/components/SummaryDashboard';
import DetailPanel from '@/components/DetailPanel';
import Filters from '@/components/Filters';
import ComparisonTab from '@/components/ComparisonTab';
import { thermalMapData, fleetData } from '@/data/mockData';
import { generateExtendedFleetData, generateSohHistorical, generateSocHistorical, generateDegradationPrediction } from '@/utils/extendedMockData';

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
  
  // Filter data based on selections
  const filteredFleetData = extendedFleetData.filter(vehicle => {
    const depotMatch = selectedDepots.length === 0 || selectedDepots.includes(vehicle.depot);
    const vehicleMatch = selectedVehicles.length === 0 || selectedVehicles.includes(vehicle.id);
    return depotMatch && vehicleMatch;
  });
  
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
            chartData={sohHistoricalData[filteredFleetData[0]?.id || 'BAT-001']}
            panelTitle="State of Health (SoH) Analysis"
            panelDescription="Detailed analysis of battery state of health based on charge cycles, total energy, internal resistance, and temperature stress."
            chartTitle="SoH Trend Over Time"
            chartYLabel="State of Health (%)"
          />
        </TabsContent>
        
        <TabsContent value="degradation" className="space-y-4">
          <DetailPanel 
            fleetData={filteredFleetData}
            chartData={degradationPredictionData[filteredFleetData[0]?.id || 'BAT-001']}
            panelTitle="Battery Degradation Analysis"
            panelDescription="Detailed analysis of battery degradation based on charge cycles, total energy, internal resistance, and temperature stress."
            chartTitle="Degradation Trend Over Time"
            chartYLabel="Degradation Rate (%)"
          />
        </TabsContent>
        
        <TabsContent value="thermal" className="space-y-4">
          <DetailPanel 
            fleetData={filteredFleetData}
            chartData={thermalMapData[filteredFleetData[0]?.id || 'BAT-001']}
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
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
