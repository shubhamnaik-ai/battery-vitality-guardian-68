
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
import { LineChart } from '@/components/charts/LineChart';
import { Button } from '@/components/ui/button';

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
    formatter: (value: number) => `${value}%`
  },
  { 
    id: 'soc',
    name: 'State of Charge History', 
    dataKey: 'socHistoricalData',
    primaryKey: 'value',
    xKey: 'timestamp',
    color: '#10b981',
    formatter: (value: number) => `${value}%`
  },
  { 
    id: 'degradation',
    name: 'Capacity vs Cycles', 
    dataKey: 'degradationPredictionData',
    primaryKey: 'capacity',
    xKey: 'cycles',
    color: '#f59e0b',
    formatter: (value: number) => `${value}%`
  },
  {
    id: 'cycles',
    name: 'Cycle History',
    dataKey: 'cycleHistoryData',
    primaryKey: 'totalCycles',
    xKey: 'timestamp',
    color: '#6366f1',
    formatter: (value: number) => `${value} cycles`
  },
  {
    id: 'temperature',
    name: 'Temperature History',
    dataKey: 'thermalHistoryData',
    primaryKey: 'avgTemperature',
    xKey: 'timestamp',
    color: '#ef4444',
    formatter: (value: number) => `${value}°C`
  },
  {
    id: 'cyclesVsSoh',
    name: 'Cycles vs SoH Correlation',
    dataKey: 'cyclesVsSohData',
    primaryKey: 'soh',
    xKey: 'cycles',
    color: '#8b5cf6',
    formatter: (value: number) => `${value}%`
  },
  {
    id: 'tempVsSoh',
    name: 'Temperature vs SoH Impact',
    dataKey: 'tempVsSohData',
    primaryKey: 'soh',
    xKey: 'temperature',
    color: '#ec4899',
    formatter: (value: number) => `${value}%`
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
  
  // Process data for the chart
  const processedData = compareValues.map((id, index) => {
    const dataSource = datasets[selectedChartType.dataKey as keyof typeof datasets];
    const rawData = dataSource[id] || [];
    const vehicleInfo = fleetData.find(v => v.id === id) || { name: id };
    
    return {
      id,
      name: vehicleInfo.name,
      data: rawData,
      dataKey: selectedChartType.primaryKey,
      color: index === 0 ? selectedChartType.color : index === 1 ? '#8b5cf6' : '#f59e0b',
      formatter: selectedChartType.formatter
    };
  });
  
  // Find vehicle names by IDs
  const getVehicleName = (id: string) => {
    const vehicle = fleetData.find(v => v.id === id);
    return vehicle ? vehicle.name : id;
  };

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
            
            <div>
              <label className="text-sm font-medium block mb-2">Vehicle 1</label>
              <Select 
                value={compareValues[0]}
                onValueChange={(value) => setCompareValues([value, compareValues[1]])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Vehicles</SelectLabel>
                    {fleetData.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.id})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Vehicle 2</label>
              <Select 
                value={compareValues[1]}
                onValueChange={(value) => setCompareValues([compareValues[0], value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Vehicles</SelectLabel>
                    {fleetData.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.id})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="h-[400px]">
            <LineChart
              data={processedData[0].data}
              xDataKey={selectedChartType.xKey}
              yDataKey={processedData[0].dataKey}
              color={processedData[0].color}
              label={getVehicleName(processedData[0].id)}
              height={400}
              tooltipFormatter={processedData[0].formatter}
              xAxisFormatter={(value) => {
                if (typeof value === 'string' && value.includes('T')) {
                  // Date format
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return String(value);
              }}
              additionalLines={processedData.slice(1).map((series, index) => ({
                dataKey: series.dataKey,
                color: series.color,
                label: getVehicleName(series.id)
              }))}
            />
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4">
            {processedData.map((series, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: series.color }}
                ></div>
                <span className="text-sm">{getVehicleName(series.id)}</span>
                {series.data && series.data.length > 0 ? (
                  <span className="text-sm font-medium">
                    Latest: {series.formatter(series.data[series.data.length - 1][series.dataKey])}
                  </span>
                ) : (
                  <span className="text-sm text-red-500">No data</span>
                )}
              </div>
            ))}
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
                    {compareValues.map(id => (
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
                      {compareValues.map(id => {
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
            <CardTitle>Analysis Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {compareValues.map(id => {
              const vehicle = fleetData.find(v => v.id === id);
              if (!vehicle) return null;
              
              // Calculate difference between vehicles
              const otherVehicle = fleetData.find(v => v.id === (id === compareValues[0] ? compareValues[1] : compareValues[0]));
              const sohDiff = otherVehicle ? (vehicle.soh - otherVehicle.soh).toFixed(1) : 'N/A';
              const cycleDiff = otherVehicle ? (vehicle.cycleCount - otherVehicle.cycleCount) : 'N/A';
              const tempDiff = otherVehicle ? (vehicle.temperature - otherVehicle.temperature).toFixed(1) : 'N/A';
              
              return (
                <div key={id} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-lg mb-2">{getVehicleName(id)}</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Health Analysis:</span> {vehicle.soh}% SoH is 
                      {vehicle.soh > 90 ? ' excellent' : 
                       vehicle.soh > 80 ? ' good' : 
                       vehicle.soh > 70 ? ' moderate' : 
                       vehicle.soh > 60 ? ' concerning' : ' critical'}.
                      {otherVehicle && ` ${Math.abs(Number(sohDiff))}% ${Number(sohDiff) > 0 ? 'higher' : 'lower'} than comparison vehicle.`}
                    </p>
                    <p>
                      <span className="font-medium">Usage Pattern:</span> {vehicle.cycleCount} cycles indicates 
                      {vehicle.cycleCount < 300 ? ' light usage' : 
                       vehicle.cycleCount < 600 ? ' moderate usage' : 
                       vehicle.cycleCount < 1000 ? ' heavy usage' : ' very heavy usage'}.
                      {otherVehicle && ` ${Math.abs(Number(cycleDiff))} ${Number(cycleDiff) > 0 ? 'more' : 'fewer'} cycles than comparison vehicle.`}
                    </p>
                    <p>
                      <span className="font-medium">Thermal Management:</span> {vehicle.temperature}°C is 
                      {vehicle.temperature < 30 ? ' within optimal range' : 
                       vehicle.temperature < 35 ? ' slightly elevated' : 
                       vehicle.temperature < 40 ? ' high' : ' critically high'}.
                      {otherVehicle && ` ${Math.abs(Number(tempDiff))}°C ${Number(tempDiff) > 0 ? 'higher' : 'lower'} than comparison vehicle.`}
                    </p>
                    <p>
                      <span className="font-medium">Estimated Lifespan:</span> {vehicle.estimatedLifeRemaining} remaining based on current usage patterns.
                    </p>
                  </div>
                </div>
              );
            })}
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-700 mb-2">Comparison Summary</h3>
              {compareValues.length === 2 && (() => {
                const v1 = fleetData.find(v => v.id === compareValues[0]);
                const v2 = fleetData.find(v => v.id === compareValues[1]);
                
                if (!v1 || !v2) return <p className="text-sm">Unable to compare - missing vehicle data.</p>;
                
                const sohDiff = Math.abs(v1.soh - v2.soh).toFixed(1);
                const cycleDiff = Math.abs(v1.cycleCount - v2.cycleCount);
                const tempDiff = Math.abs(v1.temperature - v2.temperature).toFixed(1);
                
                // Determine which vehicle is performing better
                const betterSoh = v1.soh > v2.soh ? v1.id : v2.id;
                const betterTemp = v1.temperature < v2.temperature ? v1.id : v2.id;
                
                return (
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>
                      Health difference is {sohDiff}%, with {getVehicleName(betterSoh)} showing better health.
                    </p>
                    <p>
                      Cycle count differs by {cycleDiff} cycles, which may explain some of the health difference.
                    </p>
                    <p>
                      Temperature difference is {tempDiff}°C, with {getVehicleName(betterTemp)} having better thermal management.
                    </p>
                    <p className="font-medium mt-3">
                      {v1.soh > v2.soh ? 
                        `${getVehicleName(v1.id)} is outperforming ${getVehicleName(v2.id)}` : 
                        `${getVehicleName(v2.id)} is outperforming ${getVehicleName(v1.id)}`} 
                      in terms of battery health.
                    </p>
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComparisonTab;
