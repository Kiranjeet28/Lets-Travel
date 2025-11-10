"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HomeContext } from "@/hooks/context/HomeContext";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import { useContext } from "react";

const FILTER_OPTIONS = [
  { key: "AGENCY", label: "Agencies" },
  { key: "HOTEL", label: "Hotels" },
  { key: "DMC", label: "DMC's" },
  { key: "Influencer", label: "Influencers" },
] as const;

function SearchingAndFilter() {
  const {
    visible,
    selectedCity,
    setCity,
    selectedCountry,
    setCountry,
    toggleVisible,
    allCities,
    allCountries,
  } = useContext(HomeContext);

  const handleFind = () => {
    window.scrollTo({
      top: window.innerHeight + 150,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative z-20 w-full py-10 mx-auto font-Lato">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mx-auto w-fit mb-0">
          <div className="px-6 py-2 bg-white rounded-t-xl border-2 border-gray-600 border-b-0">
            <h1 className="font-bold text-sm md:text-base text-black whitespace-nowrap">
              FIND YOUR TOP 10
            </h1>
          </div>
        </div>

        {/* Main Search Container */}
        <div className="bg-white border-2 border-gray-700 rounded-b-xl md:rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 md:p-6 space-y-4">
            {/* Location Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select value={selectedCountry} onValueChange={setCountry}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">Country:</strong>
                    <SelectValue placeholder="Select Country" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {allCountries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setCity}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">City:</strong>
                    <SelectValue placeholder="Select City" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {allCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {FILTER_OPTIONS.map(({ key, label }) => (
                <Button
                  key={key}
                  onClick={() => toggleVisible(key)}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "px-4 py-2 transition-all",
                    visible[key]
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "hover:bg-gray-100"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>

            {/* Search Button */}
            <Button
              onClick={handleFind}
              className="w-full md:w-auto px-8 py-5 rounded-full font-semibold"
              size="lg"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              FIND
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchingAndFilter;
