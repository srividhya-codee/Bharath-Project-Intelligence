import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Project } from '../../types';
import { State3DData, getStatusColor, MapFilters } from './3DTypes';
import { INDIA_STATES_DATA, createStateMesh } from './State3D';
import { createProjectMarker3D } from './ProjectMarker3D';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { ProjectDetailsPanel } from './ProjectDetailsPanel';
import {
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  MapPin,
  Compass,
  Building2,
  TrendingDown,
  TrendingUp,
  Layers
} from 'lucide-react';

interface IndiaMap3DProps {
  projects: Project[];
  selectedProjectCode?: string | null;
  onSelectProject?: (code: string) => void;
  onOpenAssistantWithQuery?: (query: string) => void;
  initialStateFilter?: string;
  className?: string;
  onViewTimeline?: (code: string) => void;
}

export const IndiaMap3D: React.FC<IndiaMap3DProps> = ({
  projects,
  selectedProjectCode,
  onSelectProject,
  onOpenAssistantWithQuery,
  initialStateFilter,
  className = '',
  onViewTimeline
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Groups
  const statesGroupRef = useRef<THREE.Group>(new THREE.Group());
  const markersGroupRef = useRef<THREE.Group>(new THREE.Group());

  // Interactive Hover & Selection States
  const [hoveredEntity, setHoveredEntity] = useState<{
    type: 'project' | 'state';
    title: string;
    subtitle: string;
    metrics: string;
    x: number;
    y: number;
  } | null>(null);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [selectedState, setSelectedState] = useState<string>(initialStateFilter || 'All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('All');
  const [selectedCapital, setSelectedCapital] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Camera Target Interpolation
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(2, 38, 40));
  const cameraLookAt = useRef<THREE.Vector3>(new THREE.Vector3(2, 0, -8));

  // Extract Categories and States
  const categories = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.sector))).sort()], [projects]);
  const states = useMemo(() => ['All', ...Array.from(new Set(INDIA_STATES_DATA.map(s => s.name))).sort()], []);

  // Filtered Projects for 3D Markers
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchState = selectedState === 'All' || p.state === selectedState;
      const matchCat = selectedCategory === 'All' || p.sector === selectedCategory;
      const matchRisk = selectedRisk === 'All' || p.prediction.riskBand === selectedRisk;
      const statusMeta = getStatusColor(p);
      const matchStatus =
        selectedStatus === 'All' ||
        statusMeta.type === selectedStatus ||
        p.status === selectedStatus;

      // Schedule filter
      let matchSchedule = true;
      if (selectedSchedule === 'on_schedule') {
        matchSchedule = p.delayDays <= 0 && p.evm.spi >= 0.95;
      } else if (selectedSchedule === 'delayed_moderate') {
        matchSchedule = p.delayDays > 0 && p.delayDays <= 60;
      } else if (selectedSchedule === 'delayed_severe') {
        matchSchedule = p.delayDays > 60 || p.evm.spi < 0.85;
      }

      // Capital Outlay filter
      let matchCapital = true;
      if (selectedCapital === 'under_1k') {
        matchCapital = p.approvedCostCr < 1000;
      } else if (selectedCapital === '1k_5k') {
        matchCapital = p.approvedCostCr >= 1000 && p.approvedCostCr <= 5000;
      } else if (selectedCapital === 'over_5k') {
        matchCapital = p.approvedCostCr > 5000;
      }

      const matchSearch =
        !searchQuery ||
        p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase());

      return matchState && matchCat && matchRisk && matchStatus && matchSchedule && matchCapital && matchSearch;
    });
  }, [projects, selectedState, selectedCategory, selectedStatus, selectedRisk, selectedSchedule, selectedCapital, searchQuery]);

  // Set active project if selectedProjectCode changes
  useEffect(() => {
    if (selectedProjectCode) {
      const match = projects.find(p => p.projectCode === selectedProjectCode);
      if (match) setActiveProject(match);
    }
  }, [selectedProjectCode, projects]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Very light cool gray
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.5,
      1000
    );
    camera.position.copy(cameraTargetPos.current);
    camera.lookAt(cameraLookAt.current);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.2);
    sunLight.position.set(30, 60, 40);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 160;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.4);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    // Ocean / Base ground plane with subtle boundary grid
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.8,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle coordinate grid
    const grid = new THREE.GridHelper(120, 30, 0xcbd5e1, 0xe2e8f0);
    grid.position.y = 0.01;
    scene.add(grid);

    // Add Groups to Scene
    scene.add(statesGroupRef.current);
    scene.add(markersGroupRef.current);

    // Mouse Interaction Controls (Manual Smooth Orbit)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let spherical = new THREE.Spherical().setFromVector3(
      camera.position.clone().sub(cameraLookAt.current)
    );

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        // Rotate camera around lookAt
        spherical.theta -= deltaX * 0.007;
        spherical.phi = Math.max(0.15, Math.min(Math.PI / 2.1, spherical.phi - deltaY * 0.006));

        camera.position.setFromSpherical(spherical).add(cameraLookAt.current);
        camera.lookAt(cameraLookAt.current);
        cameraTargetPos.current.copy(camera.position);

        previousMousePosition = { x: e.clientX, y: e.clientY };
        setHoveredEntity(null);
        return;
      }

      // Raycasting for interactive hover
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      // Check markers first
      const markerHits = raycaster.intersectObjects(markersGroupRef.current.children, true);
      if (markerHits.length > 0) {
        let pObj = markerHits[0].object;
        while (pObj.parent && !pObj.userData?.project) {
          pObj = pObj.parent as any;
        }
        if (pObj.userData?.project) {
          const p: Project = pObj.userData.project;
          container.style.cursor = 'pointer';
          setHoveredEntity({
            type: 'project',
            title: `${p.projectCode}: ${p.name}`,
            subtitle: `${p.sector} • ${p.state} • ${p.status}`,
            metrics: `Capex: ₹${p.approvedCostCr} Cr | Progress: ${p.actualPhysicalPct}% | SPI: ${p.evm.spi}`,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          return;
        }
      }

      // Check states
      const stateHits = raycaster.intersectObjects(statesGroupRef.current.children, true);
      if (stateHits.length > 0) {
        let sObj = stateHits[0].object;
        if (sObj.userData?.stateName) {
          container.style.cursor = 'pointer';
          const sData = sObj.userData.data as State3DData;
          setHoveredEntity({
            type: 'state',
            title: sObj.userData.stateName,
            subtitle: `${sData?.totalProjects || 0} National Projects Monitored`,
            metrics: `Outlay: ₹${(sData?.capitalOutlayCr || 0).toLocaleString()} Cr | Avg SPI: ${sData?.avgSpi || 1.0}`,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          return;
        }
      }

      container.style.cursor = 'default';
      setHoveredEntity(null);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(12, Math.min(95, spherical.radius + e.deltaY * 0.05));
      camera.position.setFromSpherical(spherical).add(cameraLookAt.current);
      camera.lookAt(cameraLookAt.current);
      cameraTargetPos.current.copy(camera.position);
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      // Check markers
      const markerHits = raycaster.intersectObjects(markersGroupRef.current.children, true);
      if (markerHits.length > 0) {
        let pObj = markerHits[0].object;
        while (pObj.parent && !pObj.userData?.project) {
          pObj = pObj.parent as any;
        }
        if (pObj.userData?.project) {
          const p: Project = pObj.userData.project;
          setActiveProject(p);
          if (onSelectProject) onSelectProject(p.projectCode);
          return;
        }
      }

      // Check states
      const stateHits = raycaster.intersectObjects(statesGroupRef.current.children, true);
      if (stateHits.length > 0) {
        const sObj = stateHits[0].object;
        if (sObj.userData?.stateName) {
          setSelectedState(prev => (prev === sObj.userData.stateName ? 'All' : sObj.userData.stateName));
        }
      }
    };

    const onDoubleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);

      const stateHits = raycaster.intersectObjects(statesGroupRef.current.children, true);
      if (stateHits.length > 0) {
        const sObj = stateHits[0].object;
        if (sObj.userData?.data) {
          const sData: State3DData = sObj.userData.data;
          cameraLookAt.current.set(sData.center[0], 0, -sData.center[1]);
          spherical.radius = 20;
          camera.position.setFromSpherical(spherical).add(cameraLookAt.current);
          camera.lookAt(cameraLookAt.current);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);
    container.addEventListener('dblclick', onDoubleClick);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing halos animation on project markers
      markersGroupRef.current.children.forEach(marker => {
        const halo = marker.getObjectByName('pulsingHalo');
        if (halo) {
          const isHighRisk = halo.userData?.isHighRisk;
          const isSelected = halo.userData?.isSelected;
          const pulseSpeed = isHighRisk ? 4.0 : 2.5;
          const pulseAmp = isSelected ? 0.25 : isHighRisk ? 0.22 : 0.12;
          const scale = 1.0 + Math.sin(elapsedTime * pulseSpeed + marker.id * 0.5) * pulseAmp;
          halo.scale.set(scale, scale, scale);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      container.removeEventListener('dblclick', onDoubleClick);
      renderer.dispose();
    };
  }, []);

  // Update State Meshes when selectedState changes
  useEffect(() => {
    const statesGroup = statesGroupRef.current;
    while (statesGroup.children.length > 0) {
      const child = statesGroup.children[0];
      statesGroup.remove(child);
    }

    INDIA_STATES_DATA.forEach(stateData => {
      const isSelected = selectedState === stateData.name;
      const { mesh, line } = createStateMesh(stateData, isSelected, false);
      statesGroup.add(mesh, line);
    });
  }, [selectedState]);

  // Update Project 3D Markers when filtered projects change
  useEffect(() => {
    const markersGroup = markersGroupRef.current;
    while (markersGroup.children.length > 0) {
      const child = markersGroup.children[0];
      markersGroup.remove(child);
    }

    filteredProjects.forEach(proj => {
      const isSelected = activeProject?.projectCode === proj.projectCode;
      const markerGroup = createProjectMarker3D(proj, isSelected);
      markersGroup.add(markerGroup);
    });
  }, [filteredProjects, activeProject]);

  // Camera Control Actions
  const handleResetView = () => {
    if (!cameraRef.current) return;
    cameraLookAt.current.set(2, 0, -8);
    cameraRef.current.position.set(2, 38, 40);
    cameraRef.current.lookAt(cameraLookAt.current);
    setSelectedState('All');
  };

  const handleZoomIn = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(0.85);
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.multiplyScalar(1.15);
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleRotateLeft = () => {
    if (!cameraRef.current) return;
    const pos = cameraRef.current.position.clone().sub(cameraLookAt.current);
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.35);
    cameraRef.current.position.copy(pos.add(cameraLookAt.current));
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleRotateRight = () => {
    if (!cameraRef.current) return;
    const pos = cameraRef.current.position.clone().sub(cameraLookAt.current);
    pos.applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.35);
    cameraRef.current.position.copy(pos.add(cameraLookAt.current));
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleTopDownView = () => {
    if (!cameraRef.current) return;
    cameraLookAt.current.set(2, 0, -8);
    cameraRef.current.position.set(2, 55, -8.01);
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleIsoView = () => {
    if (!cameraRef.current) return;
    cameraLookAt.current.set(2, 0, -8);
    cameraRef.current.position.set(2, 38, 40);
    cameraRef.current.lookAt(cameraLookAt.current);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current?.parentElement) return;
    if (!document.fullscreenElement) {
      containerRef.current.parentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen failed:', err);
      });
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden relative flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : className || 'h-[620px]'
      }`}
    >
      {/* 1. Top Filters Ribbon */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 p-3 z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search 3D project or state..."
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700"
            />
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={e => setSelectedState(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All States (18)</option>
            {states.filter(s => s !== 'All').map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All Sectors</option>
            {categories.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="critical">Critical Delay</option>
            <option value="completed">Completed</option>
          </select>

          {/* Risk Level Filter */}
          <select
            value={selectedRisk}
            onChange={e => setSelectedRisk(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All Risk Tiers</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          {/* Schedule Status Filter */}
          <select
            value={selectedSchedule}
            onChange={e => setSelectedSchedule(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All Schedules</option>
            <option value="on_schedule">On Schedule (SPI ≥ 0.95)</option>
            <option value="delayed_moderate">Delayed (&le; 60 days)</option>
            <option value="delayed_severe">Critical Delay (&gt; 60 days)</option>
          </select>

          {/* Capital Outlay Filter */}
          <select
            value={selectedCapital}
            onChange={e => setSelectedCapital(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-700 cursor-pointer"
          >
            <option value="All">All Capital Outlays</option>
            <option value="under_1k">&lt; ₹1,000 Cr</option>
            <option value="1k_5k">₹1,000 - ₹5,000 Cr</option>
            <option value="over_5k">&gt; ₹5,000 Cr</option>
          </select>

          {(selectedState !== 'All' || selectedCategory !== 'All' || selectedStatus !== 'All' || selectedRisk !== 'All' || selectedSchedule !== 'All' || selectedCapital !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedState('All');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSelectedRisk('All');
                setSelectedSchedule('All');
                setSelectedCapital('All');
                setSearchQuery('');
              }}
              className="text-blue-700 hover:text-blue-900 font-semibold text-[11px] underline ml-1"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* 3D Map Camera Controls */}
        <MapControls
          onResetView={handleResetView}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          onTopDownView={handleTopDownView}
          onIsoView={handleIsoView}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />
      </div>

      {/* 2. WebGL 3D Canvas Container */}
      <div ref={containerRef} className="w-full flex-1 relative select-none">
        {/* Floating Controls HUD Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-lg px-2.5 py-1 text-[11px] font-medium text-slate-600 shadow-sm pointer-events-none z-10 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-blue-700" />
          <span>Left Drag: Orbit • Scroll: Zoom • Right Drag: Pan • Click Marker: Details</span>
        </div>

        {/* 3D Map Legend at Bottom Left */}
        <div className="absolute bottom-3 left-3 z-10 max-w-md pointer-events-auto">
          <MapLegend />
        </div>

        {/* Floating Raycast Tooltip */}
        {hoveredEntity && !activeProject && (
          <div
            className="absolute bg-slate-900/95 text-white border border-slate-700 rounded-xl p-3 shadow-2xl text-xs pointer-events-none z-20 backdrop-blur-md max-w-xs animate-in fade-in duration-100"
            style={{
              left: `${Math.min(window.innerWidth - 300, hoveredEntity.x + 15)}px`,
              top: `${Math.max(10, hoveredEntity.y - 70)}px`
            }}
          >
            <div className="font-bold text-sm text-slate-100">{hoveredEntity.title}</div>
            <div className="text-[11px] text-amber-300 font-medium mt-0.5">{hoveredEntity.subtitle}</div>
            <div className="text-[10px] text-slate-300 font-mono mt-1 pt-1 border-t border-slate-800">
              {hoveredEntity.metrics}
            </div>
            <div className="text-[9px] text-blue-400 mt-1 font-semibold">
              Click to inspect details • Double-click state to zoom
            </div>
          </div>
        )}
      </div>

      {/* 3. Slide-In Project Details Panel */}
      <ProjectDetailsPanel
        project={activeProject}
        onClose={() => setActiveProject(null)}
        onViewProject={code => {
          if (onSelectProject) onSelectProject(code);
        }}
        onViewTimeline={code => {
          if (onViewTimeline) onViewTimeline(code);
          else if (onSelectProject) onSelectProject(code);
        }}
        onAIAnalysis={query => {
          if (onOpenAssistantWithQuery) onOpenAssistantWithQuery(query);
        }}
      />
    </div>
  );
};
