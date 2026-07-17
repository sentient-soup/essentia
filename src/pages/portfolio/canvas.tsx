import * as THREE from 'three';
import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import { TerrainMaterial, SkyMaterial } from './terrain/Material';
import { easing } from 'maath';
import { scrollState } from './scroll';

const views = {
  default: {
    fov: 75,
    position: [0, 500, 1700],
    lookAt: [0, -300, -1500],
  },
  lowView: {
    fov: 50,
    position: [0, 10, 1500],
    lookAt: [0, -300, -1500],
  },
  sideView: {
    fov: 50,
    position: [300, 500, 1500],
    lookAt: [0, -300, -1500],
  },
  bikeView: {
    fov: 50,
    position: [100, 220, 300],
    lookAt: [0, 40, 0],
  },
  vanishing: {
    fov: 160,
    position: [0, 200, 1200],
    lookAt: [0, -300, -1500],
  },
};

export default function App() {
  const camera = useMemo(() => {
    const view = views.vanishing;
    const c = new THREE.PerspectiveCamera(
      view.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      5000
    );
    c.position.set(view.position[0], view.position[1], view.position[2]);
    c.lookAt(view.lookAt[0], view.lookAt[1], view.lookAt[2]);
    return c;
  }, []);
  return (
    // ponytail: dpr capped at 1.5, MSAA framebuffers at dpr 2 cost ~2x the memory
    <Canvas dpr={[1, 1.5]} camera={camera}>
      <Suspense fallback={null}>
        <Sky />
        <Terrain />
      </Suspense>
    </Canvas>
  );
}

type SkyMaterialRef = THREE.ShaderMaterial & {
  time: number;
  scroll: number;
  pointer: THREE.Vector2;
};

function Sky() {
  const { viewport, size } = useThree();
  const material = useRef<SkyMaterialRef>(null);

  useFrame((state, delta) => {
    const current = material.current;
    if (!current) return;
    current.time = state.clock.elapsedTime;
    current.scroll = scrollState.current / 5000;
    easing.damp2(current.pointer, state.pointer, 0.25, delta);
  });

  return (
    <ScreenQuad renderOrder={-1}>
      <skyMaterial
        ref={material}
        key={SkyMaterial.key}
        resolution={
          new THREE.Vector2(
            size.width * viewport.dpr,
            size.height * viewport.dpr
          )
        }
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}

type TerrainMaterialRef = THREE.ShaderMaterial & {
  time: number;
};

function Terrain() {
  const material = useRef<TerrainMaterialRef>(null);

  useFrame(() => {
    const current = material.current;
    if (!current) return;
    // scrollState.current is damped by the card overlay's rAF loop, so the
    // terrain and cards always move together.
    current.time = scrollState.current / 5000;
  });

  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3000, 3000, 512, 512]} />
      <terrainMaterial ref={material} key={TerrainMaterial.key} />
    </mesh>
  );
}
