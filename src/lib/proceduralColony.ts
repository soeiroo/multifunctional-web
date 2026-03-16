export const KENNEY_MODELS = [
  "alien.glb", "astronautA.glb", "astronautB.glb", "barrel.glb", "barrels.glb", "barrels_rail.glb", "bones.glb", 
  "chimney.glb", "chimney_detailed.glb", "corridor.glb", "corridor_corner.glb", "corridor_cornerRound.glb", 
  "corridor_cornerRoundWindow.glb", "corridor_cross.glb", "corridor_detailed.glb", "corridor_end.glb", 
  "corridor_open.glb", "corridor_roof.glb", "corridor_split.glb", "corridor_wall.glb", "corridor_wallCorner.glb", 
  "corridor_window.glb", "corridor_windowClosed.glb", "craft_cargoA.glb", "craft_cargoB.glb", "craft_miner.glb", 
  "craft_racer.glb", "craft_speederA.glb", "craft_speederB.glb", "craft_speederC.glb", "craft_speederD.glb", 
  "crater.glb", "craterLarge.glb", "desk_chair.glb", "desk_chairArms.glb", "desk_chairStool.glb", "desk_computer.glb", 
  "desk_computerCorner.glb", "desk_computerScreen.glb", "gate_complex.glb", "gate_simple.glb", "hangar_largeA.glb", 
  "hangar_largeB.glb", "hangar_roundA.glb", "hangar_roundB.glb", "hangar_roundGlass.glb", "hangar_smallA.glb", 
  "hangar_smallB.glb", "machine_barrel.glb", "machine_barrelLarge.glb", "machine_generator.glb", "machine_generatorLarge.glb", 
  "machine_wireless.glb", "machine_wirelessCable.glb", "meteor.glb", "meteor_detailed.glb", "meteor_half.glb", 
  "monorail_trackCornerLarge.glb", "monorail_trackCornerSmall.glb", "monorail_trackSlope.glb", "monorail_trackStraight.glb", 
  "monorail_trackSupport.glb", "monorail_trackSupportCorner.glb", "monorail_trainBox.glb", "monorail_trainCargo.glb", 
  "monorail_trainEnd.glb", "monorail_trainFlat.glb", "monorail_trainFront.glb", "monorail_trainPassenger.glb", 
  "pipe_corner.glb", "pipe_cornerDiagonal.glb", "pipe_cornerRound.glb", "pipe_cornerRoundLarge.glb", "pipe_cross.glb", 
  "pipe_end.glb", "pipe_entrance.glb", "pipe_open.glb", "pipe_rampLarge.glb", "pipe_rampSmall.glb", "pipe_ring.glb", 
  "pipe_ringHigh.glb", "pipe_ringHighEnd.glb", "pipe_ringSupport.glb", "pipe_split.glb", "pipe_straight.glb", 
  "pipe_supportHigh.glb", "pipe_supportLow.glb", "platform_center.glb", "platform_corner.glb", "platform_cornerOpen.glb", 
  "platform_cornerRound.glb", "platform_end.glb", "platform_high.glb", "platform_large.glb", "platform_long.glb", 
  "platform_low.glb", "platform_side.glb", "platform_small.glb", "platform_smallDiagonal.glb", "platform_straight.glb", 
  "rail.glb", "rail_corner.glb", "rail_end.glb", "rail_middle.glb", "rock.glb", "rock_crystals.glb", "rock_crystalsLargeA.glb", 
  "rock_crystalsLargeB.glb", "rock_largeA.glb", "rock_largeB.glb", "rocket_baseA.glb", "rocket_baseB.glb", "rocket_finsA.glb", 
  "rocket_finsB.glb", "rocket_fuelA.glb", "rocket_fuelB.glb", "rocket_sidesA.glb", "rocket_sidesB.glb", "rocket_topA.glb", 
  "rocket_topB.glb", "rocks_smallA.glb", "rocks_smallB.glb", "rover.glb", "satelliteDish.glb", "satelliteDish_detailed.glb", 
  "satelliteDish_large.glb", "stairs.glb", "stairs_corner.glb", "stairs_short.glb", "structure.glb", "structure_closed.glb", 
  "structure_detailed.glb", "structure_diagonal.glb", "supports_high.glb", "supports_low.glb", "terrain.glb", "terrain_ramp.glb", 
  "terrain_rampLarge.glb", "terrain_rampLarge_detailed.glb", "terrain_roadCorner.glb", "terrain_roadCross.glb", 
  "terrain_roadEnd.glb", "terrain_roadSplit.glb", "terrain_roadStraight.glb", "terrain_side.glb", "terrain_sideCliff.glb", 
  "terrain_sideCorner.glb", "terrain_sideCornerInner.glb", "terrain_sideEnd.glb", "turret_double.glb", "turret_single.glb", 
  "weapon_gun.glb", "weapon_rifle.glb"
];

