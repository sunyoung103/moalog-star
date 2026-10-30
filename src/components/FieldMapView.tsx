import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Specimen, UserStats, NaturalistPersona } from '../types';
import { MapPin, Compass, Globe, Moon, Camera, Plus, Minus, Crosshair, ChevronDown, ChevronUp, ChevronRight, Check, X, Footprints, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import { HOTSPOT_DATA, SPECIES_ECOLOGY_ENCYCLOPEDIA, NATURALIST_PERSONAS } from '../data/hotspots';

interface FieldMapViewProps {
  specimens: Specimen[];
  userStats?: UserStats;
  onUpdatePersona?: (persona: NaturalistPersona) => void;
  onSelectSpecimen: (specimen: Specimen) => void;
  onOpenLens?: () => void;
  onOpenExportCard?: (specimen?: Specimen, mode?: 'specimen' | 'summary') => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  isProUser?: boolean;
  onOpenPaywall?: () => void;
  onOpenMemoFeed: () => void;
}

type MapLayerType = 'eco' | 'satellite' | 'dark';

// Free Tile Server URLs
const TILE_SERVERS: Record<MapLayerType, { url: string; maxZoom: number }> = {
  eco: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 18,
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
  },
};

interface BioBlitzCenter {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  habitatType: string;
}

const BIOBLITZ_HOTSPOTS: BioBlitzCenter[] = [
  {
    id: 'hotspot-1',
    name: '서울숲 습지생태원',
    description: '성동구 뚝섬로 · 도심 수변 및 조류 서식지',
    lat: 37.5445,
    lng: 127.0374,
    habitatType: '수변 습지 & 활엽수림',
  },
  {
    id: 'hotspot-2',
    name: '남산 야외식물원',
    description: '용산구 이태원동 · 온대 야생화 군락',
    lat: 37.5492,
    lng: 126.993,
    habitatType: '온대 활엽수림',
  },
  {
    id: 'hotspot-3',
    name: '북한산 우이령길',
    description: '강북구 우이동 · 국립공원 계곡 및 산림',
    lat: 37.6625,
    lng: 127.005,
    habitatType: '침엽·활엽 혼효림',
  },
  {
    id: 'hotspot-4',
    name: '연남동 경의선 숲길',
    description: '마포구 연남동 · 도심 선형 공원',
    lat: 37.5615,
    lng: 126.9242,
    habitatType: '도심 하천 & 선형 정원',
  },
  {
    id: 'hotspot-5',
    name: '잠실 석촌호수',
    description: '송파구 잠실동 · 호수 수변',
    lat: 37.5106,
    lng: 127.1023,
    habitatType: '호수 수변',
  },
  {
    id: 'hotspot-6',
    name: '제주 토끼섬 해안',
    description: '구좌읍 하도리 · 천연기념물 해안',
    lat: 33.5188,
    lng: 126.8660,
    habitatType: '해안 암반 지대',
  },
];

// Haversine distance in km
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GPS coordinate resolution helper
function getSpecimenGpsCoord(sp: Specimen, index: number): { lat: number; lng: number; regionTag: string } {
  if (typeof sp.locationCoord?.lat === 'number' && typeof sp.locationCoord?.lng === 'number') {
    return {
      lat: sp.locationCoord.lat,
      lng: sp.locationCoord.lng,
      regionTag: sp.locationCoord.city || '지정 위치',
    };
  }

  const fullText = `${sp.locationCoord?.city || ''} ${sp.locationCoord?.name || ''} ${sp.observations?.[0]?.location || ''} ${sp.koreanName}`;
  let baseLat = 37.5445;
  let baseLng = 127.0374;
  let regionTag = '서울숲';

  if (fullText.includes('제주') || fullText.includes('토끼섬') || fullText.includes('곶자왈') || fullText.includes('문섬')) {
    baseLat = 33.2858;
    baseLng = 126.2753;
    regionTag = '제주';
  } else if (fullText.includes('남산') || fullText.includes('한남')) {
    baseLat = 37.5492;
    baseLng = 126.993;
    regionTag = '남산';
  } else if (fullText.includes('올림픽공원') || fullText.includes('몽촌') || fullText.includes('잠실')) {
    baseLat = 37.5209;
    baseLng = 127.1214;
    regionTag = '올림픽공원';
  } else if (fullText.includes('샛강') || fullText.includes('여의도')) {
    baseLat = 37.5186;
    baseLng = 126.9242;
    regionTag = '여의도';
  } else if (fullText.includes('북한산') || fullText.includes('우이령')) {
    baseLat = 37.6625;
    baseLng = 127.005;
    regionTag = '북한산';
  }

  const hash = (sp.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) + index * 19) % 100;
  const angle = (hash / 100) * 2 * Math.PI;
  const radius = 0.003 + ((hash % 11) / 11) * 0.007;

  return {
    lat: baseLat + Math.cos(angle) * radius,
    lng: baseLng + Math.sin(angle) * radius,
    regionTag,
  };
}

