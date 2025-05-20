
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calculator as CalcIcon, ArrowLeft, Home } from 'lucide-react';
import LineChart from '@/components/charts/LineChart';

const BatteryCalculator = () => {
  // Battery parameters
  const [initialSoh, setInitialSoh] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [cycleCount, setCycleCount] = useState(0);
  const [depthOfDischarge, setDepthOfDischarge] = useState(80);
  const [maxCycles, setMaxCycles] = useState(2000);
  const [cRate, setCRate] = useState(1);
  
  // Results
  const [estimatedSoh, setEstimatedSoh] = useState(100);
  const [remainingCycles, setRemainingCycles] = useState(2000);
  const [remainingLife, setRemainingLife] = useState("5+ years");
  const [degradationRate, setDegradationRate] = useState(0);
  
  // Chart data
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const navigate = useNavigate();
  
  // Calculate battery health whenever parameters change
  useEffect(() => {
    calculateBatteryHealth();
  }, [initialSoh, temperature, cycleCount, depthOfDischarge, maxCycles, cRate]);
  
  const calculateBatteryHealth = () => {
    // Base degradation from cycles (non-linear)
    const cycleDegradation = 20 * (cycleCount / maxCycles) + 10 * Math.pow(cycleCount / maxCycles, 2);
    
    // Temperature effect (accelerated degradation at higher temperatures)
    const tempEffect = Math.max(0, (temperature - 25) * 0.2);
    
    // Depth of discharge effect
    const dodEffect = (depthOfDischarge - 60) * 0.05;
    
    // C-rate effect (charging/discharging speed)
    const cRateEffect = Math.max(0, (cRate - 1) * 2);
    
    // Calculate current SoH
    const calculatedSoh = Math.max(0, initialSoh - cycleDegradation - tempEffect - dodEffect - cRateEffect);
    setEstimatedSoh(Math.round(calculatedSoh * 10) / 10);
    
    // Calculate remaining cycles and life
    const usedPercentage = (100 - calculatedSoh) / 40; // Assuming end of life at 60% SoH
    const calculatedRemainingCycles = Math.max(0, Math.round(maxCycles * (1 - usedPercentage)));
    setRemainingCycles(calculatedRemainingCycles);
    
    // Estimate remaining life in years (assuming 1 cycle per day)
    const yearsRemaining = calculatedRemainingCycles / 365;
    
    if (yearsRemaining > 5) {
      setRemainingLife("5+ years");
    } else if (yearsRemaining > 1) {
      setRemainingLife(`${Math.floor(yearsRemaining)} years ${Math.round((yearsRemaining % 1) * 12)} months`);
    } else {
      setRemainingLife(`${Math.round(yearsRemaining * 12)} months`);
    }
    
    // Calculate monthly degradation rate
    const monthlyDegradation = (100 - calculatedSoh) / (cycleCount / 30);
    setDegradationRate(isNaN(monthlyDegradation) ? 0 : Math.round(monthlyDegradation * 100) / 100);
    
    // Generate prediction data
    generatePredictionData(calculatedSoh, calculatedRemainingCycles);
  };
  
  const generatePredictionData = (currentSoh: number, remainingCycles: number) => {
    const data = [];
    const totalPredictionCycles = cycleCount + remainingCycles;
    const currentCycleStep = Math.max(1, Math.floor(totalPredictionCycles / 20));
    
    // Historical data (up to current cycle count)
    for (let cycle = 0; cycle <= cycleCount; cycle += currentCycleStep) {
      const progress = cycle / maxCycles;
      const cycleDegradation = 20 * progress + 10 * Math.pow(progress, 2);
      const tempEffect = Math.max(0, (temperature - 25) * 0.1 * progress);
      const dodEffect = (depthOfDischarge - 60) * 0.03 * progress;
      const cRateEffect = Math.max(0, (cRate - 1) * progress);
      
      const historicalSoh = Math.max(60, initialSoh - cycleDegradation - tempEffect - dodEffect - cRateEffect);
      
      data.push({
        cycles: cycle,
        value: Math.round(historicalSoh * 10) / 10,
        isPast: true
      });
    }
    
    // Future prediction data (from current cycle count to end of life)
    const futureSteps = 15;
    const futureStepSize = Math.max(100, Math.floor(remainingCycles / futureSteps));
    
    for (let i = 1; i <= futureSteps; i++) {
      const futureCycle = cycleCount + (i * futureStepSize);
      if (futureCycle > totalPredictionCycles) break;
      
      const progress = futureCycle / maxCycles;
      const cycleDegradation = 20 * progress + 10 * Math.pow(progress, 2);
      const tempEffect = Math.max(0, (temperature - 25) * 0.1 * progress);
      const dodEffect = (depthOfDischarge - 60) * 0.03 * progress;
      const cRateEffect = Math.max(0, (cRate - 1) * progress);
      
      const predictedSoh = Math.max(0, initialSoh - cycleDegradation - tempEffect - dodEffect - cRateEffect);
      
      data.push({
        cycles: futureCycle,
        value: Math.round(predictedSoh * 10) / 10,
        isPrediction: true
      });
    }
    
    setPredictionData(data);
  };
  
  // Generate health assessment based on estimated SoH
  const getHealthAssessment = () => {
    if (estimatedSoh >= 90) return { status: 'Excellent', class: 'text-green-600' };
    if (estimatedSoh >= 80) return { status: 'Good', class: 'text-green-500' };
    if (estimatedSoh >= 70) return { status: 'Moderate', class: 'text-yellow-500' };
    if (estimatedSoh >= 60) return { status: 'Fair', class: 'text-orange-500' };
    return { status: 'Poor', class: 'text-red-500' };
  };
  
  const assessment = getHealthAssessment();

  const handleBackClick = () => {
    navigate('/');
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleBackClick}
          className="h-8 w-8"
          title="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleBackClick}
          className="h-8 w-8"
          title="Go to home page"
        >
          <Home className="h-4 w-4" />
        </Button>
        <CalcIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Battery Health Calculator</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Battery Parameters</CardTitle>
              <CardDescription>
                Adjust parameters to calculate battery health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="initialSoh">Initial State of Health (%)</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="initialSoh"
                    min={60} 
                    max={100} 
                    step={1} 
                    value={[initialSoh]} 
                    onValueChange={(value) => setInitialSoh(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={initialSoh} 
                    onChange={(e) => setInitialSoh(Number(e.target.value))} 
                    className="w-20" 
                    min={60} 
                    max={100}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Operating Temperature (°C)</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="temperature"
                    min={10} 
                    max={60} 
                    step={1} 
                    value={[temperature]} 
                    onValueChange={(value) => setTemperature(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={temperature} 
                    onChange={(e) => setTemperature(Number(e.target.value))} 
                    className="w-20"
                    min={10}
                    max={60}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cycleCount">Cycle Count</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="cycleCount"
                    min={0} 
                    max={2000} 
                    step={10} 
                    value={[cycleCount]} 
                    onValueChange={(value) => setCycleCount(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={cycleCount} 
                    onChange={(e) => setCycleCount(Number(e.target.value))} 
                    className="w-20"
                    min={0}
                    max={2000}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxCycles">Maximum Rated Cycles</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="maxCycles"
                    min={500} 
                    max={5000} 
                    step={100} 
                    value={[maxCycles]} 
                    onValueChange={(value) => setMaxCycles(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={maxCycles} 
                    onChange={(e) => setMaxCycles(Number(e.target.value))} 
                    className="w-20"
                    min={500}
                    max={5000}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="depthOfDischarge">Typical Depth of Discharge (%)</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="depthOfDischarge"
                    min={20} 
                    max={100} 
                    step={5} 
                    value={[depthOfDischarge]} 
                    onValueChange={(value) => setDepthOfDischarge(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={depthOfDischarge} 
                    onChange={(e) => setDepthOfDischarge(Number(e.target.value))} 
                    className="w-20"
                    min={20}
                    max={100}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cRate">Typical C-Rate (charging speed)</Label>
                <div className="flex items-center gap-3">
                  <Slider 
                    id="cRate"
                    min={0.2} 
                    max={3} 
                    step={0.1} 
                    value={[cRate]} 
                    onValueChange={(value) => setCRate(value[0])} 
                    className="flex-1"
                  />
                  <Input 
                    type="number" 
                    value={cRate} 
                    onChange={(e) => setCRate(Number(e.target.value))} 
                    className="w-20"
                    min={0.2}
                    step={0.1}
                    max={3}
                  />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={calculateBatteryHealth}
              >
                Calculate Health
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Parameter Effects</CardTitle>
              <CardDescription>
                How each parameter affects battery health
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <span className="font-medium">Temperature:</span> Higher operating temperatures accelerate degradation. Each 10°C increase above 25°C can double the rate of capacity loss.
              </div>
              <div>
                <span className="font-medium">Depth of Discharge (DoD):</span> Deeper discharges cause more stress. Using only 60% of capacity (60% DoD) instead of 100% can double battery lifespan.
              </div>
              <div>
                <span className="font-medium">C-Rate:</span> Faster charging/discharging rates (higher C-rate) increase stress and heat generation, accelerating degradation.
              </div>
              <div>
                <span className="font-medium">Cycle Count:</span> Each charge-discharge cycle causes some degradation, with the effect becoming more pronounced at higher cycle counts.
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold flex items-baseline gap-2">
                    <span>{estimatedSoh}%</span>
                    <span className={`text-lg ${assessment.class}`}>
                      {assessment.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Estimated State of Health
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold">
                    {remainingCycles.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Estimated Remaining Cycles
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold">
                    {remainingLife}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Estimated Remaining Life
                  </div>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <div className="text-3xl font-bold">
                    {degradationRate}%
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Monthly Degradation Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>State of Health Formula</CardTitle>
              <CardDescription>
                The calculation used to determine battery state of health
              </CardDescription>
            </CardHeader>
            <CardContent className="font-mono text-sm overflow-x-auto">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="mb-2 font-medium">SoH = InitialSoH - CycleDegradation - TempEffect - DoD_Effect - CRateEffect</p>
                <p className="mb-2">Where:</p>
                <ul className="space-y-2">
                  <li>CycleDegradation = 20 × (CycleCount ÷ MaxCycles) + 10 × (CycleCount ÷ MaxCycles)²</li>
                  <li>TempEffect = max(0, (Temperature - 25) × 0.2)</li>
                  <li>DoD_Effect = (DepthOfDischarge - 60) × 0.05</li>
                  <li>CRateEffect = max(0, (CRate - 1) × 2)</li>
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">Note: The formula applies non-linear weighting to account for accelerated degradation patterns observed in real-world battery aging studies.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>State of Health Prediction</CardTitle>
              <CardDescription>
                Projected health based on current parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {predictionData.length > 0 ? (
                <LineChart
                  data={predictionData}
                  xDataKey="cycles"
                  yDataKey="value"
                  color="#3b82f6"
                  label="State of Health"
                  height={300}
                  tooltipFormatter={(value) => `${value}%`}
                  yAxisLabel="State of Health (%)"
                  additionalLines={[
                    {
                      dataKey: "endOfLife",
                      color: "#ef4444",
                      label: "End of Life (60%)"
                    }
                  ]}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Adjust parameters to see prediction
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Temperature Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    {temperature <= 25 ? (
                      "Current temperature is within optimal range for battery longevity."
                    ) : temperature <= 35 ? (
                      "Moderate temperature stress. Consider improved cooling to extend life."
                    ) : (
                      "High temperature stress detected! Temperature is significantly reducing battery life."
                    )}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Cycling Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    {cycleCount < maxCycles * 0.25 ? (
                      "Battery is in early life stage with minimal cycle degradation."
                    ) : cycleCount < maxCycles * 0.5 ? (
                      "Battery is in mid-life stage with moderate cycle degradation."
                    ) : cycleCount < maxCycles * 0.75 ? (
                      "Battery is approaching later life stages. Plan for replacement in future."
                    ) : (
                      "Battery is in late life stage with significant cycle degradation."
                    )}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Discharge Pattern Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    {depthOfDischarge <= 60 ? (
                      "Shallow discharge pattern is optimal for battery longevity."
                    ) : depthOfDischarge <= 80 ? (
                      "Moderate depth of discharge is acceptable but limiting to 60% would extend life."
                    ) : (
                      "Deep discharge pattern is significantly reducing battery life."
                    )}
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Charging Speed Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    {cRate <= 0.5 ? (
                      "Slow charging is optimal for battery longevity."
                    ) : cRate <= 1 ? (
                      "Moderate charging rate balances convenience and battery life."
                    ) : (
                      "Fast charging is convenient but reducing battery lifespan."
                    )}
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Recommendation</h3>
                <p className="text-sm text-blue-800">
                  {estimatedSoh >= 80 ? (
                    "Battery is in good health. Continue current usage patterns."
                  ) : estimatedSoh >= 70 ? (
                    "Consider reducing operating temperature and charge rate to extend remaining life."
                  ) : estimatedSoh >= 60 ? (
                    "Battery is approaching end of life. Consider reducing depth of discharge and temperature to extend remaining life."
                  ) : (
                    "Battery has reached end of life criteria. Consider replacement planning."
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BatteryCalculator;
