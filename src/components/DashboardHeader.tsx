
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  onTabChange: (tab: string) => void;
  activeTab: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onTabChange,
  activeTab,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 mb-6">
      <h1 className="text-2xl font-bold tracking-tight flex items-center">
        <Terminal className="mr-2 h-6 w-6" />
        {title}
      </h1>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="soh">SoH</TabsTrigger>
          <TabsTrigger value="degradation">Degradation</TabsTrigger>
          <TabsTrigger value="thermal">Thermal</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default DashboardHeader;
