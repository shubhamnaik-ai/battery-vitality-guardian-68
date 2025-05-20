
import React, { useState } from 'react';
import { Search, Filter, X, CheckSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface FiltersProps {
  depots: string[];
  vehicles: string[];
  selectedDepots: string[];
  selectedVehicles: string[];
  onDepotFilterChange: (depots: string[]) => void;
  onVehicleFilterChange: (vehicles: string[]) => void;
}

const Filters: React.FC<FiltersProps> = ({
  depots,
  vehicles,
  selectedDepots,
  selectedVehicles,
  onDepotFilterChange,
  onVehicleFilterChange
}) => {
  const [isDepotFilterOpen, setIsDepotFilterOpen] = useState(false);
  const [isVehicleFilterOpen, setIsVehicleFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Handle depot selection
  const handleDepotToggle = (depot: string) => {
    if (selectedDepots.includes(depot)) {
      onDepotFilterChange(selectedDepots.filter(d => d !== depot));
    } else {
      onDepotFilterChange([...selectedDepots, depot]);
    }
  };
  
  // Handle vehicle selection
  const handleVehicleToggle = (vehicle: string) => {
    if (selectedVehicles.includes(vehicle)) {
      onVehicleFilterChange(selectedVehicles.filter(v => v !== vehicle));
    } else {
      onVehicleFilterChange([...selectedVehicles, vehicle]);
    }
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    onDepotFilterChange([]);
    onVehicleFilterChange([]);
  };
  
  // Remove a specific depot filter
  const removeDepotFilter = (depot: string) => {
    onDepotFilterChange(selectedDepots.filter(d => d !== depot));
  };
  
  // Remove a specific vehicle filter
  const removeVehicleFilter = (vehicle: string) => {
    onVehicleFilterChange(selectedVehicles.filter(v => v !== vehicle));
  };

  // Select all depots
  const selectAllDepots = () => {
    onDepotFilterChange([...depots]);
  };
  
  // Deselect all depots
  const deselectAllDepots = () => {
    onDepotFilterChange([]);
  };
  
  // Select all vehicles
  const selectAllVehicles = () => {
    onVehicleFilterChange([...vehicles]);
  };
  
  // Deselect all vehicles
  const deselectAllVehicles = () => {
    onVehicleFilterChange([]);
  };
  
  // Filter vehicles by search term
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {/* Depot Filter */}
              <Popover open={isDepotFilterOpen} onOpenChange={setIsDepotFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Depot</span>
                    {selectedDepots.length > 0 && (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedDepots.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search depots..." />
                    <CommandList>
                      <CommandEmpty>No depots found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem 
                          onSelect={() => {
                            if (selectedDepots.length === depots.length) {
                              deselectAllDepots();
                            } else {
                              selectAllDepots();
                            }
                          }}
                          className="font-medium"
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          {selectedDepots.length === depots.length ? "Deselect All" : "Select All"}
                        </CommandItem>
                        <CommandSeparator />
                        {depots.map(depot => (
                          <CommandItem
                            key={depot}
                            onSelect={() => handleDepotToggle(depot)}
                          >
                            <div 
                              className={`mr-2 h-4 w-4 border rounded-sm flex items-center justify-center ${
                                selectedDepots.includes(depot) ? 'bg-primary border-primary' : 'border-input'
                              }`}
                            >
                              {selectedDepots.includes(depot) && (
                                <CheckSquare className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span>{depot}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* Vehicle Filter */}
              <Popover open={isVehicleFilterOpen} onOpenChange={setIsVehicleFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Vehicle</span>
                    {selectedVehicles.length > 0 && (
                      <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                        {selectedVehicles.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search vehicles..." 
                      value={searchTerm}
                      onValueChange={setSearchTerm}
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No vehicles found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem 
                          onSelect={() => {
                            if (selectedVehicles.length === vehicles.length) {
                              deselectAllVehicles();
                            } else {
                              selectAllVehicles();
                            }
                          }}
                          className="font-medium"
                        >
                          <CheckSquare className="mr-2 h-4 w-4" />
                          {selectedVehicles.length === vehicles.length ? "Deselect All" : "Select All"}
                        </CommandItem>
                        <CommandSeparator />
                        {filteredVehicles.slice(0, 100).map(vehicle => (
                          <CommandItem
                            key={vehicle}
                            onSelect={() => handleVehicleToggle(vehicle)}
                          >
                            <div 
                              className={`mr-2 h-4 w-4 border rounded-sm flex items-center justify-center ${
                                selectedVehicles.includes(vehicle) ? 'bg-primary border-primary' : 'border-input'
                              }`}
                            >
                              {selectedVehicles.includes(vehicle) && (
                                <CheckSquare className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span>{vehicle}</span>
                          </CommandItem>
                        ))}
                        {filteredVehicles.length > 100 && (
                          <CommandItem disabled className="text-xs text-muted-foreground">
                            {filteredVehicles.length - 100} more vehicles...
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {(selectedDepots.length > 0 || selectedVehicles.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9"
                  onClick={clearAllFilters}
                >
                  <X className="mr-1 h-4 w-4" />
                  Clear filters
                </Button>
              )}
            </div>
            
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full sm:w-[250px] pl-8"
              />
            </div>
          </div>
          
          {/* Display Active Filters */}
          {(selectedDepots.length > 0 || selectedVehicles.length > 0) && (
            <>
              <Separator className="my-4" />
              <div className="flex flex-wrap gap-2">
                {selectedDepots.map(depot => (
                  <Badge key={depot} variant="secondary" className="flex items-center gap-1">
                    {depot}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeDepotFilter(depot)}
                    />
                  </Badge>
                ))}
                
                {selectedVehicles.map((vehicle, idx) => {
                  // Only show first 5 vehicle badges to avoid UI clutter
                  if (idx < 5) {
                    return (
                      <Badge key={vehicle} variant="secondary" className="flex items-center gap-1">
                        {vehicle}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeVehicleFilter(vehicle)}
                        />
                      </Badge>
                    );
                  } else if (idx === 5) {
                    return (
                      <Badge key="more" variant="outline">
                        +{selectedVehicles.length - 5} more
                      </Badge>
                    );
                  }
                  return null;
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Filters;