// PRNG Seed
export function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

export type Category = "habitats" | "labs" | "communication" | "energy" | "structures" | "paths" | "terrain" | "props" | "misc";

export function getCategories() {
  const map: Record<Category, string[]> = {
    habitats: [],
    labs: [],
    communication: [],
    energy: [],
    structures: [],
    paths: [],
    terrain: [],
    props: [],
    misc: []
  };

  KENNEY_MODELS.forEach((model) => {
    const l = model.toLowerCase();
    if (l.match(/dome|hab|module|station|hangar_round|structure_closed|hangar_large/)) map.habitats.push(model);
    else if (l.match(/lab|research|desk|computer|chair/)) map.labs.push(model);
    else if (l.match(/tower|antenna|satellite|wireless/)) map.communication.push(model);
    else if (l.match(/solar|panel|generator|machine|battery/)) map.energy.push(model);
    else if (l.match(/hangar|pad|landing|platform|structure|roof/)) map.structures.push(model);
    else if (l.match(/tunnel|path|corridor|pipe|stair|monorail|rail|road/)) map.paths.push(model);
    else if (l.match(/rock|terrain|crater|mars|sand|meteor/)) map.terrain.push(model);
    else if (l.match(/prop|lamp|bench|barrel|craft|rover|alien|astronaut|turret|weapon|bone|chimney|gate/)) map.props.push(model);
    else map.misc.push(model);
  });

  return map;
}

export interface RenderInstance {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  colliderType?: "cuboid" | "trimesh" | "hull" | "ball" | null;
}

export interface SpecialZones {
  rocket: [number, number, number];
  videoHub: [number, number, number];
  comms: [number, number, number];
  arquivos: [number, number, number];
}

interface GridCell {
  x: number;
  z: number;
  type: string;
  rotationY: number;
  models: RenderInstance[];
  connected: boolean;
}

