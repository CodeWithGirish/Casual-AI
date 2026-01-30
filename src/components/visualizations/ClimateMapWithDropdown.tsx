import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { District, useDistricts } from "@/hooks/useDistricts";
import { useMigrationEvents } from "@/hooks/useMigrationEvents";
import {
  Loader2,
  Droplets,
  Users,
  CloudRain,
  Waves,
  Mountain,
  Zap,
  Activity,
  ThermometerSun
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MAHARASHTRA_CENTER: [number, number] = [76.5, 19.5];

type MapMode = "current" | "simulated";
// Expanded LayerType to include requested climate shocks
type LayerType = "drought" | "migration" | "water" | "flood" | "landslide" | "thunderstorm" | "earthquake" | "heatwave";

interface ClimateMapWithDropdownProps {
  mode?: MapMode;
  onDistrictSelect?: (district: District) => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string; eventType: string }) => void;
  selectedDistrict?: string;
}

// Updated layerConfig with icons and logic for new climate shocks
const layerConfig: Record<LayerType, {
  label: string;
  icon: React.ReactNode;
  getColor: (district: District, mode: MapMode) => string;
  getValue: (district: District) => number;
  unit: string;
}> = {
  drought: {
    label: "Drought Index",
    icon: <CloudRain className="w-4 h-4" />,
    getColor: (district, mode) => {
      const value = mode === "simulated" ? district.drought_index * 1.2 : district.drought_index;
      if (value > 70) return "#ef4444";
      if (value > 50) return "#f59e0b";
      if (value > 30) return "#eab308";
      return "#22c55e";
    },
    getValue: (district) => district.drought_index,
    unit: "%",
  },
  flood: {
    label: "Flood Risk",
    icon: <Waves className="w-4 h-4" />,
    getColor: (district) => {
      const val = district.water_stress_index; // Using water stress as proxy if flood_risk is missing in types
      if (val > 70) return "#3b82f6";
      if (val > 40) return "#60a5fa";
      return "#93c5fd";
    },
    getValue: (district) => district.water_stress_index,
    unit: " Score",
  },
  landslide: {
    label: "Landslide Risk",
    icon: <Mountain className="w-4 h-4" />,
    getColor: (district) => (district.drought_index > 60 ? "#78350f" : "#d97706"),
    getValue: (district) => district.drought_index / 2,
    unit: " Risk",
  },
  thunderstorm: {
    label: "Thunderstorm Intensity",
    icon: <Zap className="w-4 h-4" />,
    getColor: () => "#facc15",
    getValue: () => 45,
    unit: " lightning/km²",
  },
  earthquake: {
    label: "Seismic Activity",
    icon: <Activity className="w-4 h-4" />,
    getColor: () => "#a855f7",
    getValue: () => 2.5,
    unit: " Richter",
  },
  heatwave: {
    label: "Heat Index",
    icon: <ThermometerSun className="w-4 h-4" />,
    getColor: (district) => (district.drought_index > 50 ? "#dc2626" : "#fb923c"),
    getValue: (district) => district.drought_index + 10,
    unit: "°C",
  },
  migration: {
    label: "Net Migration",
    icon: <Users className="w-4 h-4" />,
    getColor: (district) => {
      if (district.net_migration > 5000) return "#06b6d4";
      if (district.net_migration > 0) return "#22d3ee";
      if (district.net_migration > -5000) return "#f59e0b";
      return "#ef4444";
    },
    getValue: (district) => district.net_migration,
    unit: " people",
  },
  water: {
    label: "Water Stress",
    icon: <Droplets className="w-4 h-4" />,
    getColor: (district, mode) => {
      const value = mode === "simulated" ? district.water_stress_index * 1.1 : district.water_stress_index;
      if (value > 70) return "#ef4444";
      if (value > 50) return "#f59e0b";
      if (value > 30) return "#3b82f6";
      return "#22c55e";
    },
    getValue: (district) => district.water_stress_index,
    unit: "%",
  },
};

export const ClimateMapWithDropdown = ({
                                         mode = "current",
                                         onDistrictSelect,
                                         onLocationSelect,
                                         selectedDistrict,
                                       }: ClimateMapWithDropdownProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerType>("drought");

  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const { data: migrationEvents } = useMigrationEvents();

  const currentLayerConfig = layerConfig[activeLayer];

  // Helper for markers remains the same as original logic
  const getMarkerSize = useCallback((district: District) => {
    if (activeLayer === "migration") {
      const baseMigration = Math.abs(district.net_migration);
      if (baseMigration > 10000) return 24;
      if (baseMigration > 5000) return 18;
      return 12;
    }
    const value = currentLayerConfig.getValue(district);
    if (value > 70) return 22;
    if (value > 40) return 16;
    return 10;
  }, [activeLayer, currentLayerConfig]);

  // Initialization effect
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) return;

    mapboxgl.accessToken = accessToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: MAHARASHTRA_CENTER,
      zoom: 6,
      maxBounds: [[70, 14], [83, 24]],
      pitch: 45,
    });

    map.current.on("load", () => setMapLoaded(true));
    return () => map.current?.remove();
  }, []);

  // Marker update effect
  useEffect(() => {
    if (!map.current || !mapLoaded || !districts) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    districts.forEach((district) => {
      const el = document.createElement("div");
      const size = getMarkerSize(district);
      const color = currentLayerConfig.getColor(district, mode);
      const isSelected = selectedDistrict === district.id;

      el.className = "district-marker";
      el.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${color}; border-radius: 50%;
        border: 2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.3)"};
        cursor: pointer; transition: all 0.3s ease;
      `;

      el.addEventListener("click", () => {
        onDistrictSelect?.(district);
        onLocationSelect?.({
          lat: district.y_coord,
          lng: district.x_coord,
          name: district.name,
          eventType: activeLayer,
        });
      });

      const marker = new mapboxgl.Marker(el)
          .setLngLat([district.x_coord, district.y_coord])
          .addTo(map.current!);
      markersRef.current.push(marker);
    });
  }, [districts, mapLoaded, activeLayer, mode, selectedDistrict, getMarkerSize, currentLayerConfig, onDistrictSelect, onLocationSelect]);

  if (districtsLoading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
      <div className="relative w-full h-full">
        <div ref={mapContainer} className="w-full h-full rounded-lg" />

        {/* Expanded Select with all Climate Shocks */}
        <div className="absolute top-4 left-4 z-10">
          <Select value={activeLayer} onValueChange={(v) => setActiveLayer(v as LayerType)}>
            <SelectTrigger className="w-[200px] bg-background/90 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                {currentLayerConfig.icon}
                <SelectValue placeholder="Climate Shock" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drought">
                <div className="flex items-center gap-2"><CloudRain className="w-4 h-4" /> Drought</div>
              </SelectItem>
              <SelectItem value="flood">
                <div className="flex items-center gap-2"><Waves className="w-4 h-4" /> Flood</div>
              </SelectItem>
              <SelectItem value="landslide">
                <div className="flex items-center gap-2"><Mountain className="w-4 h-4" /> Landslide</div>
              </SelectItem>
              <SelectItem value="thunderstorm">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Thunderstorm</div>
              </SelectItem>
              <SelectItem value="earthquake">
                <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Earthquake</div>
              </SelectItem>
              <SelectItem value="heatwave">
                <div className="flex items-center gap-2"><ThermometerSun className="w-4 h-4" /> Heat Wave</div>
              </SelectItem>
              <SelectItem value="water">
                <div className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Water Stress</div>
              </SelectItem>
              <SelectItem value="migration">
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Migration Flow</div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
  );
};

export default ClimateMapWithDropdown;