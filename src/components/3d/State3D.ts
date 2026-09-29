import * as THREE from 'three';
import { State3DData } from './3DTypes';

export const INDIA_STATES_DATA: State3DData[] = [
  {
    name: 'Jammu and Kashmir',
    code: 'JK',
    points: [[-4, 18], [0, 21], [3, 19], [4, 14], [1, 12], [-3, 14]],
    center: [-0.5, 16],
    capitalOutlayCr: 4200,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 1,
    avgSpi: 0.88
  },
  {
    name: 'Himachal Pradesh',
    code: 'HP',
    points: [[-1, 13], [3, 14], [4, 11], [1, 9], [-1, 10]],
    center: [1.5, 11.5],
    capitalOutlayCr: 3100,
    totalProjects: 2,
    delayedProjects: 0,
    highRiskProjects: 0,
    avgSpi: 0.96
  },
  {
    name: 'Punjab',
    code: 'PB',
    points: [[-3.5, 12], [-0.5, 12], [0, 8.5], [-3, 8], [-4, 10]],
    center: [-2, 10],
    capitalOutlayCr: 4800,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.92
  },
  {
    name: 'Uttarakhand',
    code: 'UK',
    points: [[2, 11], [6, 10], [6.5, 7.5], [3, 7.5], [1.5, 9]],
    center: [3.8, 9],
    capitalOutlayCr: 3600,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.89
  },
  {
    name: 'Haryana',
    code: 'HR',
    points: [[-1.5, 8.5], [2, 8.5], [2.5, 5], [-1, 4.5], [-2, 6.5]],
    center: [0.5, 6.5],
    capitalOutlayCr: 5200,
    totalProjects: 4,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.94
  },
  {
    name: 'Rajasthan',
    code: 'RJ',
    points: [[-10, 8], [-3, 8], [-1, 3], [-2, -2], [-6, -4], [-11, 0], [-11, 5]],
    center: [-6, 2.5],
    capitalOutlayCr: 12400,
    totalProjects: 6,
    delayedProjects: 2,
    highRiskProjects: 2,
    avgSpi: 0.82
  },
  {
    name: 'Uttar Pradesh',
    code: 'UP',
    points: [[1.5, 6.5], [8, 6.5], [11, 2], [9, -3], [3, -3], [0.5, 1], [1, 4]],
    center: [5, 1.5],
    capitalOutlayCr: 19800,
    totalProjects: 8,
    delayedProjects: 3,
    highRiskProjects: 2,
    avgSpi: 0.84
  },
  {
    name: 'Bihar',
    code: 'BR',
    points: [[11, 3.5], [17, 3], [17, -2], [11.5, -2.5], [9.5, 0]],
    center: [14, 0.5],
    capitalOutlayCr: 9600,
    totalProjects: 4,
    delayedProjects: 1,
    highRiskProjects: 1,
    avgSpi: 0.86
  },
  {
    name: 'West Bengal',
    code: 'WB',
    points: [[17, 2], [18.5, 4], [20, -1], [18, -6], [16, -4], [16.5, -1]],
    center: [17.5, -1.5],
    capitalOutlayCr: 11200,
    totalProjects: 5,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.91
  },
  {
    name: 'Assam',
    code: 'AS',
    points: [[21, 2], [28, 3], [29, 0], [25, -2], [22, -1]],
    center: [25, 0.5],
    capitalOutlayCr: 7200,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.89
  },
  {
    name: 'Gujarat',
    code: 'GJ',
    points: [[-13, -2], [-6, -2], [-5, -6], [-7, -9], [-12, -9], [-15, -6]],
    center: [-9, -5.5],
    capitalOutlayCr: 21500,
    totalProjects: 8,
    delayedProjects: 2,
    highRiskProjects: 1,
    avgSpi: 0.87
  },
  {
    name: 'Madhya Pradesh',
    code: 'MP',
    points: [[-4, -2], [4, -2], [7, -6], [5, -11], [-3, -10], [-5, -6]],
    center: [0.5, -6],
    capitalOutlayCr: 14800,
    totalProjects: 6,
    delayedProjects: 2,
    highRiskProjects: 2,
    avgSpi: 0.81
  },
  {
    name: 'Jharkhand',
    code: 'JH',
    points: [[11, -2], [16, -2], [15, -7], [10.5, -6]],
    center: [13, -4.5],
    capitalOutlayCr: 6800,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.89
  },
  {
    name: 'Odisha',
    code: 'OD',
    points: [[10.5, -7], [15.5, -6], [14.5, -13], [9, -12]],
    center: [12.5, -9.5],
    capitalOutlayCr: 10400,
    totalProjects: 4,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.92
  },
  {
    name: 'Chhattisgarh',
    code: 'CG',
    points: [[5, -6], [9.5, -6.5], [8.5, -14], [4.5, -13], [4.5, -9]],
    center: [6.8, -10],
    capitalOutlayCr: 7900,
    totalProjects: 3,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.90
  },
  {
    name: 'Maharashtra',
    code: 'MH',
    points: [[-8, -7], [3, -8], [2.5, -15], [-4, -15], [-9, -12]],
    center: [-2.5, -11.5],
    capitalOutlayCr: 28400,
    totalProjects: 9,
    delayedProjects: 2,
    highRiskProjects: 1,
    avgSpi: 0.93
  },
  {
    name: 'Telangana',
    code: 'TS',
    points: [[-1, -14], [4, -13], [5, -18], [0, -18.5]],
    center: [2, -16],
    capitalOutlayCr: 9400,
    totalProjects: 4,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.94
  },
  {
    name: 'Andhra Pradesh',
    code: 'AP',
    points: [[3, -16], [9, -13], [7.5, -23], [2, -22], [3.5, -19]],
    center: [5.5, -19],
    capitalOutlayCr: 13200,
    totalProjects: 5,
    delayedProjects: 1,
    highRiskProjects: 1,
    avgSpi: 0.88
  },
  {
    name: 'Karnataka',
    code: 'KA',
    points: [[-5, -15], [0, -16], [1.5, -24], [-2, -26], [-6, -21]],
    center: [-2, -20.5],
    capitalOutlayCr: 18900,
    totalProjects: 7,
    delayedProjects: 1,
    highRiskProjects: 0,
    avgSpi: 0.95
  },
  {
    name: 'Kerala',
    code: 'KL',
    points: [[-3.5, -25], [-1.5, -25], [-0.5, -31], [-2.5, -31]],
    center: [-2, -28],
    capitalOutlayCr: 7600,
    totalProjects: 3,
    delayedProjects: 0,
    highRiskProjects: 0,
    avgSpi: 0.97
  },
  {
    name: 'Tamil Nadu',
    code: 'TN',
    points: [[-1, -23], [4.5, -22], [4, -31], [0, -32], [-0.5, -27]],
    center: [1.8, -27],
    capitalOutlayCr: 24600,
    totalProjects: 9,
    delayedProjects: 4,
    highRiskProjects: 3,
    avgSpi: 0.81
  }
];

