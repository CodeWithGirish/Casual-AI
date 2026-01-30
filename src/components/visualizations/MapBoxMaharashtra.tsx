import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { District, useDistricts } from "@/hooks/useDistricts";
import { useSimulationRuns } from "@/hooks/useSimulationRuns";
import { Loader2 } from "lucide-react";

interface MapBoxMaharashtraProps {
  mode?: "current" | "simulated";
  onDistrictSelect?: (district: District) => void;
  selectedDistrict?: string;
}

export const MapBoxMaharashtra = ({
  mode = "current",
  onDistrictSelect,
  selectedDistrict,
}: MapBoxMaharashtraProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const { data: districts, isLoading } = useDistricts();
  const { data: simulationRuns } = useSimulationRuns();

  // Get the most recent simulation results to apply to the map
  const latestSim = simulationRuns?.[0];

  const getDistrictColor = useCallback(
    (district: District) => {
      let droughtVal = district.drought_index;

      // Apply projected reduction if in simulated mode
      if (mode === "simulated" && latestSim) {
        const impact = (latestSim.climate_policy_input / 100) * 0.25;
        droughtVal = district.drought_index * (1 - impact);
      }

      if (droughtVal > 70) return "#ef4444"; // Severe Risk
      if (droughtVal > 50) return "#f59e0b"; // Moderate Risk
      return "#22c55e"; // Stabilized
    },
    [mode, latestSim]
  );

  const getMarkerSize = useCallback(
    (district: District) => {
      let migrationVal = Math.abs(district.net_migration);

      // Shrink markers in simulated mode based on prevented migration
      if (mode === "simulated" && latestSim) {
        const reductionFactor = (latestSim.water_subsidy_input + latestSim.climate_policy_input) / 200;
        migrationVal = migrationVal * (1 - (reductionFactor * 0.6));
      }

      if (migrationVal > 100) return 24;
      if (migrationVal > 50) return 18;
      return 12;
    },
    [mode, latestSim]
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [76.5, 19.5],
      zoom: 6,
      pitch: 45,
    });

    map.current.on("load", () => setMapLoaded(true));
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !districts) return;

    // Clear and redraw markers whenever mode or data changes
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    districts.forEach((district) => {
      const el = document.createElement("div");
      const size = getMarkerSize(district);
      const color = getDistrictColor(district);
      const isSelected = selectedDistrict === district.id;

      el.style.cssText = `
        width: ${size}px; height: ${size}px;
        background: ${color}; border-radius: 50%;
        border: 2px solid ${isSelected ? "#fff" : "rgba(255,255,255,0.3)"};
        box-shadow: 0 0 15px ${color}80;
        cursor: pointer; transition: all 0.5s ease;
      `;

      el.onclick = () => onDistrictSelect?.(district);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([district.x_coord, district.y_coord])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [districts, mode, latestSim, mapLoaded, selectedDistrict]);

  if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return <div ref={mapContainer} className="w-full h-full" />;
};