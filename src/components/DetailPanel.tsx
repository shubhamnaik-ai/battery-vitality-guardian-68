import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import LineChart from './charts/LineChart';
import GaugeChart from './charts/GaugeChart';
import HeatMap from './charts/HeatMap';
import HealthStatusBadge from './HealthStatusBadge';
import { 
  sohHistoricalData, 
  socHistoricalData,
  thermalMapData,
  degradationPredictionData,
  healthFactorsData
} from '@/data/mockData';
import { calculateDegradationRate } from '@/utils/batteryAnalytics';

// Updated interface to handle both fleet view and single battery detail view
export interface DetailPanelProps {
  // For single battery detail view
  batteryId?: string;
  onClose?: () => void;
  batteryData?: {
    id: string;
    name: string;
    soh: number;
    soc: number;
    status: string;
    temperature: number;
    thermalRisk: string;
    cycleCount: number;
    estimatedLifeRemaining: string;
  };
  
  // For fleet view in tabs
  fleetData?: any[];
  chartData?: any;
  panelTitle?: string;
  panelDescription?: string;
  chartTitle?: string;
  chartYLabel?: string;
}

export const DetailPanel: React.FC<DetailPanelProps> = (props) => {
  // If we're in single battery detail mode
  if (props.batteryId && props.batteryData && props.onClose) {
    const { batteryId, onClose, batteryData } = props;
    const [activeTab, setActiveTab] = useState('soh');
    
    const sohData = sohHistoricalData[batteryId as keyof typeof sohHistoricalData] || [];
    const socData = socHistoricalData[batteryId as keyof typeof socHistoricalData] || [];
    const thermalData = thermalMapData[batteryId as keyof typeof thermalMapData];
    const degradationData = degradationPredictionData[batteryId as keyof typeof degradationPredictionData] || [];
    const healthFactors = healthFactorsData[batteryId as keyof typeof healthFactorsData];
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const degradationRate = calculateDegradationRate(sohData);
    
    return (
      <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl">
                {batteryData.name}
                <HealthStatusBadge status={batteryData.status} className="ml-3" />
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                ID: {batteryId} • Cycle Count: {batteryData.cycleCount} • Est. Life: {batteryData.estimatedLifeRemaining}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex flex-col items-center">
                <GaugeChart value={batteryData.soh} label="State of Health" />
              </div>
              <div className="flex flex-col items-center">
                <GaugeChart value={batteryData.soc} label="State of Charge" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="text-center mb-4">
                  <div className="text-sm font-medium text-muted-foreground">Thermal Status</div>
                  <div className="flex items-center justify-center mt-2">
                    <HealthStatusBadge 
                      status={batteryData.thermalRisk} 
                      type="thermal" 
                      size="lg" 
                    />
                  </div>
                  <div className="text-2xl font-bold mt-3">
                    {batteryData.temperature}°C
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Current Temperature
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="soh">Health (SoH)</TabsTrigger>
                <TabsTrigger value="soc">Charge (SoC)</TabsTrigger>
                <TabsTrigger value="degradation">Degradation</TabsTrigger>
                <TabsTrigger value="thermal">Thermal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="soh" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Health Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LineChart 
                        data={sohData} 
                        xDataKey="timestamp" 
                        yDataKey="value"
                        color="#22c55e"
                        label="State of Health (%)"
                        xAxisFormatter={formatDate}
                        tooltipFormatter={(value) => `${value}%`}
                      />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-muted/30 p-4 rounded-md">
                          <div className="text-sm font-medium">Degradation Rate</div>
                          <div className="text-2xl font-bold text-battery-warning mt-1">
                            {degradationRate.toFixed(2)}% <span className="text-sm font-normal">per month</span>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 p-4 rounded-md">
                          <div className="text-sm font-medium">Expected EOL</div>
                          <div className="text-2xl font-bold mt-1">
                            {batteryData.estimatedLifeRemaining}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {healthFactors && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Health Impact Factors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm">Deep Discharges</span>
                              <span className="text-sm font-medium">
                                {healthFactors.deepDischarges.count} events
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${healthFactors.deepDischarges.impact === 'high' ? 'bg-red-100 text-red-800' : healthFactors.deepDischarges.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                  {healthFactors.deepDischarges.impact}
                                </span>
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm">High Charge Rates</span>
                              <span className="text-sm font-medium">
                                {healthFactors.highChargeRates.count} events
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${healthFactors.highChargeRates.impact === 'high' ? 'bg-red-100 text-red-800' : healthFactors.highChargeRates.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                  {healthFactors.highChargeRates.impact}
                                </span>
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm">High Temperature</span>
                              <span className="text-sm font-medium">
                                {healthFactors.highTemperature.count} events
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${healthFactors.highTemperature.impact === 'high' ? 'bg-red-100 text-red-800' : healthFactors.highTemperature.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                  {healthFactors.highTemperature.impact}
                                </span>
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm">SoC Extremes</span>
                              <span className="text-sm font-medium">
                                {healthFactors.socExtremes.count} events
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${healthFactors.socExtremes.impact === 'high' ? 'bg-red-100 text-red-800' : healthFactors.socExtremes.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                  {healthFactors.socExtremes.impact}
                                </span>
                              </span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span className="text-sm">High SoC Rest</span>
                              <span className="text-sm font-medium">
                                {healthFactors.highSocResting.hours} hours
                                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${healthFactors.highSocResting.impact === 'high' ? 'bg-red-100 text-red-800' : healthFactors.highSocResting.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                  {healthFactors.highSocResting.impact}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="soc">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">State of Charge - Last 24 Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={socData} 
                      xDataKey="timestamp" 
                      yDataKey="value"
                      color="#3b82f6"
                      label="State of Charge (%)"
                      xAxisFormatter={formatTime}
                      tooltipFormatter={(value) => `${value}%`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="degradation">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Capacity vs. Cycle Count</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LineChart 
                      data={degradationData} 
                      xDataKey="cycles" 
                      yDataKey="capacity"
                      color="#9333ea"
                      label="Capacity (%)"
                      tooltipFormatter={(value) => `${value}%`}
                    />
                    
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="text-sm font-medium">Current Cycles</div>
                        <div className="text-2xl font-bold mt-1">
                          {batteryData.cycleCount}
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="text-sm font-medium">Estimated EOL Cycles</div>
                        <div className="text-2xl font-bold mt-1">
                          {batteryData.cycleCount + 800}
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="text-sm font-medium">Est. Remaining Capacity at EOL</div>
                        <div className="text-2xl font-bold text-battery-critical mt-1">
                          60%
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="thermal">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Temperature Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      {thermalData ? (
                        <HeatMap 
                          data={thermalData} 
                          title="Cell Temperature Map (°C)"
                        />
                      ) : (
                        <div className="p-6 text-center text-muted-foreground">
                          No thermal mapping data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Thermal Risk Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Current Status</h4>
                          <div className="flex items-center">
                            <HealthStatusBadge 
                              status={batteryData.thermalRisk} 
                              type="thermal" 
                            />
                            <span className="ml-2 text-sm">
                              {batteryData.temperature}°C
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-center justify-between">
                              <span>Temperature Gradient</span>
                              <span className="font-medium">
                                {thermalData ? (Math.max(...thermalData.flat()) - Math.min(...thermalData.flat())).toFixed(1) : 'N/A'}°C
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Maximum Cell Temperature</span>
                              <span className="font-medium">
                                {thermalData ? Math.max(...thermalData.flat()).toFixed(1) : 'N/A'}°C
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Cooling System</span>
                              <span className="font-medium text-green-600">
                                Operational
                              </span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span>Ambient Temperature</span>
                              <span className="font-medium">
                                22.4°C
                              </span>
                            </li>
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Historical Events</h4>
                          <div className="text-sm">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                              <div>Temperature Warnings:</div>
                              <div className="font-medium">3 in last 30 days</div>
                              <div>Overheating Events:</div>
                              <div className="font-medium">None in last 90 days</div>
                              <div>Cooling Interventions:</div>
                              <div className="font-medium">12 in last 30 days</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Fleet view for tab panels
  const { fleetData = [], chartData, panelTitle, panelDescription, chartTitle, chartYLabel } = props;
  
  // Safely get the first vehicle data or provide a default
  const firstVehicle = fleetData && fleetData.length > 0 ? fleetData[0] : {
    id: '',
    name: '',
    soh: 0,
    temperature: 0,
    status: 'unknown',
    cycleCount: 0,
    estimatedLifeRemaining: 'N/A'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{panelTitle || 'Analytics Panel'}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {panelDescription || 'No description available'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartData && (
          <LineChart
            data={chartData}
            xDataKey={chartData[0] && Object.keys(chartData[0])[0] || 'x'} 
            yDataKey={chartData[0] && Object.keys(chartData[0])[1] || 'y'}
            label={chartYLabel || ''}
            color="#3b82f6"
          />
        )}

        {fleetData && fleetData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {fleetData.slice(0, 3).map(vehicle => (
              <Card key={vehicle.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{vehicle.name}</div>
                    <HealthStatusBadge status={vehicle.status} size="sm" />
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between mt-1">
                      <span>SoH:</span>
                      <span className="font-medium">{vehicle.soh}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Cycles:</span>
                      <span className="font-medium">{vehicle.cycleCount}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Est. Life:</span>
                      <span className="font-medium">{vehicle.estimatedLifeRemaining}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DetailPanel;
