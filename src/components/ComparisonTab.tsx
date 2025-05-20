
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LineChart } from '@/components/charts/LineChart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComparisonTabProps {
  fleetData: any[];
  sohHistoricalData: any;
  socHistoricalData: any;
  degradationPredictionData: any;
  cycleHistoryData?: any;
  thermalHistoryData?: any;
  cyclesVsSohData?: any;
  tempVsSohData?: any;
}

const CHART_TYPES = [
  { 
    id: 'soh',
    name: 'State of Health Trend', 
    dataKey: 'sohHistoricalData',
    primaryKey: 'value',
    xKey: 'timestamp',
    color: '#3b82f6',
    formatter: (value: number) => `${value}%`,
    yAxisLabel: 'State of Health (%)'
  },
  { 
    id: 'soc',
    name: 'State of Charge History', 
    dataKey: 'socHistoricalData',
    primaryKey: 'value',
    xKey: 'timestamp',
    color: '#10b981',
    formatter: (value: number) => `${value}%`,
    yAxisLabel: 'State of Charge (%)'
  },
  { 
    id: 'degradation',
    name: 'Capacity vs Cycles', 
    dataKey: 'degradationPredictionData',
    primaryKey: 'capacity',
    xKey: 'cycles',
    color: '#f59e0b',
    formatter: (value: number) => `${value}%`,
    yAxisLabel: 'Capacity (%)'
  },
  {
    id: 'cycles',
    name: 'Cycle History',
    dataKey: 'cycleHistoryData',
    primaryKey: 'totalCycles',
    xKey: 'timestamp',
    color: '#6366f1',
    formatter: (value: number) => `${value} cycles`,
    yAxisLabel: 'Total Cycles'
  },
  {
    id: 'temperature',
    name: 'Temperature History',
    dataKey: 'thermalHistoryData',
    primaryKey: 'avgTemperature',
    xKey: 'timestamp',
    color: '#ef4444',
    formatter: (value: number) => `${value}°C`,
    yAxisLabel: 'Temperature (°C)'
  },
  {
    id: 'cyclesVsSoh',
    name: 'Cycles vs SoH Correlation',
    dataKey: 'cyclesVsSohData',
    primaryKey: 'soh',
    xKey: 'cycles',
    color: '#8b5cf6',
    formatter: (value: number) => `${value}%`,
    yAxisLabel: 'State of Health (%)'
  },
  {
    id: 'tempVsSoh',
    name: 'Temperature vs SoH Impact',
    dataKey: 'tempVsSohData',
    primaryKey: 'soh',
    xKey: 'temperature',
    color: '#ec4899',
    formatter: (value: number) => `${value}%`,
    yAxisLabel: 'State of Health (%)'
  }
];

