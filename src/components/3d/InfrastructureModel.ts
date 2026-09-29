import * as THREE from 'three';

export function createInfrastructureModel(
  categoryOrSector: string,
  statusHex: number,
  scale: number = 1.0,
  projectName: string = ''
): THREE.Group {
  const group = new THREE.Group();

  const primaryMaterial = new THREE.MeshStandardMaterial({
    color: statusHex,
    roughness: 0.35,
    metalness: 0.25,
    emissive: statusHex,
    emissiveIntensity: 0.25
  });

  const concreteMaterial = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.65,
    metalness: 0.1
  });

  const darkSteelMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.7
  });

  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.8
  });

  const targetStr = (categoryOrSector + ' ' + projectName).toLowerCase();

  // 1. BRIDGES (Suspension / Cable-Stayed Bridge)
  if (targetStr.includes('bridge') || targetStr.includes('flyover') || targetStr.includes('viaduct')) {
    // Bridge Deck
    const deckGeo = new THREE.BoxGeometry(2.2 * scale, 0.08 * scale, 0.5 * scale);
    const deck = new THREE.Mesh(deckGeo, darkSteelMaterial);
    deck.position.y = 0.45 * scale;

    // Twin Suspension Towers
    const towerGeo = new THREE.BoxGeometry(0.12 * scale, 1.3 * scale, 0.12 * scale);
    const tower1 = new THREE.Mesh(towerGeo, concreteMaterial);
    tower1.position.set(-0.6 * scale, 0.65 * scale, 0);
    const tower2 = new THREE.Mesh(towerGeo, concreteMaterial);
    tower2.position.set(0.6 * scale, 0.65 * scale, 0);

    // Cross beam between towers
    const crossBeamGeo = new THREE.BoxGeometry(1.3 * scale, 0.06 * scale, 0.08 * scale);
    const crossBeam = new THREE.Mesh(crossBeamGeo, primaryMaterial);
    crossBeam.position.set(0, 1.15 * scale, 0);

    // Cable catenaries (angled lines/boxes)
    const cableGeo1 = new THREE.BoxGeometry(1.4 * scale, 0.04 * scale, 0.04 * scale);
    const cable1 = new THREE.Mesh(cableGeo1, primaryMaterial);
    cable1.position.set(0, 0.8 * scale, 0.15 * scale);
    cable1.rotation.z = 0.1;

    group.add(deck, tower1, tower2, crossBeam, cable1);
    return group;
  }

  // 2. DAMS / WATER RESOURCES
  if (targetStr.includes('dam') || targetStr.includes('water') || targetStr.includes('irrigation') || targetStr.includes('hydro')) {
    // Curved Dam Wall
    const damGeo = new THREE.CylinderGeometry(1.2 * scale, 1.4 * scale, 0.8 * scale, 16, 1, false, 0, Math.PI);
    const dam = new THREE.Mesh(damGeo, concreteMaterial);
    dam.position.set(0, 0.4 * scale, 0);
    dam.rotation.y = -Math.PI / 2;

    // Reservoir Water behind dam
    const resGeo = new THREE.CylinderGeometry(0.9 * scale, 0.9 * scale, 0.6 * scale, 16, 1, false, 0, Math.PI);
    const res = new THREE.Mesh(resGeo, waterMaterial);
    res.position.set(0, 0.35 * scale, -0.3 * scale);
    res.rotation.y = -Math.PI / 2;

    // Spillway Gates / Powerhouse crest
    const crestGeo = new THREE.BoxGeometry(0.8 * scale, 0.25 * scale, 0.4 * scale);
    const crest = new THREE.Mesh(crestGeo, primaryMaterial);
    crest.position.set(0, 0.7 * scale, 0.1 * scale);

    group.add(dam, res, crest);
    return group;
  }

  // 3. PORTS / HARBORS
  if (targetStr.includes('port') || targetStr.includes('shipping') || targetStr.includes('maritime') || targetStr.includes('harbor')) {
    // Concrete Jetty / Pier
    const jettyGeo = new THREE.BoxGeometry(1.8 * scale, 0.15 * scale, 1.1 * scale);
    const jetty = new THREE.Mesh(jettyGeo, concreteMaterial);
    jetty.position.y = 0.1 * scale;

    // Harbor Water
    const seaGeo = new THREE.BoxGeometry(2.0 * scale, 0.08 * scale, 0.5 * scale);
    const sea = new THREE.Mesh(seaGeo, waterMaterial);
    sea.position.set(0, 0.05 * scale, 0.6 * scale);

    // Cargo Container Gantry Crane
    const craneLegGeo = new THREE.BoxGeometry(0.08 * scale, 1.2 * scale, 0.08 * scale);
    const cl1 = new THREE.Mesh(craneLegGeo, darkSteelMaterial);
    cl1.position.set(-0.35 * scale, 0.65 * scale, -0.2 * scale);
    const cl2 = new THREE.Mesh(craneLegGeo, darkSteelMaterial);
    cl2.position.set(0.35 * scale, 0.65 * scale, -0.2 * scale);

    const boomGeo = new THREE.BoxGeometry(1.5 * scale, 0.12 * scale, 0.25 * scale);
    const boom = new THREE.Mesh(boomGeo, primaryMaterial);
    boom.position.set(0.2 * scale, 1.25 * scale, 0);

    // Container Cargo Stack
    const containerGeo = new THREE.BoxGeometry(0.5 * scale, 0.25 * scale, 0.3 * scale);
    const cont = new THREE.Mesh(containerGeo, primaryMaterial);
    cont.position.set(-0.4 * scale, 0.25 * scale, 0.1 * scale);

    group.add(jetty, sea, cl1, cl2, boom, cont);
    return group;
  }

  // 4. AIRPORTS (Runway & Control Tower)
  if (targetStr.includes('airport') || targetStr.includes('aviation')) {
    // Runway strip
    const runwayGeo = new THREE.BoxGeometry(2.2 * scale, 0.06 * scale, 0.5 * scale);
    const runway = new THREE.Mesh(runwayGeo, darkSteelMaterial);
    runway.position.y = 0.03 * scale;

    // ATC Tower base
    const baseGeo = new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 0.4 * scale, 8);
    const base = new THREE.Mesh(baseGeo, concreteMaterial);
    base.position.set(0.6 * scale, 0.2 * scale, 0);

    // ATC Tower Stem
    const stemGeo = new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, 1.0 * scale, 8);
    const stem = new THREE.Mesh(stemGeo, concreteMaterial);
    stem.position.set(0.6 * scale, 0.8 * scale, 0);

    // ATC Glass Cab
    const cabGeo = new THREE.CylinderGeometry(0.4 * scale, 0.28 * scale, 0.35 * scale, 8);
    const cab = new THREE.Mesh(cabGeo, primaryMaterial);
    cab.position.set(0.6 * scale, 1.35 * scale, 0);

    // Radar dome
    const radomeGeo = new THREE.SphereGeometry(0.18 * scale, 8, 8);
    const radome = new THREE.Mesh(radomeGeo, darkSteelMaterial);
    radome.position.set(0.6 * scale, 1.6 * scale, 0);

    group.add(runway, base, stem, cab, radome);
    return group;
  }

  // 5. RAILWAYS / RAILWAY STATIONS / METRO
  if (targetStr.includes('rail') || targetStr.includes('metro') || targetStr.includes('train')) {
    // Ballast bed
    const ballastGeo = new THREE.BoxGeometry(1.8 * scale, 0.12 * scale, 0.8 * scale);
    const ballast = new THREE.Mesh(ballastGeo, concreteMaterial);
    group.add(ballast);

    // Parallel rails
    const railGeo = new THREE.BoxGeometry(1.8 * scale, 0.08 * scale, 0.06 * scale);
    const rail1 = new THREE.Mesh(railGeo, darkSteelMaterial);
    rail1.position.set(0, 0.1 * scale, -0.2 * scale);
    const rail2 = new THREE.Mesh(railGeo, darkSteelMaterial);
    rail2.position.set(0, 0.1 * scale, 0.2 * scale);
    group.add(rail1, rail2);

    // Station Canopy / Overhead Mast
    const pylonGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 1.0 * scale, 6);
    const pylon = new THREE.Mesh(pylonGeo, darkSteelMaterial);
    pylon.position.set(0.7 * scale, 0.5 * scale, 0.3 * scale);

    const canopyGeo = new THREE.BoxGeometry(1.2 * scale, 0.1 * scale, 0.6 * scale);
    const canopy = new THREE.Mesh(canopyGeo, primaryMaterial);
    canopy.position.set(0, 0.9 * scale, 0);

    group.add(pylon, canopy);
    return group;
  }

  // 6. ROADS & HIGHWAYS
  if (targetStr.includes('road') || targetStr.includes('highway') || targetStr.includes('corridor') || targetStr.includes('expressway')) {
    // Dual Carriageway Deck
    const deckGeo = new THREE.BoxGeometry(2.0 * scale, 0.14 * scale, 0.9 * scale);
    const deck = new THREE.Mesh(deckGeo, darkSteelMaterial);
    deck.position.y = 0.45 * scale;

    // Central Median
    const medianGeo = new THREE.BoxGeometry(2.0 * scale, 0.08 * scale, 0.12 * scale);
    const median = new THREE.Mesh(medianGeo, primaryMaterial);
    median.position.set(0, 0.55 * scale, 0);

    // Bridge piers beneath
    const pierGeo = new THREE.CylinderGeometry(0.14 * scale, 0.16 * scale, 0.45 * scale, 8);
    const pier1 = new THREE.Mesh(pierGeo, concreteMaterial);
    pier1.position.set(-0.6 * scale, 0.225 * scale, 0);
    const pier2 = new THREE.Mesh(pierGeo, concreteMaterial);
    pier2.position.set(0.6 * scale, 0.225 * scale, 0);

    group.add(deck, median, pier1, pier2);
    return group;
  }

  // 7. INDUSTRIAL / PETROLEUM / MANUFACTURING / ENERGY
  if (targetStr.includes('industrial') || targetStr.includes('sez') || targetStr.includes('petroleum') || targetStr.includes('solar') || targetStr.includes('power') || targetStr.includes('gas') || targetStr.includes('refinery')) {
    // Factory Warehouse Base
    const warehouseGeo = new THREE.BoxGeometry(1.2 * scale, 0.5 * scale, 0.9 * scale);
    const warehouse = new THREE.Mesh(warehouseGeo, primaryMaterial);
    warehouse.position.set(-0.2 * scale, 0.25 * scale, 0);

    // Twin Storage Silos
    const siloGeo = new THREE.CylinderGeometry(0.22 * scale, 0.22 * scale, 0.8 * scale, 12);
    const silo1 = new THREE.Mesh(siloGeo, concreteMaterial);
    silo1.position.set(0.6 * scale, 0.4 * scale, -0.2 * scale);
    const silo2 = new THREE.Mesh(siloGeo, concreteMaterial);
    silo2.position.set(0.6 * scale, 0.4 * scale, 0.2 * scale);

    // Exhaust Chimney / Stack
    const stackGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.4 * scale, 8);
    const stack = new THREE.Mesh(stackGeo, darkSteelMaterial);
    stack.position.set(-0.5 * scale, 0.7 * scale, -0.2 * scale);

    group.add(warehouse, silo1, silo2, stack);
    return group;
  }

  // 8. GOVERNMENT & CIVIC BUILDINGS (Civic portico, pillars, dome)
  const podiumGeo = new THREE.BoxGeometry(1.2 * scale, 0.2 * scale, 1.2 * scale);
  const podium = new THREE.Mesh(podiumGeo, concreteMaterial);
  podium.position.y = 0.1 * scale;

  const colonnadeGeo = new THREE.BoxGeometry(0.9 * scale, 0.6 * scale, 0.9 * scale);
  const colonnade = new THREE.Mesh(colonnadeGeo, primaryMaterial);
  colonnade.position.y = 0.5 * scale;

  // Central Dome
  const domeGeo = new THREE.SphereGeometry(0.35 * scale, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, primaryMaterial);
  dome.position.y = 0.8 * scale;

  // Finial / Spire
  const spireGeo = new THREE.CylinderGeometry(0.04 * scale, 0.04 * scale, 0.5 * scale, 6);
  const spire = new THREE.Mesh(spireGeo, darkSteelMaterial);
  spire.position.y = 1.25 * scale;

  group.add(podium, colonnade, dome, spire);
  return group;
}
