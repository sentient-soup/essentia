import * as THREE from 'three';
import { extend, type ThreeElement } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import terrainVertex from './Vertex';
import terrainFragment from './Fragment';
import { skyVertex, skyFragment } from './Sky';

// Named TerrainMaterial (not GridMaterial): drei's <Grid> already registers a
// global 'gridMaterial' JSX element and the declarations collide.
const TerrainMaterial = shaderMaterial(
  {
    time: 0,
  },
  terrainVertex,
  terrainFragment
);

const SkyMaterial = shaderMaterial(
  {
    time: 0,
    scroll: 0,
    resolution: new THREE.Vector2(),
    pointer: new THREE.Vector2(),
  },
  skyVertex,
  skyFragment
);

extend({ TerrainMaterial, SkyMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    terrainMaterial: ThreeElement<typeof TerrainMaterial>;
    skyMaterial: ThreeElement<typeof SkyMaterial>;
  }
}

export { TerrainMaterial, SkyMaterial };
