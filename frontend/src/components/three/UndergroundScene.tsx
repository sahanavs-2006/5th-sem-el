import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { UtilityRecord, UTILITY_CATEGORIES, UtilityType } from '../../types/infrastructure';

interface ExcavationBox {
  center_x: number;
  center_y: number;
  length_m: number;
  width_m: number;
  depth_m: number;
  rotation_deg: number;
}

export type CameraViewPreset = '3d' | 'top' | 'cross' | 'side';

interface UndergroundSceneProps {
  utilities: UtilityRecord[];
  selectedUtilityId?: string;
  onSelectUtility: (util: UtilityRecord) => void;
  showSurface: boolean;
  showWater: boolean;
  showDrainage: boolean;
  showElectrical: boolean;
  showGas: boolean;
  showUncertaintyEnvelopes: boolean;
  viewPreset?: CameraViewPreset;
  xrayMode?: boolean;
  depthCutoffM?: number;
  excavation?: ExcavationBox | null;
  hasConflicts?: boolean;
}

export const UndergroundScene: React.FC<UndergroundSceneProps> = ({
  utilities,
  selectedUtilityId,
  onSelectUtility,
  showSurface,
  showWater,
  showDrainage,
  showElectrical,
  showGas,
  showUncertaintyEnvelopes,
  viewPreset = '3d',
  xrayMode = false,
  depthCutoffM = 4.0,
  excavation,
  hasConflicts
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const utilityMeshesRef = useRef<Map<string, THREE.Group>>(new Map());

  // Mouse orbit drag state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0.68, phi: 0.95, radius: 36 });
  const cameraTargetRef = useRef(new THREE.Vector3(0, -1.5, 0));

  // Pulse animation state
  const pulseUniformsRef = useRef<{ time: { value: number } }>({ time: { value: 0 } });

  // Hover state for 3D tooltip
  const [hoveredUtil, setHoveredUtil] = useState<UtilityRecord | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const target = cameraTargetRef.current;

    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  // Switch camera view presets smoothly
  useEffect(() => {
    if (viewPreset === '3d') {
      cameraAngleRef.current = { theta: 0.68, phi: 0.95, radius: 36 };
      cameraTargetRef.current.set(0, -1.5, 0);
    } else if (viewPreset === 'top') {
      cameraAngleRef.current = { theta: 0.0, phi: 0.05, radius: 42 };
      cameraTargetRef.current.set(0, -1.5, 0);
    } else if (viewPreset === 'cross') {
      // Look straight along the X-axis across the road cross-section
      cameraAngleRef.current = { theta: Math.PI / 2, phi: 1.35, radius: 28 };
      cameraTargetRef.current.set(0, -1.8, 0);
    } else if (viewPreset === 'side') {
      // Look longitudinal along the Y-axis
      cameraAngleRef.current = { theta: 0.0, phi: 1.45, radius: 32 };
      cameraTargetRef.current.set(0, -1.8, 0);
    }
    updateCameraPosition();
  }, [viewPreset]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x050a18);
    scene.fog = new THREE.FogExp2(0x050a18, 0.012);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer with soft shadow maps
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Photometric & Geological Lighting
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.85);
    scene.add(ambientLight);

    // Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.bias = -0.0005;
    const d = 35;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Subsurface Fill Light (Subtle Cyan Glow so underground utilities are visible)
    const trenchFill = new THREE.DirectionalLight(0x38bdf8, 0.7);
    trenchFill.position.set(-20, -10, -15);
    scene.add(trenchFill);

    // 5. Build Stratigraphic Strata & Road Assembly
    const strataGroup = new THREE.Group();
    strataGroup.name = 'strata-group';

    const ROAD_LENGTH = 64;
    const ROAD_WIDTH = 18;

    // --- A. Asphalt Road Surface ---
    const asphaltGeo = new THREE.PlaneGeometry(ROAD_LENGTH, ROAD_WIDTH);
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x181c24,
      roughness: 0.82,
      metalness: 0.15,
      transparent: true,
      opacity: xrayMode ? 0.12 : 0.90,
      side: THREE.DoubleSide
    });
    const asphaltMesh = new THREE.Mesh(asphaltGeo, asphaltMat);
    asphaltMesh.rotation.x = -Math.PI / 2;
    asphaltMesh.position.y = 0;
    asphaltMesh.receiveShadow = true;
    strataGroup.add(asphaltMesh);

    // Road Markings: Double Yellow Centerline
    const yellowMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
    [-0.15, 0.15].forEach(yOffset => {
      const yellowLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-ROAD_LENGTH / 2, 0.02, yOffset),
        new THREE.Vector3(ROAD_LENGTH / 2, 0.02, yOffset)
      ]);
      strataGroup.add(new THREE.Line(yellowLineGeo, yellowMat));
    });

    // Road Markings: Dashed White Lane Dividers
    const whiteDashedMat = new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 2.0, gapSize: 1.5 });
    [-4.5, 4.5].forEach(yOffset => {
      const whiteLineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-ROAD_LENGTH / 2, 0.02, yOffset),
        new THREE.Vector3(ROAD_LENGTH / 2, 0.02, yOffset)
      ]);
      const dashed = new THREE.Line(whiteLineGeo, whiteDashedMat);
      dashed.computeLineDistances();
      strataGroup.add(dashed);
    });

    // Concrete Curbs & Sidewalk Footpaths (North and South sides)
    [-ROAD_WIDTH / 2, ROAD_WIDTH / 2].forEach((yPos, i) => {
      // Concrete Curb
      const curbGeo = new THREE.BoxGeometry(ROAD_LENGTH, 0.22, 0.35);
      const curbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
      const curbMesh = new THREE.Mesh(curbGeo, curbMat);
      curbMesh.position.set(0, 0.11, yPos);
      strataGroup.add(curbMesh);

      // Paved Footpath Walkway Slab
      const footGeo = new THREE.BoxGeometry(ROAD_LENGTH, 0.18, 3.5);
      const footMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.85 });
      const footMesh = new THREE.Mesh(footGeo, footMat);
      const sign = i === 0 ? -1 : 1;
      footMesh.position.set(0, 0.09, yPos + sign * 1.9);
      strataGroup.add(footMesh);

      // Cast-Iron Utility Access Manhole Cover on Footpath
      const manholeCoverGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24);
      const manholeCoverMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.4 });
      const cover = new THREE.Mesh(manholeCoverGeo, manholeCoverMat);
      cover.position.set(-6 + i * 12, 0.20, yPos + sign * 1.8);
      strataGroup.add(cover);
    });

    // --- B. Stratigraphic Subsurface Geological Layers (Cutaway Block) ---
    // Layer 1: Compacted Sub-Base Aggregate (-0.18m to -0.55m)
    const subBaseGeo = new THREE.BoxGeometry(ROAD_LENGTH, 0.37, ROAD_WIDTH + 7.0);
    const subBaseMat = new THREE.MeshStandardMaterial({
      color: 0x78716c, // Sandy crushed gravel aggregate
      roughness: 0.9,
      transparent: true,
      opacity: xrayMode ? 0.05 : 0.18
    });
    const subBase = new THREE.Mesh(subBaseGeo, subBaseMat);
    subBase.position.set(0, -0.36, 0);
    strataGroup.add(subBase);

    // Layer 2: Bengaluru Red Sandy Loam Soil Layer (-0.55m to -2.10m)
    const redSoilGeo = new THREE.BoxGeometry(ROAD_LENGTH, 1.55, ROAD_WIDTH + 7.0);
    const redSoilMat = new THREE.MeshStandardMaterial({
      color: 0x8b3a20, // Characteristic Bengaluru terra-cotta red loam
      roughness: 0.95,
      transparent: true,
      opacity: xrayMode ? 0.08 : 0.22
    });
    const redSoil = new THREE.Mesh(redSoilGeo, redSoilMat);
    redSoil.position.set(0, -1.32, 0);
    strataGroup.add(redSoil);

    // Layer 3: Weathered Granitic Gneiss Bedrock Horizon (-2.10m to -4.50m)
    const bedrockGeo = new THREE.BoxGeometry(ROAD_LENGTH, 2.4, ROAD_WIDTH + 7.0);
    const bedrockMat = new THREE.MeshStandardMaterial({
      color: 0x292524, // Deep rocky granite basement
      roughness: 0.98,
      transparent: true,
      opacity: xrayMode ? 0.05 : 0.25
    });
    const bedrock = new THREE.Mesh(bedrockGeo, bedrockMat);
    bedrock.position.set(0, -3.3, 0);
    strataGroup.add(bedrock);

    // --- C. Depth Elevation Graduation Ticks & Metric Rulers ---
    [-1.0, -1.8, -2.4, -3.2].forEach(depth => {
      // Horizontal wire frame grid at key utility depths
      const depthHelper = new THREE.GridHelper(ROAD_LENGTH, 16, 0x0284c7, 0x1e293b);
      depthHelper.position.set(0, depth, 0);
      strataGroup.add(depthHelper);
    });

    // Vertical Depth Posts at the four corners of the cutaway
    [
      { x: -ROAD_LENGTH / 2, z: -(ROAD_WIDTH + 7) / 2 },
      { x: ROAD_LENGTH / 2, z: -(ROAD_WIDTH + 7) / 2 },
      { x: -ROAD_LENGTH / 2, z: (ROAD_WIDTH + 7) / 2 },
      { x: ROAD_LENGTH / 2, z: (ROAD_WIDTH + 7) / 2 }
    ].forEach(pos => {
      const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 4.5, 12);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.3 });
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(pos.x, -2.25, pos.z);
      strataGroup.add(post);
    });

    scene.add(strataGroup);

    // 6. Animation Loop (Flow Pulses & Dynamic Lights)
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      pulseUniformsRef.current.time.value = elapsedTime;

      // Animate flowing pulses along pipeline groups
      utilityMeshesRef.current.forEach((group) => {
        const pulseMesh = group.getObjectByName('flow-pulse');
        if (pulseMesh && pulseMesh instanceof THREE.Mesh) {
          pulseMesh.material.opacity = 0.5 + 0.3 * Math.sin(elapsedTime * 3.5);
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Orbit Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        // Raycast for hover tooltip
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const meshes: THREE.Object3D[] = [];
        utilityMeshesRef.current.forEach(group => {
          group.traverse(child => {
            if (child instanceof THREE.Mesh && child.userData.utilityId) {
              meshes.push(child);
            }
          });
        });

        const intersects = raycaster.intersectObjects(meshes, false);
        if (intersects.length > 0) {
          const uId = intersects[0].object.userData.utilityId;
          const found = utilities.find(u => u.id === uId);
          if (found) {
            setHoveredUtil(found);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }
        } else {
          setHoveredUtil(null);
          setTooltipPos(null);
        }
        return;
      }

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta += deltaX * 0.007;
      cameraAngleRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI / 2 - 0.02, cameraAngleRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraAngleRef.current.radius = Math.max(
        6,
        Math.min(90, cameraAngleRef.current.radius + e.deltaY * 0.025)
      );
      updateCameraPosition();
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      const meshes: THREE.Object3D[] = [];
      utilityMeshesRef.current.forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh && child.userData.utilityId) {
            meshes.push(child);
          }
        });
      });

      const intersects = raycaster.intersectObjects(meshes, false);
      if (intersects.length > 0) {
        const uId = intersects[0].object.userData.utilityId;
        const found = utilities.find(u => u.id === uId);
        if (found) onSelectUtility(found);
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Surface visibility & X-ray mode
  useEffect(() => {
    if (!sceneRef.current) return;
    const strata = sceneRef.current.getObjectByName('strata-group');
    if (strata) strata.visible = showSurface;
  }, [showSurface]);

  // Re-render High-Fidelity Utility Models & Uncertainty Envelopes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous utility meshes
    utilityMeshesRef.current.forEach(group => {
      scene.remove(group);
      group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
    });
    utilityMeshesRef.current.clear();

    const activeUtilities = utilities.filter(u => {
      if (u.category === 'water' && !showWater) return false;
      if (u.category === 'drainage' && !showDrainage) return false;
      if (u.category === 'electrical' && !showElectrical) return false;
      if (u.category === 'gas' && !showGas) return false;
      return true;
    });

    activeUtilities.forEach(util => {
      const uGroup = new THREE.Group();
      uGroup.userData = { utilityId: util.id };
      const catMeta = UTILITY_CATEGORIES[util.category] || UTILITY_CATEGORIES.water;
      const isSelected = util.id === selectedUtilityId;

      const path = util.path_3d;
      if (path && path.length >= 2) {
        const points = path.map(p => new THREE.Vector3(p.x, p.z, p.y));
        const curve = new THREE.CatmullRomCurve3(points);
        const radius = Math.max((util.diameter_mm / 1000.0) / 2.0, 0.08);

        // --- 1. Primary Solid Pipe Tube ---
        const pipeGeo = new THREE.TubeGeometry(curve, 48, radius, 20, false);
        const pipeMat = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xffffff : catMeta.threeColor,
          roughness: util.category === 'drainage' ? 0.8 : 0.25,
          metalness: util.category === 'water' || util.category === 'gas' ? 0.65 : 0.2,
          emissive: isSelected ? 0x60a5fa : catMeta.threeColor,
          emissiveIntensity: isSelected ? 0.7 : 0.25
        });
        const pipeMesh = new THREE.Mesh(pipeGeo, pipeMat);
        pipeMesh.castShadow = true;
        pipeMesh.receiveShadow = true;
        pipeMesh.userData = { utilityId: util.id };
        uGroup.add(pipeMesh);

        // --- 2. Flanged Pipe Collars / Joint Rings ---
        // Create metallic connector bands every few meters along the pipeline
        const numJoints = 5;
        for (let j = 0; j <= numJoints; j++) {
          const t = j / numJoints;
          const pos = curve.getPointAt(t);
          const tangent = curve.getTangentAt(t);

          const collarGeo = new THREE.CylinderGeometry(radius * 1.35, radius * 1.35, 0.18, 16);
          const collarMat = new THREE.MeshStandardMaterial({
            color: 0x475569,
            metalness: 0.85,
            roughness: 0.2
          });
          const collarMesh = new THREE.Mesh(collarGeo, collarMat);
          collarMesh.position.copy(pos);
          collarMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
          uGroup.add(collarMesh);
        }

        // --- 3. Gas Warning Tape (Section 8 Standard: Floating 300mm above gas pipe) ---
        if (util.category === 'gas') {
          const tapePoints = points.map(pt => new THREE.Vector3(pt.x, pt.y + 0.35, pt.z));
          const tapeCurve = new THREE.CatmullRomCurve3(tapePoints);
          const tapeGeo = new THREE.TubeGeometry(tapeCurve, 32, 0.04, 6, false);
          const tapeMat = new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            emissive: 0xeab308,
            emissiveIntensity: 0.6
          });
          const tapeMesh = new THREE.Mesh(tapeGeo, tapeMat);
          uGroup.add(tapeMesh);
        }

        // --- 4. Concrete Warning Protective Tiles for 11kV Electrical Cable ---
        if (util.category === 'electrical') {
          const tilePoints = points.map(pt => new THREE.Vector3(pt.x, pt.y + 0.18, pt.z));
          for (let k = 0; k < 6; k++) {
            const t = k / 5;
            const pt = new THREE.CatmullRomCurve3(tilePoints).getPointAt(t);
            const tileGeo = new THREE.BoxGeometry(1.2, 0.05, 0.45);
            const tileMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.8 });
            const tileMesh = new THREE.Mesh(tileGeo, tileMat);
            tileMesh.position.copy(pt);
            uGroup.add(tileMesh);
          }
        }

        // --- 5. Vertical Access Manhole Shafts for Drainage / Sewer Mains ---
        if (util.category === 'drainage') {
          points.forEach((pt, idx) => {
            if (idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) {
              const shaftHeight = Math.abs(pt.y);
              const shaftGeo = new THREE.CylinderGeometry(0.55, 0.65, shaftHeight, 20);
              const shaftMat = new THREE.MeshStandardMaterial({
                color: 0x64748b,
                roughness: 0.9,
                transparent: true,
                opacity: 0.85
              });
              const shaft = new THREE.Mesh(shaftGeo, shaftMat);
              shaft.position.set(pt.x, pt.y / 2.0, pt.z);
              uGroup.add(shaft);
            }
          });
        }

        // --- 6. Flow Pulse Animation Layer ---
        const pulseGeo = new THREE.TubeGeometry(curve, 48, radius * 1.05, 12, false);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: catMeta.threeColor,
          transparent: true,
          opacity: 0.35,
          wireframe: true
        });
        const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
        pulseMesh.name = 'flow-pulse';
        uGroup.add(pulseMesh);

        // --- 7. 95% Volumetric Gaussian Uncertainty Envelope ---
        if (showUncertaintyEnvelopes) {
          const uncRadius = Math.max(radius + 0.15, radius + (util.horizontal_uncertainty_m * 1.25));
          
          // Outer Soft Transparent Bubble
          const envGeo = new THREE.TubeGeometry(curve, 32, uncRadius, 16, false);
          const envMat = new THREE.MeshStandardMaterial({
            color: catMeta.threeColor,
            transparent: true,
            opacity: 0.18,
            roughness: 0.9,
            side: THREE.DoubleSide
          });
          const envMesh = new THREE.Mesh(envGeo, envMat);
          envMesh.userData = { utilityId: util.id };
          uGroup.add(envMesh);

          // Inner Wireframe Uncertainty Cage
          const wireMat = new THREE.MeshBasicMaterial({
            color: catMeta.threeColor,
            wireframe: true,
            transparent: true,
            opacity: 0.28
          });
          const wireMesh = new THREE.Mesh(envGeo, wireMat);
          uGroup.add(wireMesh);
        }
      }

      scene.add(uGroup);
      utilityMeshesRef.current.set(util.id, uGroup);
    });
  }, [utilities, selectedUtilityId, showWater, showDrainage, showElectrical, showGas, showUncertaintyEnvelopes]);

  // Render Excavation Prism Trench
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const existingExc = scene.getObjectByName('excavation-prism');
    if (existingExc) scene.remove(existingExc);

    if (excavation) {
      const excGroup = new THREE.Group();
      excGroup.name = 'excavation-prism';

      const trenchL = excavation.length_m;
      const trenchW = excavation.width_m;
      const trenchD = excavation.depth_m;

      const trenchGeo = new THREE.BoxGeometry(trenchL, trenchD, trenchW);
      const trenchMat = new THREE.MeshStandardMaterial({
        color: hasConflicts ? 0xef4444 : 0xf59e0b,
        transparent: true,
        opacity: 0.55,
        roughness: 0.2,
        emissive: hasConflicts ? 0xef4444 : 0xf59e0b,
        emissiveIntensity: 0.35,
        side: THREE.DoubleSide
      });
      const trenchMesh = new THREE.Mesh(trenchGeo, trenchMat);
      trenchMesh.position.set(excavation.center_x, -trenchD / 2.0, excavation.center_y);
      excGroup.add(trenchMesh);

      // Warning Edge Wireframe
      const edgeGeo = new THREE.EdgesGeometry(trenchGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: hasConflicts ? 0xffffff : 0xfde047,
        linewidth: 3
      });
      const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
      wireframe.position.copy(trenchMesh.position);
      excGroup.add(wireframe);

      // Warning Stanchions / Safety Drums at trench corners
      [
        { x: -trenchL / 2, z: -trenchW / 2 },
        { x: trenchL / 2, z: -trenchW / 2 },
        { x: -trenchL / 2, z: trenchW / 2 },
        { x: trenchL / 2, z: trenchW / 2 }
      ].forEach(corner => {
        const coneGeo = new THREE.ConeGeometry(0.25, 0.8, 12);
        const coneMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
        const cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.set(excavation.center_x + corner.x, 0.4, excavation.center_y + corner.z);
        excGroup.add(cone);
      });

      scene.add(excGroup);
    }
  }, [excavation, hasConflicts]);

  return (
    <div className="relative w-full h-full bg-[#050a18] select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport HUD Overlay */}
      <div className="absolute top-4 left-4 bg-[#0a142c]/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 shadow-xl pointer-events-none">
        <div className="font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Photorealistic Subsurface 3D Cutaway</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Left Drag: Orbit • Wheel: Zoom • Click Pipe: Full Inspector
        </div>
      </div>

      {/* Interactive Hover 3D Tooltip */}
      {hoveredUtil && tooltipPos && (
        <div
          style={{ left: `${tooltipPos.x + 15}px`, top: `${tooltipPos.y + 15}px` }}
          className="absolute z-30 pointer-events-none bg-[#0c1836]/95 backdrop-blur-md border border-blue-500/50 rounded-xl p-3 shadow-2xl text-xs text-slate-200 space-y-1 animate-in fade-in"
        >
          <div className="font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: UTILITY_CATEGORIES[hoveredUtil.category]?.hexColor }}></span>
            <span>{hoveredUtil.utility_code} — {hoveredUtil.category_name}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Nominal Depth: <span className="font-mono text-emerald-400 font-bold">{hoveredUtil.nominal_depth_m.toFixed(2)}m</span> ({hoveredUtil.depth_measurement_status})
          </div>
          <div className="text-[11px] text-slate-400">
            ASCE Level: <span className="font-bold text-blue-400">{hoveredUtil.asce_quality_level}</span> • Confidence: <span className="font-bold text-white">{(hoveredUtil.confidence_score * 100).toFixed(0)}%</span>
          </div>
          <div className="text-[10px] text-slate-500">
            95% Spatial Envelope: ±{hoveredUtil.horizontal_uncertainty_m}m Horiz / ±{hoveredUtil.vertical_uncertainty_m}m Depth
          </div>
        </div>
      )}

      {/* Depth Horizon & Geological Strata Legend */}
      <div className="absolute bottom-4 left-4 bg-[#0a142c]/90 backdrop-blur-md border border-slate-800 rounded-xl px-4 py-2.5 text-[11.5px] font-mono text-slate-300 shadow-xl flex items-center gap-4 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-600"></span>
          <span>Asphalt (0.0m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#8b3a20]"></span>
          <span>Bengaluru Red Loam (-0.5m to -2.1m)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#292524]"></span>
          <span>Granite Bedrock (-2.1m to -4.5m)</span>
        </div>
      </div>
    </div>
  );
};