export function createStateMesh(
  stateData: State3DData,
  isSelected: boolean = false,
  isHovered: boolean = false
): { mesh: THREE.Mesh; line: THREE.LineSegments } {
  const shape = new THREE.Shape();

  stateData.points.forEach((pt, i) => {
    if (i === 0) shape.moveTo(pt[0], pt[1]);
    else shape.lineTo(pt[0], pt[1]);
  });
  shape.closePath();

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: isSelected ? 0.85 : isHovered ? 0.7 : 0.45,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.08,
    bevelThickness: 0.08
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2); // Lay flat on X-Z plane

  // Base state color: Sophisticated Government palette
  let colorHex = 0xe2e8f0; // Clean light gray
  if (isSelected) {
    colorHex = 0x1565c0; // Government blue highlight
  } else if (isHovered) {
    colorHex = 0x93c5fd; // Soft blue hover
  } else if (stateData.avgSpi < 0.85) {
    colorHex = 0xfef3c7; // Subtle amber tint for delayed states
  }

  const material = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.45,
    metalness: 0.15,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { type: 'state', stateName: stateData.name, data: stateData };

  // Boundary edges
  const edges = new THREE.EdgesGeometry(geometry);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: isSelected ? 0x0b1f3a : isHovered ? 0x1565c0 : 0x94a3b8,
    linewidth: isSelected ? 2 : 1
  });
  const line = new THREE.LineSegments(edges, lineMaterial);
  line.position.copy(mesh.position);

  return { mesh, line };
}
