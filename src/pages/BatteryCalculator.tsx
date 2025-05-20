
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import GaugeChart from '@/components/charts/GaugeChart';
import { ChartLine, Thermometer, ListCheck, CircleArrowDown } from 'lucide-react';

const BatteryCalculator = () => {
  // Input variables
  const [initialCapacity, setInitialCapacity] = useState(100);
  const [cycleCount, setCycleCount] = useState(500);
  const [temperature, setTemperature] = useState(25);
  const [averageDischargeDepth, setAverageDischargeDepth] = useState(70);
  const [restingAtHighSoc, setRestingAtHighSoc] = useState(30);
  const [highChargeRateEvents, setHighChargeRateEvents] = useState(10);
  
  // Calculated results
  const [sohResult, setSohResult] = useState(100);
  const [lifetimeEstimate, setLifetimeEstimate] = useState("24 months");
  const [degradationRate, setDegradationRate] = useState(0.5);
  const [impactFactors, setImpactFactors] = useState<{
    cycles: number;
    temperature: number;
    discharge: number;
    resting: number;
    charging: number;
  }>({
    cycles: 0,
    temperature: 0,
    discharge: 0,
    resting: 0,
    charging: 0,
  });

  // Calculate SoH based on all factors
  const calculateSoh = () => {
    // Base degradation from cycle count (0.015% per cycle on average)
    const cycleDegradation = cycleCount * 0.015;
    
    // Temperature impact (accelerated degradation at high temperatures)
    // 25°C is baseline, every 10°C above adds 20% more degradation
    const tempFactor = temperature > 25 ? ((temperature - 25) / 10) * 0.2 : 0;
    const temperatureDegradation = cycleDegradation * tempFactor;
    
    // Deep discharge impact 
    // (DoD > 80% has higher impact, DoD < 50% has lower impact)
    let dischargeFactor = 0;
    if (averageDischargeDepth > 80) {
      dischargeFactor = 0.3; // 30% additional degradation
    } else if (averageDischargeDepth < 50) {
      dischargeFactor = -0.15; // 15% reduced degradation (beneficial)
    }
    const dischargeDegradation = cycleDegradation * dischargeFactor;
    
    // High SoC resting impact (accelerates calendar aging)
    // Every 10 days resting at high SoC (>80%) adds 0.2% degradation
    const restingDegradation = (restingAtHighSoc / 10) * 0.2;
    
    // Fast charge events impact
    // Each fast charge event adds 0.05% degradation
    const chargingDegradation = highChargeRateEvents * 0.05;
    
    // Total degradation sum
    const totalDegradation = cycleDegradation + 
                              temperatureDegradation + 
                              dischargeDegradation + 
                              restingDegradation + 
                              chargingDegradation;
    
    // Calculate the impact percentages for visualization
    const totalImpact = cycleDegradation + 
                        Math.abs(temperatureDegradation) + 
                        Math.abs(dischargeDegradation) + 
                        restingDegradation + 
                        chargingDegradation;
    
    setImpactFactors({
      cycles: cycleDegradation / totalImpact * 100,
      temperature: Math.abs(temperatureDegradation) / totalImpact * 100,
      discharge: Math.abs(dischargeDegradation) / totalImpact * 100,
      resting: restingDegradation / totalImpact * 100,
      charging: chargingDegradation / totalImpact * 100,
    });
    
    // Calculate remaining SoH (cannot go below 0%)
    const remainingSoh = Math.max(initialCapacity - totalDegradation, 0);
    
    // Calculate degradation rate (% per month)
    // Assuming 500 cycles = 12 months of typical usage
    const estimatedMonths = cycleCount / (500 / 12);
    const monthlyRate = totalDegradation / estimatedMonths;
    
    // Calculate lifetime estimate (months until SoH reaches 70%)
    const remainingPercentage = remainingSoh - 70; // until 70% SoH
    const monthsRemaining = remainingPercentage / monthlyRate;
    const totalLifetime = estimatedMonths + monthsRemaining;
    
    // Update the state
    setSohResult(parseFloat(remainingSoh.toFixed(2)));
    setDegradationRate(parseFloat(monthlyRate.toFixed(2)));
    setLifetimeEstimate(`${Math.round(totalLifetime)} months`);
  };

  // Calculate SoH whenever inputs change
  useEffect(() => {
    calculateSoh();
  }, [
    initialCapacity, 
    cycleCount, 
    temperature, 
    averageDischargeDepth, 
    restingAtHighSoc, 
    highChargeRateEvents
  ]);

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Battery Health Calculator</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="initial-capacity">Initial Capacity (%)</Label>
                      <span className="text-sm font-medium">{initialCapacity}%</span>
                    </div>
                    <Slider
                      id="initial-capacity"
                      min={70}
                      max={100}
                      step={1}
                      value={[initialCapacity]}
                      onValueChange={(value) => setInitialCapacity(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="cycle-count">
                        <div className="flex items-center gap-1">
                          <ListCheck className="h-4 w-4" />
                          <span>Charge Cycle Count</span>
                        </div>
                      </Label>
                      <span className="text-sm font-medium">{cycleCount} cycles</span>
                    </div>
                    <Slider
                      id="cycle-count"
                      min={0}
                      max={2000}
                      step={10}
                      value={[cycleCount]}
                      onValueChange={(value) => setCycleCount(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="temperature">
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-4 w-4" />
                          <span>Average Operating Temperature</span>
                        </div>
                      </Label>
                      <span className="text-sm font-medium">{temperature}°C</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={5}
                      max={60}
                      step={1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="discharge-depth">
                        <div className="flex items-center gap-1">
                          <CircleArrowDown className="h-4 w-4" />
                          <span>Average Discharge Depth (%)</span>
                        </div>
                      </Label>
                      <span className="text-sm font-medium">{averageDischargeDepth}%</span>
                    </div>
                    <Slider
                      id="discharge-depth"
                      min={10}
                      max={100}
                      step={5}
                      value={[averageDischargeDepth]}
                      onValueChange={(value) => setAverageDischargeDepth(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="high-soc">Days Resting at High SoC (&gt;80%)</Label>
                      <span className="text-sm font-medium">{restingAtHighSoc} days</span>
                    </div>
                    <Slider
                      id="high-soc"
                      min={0}
                      max={180}
                      step={5}
                      value={[restingAtHighSoc]}
                      onValueChange={(value) => setRestingAtHighSoc(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label htmlFor="high-charge">High Charge Rate Events</Label>
                      <span className="text-sm font-medium">{highChargeRateEvents} events</span>
                    </div>
                    <Slider
                      id="high-charge"
                      min={0}
                      max={100}
                      step={1}
                      value={[highChargeRateEvents]}
                      onValueChange={(value) => setHighChargeRateEvents(value[0])}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-muted/30 p-4 rounded-md">
                <h3 className="text-sm font-medium mb-3">SoH Calculation Formula</h3>
                <div className="text-xs space-y-1 font-mono">
                  <p className="text-muted-foreground">
                    SoH = Initial Capacity – (Cycle Degradation + Temperature Effect + Discharge Effect + Rest Effect + Charging Effect)
                  </p>
                  <div className="space-y-1 mt-2">
                    <p>Where:</p>
                    <p>• Cycle Degradation = Cycle Count × 0.015%</p>
                    <p>• Temperature Effect = Cycle Degradation × ((Temp - 25°C) / 10) × 0.2 [if Temp > 25°C]</p>
                    <p>• Discharge Effect = Cycle Degradation × 0.3 [if DoD > 80%] or -0.15 [if DoD < 50%]</p>
                    <p>• Rest Effect = (Days at High SoC / 10) × 0.2%</p>
                    <p>• Charging Effect = Fast Charge Events × 0.05%</p>
                  </div>
                </div>
              </div>

              <Button onClick={calculateSoh} className="mt-4 w-full">
                Recalculate Battery Health
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4">
                <GaugeChart value={sohResult} label="State of Health" size={180} />
              </div>
              
              <div className="w-full space-y-4 mt-4">
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-sm font-medium">Degradation Rate</div>
                  <div className="text-xl font-bold text-amber-600 mt-1">
                    {degradationRate}% <span className="text-sm font-normal">per month</span>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-sm font-medium">Estimated Lifetime</div>
                  <div className="text-xl font-bold mt-1">
                    {lifetimeEstimate} <span className="text-sm font-normal">(until 70% SoH)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Impact Factors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Cycle Count</span>
                    <span>{impactFactors.cycles.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${impactFactors.cycles}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Temperature</span>
                    <span>{impactFactors.temperature.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${impactFactors.temperature}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Discharge Depth</span>
                    <span>{impactFactors.discharge.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${impactFactors.discharge}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>High SoC Resting</span>
                    <span>{impactFactors.resting.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${impactFactors.resting}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fast Charging</span>
                    <span>{impactFactors.charging.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${impactFactors.charging}%` }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BatteryCalculator;
