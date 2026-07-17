import * as THREE from 'three';
import { extend, type ThreeElement } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import terrainVertex from './Vertex';
import terrainFragment from './Fragment';

// Named TerrainMaterial (not GridMaterial): drei's <Grid> already registers a
// global 'gridMaterial' JSX element and the declarations collide.
const TerrainMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
    pointer: new THREE.Vector2(),
  },
  terrainVertex,
  terrainFragment
);

extend({ TerrainMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    terrainMaterial: ThreeElement<typeof TerrainMaterial>;
  }
}

export { TerrainMaterial };
