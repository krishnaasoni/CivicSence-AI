"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useMap, useMapEvents } from "react-leaflet";
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Building2,
  Compass,
  Loader2
} from "lucide-react";
import { reverseGeocode, searchLocation, GeocodedAddress } from "@/lib/geocoding";

// Dynamic imports with SSR disabled for Next.js App Router safety
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export interface CivicReport {
  id: string;
  title: string;
  issue_type: string;
  priority_level: string;
  severity_score: number;
  hazard_summary: string;
  recommended_action: string;
  sustainability_impact: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  status?: string;
  duplicate_count?: number;
  location_name?: string;
}

interface CivicMapProps {
  refreshTrigger?: number;
  focusCoords?: [number, number] | null;
  newReport?: CivicReport | null;
  theme?: "dark" | "light";
  onSelectReport?: (report: CivicReport) => void;
  className?: string;
}

// Available Real-World Map Layer Presets
export type MapLayerPreset = "STREETS" | "SATELLITE" | "CLEAN_STREET" | "CYBER_DARK";

interface LayerConfig {
  id: MapLayerPreset;
  label: string;
  icon: string;
  description: string;
  url: string;
  overlayUrl?: string;
  attribution: string;
  maxZoom: number;
}

const MAP_LAYERS: Record<MapLayerPreset, LayerConfig> = {
  STREETS: {
    id: "STREETS",
    label: "Detailed Streets",
    icon: "🗺️",
    description: "OpenStreetMap with real colony names, gali numbers, hospitals, & parks",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  SATELLITE: {
    id: "SATELLITE",
    label: "Satellite Hybrid",
    icon: "🛰️",
    description: "Real Earth Satellite imagery with colony & road label overlays",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    overlayUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Earthstar Geographics",
    maxZoom: 19,
  },
  CLEAN_STREET: {
    id: "CLEAN_STREET",
    label: "Smart City",
    icon: "🏙️",
    description: "Crisp vector street atlas with highway shields & colony borders",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; DeLorme, NAVTEQ, TomTom",
    maxZoom: 19,
  },
  CYBER_DARK: {
    id: "CYBER_DARK",
    label: "Night Vision",
    icon: "🌃",
    description: "High-contrast dark mode HUD for nighttime emergency operations",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
};

// Map Camera Controller to smoothly fly/zoom to target coordinates
function MapFlyController({
  coords,
  zoom = 16,
}: {
  coords: [number, number] | null;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (coords && typeof coords[0] === "number" && typeof coords[1] === "number") {
      map.flyTo(coords, zoom, { animate: true, duration: 1.5 });
    }
  }, [coords, zoom, map]);

  return null;
}

// Map Click Inspector: Allows clicking anywhere to inspect the Colony & Area address
function MapClickInspector({
  onInspectLocation,
}: {
  onInspectLocation: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onInspectLocation(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

// Fallback seed reports
const SEED_REPORTS: CivicReport[] = [
  {
    id: "CR-1049",
    title: "Industrial Sludge in Drainage Canal",
    issue_type: "Drainage",
    priority_level: "CRITICAL",
    severity_score: 94,
    hazard_summary: "Toxic chemical sludge accumulation obstructing stormwater outfall.\nRisk of flash inundation.",
    recommended_action: "Deploy hazardous suction truck, seal stormwater valve.",
    sustainability_impact: "Prevents toxic heavy metal leaching into regional water table.",
    latitude: 28.6139,
    longitude: 77.2090,
    timestamp: "2026-10-25T11:45:00Z",
    status: "OPEN",
    location_name: "Barakhamba Road, Connaught Place, New Delhi",
  },
  {
    id: "CR-1048",
    title: "Solar Smart Streetlight Blackout",
    issue_type: "Streetlight",
    priority_level: "MEDIUM",
    severity_score: 52,
    hazard_summary: "Grid fault on renewable street pole causing zero illumination on pedestrian walkway.",
    recommended_action: "Dispatch energy zonal maintenance unit for battery inverter inspection.",
    sustainability_impact: "Restores decentralized renewable solar lighting coverage.",
    latitude: 28.6219,
    longitude: 77.2150,
    timestamp: "2026-10-25T11:32:00Z",
    status: "OPEN",
    location_name: "Janpath Sector, Central Delhi",
  },
  {
    id: "CR-1047",
    title: "Severe Deep Pothole on EV Transit Lane",
    issue_type: "Pothole",
    priority_level: "HIGH",
    severity_score: 79,
    hazard_summary: "Crater-depth asphalt depression spanning over 1.2 meters.\nPresents blowout hazard.",
    recommended_action: "Deploy rapid cold-mix bitumen patching team within 6 hours.",
    sustainability_impact: "Minimizes localized vehicle deceleration cycles and emissions.",
    latitude: 28.6080,
    longitude: 77.2010,
    timestamp: "2026-10-25T11:15:00Z",
    status: "OPEN",
    location_name: "Chanakyapuri Avenue, New Delhi",
  },
  {
    id: "CR-1046",
    title: "Unsegregated Plastic Dump in Public Eco-Park",
    issue_type: "Garbage Dump",
    priority_level: "HIGH",
    severity_score: 71,
    hazard_summary: "Massive pile of single-use plastic waste and open decomposing refuse.",
    recommended_action: "Dispatch municipal mechanical refuse compactor and sanitize ground.",
    sustainability_impact: "Halts open plastic degradation and stops microplastic spread.",
    latitude: 28.6180,
    longitude: 77.2280,
    timestamp: "2026-10-25T10:50:00Z",
    status: "OPEN",
    location_name: "India Gate Environs, New Delhi",
  },
];

export default function CivicMap({
  refreshTrigger = 0,
  focusCoords,
  newReport,
  theme = "dark",
  onSelectReport,
  className = "",
}: CivicMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [reports, setReports] = useState<CivicReport[]>(SEED_REPORTS);
  const [isLoading, setIsLoading] = useState(true);
  const [leafletLib, setLeafletLib] = useState<typeof import("leaflet") | null>(null);
  
  // Real Map Layer Mode: Default to "STREETS" for real street view, or "SATELLITE"
  const [activeLayer, setActiveLayer] = useState<MapLayerPreset>("STREETS");

  // Map Coordinates & Flying
  const [targetFlyCoords, setTargetFlyCoords] = useState<[number, number] | null>(null);
  const [targetZoom, setTargetZoom] = useState<number>(15);

  // Search Bar State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<
    Array<{ displayName: string; lat: number; lng: number; colony: string; city: string }>
  >([]);

  // Inspected Location on Map Click
  const [inspectedLocation, setInspectedLocation] = useState<{
    lat: number;
    lng: number;
    address: GeocodedAddress | null;
    isLoading: boolean;
  } | null>(null);

  // Address lookup cache for reports
  const [resolvedAddresses, setResolvedAddresses] = useState<Record<string, GeocodedAddress>>({});

  // Client mounting guard & dynamic Leaflet import
  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((L) => {
      setLeafletLib(L);
    });
  }, []);

  // When theme changes from parent, sync default view if in cyber mode
  useEffect(() => {
    if (theme === "dark" && activeLayer === "CYBER_DARK") {
      setActiveLayer("CYBER_DARK");
    }
  }, [theme, activeLayer]);

  // When a newly submitted report is passed, prepend it and immediately fly to its GPS coordinates
  useEffect(() => {
    if (newReport && newReport.latitude && newReport.longitude) {
      setReports((prev) => {
        if (prev.some((r) => r.id === newReport.id)) {
          return prev;
        }
        return [newReport, ...prev];
      });
      setTargetFlyCoords([newReport.latitude, newReport.longitude]);
      setTargetZoom(16);

      // Pre-resolve reverse geocoded address for the new report
      reverseGeocode(newReport.latitude, newReport.longitude).then((addr) => {
        setResolvedAddresses((prev) => ({ ...prev, [newReport.id]: addr }));
      });
    }
  }, [newReport]);

  // When external focus coordinates are updated (e.g. from TicketList "Locate on Map")
  useEffect(() => {
    if (focusCoords && focusCoords[0] && focusCoords[1]) {
      setTargetFlyCoords(focusCoords);
      setTargetZoom(16);
    }
  }, [focusCoords]);

  // Fetch all reports from backend via multi-port apiRequest
  useEffect(() => {
    let isCancelled = false;

    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const { apiRequest } = await import("@/lib/api");
        const res = await apiRequest("/api/v1/reports", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && Array.isArray(data) && data.length > 0) {
            setReports(data);

            // Asynchronously resolve address for each report
            data.forEach((r: CivicReport) => {
              if (r.latitude && r.longitude) {
                reverseGeocode(r.latitude, r.longitude).then((addr) => {
                  if (!isCancelled) {
                    setResolvedAddresses((prev) => ({ ...prev, [r.id]: addr }));
                  }
                });
              }
            });
          }
        }
      } catch {
        // Retain seed reports if backend is unavailable
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    if (isMounted) {
      fetchReports();
    }

    return () => {
      isCancelled = true;
    };
  }, [isMounted, refreshTrigger]);

  // Handle Map Click to inspect any colony / place
  const handleMapClick = async (lat: number, lng: number) => {
    setInspectedLocation({ lat, lng, address: null, isLoading: true });
    try {
      const addr = await reverseGeocode(lat, lng);
      setInspectedLocation({ lat, lng, address: addr, isLoading: false });
    } catch {
      setInspectedLocation({
        lat,
        lng,
        address: {
          colony: "Selected Spot",
          city: "Municipal Boundary",
          state: "India",
          formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        },
        isLoading: false,
      });
    }
  };

  // Search Colony, Landmark, or City
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
      if (results.length > 0) {
        const top = results[0];
        setTargetFlyCoords([top.lat, top.lng]);
        setTargetZoom(15);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (res: { lat: number; lng: number; displayName: string }) => {
    setTargetFlyCoords([res.lat, res.lng]);
    setTargetZoom(16);
    setSearchResults([]);
    setSearchQuery(res.displayName.split(",")[0]);
  };

  // Locate User via Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setTargetFlyCoords([pos.coords.latitude, pos.coords.longitude]);
        setTargetZoom(17);
      },
      () => {
        // default fallback
        setTargetFlyCoords([28.6139, 77.2090]);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Glowing Leaflet divIcon markers
  const icons = useMemo(() => {
    if (!leafletLib) return null;

    const createIcon = (color: string, glow: string) =>
      leafletLib.divIcon({
        className: "custom-civic-marker",
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #0b0f19; border: 2.5px solid ${color}; box-shadow: 0 0 18px ${glow}; display: flex; align-items: center; justify-content: center;">
              <div style="width: 8px; height: 8px; border-radius: 50%; background: ${color};"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -17],
      });

    const createInspectIcon = () =>
      leafletLib.divIcon({
        className: "custom-inspect-marker",
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #38bdf8; border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(56,189,248,0.8); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background: #0f172a;"></div>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

    return {
      CRITICAL: createIcon("#f43f5e", "rgba(244, 63, 94, 0.9)"),
      HIGH: createIcon("#f59e0b", "rgba(245, 158, 11, 0.9)"),
      MEDIUM: createIcon("#06b6d4", "rgba(6, 182, 212, 0.9)"),
      LOW: createIcon("#10b981", "rgba(16, 185, 129, 0.9)"),
      INSPECT: createInspectIcon(),
    };
  }, [leafletLib]);

  if (!isMounted || !leafletLib) {
    return (
      <div className={`h-full min-h-[460px] w-full flex items-center justify-center rounded-2xl bg-slate-950/60 border border-slate-800 ${className}`}>
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-civic-emerald animate-ping" />
          Initializing High-Resolution GIS Satellite & Street Engine...
        </div>
      </div>
    );
  }

  const currentLayerConfig = MAP_LAYERS[activeLayer];
  const defaultCenter: [number, number] = targetFlyCoords || [28.6139, 77.2090];

  return (
    <div className={`relative h-full min-h-[460px] w-full rounded-3xl overflow-hidden border border-slate-800/80 shadow-glass-card ${className}`}>
      
      {/* 1. TOP BAR: Real-Time Map Search & Layer Switcher */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Search Colony / City Box */}
        <div className="relative pointer-events-auto w-full sm:w-80">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colony, city, landmark (e.g. Bhopal, CP)..."
              className="w-full pl-9 pr-9 py-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-civic-cyan focus:ring-1 focus:ring-civic-cyan shadow-lg transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-civic-cyan" />
              ) : (
                <span className="text-[10px] font-mono font-bold bg-slate-800/80 hover:bg-slate-700 px-1.5 py-0.5 rounded text-cyan-300">
                  GO
                </span>
              )}
            </button>
          </form>

          {/* Autocomplete / Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-slate-950/95 backdrop-blur-md border border-slate-700/90 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 transition-colors flex items-start gap-2 text-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-civic-emerald mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-white text-xs">
                      {res.colony || "Colony Area"}, {res.city}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">
                      {res.displayName}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls: Layer Switcher & GPS Locate Me */}
        <div className="flex items-center gap-2 pointer-events-auto ml-auto">
          {/* Map Layer Switcher Segmented Pills */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-lg text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setActiveLayer("STREETS")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
                activeLayer === "STREETS"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
              title="Real street atlas with colony names & parks"
            >
              <span>🗺️</span>
              <span className="hidden sm:inline">Streets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer("SATELLITE")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
                activeLayer === "SATELLITE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
              title="Real high-resolution Earth satellite imagery with colony labels"
            >
              <span>🛰️</span>
              <span className="hidden sm:inline">Satellite</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer("CLEAN_STREET")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
                activeLayer === "CLEAN_STREET"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
              title="Clean vector smart city roads"
            >
              <span>🏙️</span>
              <span className="hidden md:inline">Smart City</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayer("CYBER_DARK")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all ${
                activeLayer === "CYBER_DARK"
                  ? "bg-slate-800 text-white border border-slate-600 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
              title="Night Vision HUD"
            >
              <span>🌃</span>
              <span className="hidden md:inline">Dark</span>
            </button>
          </div>

          {/* GPS 'My Location' Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            className="p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-cyan-400 hover:text-cyan-200 hover:border-cyan-500/50 shadow-lg transition-all"
            title="Pan to My Current GPS Location"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. BOTTOM FLOATING BAR: Active Layer Badge & Click-to-Inspect Status */}
      <div className="absolute bottom-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Layer Info Pill */}
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 text-[11px] font-mono shadow-lg pointer-events-auto">
          <span className="text-sm">{currentLayerConfig.icon}</span>
          <span className="text-white font-bold">{currentLayerConfig.label} Mode</span>
          <span className="text-slate-400 hidden sm:inline">• Click any road/spot to inspect address</span>
        </div>

        {/* Live Incident Counter */}
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 text-[11px] font-mono shadow-lg pointer-events-auto">
          <span className={`h-2 w-2 rounded-full ${isLoading ? "bg-civic-amber animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
          <span className="text-slate-200 font-semibold">{reports.length} Incidents Live</span>
        </div>
      </div>

      {/* 3. INTERACTIVE LEAFLET MAP CONTAINER */}
      <MapContainer
        center={defaultCenter}
        zoom={targetZoom}
        scrollWheelZoom={true}
        className="h-full min-h-[460px] w-full"
      >
        {/* Dynamic Camera Fly Controller */}
        <MapFlyController coords={targetFlyCoords} zoom={targetZoom} />

        {/* Map Click Inspector Listener */}
        <MapClickInspector onInspectLocation={handleMapClick} />

        {/* Primary Tile Layer (Streets, Satellite, or Dark) */}
        <TileLayer
          key={currentLayerConfig.id}
          attribution={currentLayerConfig.attribution}
          url={currentLayerConfig.url}
          maxZoom={currentLayerConfig.maxZoom}
        />

        {/* Satellite Hybrid Overlay Layer (Roads, Colony Names, Landmarks) */}
        {currentLayerConfig.overlayUrl && (
          <TileLayer
            key={`${currentLayerConfig.id}_overlay`}
            url={currentLayerConfig.overlayUrl}
            maxZoom={currentLayerConfig.maxZoom}
          />
        )}

        {/* Clicked Inspection Spot Marker */}
        {inspectedLocation && (
          <Marker
            position={[inspectedLocation.lat, inspectedLocation.lng]}
            icon={icons?.INSPECT}
          >
            <Popup>
              <div className="p-1 min-w-[220px]">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-widest pb-1 border-b border-slate-800">
                  <Compass className="h-3 w-3 text-cyan-400" />
                  Inspected Location
                </div>
                {inspectedLocation.isLoading ? (
                  <div className="py-2 text-xs text-slate-400 flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    Fetching Colony & Address...
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <h5 className="text-xs font-bold text-white">
                      {inspectedLocation.address?.colony || "Colony / Sector"}
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      {inspectedLocation.address?.formattedAddress}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      GPS: {inspectedLocation.lat.toFixed(5)}, {inspectedLocation.lng.toFixed(5)}
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render All Incident Markers */}
        {reports.map((report) => {
          const markerIcon = icons
            ? icons[report.priority_level as keyof typeof icons] || icons.HIGH
            : undefined;

          const resolved = resolvedAddresses[report.id];
          const displayColony =
            report.location_name ||
            (resolved ? `${resolved.colony}, ${resolved.city}` : "Colony / Urban Zone");

          return (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={markerIcon}
              eventHandlers={{
                click: () => {
                  setTargetFlyCoords([report.latitude, report.longitude]);
                  setTargetZoom(16);
                  if (onSelectReport) onSelectReport(report);
                },
              }}
            >
              <Popup>
                <div className="p-1 min-w-[250px]">
                  {/* Priority & Score Header */}
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wider border ${
                        report.priority_level === "CRITICAL"
                          ? "bg-rose-950/80 text-rose-400 border-rose-800/80"
                          : report.priority_level === "HIGH"
                          ? "bg-amber-950/80 text-amber-400 border-amber-800/80"
                          : "bg-emerald-950/80 text-emerald-400 border-emerald-800/80"
                      }`}
                    >
                      {report.priority_level}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-civic-cyan">
                      Severity: {report.severity_score}/100
                    </span>
                  </div>

                  {/* Real Colony & City Badge */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-1 rounded-lg">
                    <Building2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{displayColony}</span>
                  </div>

                  {/* Title & Issue Type */}
                  <div className="mt-2">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                      {report.issue_type} • #{report.id}
                    </span>
                    <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                      {report.title}
                    </h4>
                  </div>

                  {/* Detailed Geocoded Address & Coordinates */}
                  <div className="text-[10px] font-mono text-slate-300 mt-1.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-cyan-400 flex-shrink-0" />
                    <span>
                      {resolved?.formattedAddress ||
                        `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                    </span>
                  </div>

                  {/* Summary */}
                  <p className="text-[11px] text-slate-300 mt-1.5 leading-snug line-clamp-2">
                    {report.hazard_summary.split("\n")[0]}
                  </p>

                  {/* Action Callout for Municipal Officers */}
                  <div className="mt-2 p-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300">
                    <span className="text-slate-400 font-semibold block">Nagar Nigam Action:</span>
                    <span className="line-clamp-2">{report.recommended_action}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
