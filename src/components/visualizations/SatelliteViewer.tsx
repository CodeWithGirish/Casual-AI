import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Satellite, Calendar, Layers, MapPin, AlertTriangle } from "lucide-react";
import { District } from "@/hooks/useDistricts";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SatelliteViewerProps {
  selectedLocation?: {
    lat: number;
    lng: number;
    name: string;
    eventType?: string;
  } | null;
  district?: District | null;
}

type ImageryLayer = "satellite" | "satellite-streets" | "terrain";

export const SatelliteViewer = ({ selectedLocation, district }: SatelliteViewerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageryLayer, setImageryLayer] = useState<ImageryLayer>("satellite");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; name: string } | null>(null);

  // Default to center of Maharashtra if no location
  const defaultCenter: [number, number] = [76.5, 19.5];
  const center: [number, number] = selectedLocation 
    ? [selectedLocation.lng, selectedLocation.lat]
    : district 
    ? [district.x_coord, district.y_coord]
    : defaultCenter;

  const locationName = selectedLocation?.name || district?.name || "Maharashtra";
  const eventType = selectedLocation?.eventType;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MapBox access token is missing");
      setIsLoading(false);
      return;
    }

    mapboxgl.accessToken = accessToken;

    const mapStyle = imageryLayer === "satellite" 
      ? "mapbox://styles/mapbox/satellite-v9"
      : imageryLayer === "satellite-streets"
      ? "mapbox://styles/mapbox/satellite-streets-v12"
      : "mapbox://styles/mapbox/outdoors-v12";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: center,
      zoom: 12,
      pitch: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left");

    map.current.on("load", () => {
      setMapLoaded(true);
      setIsLoading(false);
      
      // Add marker for location
      if (selectedLocation || district) {
        addLocationMarker();
      }
    });

    return () => {
      markerRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when imagery layer changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const mapStyle = imageryLayer === "satellite" 
      ? "mapbox://styles/mapbox/satellite-v9"
      : imageryLayer === "satellite-streets"
      ? "mapbox://styles/mapbox/satellite-streets-v12"
      : "mapbox://styles/mapbox/outdoors-v12";

    map.current.setStyle(mapStyle);
  }, [imageryLayer, mapLoaded]);

  // Update map when location changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const newCenter: [number, number] = selectedLocation 
      ? [selectedLocation.lng, selectedLocation.lat]
      : district 
      ? [district.x_coord, district.y_coord]
      : defaultCenter;

    map.current.flyTo({
      center: newCenter,
      zoom: selectedLocation ? 14 : 10,
      duration: 1500,
    });

    setCurrentLocation({
      lat: newCenter[1],
      lng: newCenter[0],
      name: locationName,
    });

    addLocationMarker();
  }, [selectedLocation, district, mapLoaded]);

  const addLocationMarker = () => {
    if (!map.current) return;
    
    // Remove existing marker
    markerRef.current?.remove();

    const coords: [number, number] = selectedLocation 
      ? [selectedLocation.lng, selectedLocation.lat]
      : district 
      ? [district.x_coord, district.y_coord]
      : defaultCenter;

    // Create custom marker element
    const el = document.createElement("div");
    el.className = "satellite-marker";
    el.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 12px solid white;
      "></div>
    `;

    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat(coords)
      .addTo(map.current);
  };

  const getEventBadge = () => {
    if (!eventType) return null;
    
    const badges: Record<string, { color: string; icon: React.ReactNode }> = {
      drought: { color: "bg-warning text-warning-foreground", icon: <AlertTriangle className="w-3 h-3" /> },
      migration: { color: "bg-primary text-primary-foreground", icon: <MapPin className="w-3 h-3" /> },
      flood: { color: "bg-secondary text-secondary-foreground", icon: <Layers className="w-3 h-3" /> },
      crop_failure: { color: "bg-destructive text-destructive-foreground", icon: <AlertTriangle className="w-3 h-3" /> },
    };

    const badge = badges[eventType] || badges.drought;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {eventType.replace("_", " ").toUpperCase()}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <Satellite className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Satellite Ground Verification
              </h3>
              <p className="text-xs text-muted-foreground">
                High-resolution imagery for {locationName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getEventBadge()}
            <Select value={imageryLayer} onValueChange={(v) => setImageryLayer(v as ImageryLayer)}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <Layers className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Layer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite">Satellite</SelectItem>
                <SelectItem value="satellite-streets">Satellite + Labels</SelectItem>
                <SelectItem value="terrain">Terrain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[300px] sm:h-[350px]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading satellite imagery...</span>
            </div>
          </div>
        )}
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Coordinate overlay */}
        {currentLocation && (
          <div className="absolute bottom-4 right-4 glass-card px-3 py-2 rounded-lg text-xs font-mono z-10">
            <div className="text-muted-foreground">
              {currentLocation.lat.toFixed(4)}°N, {currentLocation.lng.toFixed(4)}°E
            </div>
          </div>
        )}
      </div>

      {/* Info panel */}
      <div className="p-4 bg-muted/30 border-t border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Location</div>
            <div className="text-sm font-medium text-foreground truncate">{locationName}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Imagery</div>
            <div className="text-sm font-medium text-foreground capitalize">{imageryLayer.replace("-", " ")}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Resolution</div>
            <div className="text-sm font-medium text-foreground">~0.5m/px</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <div className="text-sm font-medium text-success flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Live
            </div>
          </div>
        </div>
        
        {district && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-muted-foreground">Drought Index</div>
                <div className={`text-lg font-bold ${district.drought_index > 70 ? "text-destructive" : district.drought_index > 50 ? "text-warning" : "text-success"}`}>
                  {district.drought_index.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Water Stress</div>
                <div className={`text-lg font-bold ${district.water_stress_index > 70 ? "text-destructive" : district.water_stress_index > 50 ? "text-warning" : "text-success"}`}>
                  {district.water_stress_index.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Net Migration</div>
                <div className={`text-lg font-bold ${district.net_migration < 0 ? "text-warning" : "text-secondary"}`}>
                  {district.net_migration > 0 ? "+" : ""}{(district.net_migration / 1000).toFixed(1)}K
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .mapboxgl-ctrl-scale {
          background: rgba(0,0,0,0.6) !important;
          color: white !important;
          border-color: rgba(255,255,255,0.3) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default SatelliteViewer;