export function generateColony(seedStr: string): { instances: RenderInstance[], zones: SpecialZones } {
  // Convert string to numeric seed
  let seedNum = 0;
  for (let i = 0; i < seedStr.length; i++) seedNum += seedStr.charCodeAt(i);
  const prng = mulberry32(seedNum);

  function randRange(min: number, max: number) {
    return min + Math.floor(prng() * (max - min));
  }

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(prng() * arr.length)];
  }

  const RENDER_PATH = "/models/kenney_space-kit/Models/GLTF format/";
  const cats = getCategories();

  // Grid limits
  const TILE_SIZE = 10;
  const GRID_SIZE = 15;
  const CENTER = 7;
  const grid: (GridCell | null)[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));

  const instances: RenderInstance[] = [];
  const zones: SpecialZones = {
    rocket: [0, 0, 0],
    videoHub: [0, 0, 0],
    comms: [0, 0, 0],
    arquivos: [0, 0, 0],
  };

  const toWorld = (gx: number, gz: number, yOffset = 0): [number, number, number] => [
    (gx - CENTER) * TILE_SIZE,
    yOffset,
    (gz - CENTER) * TILE_SIZE
  ];

  // Helper to place models in a cell
  function placeAt(gx: number, gz: number, file: string | string[], typeStr: string, opts: Partial<RenderInstance> = {}) {
    if (gx < 0 || gz < 0 || gx >= GRID_SIZE || gz >= GRID_SIZE) return;
    if (!grid[gx][gz]) grid[gx][gz] = { x: gx, z: gz, type: typeStr, rotationY: opts.rotation?.[1] || 0, models: [], connected: true };
    
    const worldPos = toWorld(gx, gz, opts.position?.[1] || 0);
    if (opts.position) {
      worldPos[0] += opts.position[0];
      worldPos[2] += opts.position[2];
    }

    const files = Array.isArray(file) ? file : [file];
    
    files.forEach((f, i) => {
      // For stacked items like rockets, we increase Y
      const currentPos: [number, number, number] = [...worldPos];
      if (files.length > 1) {
          // If rocket parts, stack them roughly by 2.5 units each scaling loop
          currentPos[1] += (i * 2.3);
      }
      
      const instance: RenderInstance = {
        url: RENDER_PATH + f,
        position: currentPos,
        rotation: opts.rotation || [0, 0, 0],
        scale: opts.scale || 3, // slightly bigger base scale for modular map
        colliderType: opts.colliderType !== undefined ? opts.colliderType : "trimesh"
      };
      grid[gx][gz]!.models.push(instance);
      instances.push(instance);
    });
  }

  // --- GENERATION ALGORITHM (WFC / Growth Pattern) ---

  // 1. Center Core (Video Hub)
  const coreHangar = pick(cats.habitats);
  placeAt(CENTER, CENTER, coreHangar, "core_hub", { scale: 3.5 });
  zones.videoHub = toWorld(CENTER, CENTER, 1.5);
  zones.videoHub[2] += 3; // Offset label to front

  // Track frontier for growth
  const DIRS = [ [0,1], [1,0], [0,-1], [-1,0] ]; // N, E, S, W
  const ROTS = [ 0, Math.PI/2, Math.PI, -Math.PI/2 ]; // Matching rotations for corridors

  let frontiers = [ { x: CENTER, z: CENTER, depth: 0 } ];

  const MAX_DEPTH = 3;

  while(frontiers.length > 0) {
    const nextFrontiers = [];
    for (const f of frontiers) {
      if (f.depth >= MAX_DEPTH) continue;

      // Randomly spawn paths outward
      for (let i = 0; i < DIRS.length; i++) {
        if (prng() > 0.45) continue; // 55% chance to skip a direction to make it organic

        const dx = DIRS[i][0];
        const dz = DIRS[i][1];
        const nx = f.x + dx;
        const nz = f.z + dz;

        if (nx < 2 || nz < 2 || nx > GRID_SIZE-3 || nz > GRID_SIZE-3) continue;
        if (grid[nx][nz]) continue; // Already occupied

        // Place a corridor connecting them
        const pathModel = prng() > 0.5 ? "corridor_window.glb" : "corridor.glb";
        // Corridor aligns with the growth direction
        const rotY = ROTS[i]; 
        placeAt(nx, nz, pathModel, "path", { rotation: [0, rotY, 0], scale: 2.5 });

        // Sometimes place a platform underneath the path
        if (prng() > 0.5) placeAt(nx, nz, "platform_large.glb", "platform", { scale: 3 });

        nextFrontiers.push({ x: nx, z: nz, depth: f.depth + 1 });
      }
    }
    // Swap and continue
    // Shuffle next frontiers for randomness
    frontiers = nextFrontiers.sort(() => prng() - 0.5).slice(0, 5); // Limit expansion per tick
  }

  // 2. Assign specialized ring nodes at path ends
  const leafNodes = [];
  for (let x=0; x<GRID_SIZE; x++) {
    for (let z=0; z<GRID_SIZE; z++) {
      if (grid[x][z]?.type === "path") {
        // Count neighbors
        let neighbors = 0;
        DIRS.forEach(([dx, dz]) => {
          if (grid[x+dx]?.[z+dz]) neighbors++;
        });
        if (neighbors === 1) leafNodes.push({x, z});
      }
    }
  }

  // Shuffle leaves
  leafNodes.sort(() => prng() - 0.5);

  // Guarantee Rocket Pad
  if (leafNodes.length > 0) {
    const l = leafNodes.pop()!;
    // Build rocket
    placeAt(l.x, l.z, "platform_large.glb", "pad", { scale: 3.5 });
    placeAt(l.x, l.z, ["rocket_baseA.glb", "rocket_sidesA.glb", "rocket_topA.glb"], "rocket", { scale: 3, position: [0, 0.4, 0] });
    zones.rocket = toWorld(l.x, l.z, 1.5);
    zones.rocket[2] += 4; // Shift interaction zone outwards
  }

  // Guarantee Comms Tower
  if (leafNodes.length > 0) {
    const l = leafNodes.pop()!;
    placeAt(l.x, l.z, "platform_large.glb", "pad", { scale: 3 });
    placeAt(l.x, l.z, "satelliteDish_large.glb", "comms", { scale: 2.5 });
    zones.comms = toWorld(l.x, l.z, 1.5);
    zones.comms[0] -= 2;
  }

  // Guarantee Arquivos (Lab/Observation Dome)
  if (leafNodes.length > 0) {
    const l = leafNodes.pop()!;
    placeAt(l.x, l.z, pick(cats.habitats), "lab", { scale: 3 });
    zones.arquivos = toWorld(l.x, l.z, 1.5);
  }

  // Fill remaining leaves with energy/labs
  for (const l of leafNodes) {
    if (prng() > 0.5) {
      placeAt(l.x, l.z, pick(cats.energy), "energy", { scale: 2 });
    } else {
      placeAt(l.x, l.z, pick(cats.structures), "structure", { scale: 2 });
    }
  }

  // 3. Fill empty space with random terrain and props
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      if (!grid[x][z]) {
        // Calculate distance from center
        const dist = Math.sqrt((x - CENTER)**2 + (z - CENTER)**2);
        
        // Don't place terrain too close to core
        if (dist > 2 && dist < 6) {
          if (prng() > 0.8) {
            const rock = pick(cats.terrain);
            placeAt(x, z, rock, "terrain", { scale: randRange(2, 6), rotation: [0, prng() * Math.PI * 2, 0] });
          } else if (prng() > 0.95) {
            const prop = pick(cats.props);
            placeAt(x, z, prop, "prop", { scale: randRange(1, 3), rotation: [0, prng() * Math.PI * 2, 0] });
          }
        }
      }
    }
  }

  return { instances, zones };
}