const ComparisonTab: React.FC<ComparisonTabProps> = ({
  fleetData,
  sohHistoricalData,
  socHistoricalData,
  degradationPredictionData,
  cycleHistoryData = {},
  thermalHistoryData = {},
  cyclesVsSohData = {},
  tempVsSohData = {}
}) => {
  const [compareValues, setCompareValues] = useState<string[]>(['BAT-001', 'BAT-002']);
  const [chartType, setChartType] = useState('soh');
  const [selectedVehicles, setSelectedVehicles] = useState<Record<string, boolean>>({
    'BAT-001': true, 
    'BAT-002': true
  });
  
  const datasets = {
    sohHistoricalData,
    socHistoricalData,
    degradationPredictionData,
    cycleHistoryData,
    thermalHistoryData,
    cyclesVsSohData,
    tempVsSohData
  };
  
  // Get the chart configuration
  const selectedChartType = CHART_TYPES.find(type => type.id === chartType) || CHART_TYPES[0];

  // Handle vehicle selection changes
  const handleVehicleToggle = (vehicleId: string, checked: boolean) => {
    setSelectedVehicles(prev => ({
      ...prev,
      [vehicleId]: checked
    }));
  };
  
  // Process data for the chart - combine all selected vehicle data into one dataset
  const processChartData = () => {
    const selectedVehicleIds = Object.keys(selectedVehicles).filter(id => selectedVehicles[id]);
    
    if (selectedVehicleIds.length === 0) return [];
    
    const dataKey = selectedChartType.dataKey;
    const primaryKey = selectedChartType.primaryKey;
    const dataSource = datasets[dataKey as keyof typeof datasets];
    
    // Get the first vehicle's data as base
    const firstVehicleData = [...(dataSource[selectedVehicleIds[0]] || [])];
    
    // For each data point, add the other vehicles' values
    selectedVehicleIds.slice(1).forEach(vehicleId => {
      const vehicleData = dataSource[vehicleId] || [];
      
      // Add this vehicle's data as a new property to each data point
      vehicleData.forEach((point: any, index: number) => {
        if (index < firstVehicleData.length) {
          firstVehicleData[index][vehicleId] = point[primaryKey];
        }
      });
    });
    
    return firstVehicleData;
  };
  
  // Create additional lines config for all selected vehicles
  const getAdditionalLines = () => {
    const selectedVehicleIds = Object.keys(selectedVehicles).filter(id => selectedVehicles[id]);
    
    // First vehicle will be the main line, others will be additional lines
    return selectedVehicleIds.slice(1).map((id, index) => ({
      dataKey: id,
      color: index === 0 ? '#8b5cf6' : index === 1 ? '#f59e0b' : 
              index === 2 ? '#10b981' : index === 3 ? '#ef4444' : 
              `hsl(${(index * 30) % 360}, 70%, 50%)`,
      label: getVehicleName(id)
    }));
  };
  
  // Find vehicle names by IDs
  const getVehicleName = (id: string) => {
    const vehicle = fleetData.find(v => v.id === id);
    return vehicle ? vehicle.name : id;
  };

  // Get the processed chart data
  const chartData = processChartData();
  const additionalLines = getAdditionalLines();

  // Get list of vehicles with highest temperature range
  const getHighTempVehicles = () => {
    return fleetData
      .filter(v => v.temperature > 38)
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5);
  };

  const highTempVehicles = getHighTempVehicles();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Battery Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium block mb-2">Chart Type</label>
              <Select 
                value={chartType}
                onValueChange={setChartType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Chart Types</SelectLabel>
                    {CHART_TYPES.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <label className="text-sm font-medium block mb-2">Select Vehicles to Compare</label>
              <ScrollArea className="h-40 border rounded-md p-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {fleetData.slice(0, 50).map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`vehicle-${vehicle.id}`} 
                        checked={selectedVehicles[vehicle.id] || false}
                        onCheckedChange={(checked) => 
                          handleVehicleToggle(vehicle.id, checked === true)
                        }
                      />
                      <Label htmlFor={`vehicle-${vehicle.id}`} className="text-sm">
                        {vehicle.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          
          <div className="h-[400px]">
            <LineChart
              data={chartData}
              xDataKey={selectedChartType.xKey}
              yDataKey={selectedChartType.primaryKey}
              color={selectedChartType.color}
              label={getVehicleName(Object.keys(selectedVehicles).find(id => selectedVehicles[id]) || 'BAT-001')}
              height={400}
              tooltipFormatter={selectedChartType.formatter}
              yAxisLabel={selectedChartType.yAxisLabel}
              xAxisFormatter={(value) => {
                if (typeof value === 'string' && value.includes('T')) {
                  // Date format
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return String(value);
              }}
              additionalLines={additionalLines}
            />
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Selected Vehicles</h3>
            <div className="flex flex-wrap gap-4">
              {Object.keys(selectedVehicles)
                .filter(id => selectedVehicles[id])
                .map((vehicleId, index) => {
                  const vehicle = fleetData.find(v => v.id === vehicleId);
                  if (!vehicle) return null;
                  
                  const color = index === 0 ? selectedChartType.color : 
                              additionalLines[index-1]?.color || '#000';
                  
                  return (
                    <div key={vehicleId} className="bg-gray-50 px-3 py-2 rounded-lg flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="text-sm">{getVehicleName(vehicleId)}</span>
                      {chartData && chartData.length > 0 && (
                        <span className="text-sm font-medium">
                          Latest: {selectedChartType.formatter(
                            chartData[chartData.length - 1][index === 0 ? selectedChartType.primaryKey : vehicleId]
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
          
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Summary Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Metric</th>
                    {Object.keys(selectedVehicles)
                      .filter(id => selectedVehicles[id])
                      .map(id => (
                        <th key={id} className="text-left font-medium p-2">{getVehicleName(id)}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Current SoH', key: 'soh', suffix: '%' },
                    { label: 'Current SoC', key: 'soc', suffix: '%' },
                    { label: 'Status', key: 'status', transform: (v: string) => v.toUpperCase() },
                    { label: 'Cycles', key: 'cycleCount' },
                    { label: 'Temperature', key: 'temperature', suffix: '°C' },
                    { label: 'Thermal Risk', key: 'thermalRisk', transform: (v: string) => v.toUpperCase() },
                    { label: 'Estimated Life', key: 'estimatedLifeRemaining' },
                    { label: 'Depot', key: 'depot' }
                  ].map((metric, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="p-2 font-medium">{metric.label}</td>
                      {Object.keys(selectedVehicles)
                        .filter(id => selectedVehicles[id])
                        .map(id => {
                          const vehicle = fleetData.find(v => v.id === id);
                          let value = vehicle ? vehicle[metric.key] : 'N/A';
                          if (metric.transform && value !== 'N/A') {
                            value = metric.transform(value);
                          }
                          return (
                            <td key={id} className="p-2">
                              {value}{metric.suffix || ''}
                            </td>
                          );
                        })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Vehicles with High Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">ID</th>
                    <th className="text-left font-medium p-2">Name</th>
                    <th className="text-left font-medium p-2">Temperature</th>
                    <th className="text-left font-medium p-2">Thermal Risk</th>
                    <th className="text-left font-medium p-2">Depot</th>
                  </tr>
                </thead>
                <tbody>
                  {highTempVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b">
                      <td className="p-2">{vehicle.id}</td>
                      <td className="p-2">{vehicle.name}</td>
                      <td className="p-2 font-medium text-red-600">{vehicle.temperature}°C</td>
                      <td className="p-2">
                        <span 
                          className={`px-2 py-0.5 rounded text-xs ${
                            vehicle.thermalRisk === 'critical' ? 'bg-red-100 text-red-800' : 
                            vehicle.thermalRisk === 'warning' ? 'bg-amber-100 text-amber-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {vehicle.thermalRisk.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-2">{vehicle.depot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComparisonTab;