export const FieldMapView: React.FC<FieldMapViewProps> = ({
  specimens,
  userStats,
  onSelectSpecimen,
  onOpenLens,
  onOpenMemoFeed,
  searchQuery = '',
}) => {
  // Only collected specimens
  const collectedSpecimens = useMemo(() => {
    return specimens.filter((s) => s.isCollected && !s.isPending);
  }, [specimens]);

  // Leaflet map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const radarGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [mapLayer, setMapLayer] = useState<MapLayerType>('eco');
  const [isHotspotMenuOpen, setIsHotspotMenuOpen] = useState(false);
  const [radarCenter, setRadarCenter] = useState<BioBlitzCenter>(BIOBLITZ_HOTSPOTS[0]);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [activeFilter, setActiveFilter] = useState('전체');

  // Selected Pin for Floating Inspection Card
  const [selectedPinSpecimen, setSelectedPinSpecimen] = useState<Specimen | null>(null);

  // Bottom Drawer State
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(true);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'radar' | 'trail'>('radar');

  // User persona
  const activePersonaKey = userStats?.persona || 'general';
  const currentPersona = NATURALIST_PERSONAS[activePersonaKey] || NATURALIST_PERSONAS.general;

  // Specimen GPS points
  const specimenGpsPoints = useMemo(() => {
    return collectedSpecimens.map((sp, idx) => {
      const coord = getSpecimenGpsCoord(sp, idx);
      const distFromRadar = getHaversineDistanceKm(radarCenter.lat, radarCenter.lng, coord.lat, coord.lng);
      return {
        specimen: sp,
        lat: coord.lat,
        lng: coord.lng,
        regionTag: coord.regionTag,
        distanceKm: distFromRadar,
        isInsideRadar: distFromRadar <= 1.0,
      };
    });
  }, [collectedSpecimens, radarCenter]);

  // Filtered by Search Query & Active Filter
  const filteredPoints = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return specimenGpsPoints.filter((pt) => {
      const sp = pt.specimen;
      
      // Filter by Search Query
      const matchesSearch = !q || 
        (sp.koreanName || '').toLowerCase().includes(q) ||
        (sp.scientificName || '').toLowerCase().includes(q) ||
        (pt.regionTag || '').toLowerCase().includes(q);

      // Filter by Category/Type
      let matchesFilter = true;
      if (activeFilter === '전체') matchesFilter = true;
      else if (activeFilter === '내 포착') matchesFilter = sp.isCollected;
      else if (activeFilter === '즐겨찾기') matchesFilter = !!sp.isFavorite; // Assuming isFavorite exists on Specimen
      else matchesFilter = sp.category === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [specimenGpsPoints, searchQuery, activeFilter]);

  // Recommended Nearby Targets
  const recommendedNearbySpecies = useMemo(() => {
    const recommendedCategories = currentPersona?.recommendedCategories || ['plants', 'birds', 'insects', 'mammals'];

    const matchingEncyclopediaSpecies = SPECIES_ECOLOGY_ENCYCLOPEDIA.filter((e) => {
      if (recommendedCategories.includes('all' as any)) return true;
      return recommendedCategories.includes(e.category as any);
    });

    const currentHotspotData = HOTSPOT_DATA.find(
      (h) => h.id === radarCenter.id
    );

    const targets: {
      koreanName: string;
      scientificName: string;
      rarity: 'common' | 'uncommon' | 'rare';
      chancePercent: number;
    }[] = [];

    if (currentHotspotData?.targetSpecies) {
      currentHotspotData.targetSpecies.forEach((tgt) => {
        const eco = SPECIES_ECOLOGY_ENCYCLOPEDIA.find((e) => e.koreanName === tgt.koreanName);
        if (eco && (recommendedCategories.includes('all' as any) || recommendedCategories.includes(eco.category as any))) {
          if (!targets.some((t) => t.koreanName === tgt.koreanName)) {
            targets.push(tgt);
          }
        }
      });
    }

    matchingEncyclopediaSpecies.forEach((eco, idx) => {
      if (!targets.some((t) => t.koreanName === eco.koreanName)) {
        const rarity = idx % 5 === 4 ? 'rare' : idx % 3 === 2 ? 'uncommon' : 'common';
        const chance = rarity === 'common' ? Math.max(75, 96 - idx * 2) : rarity === 'uncommon' ? 55 : 35;
        targets.push({
          koreanName: eco.koreanName,
          scientificName: eco.scientificName,
          rarity,
          chancePercent: chance,
        });
      }
    });

    return targets.slice(0, 10).map((tgt) => {
      const matchingSpecimen = collectedSpecimens.find(
        (sp) => sp.koreanName === tgt.koreanName || sp.scientificName === tgt.scientificName
      );
      const encyclopedia = SPECIES_ECOLOGY_ENCYCLOPEDIA.find(
        (e) => e.koreanName === tgt.koreanName || e.scientificName === tgt.scientificName
      );

      return {
        ...tgt,
        isDiscovered: !!matchingSpecimen,
        collectedSpecimen: matchingSpecimen,
        category: encyclopedia?.category || 'birds',
        habitatTip: encyclopedia?.habitat || '주변 도심 공원 수풀 및 수변',
      };
    });
  }, [radarCenter, collectedSpecimens, currentPersona]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [radarCenter.lat, radarCenter.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const tileServer = TILE_SERVERS[mapLayer];
    const tileLayer = L.tileLayer(tileServer.url, {
      maxZoom: tileServer.maxZoom,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const radarGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersGroupRef.current = markersGroup;
    radarGroupRef.current = radarGroup;

    // Click on blank map closes inspector card
    map.on('click', () => {
      setSelectedPinSpecimen(null);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileServer = TILE_SERVERS[mapLayer];
    const newTileLayer = L.tileLayer(tileServer.url, {
      maxZoom: tileServer.maxZoom,
    });
    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [mapLayer]);

  // Render BioBlitz Radar Circles (1km subtle ring)
  useEffect(() => {
    if (!mapInstanceRef.current || !radarGroupRef.current) return;

    const radarGroup = radarGroupRef.current;
    radarGroup.clearLayers();

    // 1km radar perimeter
    const outerCircle = L.circle([radarCenter.lat, radarCenter.lng], {
      radius: 1000,
      color: '#10B981',
      weight: 1.5,
      dashArray: '4, 4',
      fillColor: '#10B981',
      fillOpacity: 0.05,
    });
    radarGroup.addLayer(outerCircle);

    // Center pulse beacon
    const radarCenterIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500/20 animate-ping"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-md z-10"></div>
        </div>
      `,
      className: 'custom-radar-center-icon',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const centerMarker = L.marker([radarCenter.lat, radarCenter.lng], {
      icon: radarCenterIcon,
    });
    radarGroup.addLayer(centerMarker);
  }, [radarCenter]);

  // Render Specimen Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (filteredPoints.length === 0) return;

    filteredPoints.forEach((pt) => {
      const sp = pt.specimen;
      const isSelected = selectedPinSpecimen?.id === sp.id;
      const photo = sp.stickerImage || sp.originalImage || sp.observations?.[0]?.photoUrl || '';

      const iconHtml = `
        <div class="relative cursor-pointer transition-transform duration-200 ${
          isSelected ? 'scale-125 z-50' : 'hover:scale-110 z-10'
        }">
          <div class="w-9 h-9 rounded-full p-0.5 shadow-md flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-stone-900 ring-4 ring-emerald-400 ring-offset-1'
              : 'bg-white border-2 border-white'
          }">
            <div class="w-full h-full rounded-full overflow-hidden bg-stone-100">
              <img src="${photo}" alt="${sp.koreanName}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
            </div>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 ${
            isSelected ? 'bg-stone-900' : 'bg-white'
          } rotate-45 shadow-2xs"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-specimen-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedPinSpecimen(sp);
        mapInstanceRef.current?.flyTo([pt.lat, pt.lng], 15, { duration: 0.8 });
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredPoints, selectedPinSpecimen]);

  // Pan to Hotspot
  const handleSelectHotspot = (hotspot: BioBlitzCenter) => {
    setRadarCenter(hotspot);
    setIsHotspotMenuOpen(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hotspot.lat, hotspot.lng], 14, { duration: 1.0 });
    }
  };

  // Locate User Real GPS
  const handleLocateUser = () => {
    if (!navigator.geolocation) return;
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingUser(false);
        const userLoc: BioBlitzCenter = {
          id: 'user-current-gps',
          name: '내 현재 GPS 위치',
          description: `${pos.coords.latitude.toFixed(4)}°, ${pos.coords.longitude.toFixed(4)}°`,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          habitatType: '실시간 탐사 위치',
        };
        setRadarCenter(userLoc);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLoc.lat, userLoc.lng], 15, { duration: 1.0 });
        }
      },
      () => {
        setIsLocatingUser(false);
        handleSelectHotspot(BIOBLITZ_HOTSPOTS[0]);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-[calc(100vh-120px)] sm:h-[calc(100vh-130px)] bg-[#f4f2ee] overflow-hidden flex flex-col font-geist select-none">
      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* ========================================================
          TOP CONTROL BAR (기획서 F-2 기준 간소화)
          ======================================================== */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Location Dropdown */}
          <button
            type="button"
            onClick={() => setIsHotspotMenuOpen(!isHotspotMenuOpen)}
            className="px-4 py-2 rounded-full bg-white/95 backdrop-blur-md text-stone-900 border border-stone-200/90 shadow-sm text-xs font-bold flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-transform"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{radarCenter.name}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isHotspotMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Right: Memo Button */}
          <button
            type="button"
            onClick={onOpenMemoFeed}
            className="px-4 py-2 rounded-full bg-stone-900 text-white shadow-sm text-xs font-bold flex items-center gap-1.5 pointer-events-auto active:scale-95 transition-transform"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>메모 피드</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {[
            { label: '전체', value: '전체' },
            { label: '즐겨찾기', value: '즐겨찾기' },
            { label: '내 포착', value: '내 포착' },
            { label: '조류', value: 'birds' },
            { label: '곤충', value: 'insects' },
            { label: '식물', value: 'plants' },
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm text-[11px] font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer ${
                activeFilter === filter.value
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white/90 border-stone-200/80 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Zoom & Location Controls */}
      <div className="absolute right-3 bottom-36 z-20 flex flex-col rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-sm overflow-hidden">
        <button type="button" onClick={() => mapInstanceRef.current?.zoomIn()} className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100"><Plus className="w-5 h-5" /></button>
        <button type="button" onClick={() => mapInstanceRef.current?.zoomOut()} className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100"><Minus className="w-5 h-5" /></button>
        <button type="button" onClick={handleLocateUser} className="w-10 h-10 flex items-center justify-center text-stone-700 hover:bg-stone-100"><Crosshair className="w-4 h-4" /></button>
      </div>

    </div>
  );
};
