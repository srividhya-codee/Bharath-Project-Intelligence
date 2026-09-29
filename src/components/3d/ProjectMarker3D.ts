import * as THREE from 'three';
import { Project } from '../../types';
import { getStatusColor } from './3DTypes';
import { createInfrastructureModel } from './InfrastructureModel';
import { INDIA_STATES_DATA } from './State3D';

// Convert lat / long to 3D scene coordinates aligned with state boundaries
export function projectCoordsTo3D(project: Project): [number, number, number] {
  // If state is recognized in INDIA_STATES_DATA, use its center with a slight deterministic offset
  const stateData = INDIA_STATES_DATA.find(s => s.name.toLowerCase() === project.state.toLowerCase());
  
  if (stateData) {
    // Deterministic offset based on project ID
    const seed = project.id * 1.618;
    const offsetX = ((seed % 5) - 2.5) * 0.8;
    const offsetZ = (((seed * 3) % 5) - 2.5) * 0.8;
    const x = stateData.center[0] + offsetX;
    const z = -stateData.center[1] + offsetZ; // Flip Y to Z
    return [x, 0.6, z];
  }

  // Fallback lat/lng conversion: Center India approx (Lat 22, Lng 78)
  const x = (project.longitude - 78) * 1.8;
  const z = -(project.latitude - 22) * 1.8;
  return [x, 0.6, z];
}

export function createProjectMarker3D(
  project: Project,
  isSelected: boolean = false
): THREE.Group {
  const group = new THREE.Group();
  const [x, y, z] = projectCoordsTo3D(project);
  group.position.set(x, y, z);

  const statusMeta = getStatusColor(project);

  // 1. Base pedestal ring
  const baseRingGeo = new THREE.CylinderGeometry(0.55, 0.7, 0.12, 16);
  const baseRingMat = new THREE.MeshStandardMaterial({
    color: statusMeta.hex,
    roughness: 0.3,
    metalness: 0.4,
    emissive: statusMeta.hex,
    emissiveIntensity: isSelected ? 0.6 : 0.25
  });
  const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  baseRing.position.y = 0.06;
  group.add(baseRing);

  // 2. Elevated pillar
  const pillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.8, 8);
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.6
  });
  const pillar = new THREE.Mesh(pillarGeo, pillarMat);
  pillar.position.y = 0.5;
  group.add(pillar);

  // 3. Category infrastructure model on top
  const infraModel = createInfrastructureModel(project.sector, statusMeta.hex, 0.75, project.name);
  infraModel.position.y = 0.9;
  group.add(infraModel);

  // 4. Floating pulsing status halo
  const haloGeo = new THREE.TorusGeometry(0.4, 0.05, 8, 24);
  const isHighRisk = project.prediction.riskBand === 'High' || project.prediction.riskBand === 'Critical' || project.status === 'Delayed';
  const haloMat = new THREE.MeshBasicMaterial({
    color: statusMeta.hex,
    transparent: true,
    opacity: isSelected ? 0.95 : isHighRisk ? 0.85 : 0.65
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = 2.1;
  halo.name = 'pulsingHalo';
  halo.userData = { isHighRisk, isSelected };
  group.add(halo);

  // 5. Invisible raycast hit target cylinder
  const hitGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.4, 8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitMesh = new THREE.Mesh(hitGeo, hitMat);
  hitMesh.position.y = 1.2;
  hitMesh.userData = { type: 'project', project, code: project.projectCode };
  group.add(hitMesh);

  group.userData = { type: 'project', project, code: project.projectCode };

  return group;
}
