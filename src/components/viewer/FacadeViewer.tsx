"use client";

import { useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import { buildFacadeGeometry } from "@/lib/facadeGeometry";
import { profiles, type ProfileId } from "@/lib/profiles";
import { createGrainTexture } from "@/lib/grainTexture";
import type { Finish, Swatch } from "@/lib/palette";

export type FacadeViewerProps = {
  profile: ProfileId;
  /** мм */
  width: number;
  height: number;
  thickness: number;
  swatch: Swatch;
  finish: Finish;
  className?: string;
};

/** Размер фасада на сцене: максимальная сторона всегда занимает одну и ту же долю кадра */
const STAGE_SIZE = 1.2;

function Facade({ profile, width, height, thickness, swatch, finish }: FacadeViewerProps) {
  const geometry = useMemo(
    () => buildFacadeGeometry(profiles[profile], width, height, thickness),
    [profile, width, height, thickness],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const grain = useMemo(
    () => (swatch.grain ? createGrainTexture(swatch.hex) : null),
    [swatch.grain, swatch.hex],
  );
  useEffect(() => () => grain?.dispose(), [grain]);

  const scale = STAGE_SIZE / Math.max(width, height);
  const glossy = finish === "gloss";

  return (
    <mesh geometry={geometry} scale={scale} castShadow>
      <meshPhysicalMaterial
        key={grain ? "grain" : "flat"}
        color={grain ? "#ffffff" : swatch.hex}
        map={grain}
        roughness={glossy ? 0.12 : 0.62}
        clearcoat={glossy ? 1 : 0}
        clearcoatRoughness={0.04}
        metalness={0}
      />
    </mesh>
  );
}

/** Студийный свет без загрузки внешних HDRI: софтбоксы собираются из Lightformer */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#14151a"]} />
      <Lightformer form="rect" intensity={4} position={[0, 5, 2]} scale={[10, 4, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} scale={[2.5, 8, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={2} position={[5, 0, 1]} scale={[2, 8, 1]} rotation-y={-Math.PI / 2} />
      <Lightformer form="ring" intensity={1.2} position={[0, 0, -6]} scale={10} />
    </Environment>
  );
}

export default function FacadeViewer(props: FacadeViewerProps) {
  return (
    <Canvas
      className={props.className}
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0.8, 0.28, 3.05], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      shadows={false}
    >
      <Studio />
      <group rotation={[0, -0.35, 0]}>
        <Facade {...props} />
      </group>
      <ContactShadows position={[0, -0.75, 0]} opacity={0.35} scale={6} blur={2.6} far={2} frames={1} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
        minAzimuthAngle={-Math.PI * 0.6}
        maxAzimuthAngle={Math.PI * 0.6}
        rotateSpeed={0.7}
        enableDamping
      />
    </Canvas>
  );
}
