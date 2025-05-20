
import React, { useState } from 'react';
import { fleetData, sohHistoricalData, thermalMapData } from '@/data/mockData';
import DashboardHeader from '@/components/DashboardHeader';
import BatteryCard from '@/components/BatteryCard';
import DetailPanel from '@/components/DetailPanel';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LineChart from '@/components/charts/LineChart';
import HeatMap from '@/components/charts/HeatMap';
import { calculateDegradationRate } from '@/utils/batteryAnalytics';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBattery, setSelectedBattery] = useState<string | null>(null);
  
  const handleBatteryClick = (batteryId: string) => {
    setSelectedBattery(batteryId);
  };
  
  const handleCloseDetail = () => {
    setSelectedBattery(null);
  };
  
  const selectedBatteryData = selectedBattery 
    ? fleetData.find(battery => battery.id === selectedBattery) 
    : null;
  
  const batteriesByStatus = {
    optimal: fleetData.filter(battery => battery.status === 'optimal').length,
    good: fleetData.filter(battery => battery.status === 'good').length,
    moderate: fleetData.filter(battery => battery.status === 'moderate').length,
    warning: fleetData.filter(battery => battery.status === 'warning').length,
    critical: fleetData.filter(battery => battery.status === 'critical').length,
  };
  
  const calculateAverageSoH = () => {
    const sum = fleetData.reduce((acc, battery) => acc + battery.soh, 0);
    return (sum / fleetData.length).toFixed(1);
  };

  // Count batteries with thermal warnings
  const thermalWarningCount = fleetData.filter(battery => 
    battery.thermalRisk === 'warning' || battery.thermalRisk === 'danger'
  ).length;
  
  return (
    <div className="container py-6">
      <DashboardHeader 
        title="Battery Analytics Dashboard" 
        onTabChange={setActiveTab}
        activeTab={activeTab}
      />
      
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Fleet Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateAverageSoH()}%</div>
                <p className="text-xs text-muted-foreground">Average State of Health</p>
                
                <div className="mt-4 flex items-center space-x-1">
                  <div className="h-2 rounded-full bg-battery-optimal" style={{width: `${batteriesByStatus.optimal * 20}%`}}></div>
                  <div className="h-2 rounded-full bg-battery-good" style={{width: `${batteriesByStatus.good * 20}%`}}></div>
                  <div className="h-2 rounded-full bg-battery-moderate" style={{width: `${batteriesByStatus.moderate * 20}%`}}></div>
                  <div className="h-2 rounded-full bg-battery-warning" style={{width: `${batteriesByStatus.warning * 20}%`}}></div>
                  <div className="h-2 rounded-full bg-battery-critical" style={{width: `${batteriesByStatus.critical * 20}%`}}></div>
                </div>
                
                <div className="mt-2 grid grid-cols-5 gap-1 text-xs text-center">
                  <div>{batteriesByStatus.optimal} <span className="block text-muted-foreground">Optimal</span></div>
                  <div>{batteriesByStatus.good} <span className="block text-muted-foreground">Good</span></div>
                  <div>{batteriesByStatus.moderate} <span className="block text-muted-foreground">Moderate</span></div>
                  <div>{batteriesByStatus.warning} <span className="block text-muted-foreground">Warning</span></div>
                  <div>{batteriesByStatus.critical} <span className="block text-muted-foreground">Critical</span></div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Health Degradation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {calculateDegradationRate(sohHistoricalData['BAT-001']).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">Average Monthly Degradation</p>
                
                <div className="mt-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">{(calculateDegradationRate(sohHistoricalData['BAT-001']) * 1.5).toFixed(2)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Min:</span>
                    <span className="font-medium">{(calculateDegradationRate(sohHistoricalData['BAT-001']) * 0.6).toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Average Cycle Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(fleetData.reduce((acc, battery) => acc + battery.cycleCount, 0) / fleetData.length)}
                </div>
                <p className="text-xs text-muted-foreground">Across All Battery Packs</p>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Highest:</span>
                    <span className="font-medium">{Math.max(...fleetData.map(b => b.cycleCount))} cycles</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Lowest:</span>
                    <span className="font-medium">{Math.min(...fleetData.map(b => b.cycleCount))} cycles</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Thermal Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(fleetData.reduce((acc, battery) => acc + battery.temperature, 0) / fleetData.length)}°C
                </div>
                <p className="text-xs text-muted-foreground">Average Temperature</p>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Warning/Danger:</span>
                    <span className="font-medium text-battery-warning">{thermalWarningCount} batteries</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Temp:</span>
                    <span className="font-medium">{Math.max(...fleetData.map(b => b.temperature))}°C</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h2 className="text-xl font-semibold mb-3">Battery Fleet Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {fleetData.map(battery => (
              <BatteryCard
                key={battery.id}
                {...battery}
                onClick={() => handleBatteryClick(battery.id)}
              />
            ))}
          </div>
        </>
      )}
      
      {activeTab === 'soh' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>State of Health Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Fleet Health Trend</h3>
                  <LineChart 
                    data={sohHistoricalData['BAT-001']} 
                    xDataKey="timestamp" 
                    yDataKey="value"
                    color="#22c55e"
                    label="BAT-001 SoH (%)"
                    additionalLines={[
                      { dataKey: "value", color: "#3b82f6", label: "BAT-002 SoH (%)" }
                    ]}
                    tooltipFormatter={(value) => `${value}%`}
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Key SoH Parameters</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="text-sm font-medium">Avg Degradation Rate</div>
                        <div className="text-xl font-bold text-amber-500 mt-1">
                          {calculateDegradationRate(sohHistoricalData['BAT-001']).toFixed(2)}% <span className="text-sm font-normal">per month</span>
                        </div>
                      </div>
                      
                      <div className="bg-muted/30 p-4 rounded-md">
                        <div className="text-sm font-medium">Fleet Health Score</div>
                        <div className="text-xl font-bold mt-1">
                          {calculateAverageSoH()}/100
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Health Impact Factors</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Deep Discharges</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>High Charge Rates</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>High Temperature</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>SoC Extremes</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>High SoC Rest</span>
                        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Anomaly Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                    <h4 className="font-medium text-amber-800">SoH Drop Detected</h4>
                    <p className="text-sm text-amber-700">BAT-004 showed 3.2% decline in the last 30 days (above threshold of 2%)</p>
                  </div>
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h4 className="font-medium text-red-800">Critical Health Decline</h4>
                    <p className="text-sm text-red-700">BAT-005 health below critical threshold of 60%</p>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                    <h4 className="font-medium text-blue-800">Calibration Recommended</h4>
                    <p className="text-sm text-blue-700">BAT-002 showing inconsistent SoH readings</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Life Estimation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="text-sm font-medium">Fleet Average</div>
                      <div className="text-2xl font-bold mt-1">2.6 years</div>
                      <div className="text-xs text-muted-foreground mt-1">Time to 70% capacity</div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="text-sm font-medium">Total Distance</div>
                      <div className="text-2xl font-bold mt-1">42,800 km</div>
                      <div className="text-xs text-muted-foreground mt-1">Estimated remaining</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>BAT-001</span>
                      <span className="font-medium">4.2 years remaining</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>BAT-002</span>
                      <span className="font-medium">3.7 years remaining</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>BAT-003</span>
                      <span className="font-medium">2.8 years remaining</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>BAT-004</span>
                      <span className="font-medium">1.5 years remaining</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>BAT-005</span>
                      <span className="font-medium text-battery-critical">0.7 years remaining</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'degradation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Battery Degradation Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Capacity vs. Cycle Count</h3>
                  <LineChart 
                    data={[
                      { cycles: 0, actual: 100, predicted: 100 },
                      { cycles: 200, actual: 97, predicted: 98 },
                      { cycles: 400, actual: 94, predicted: 95 },
                      { cycles: 600, actual: 92, predicted: 93 },
                      { cycles: 800, actual: 89, predicted: 90 },
                      { cycles: 1000, actual: null, predicted: 87 },
                      { cycles: 1200, actual: null, predicted: 83 },
                      { cycles: 1400, actual: null, predicted: 78 },
                      { cycles: 1600, actual: null, predicted: 73 },
                      { cycles: 1800, actual: null, predicted: 67 },
                      { cycles: 2000, actual: null, predicted: 60 },
                    ]}
                    xDataKey="cycles"
                    yDataKey="actual"
                    color="#3b82f6"
                    label="Actual Capacity (%)"
                    additionalLines={[
                      { dataKey: "predicted", color: "#9333ea", label: "Predicted Capacity (%)" }
                    ]}
                    tooltipFormatter={(value) => `${value}%`}
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Degradation Factors</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Fast Charging Events</span>
                          <span className="font-medium text-amber-600">High Impact</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Frequent Full Charges</span>
                          <span className="font-medium text-amber-600">Medium Impact</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>High Ambient Temperatures</span>
                          <span className="font-medium text-red-600">Critical Impact</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>Extended High SoC Idle</span>
                          <span className="font-medium text-amber-600">Medium Impact</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Limit fast charging to less than 20% of total charging events</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Maintain charging between 20%-80% SoC when possible</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Improve cooling in Building C to reduce ambient temperature</span>
                      </li>
                      <li className="flex items-start">
                        <div className="bg-green-100 text-green-800 p-1 rounded-full mr-2 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span>Schedule storage at 50% SoC for batteries not in use</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Remaining Useful Life (RUL)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="text-sm font-medium">Average RUL</div>
                      <div className="text-2xl font-bold mt-1">2.6 years</div>
                      <div className="text-xs text-muted-foreground mt-1">Time to end-of-life</div>
                    </div>
                    
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="text-sm font-medium">Battery Replacement</div>
                      <div className="text-2xl font-bold text-battery-critical mt-1">1 unit</div>
                      <div className="text-xs text-muted-foreground mt-1">Needed within 1 year</div>
                    </div>
                  </div>
                  
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-4 py-2">Battery ID</th>
                        <th className="px-4 py-2">Current SoH</th>
                        <th className="px-4 py-2">Est. EOL Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2">BAT-001</td>
                        <td className="px-4 py-2">98%</td>
                        <td className="px-4 py-2">Jan 2030</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2">BAT-002</td>
                        <td className="px-4 py-2">91%</td>
                        <td className="px-4 py-2">Aug 2028</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2">BAT-003</td>
                        <td className="px-4 py-2">82%</td>
                        <td className="px-4 py-2">Feb 2028</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2">BAT-004</td>
                        <td className="px-4 py-2">71%</td>
                        <td className="px-4 py-2">Nov 2026</td>
                      </tr>
                      <tr className="bg-white border-b">
                        <td className="px-4 py-2 text-battery-critical">BAT-005</td>
                        <td className="px-4 py-2 text-battery-critical">56%</td>
                        <td className="px-4 py-2 text-battery-critical">Dec 2025</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Fleet Health Clustering</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <svg width="100%" height="250" viewBox="0 0 400 250">
                    {/* Background grid */}
                    <line x1="50" y1="50" x2="50" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="150" y1="50" x2="150" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="250" y1="50" x2="250" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="350" y1="50" x2="350" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="50" x2="350" y2="50" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="100" x2="350" y2="100" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="150" x2="350" y2="150" stroke="#e5e7eb" strokeWidth="1" />
                    <line x1="50" y1="200" x2="350" y2="200" stroke="#e5e7eb" strokeWidth="1" />
                    
                    {/* Axis labels */}
                    <text x="200" y="230" textAnchor="middle" fontSize="12">Cycle Count</text>
                    <text x="20" y="125" textAnchor="middle" fontSize="12" transform="rotate(-90 20 125)">State of Health (%)</text>
                    
                    {/* Clusters */}
                    <circle cx="80" cy="70" r="30" fill="rgba(34, 197, 94, 0.2)" stroke="#22c55e" strokeWidth="1" />
                    <circle cx="270" cy="160" r="40" fill="rgba(234, 179, 8, 0.2)" stroke="#eab308" strokeWidth="1" />
                    
                    {/* Data points */}
                    <circle cx="80" cy="60" r="8" fill="#22c55e" />
                    <text x="80" y="60" textAnchor="middle" fontSize="10" fill="white">1</text>
                    
                    <circle cx="100" cy="80" r="8" fill="#84cc16" />
                    <text x="100" y="80" textAnchor="middle" fontSize="10" fill="white">2</text>
                    
                    <circle cx="230" cy="130" r="8" fill="#eab308" />
                    <text x="230" y="130" textAnchor="middle" fontSize="10" fill="white">3</text>
                    
                    <circle cx="280" cy="160" r="8" fill="#f97316" />
                    <text x="280" y="160" textAnchor="middle" fontSize="10" fill="white">4</text>
                    
                    <circle cx="320" cy="180" r="8" fill="#ef4444" />
                    <text x="320" y="180" textAnchor="middle" fontSize="10" fill="white">5</text>
                  </svg>
                  
                  <div className="grid grid-cols-2 mt-4 gap-4 text-sm">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium text-green-600">Cluster A: Healthy</h4>
                      <p className="text-xs text-gray-500">Low cycle count, high SoH</p>
                      <p className="text-xs mt-1">2 batteries</p>
                    </div>
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium text-amber-600">Cluster B: Degrading</h4>
                      <p className="text-xs text-gray-500">High cycle count, moderate to low SoH</p>
                      <p className="text-xs mt-1">3 batteries</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'thermal' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thermal Risk Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-medium mb-4">Fleet Thermal Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Normal Operating Temps</h4>
                      <HeatMap data={thermalMapData['BAT-001']} title="BAT-001 (25.3°C avg)" />
                    </div>
                    <div className="border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Elevated Risk</h4>
                      <HeatMap data={thermalMapData['BAT-004']} title="BAT-004 (35.8°C avg)" />
                    </div>
                    <div className="border rounded-lg p-4 md:col-span-2">
                      <h4 className="text-sm font-medium mb-3">High Risk Zone</h4>
                      <HeatMap data={thermalMapData['BAT-005']} title="BAT-005 (42.1°C avg)" />
                      <div className="mt-2 bg-red-100 text-red-800 p-2 text-sm rounded">
                        Warning: Battery pack shows signs of potential thermal runaway
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Thermal Risk Analysis</h3>
                  <div className="space-y-4">
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="text-sm font-medium">Fleet Average</div>
                      <div className="text-2xl font-bold mt-1">
                        32.6°C
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Across all battery packs
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Risk Distribution</h4>
                      <div className="flex items-center space-x-1">
                        <div className="h-3 rounded-l-full bg-thermal-safe" style={{width: '30%'}}></div>
                        <div className="h-3 bg-thermal-elevated" style={{width: '20%'}}></div>
                        <div className="h-3 bg-thermal-caution" style={{width: '20%'}}></div>
                        <div className="h-3 bg-thermal-warning" style={{width: '10%'}}></div>
                        <div className="h-3 rounded-r-full bg-thermal-danger" style={{width: '20%'}}></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Safe</span>
                        <span>Elevated</span>
                        <span>Danger</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Overcurrent Events</span>
                            <span className="font-medium text-amber-600">Medium Impact</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>High Ambient + Charge</span>
                            <span className="font-medium text-red-600">High Impact</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Cooling Failure</span>
                            <span className="font-medium text-amber-600">Medium Impact</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '50%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Cell Imbalance</span>
                            <span className="font-medium text-amber-600">Medium Impact</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '55%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thermal Runaway Prevention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                    <h4 className="font-medium text-amber-800">High Risk Alert</h4>
                    <p className="text-sm text-amber-700">BAT-005 in Building C shows temperatures above 42°C</p>
                    <div className="mt-2">
                      <button className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium py-1 px-3 rounded text-xs">View Details</button>
                    </div>
                  </div>
                  
                  <h4 className="font-medium">Recommended Actions</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <div className="bg-red-100 text-red-800 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Immediately reduce charging current for BAT-005</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-red-100 text-red-800 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Inspect cooling system in Building C</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-amber-100 text-amber-800 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Limit charging operations during peak ambient temperature</span>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-amber-100 text-amber-800 p-1 rounded-full mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Monitor cell balancing in BAT-004 and BAT-005</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Predictive Thermal Modeling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LineChart 
                    data={[
                      { hour: 0, actual: 42.1, predicted: 42.5 },
                      { hour: 2, actual: null, predicted: 43.2 },
                      { hour: 4, actual: null, predicted: 42.8 },
                      { hour: 6, actual: null, predicted: 41.5 },
                      { hour: 8, actual: null, predicted: 40.2 },
                      { hour: 10, actual: null, predicted: 44.7 },
                      { hour: 12, actual: null, predicted: 46.3 },
                    ]}
                    xDataKey="hour"
                    yDataKey="actual"
                    color="#ef4444"
                    label="Current Temperature (°C)"
                    additionalLines={[
                      { dataKey: "predicted", color: "#f97316", label: "Predicted Temperature (°C)" }
                    ]}
                    height={200}
                  />
                  
                  <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <h4 className="font-medium text-red-800">Thermal Runaway Risk</h4>
                    <p className="text-sm text-red-700">Prediction indicates BAT-005 may exceed critical threshold (45°C) in 8-12 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {selectedBattery && selectedBatteryData && (
        <DetailPanel
          batteryId={selectedBattery}
          batteryData={selectedBatteryData}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default Index;
