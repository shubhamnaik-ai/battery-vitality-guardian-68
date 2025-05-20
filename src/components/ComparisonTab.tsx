
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GitCompare } from 'lucide-react';
import LineChart from './charts/LineChart';

interface ComparisonTabProps {
  fleetData: any[];
  sohHistoricalData: any;
  socHistoricalData: any;
  degradationPredictionData: any;
}

const ComparisonTab: React.FC<ComparisonTabProps> = ({
  fleetData,
  sohHistoricalData,
  socHistoricalData,
  degradationPredictionData
}) => {
  const [selectedParameter, setSelectedParameter] = useState('soh');
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>(['BAT-001']);
  const [normalizeData, setNormalizeData] = useState(false);
  
  const parameters = [
    { id: 'soh', name: 'State of Health' },
    { id: 'soc', name: 'State of Charge' },
    { id: 'degradation', name: 'Degradation Rate' },
    { id: 'temperature', name: 'Temperature' }
  ];
  
  // Get data based on selected parameter
  const getComparisonData = () => {
    switch (selectedParameter) {
      case 'soh':
        return selectedVehicles.map(vehicleId => ({
          id: vehicleId,
          name: fleetData.find(v => v.id === vehicleId)?.name || vehicleId,
          data: sohHistoricalData[vehicleId] || [],
          dataKey: 'value',
          label: `${vehicleId} SoH (%)`,
          formatter: (value: number) => `${value}%`
        }));
      case 'soc':
        return selectedVehicles.map(vehicleId => ({
          id: vehicleId,
          name: fleetData.find(v => v.id === vehicleId)?.name || vehicleId,
          data: socHistoricalData[vehicleId] || [],
          dataKey: 'value',
          label: `${vehicleId} SoC (%)`,
          formatter: (value: number) => `${value}%`
        }));
      case 'degradation':
        return selectedVehicles.map(vehicleId => ({
          id: vehicleId,
          name: fleetData.find(v => v.id === vehicleId)?.name || vehicleId,
          data: degradationPredictionData[vehicleId] || [],
          dataKey: 'capacity',
          xKey: 'cycles',
          label: `${vehicleId} Capacity (%)`,
          formatter: (value: number) => `${value}%`
        }));
      case 'temperature':
        // For temperature, we'll create simple trend data since we don't have historical temp data
        return selectedVehicles.map(vehicleId => {
          const vehicle = fleetData.find(v => v.id === vehicleId);
          const baseTemp = vehicle?.temperature || 30;
          
          // Generate synthetic data
          const tempData = Array.from({ length: 10 }, (_, i) => ({
            timestamp: new Date(Date.now() - (9 - i) * 86400000).toISOString(),
            value: baseTemp + (Math.random() * 4 - 2)
          }));
          
          return {
            id: vehicleId,
            name: vehicle?.name || vehicleId,
            data: tempData,
            dataKey: 'value',
            label: `${vehicleId} Temperature (°C)`,
            formatter: (value: number) => `${value.toFixed(1)}°C`
          };
        });
      default:
        return [];
    }
  };
  
  const comparisonData = getComparisonData();
  const availableVehicles = fleetData.map(vehicle => vehicle.id);
  
  // Normalize data if requested
  const normalizeComparisonData = (data: any[]) => {
    if (!normalizeData) return data;
    
    return data.map(series => {
      // Find min and max values
      const values = series.data.map((d: any) => d[series.dataKey]).filter((v: any) => v !== null && v !== undefined);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const range = max - min;
      
      // Normalize data to 0-100 range
      const normalizedData = series.data.map((point: any) => {
        const normalized = { ...point };
        if (point[series.dataKey] !== null && point[series.dataKey] !== undefined) {
          normalized[series.dataKey] = ((point[series.dataKey] - min) / range) * 100;
        }
        return normalized;
      });
      
      return {
        ...series,
        data: normalizedData,
        formatter: (value: number) => `${value.toFixed(1)}%`,
        label: `${series.label} (Normalized)`
      };
    });
  };
  
  const processedData = normalizeData ? normalizeComparisonData(comparisonData) : comparisonData;
  
  // Handle vehicle selection toggle
  const toggleVehicleSelection = (vehicleId: string) => {
    if (selectedVehicles.includes(vehicleId)) {
      setSelectedVehicles(selectedVehicles.filter(id => id !== vehicleId));
    } else {
      setSelectedVehicles([...selectedVehicles, vehicleId]);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <GitCompare className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Data Comparison</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparison Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>Select Parameter</Label>
              <Select 
                value={selectedParameter} 
                onValueChange={setSelectedParameter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parameter" />
                </SelectTrigger>
                <SelectContent>
                  {parameters.map(param => (
                    <SelectItem key={param.id} value={param.id}>
                      {param.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <Label htmlFor="normalize">Normalize Data</Label>
              <Switch 
                id="normalize" 
                checked={normalizeData} 
                onCheckedChange={setNormalizeData}
              />
              <div className="text-sm text-muted-foreground">
                Scales all data to 0-100% for easier comparison
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Select Vehicles to Compare</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {availableVehicles.slice(0, 10).map(vehicleId => (
                <div 
                  key={vehicleId}
                  onClick={() => toggleVehicleSelection(vehicleId)}
                  className={`border rounded-md p-2 text-center text-sm cursor-pointer transition-colors ${
                    selectedVehicles.includes(vehicleId) 
                      ? 'border-primary bg-primary/10' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {vehicleId}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {parameters.find(p => p.id === selectedParameter)?.name} Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          {processedData.length > 0 ? (
            <LineChart 
              data={processedData[0].data}
              xDataKey={processedData[0].xKey || "timestamp"}
              yDataKey={processedData[0].dataKey}
              color="#3b82f6"
              label={processedData[0].label}
              height={400}
              tooltipFormatter={processedData[0].formatter}
              xAxisFormatter={(value) => {
                if (value.includes('T')) {
                  // Date format
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
                return value;
              }}
              additionalLines={processedData.slice(1).map((series, index) => ({
                dataKey: series.dataKey,
                color: ['#9333ea', '#ef4444', '#22c55e', '#eab308', '#f97316', '#06b6d4'][index % 6],
                label: series.label
              }))}
            />
          ) : (
            <div className="text-center p-12 text-muted-foreground">
              No data available for the selected vehicles and parameter.
              Please select different vehicles or parameter.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonTab;
