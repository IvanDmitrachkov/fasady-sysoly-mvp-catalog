"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Edges, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { CanvasTexture } from "three";
import { buildFacadeGeometry } from "@/lib/facadeGeometry";
import { createGrainTexture } from "@/lib/grainTexture";
import { dims, layoutProject, type ColumnLayout, type FacadePiece, type Project } from "@/lib/kitchen";
import { swatchById, type Finish } from "@/lib/palette";
import { profiles } from "@/lib/profiles";

const grainCache = new Map<string, CanvasTexture>();
function grainFor(hex: string) {
  let t = grainCache.get(hex);
  if (!t) {
    t = createGrainTexture(hex);
    grainCache.set(hex, t);
  }
  return t;
}

export type Mood = "day" | "evening";

const CARCASS = "#e4dfd5";
const WORKTOP = "#5d554e";
const PLINTH = "#2a2623";

function Box({
  x,
  y,
  z,
  w,
  h,
  d,
  color,
  onClick,
}: {
  x: number;
  y: number;
  z: number;
  w: number;
  h: number;
  d: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <mesh
      castShadow
      receiveShadow
      position={[x + w / 2, y + h / 2, z + d / 2]}
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function FacadeMesh({ piece, finish, onSelect }: { piece: FacadePiece; finish: Finish; onSelect: () => void }) {
  const w = Math.round(piece.w);
  const h = Math.round(piece.h);
  const geometry = useMemo(
    () => buildFacadeGeometry(profiles[piece.style.profile], w, h, dims.facadeThickness),
    [piece.style.profile, w, h],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const swatch = swatchById(piece.style.swatchId);
  const glossy = finish === "gloss";

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geometry}
      position={[piece.x + piece.w / 2, piece.y + piece.h / 2, piece.depth + dims.facadeThickness / 2]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <meshPhysicalMaterial
        key={swatch.grain ? "grain" : "flat"}
        color={swatch.grain ? "#ffffff" : swatch.hex}
        map={swatch.grain ? grainFor(swatch.hex) : null}
        roughness={glossy ? 0.12 : 0.62}
        clearcoat={glossy ? 1 : 0}
        clearcoatRoughness={0.04}
        metalness={0}
      />
    </mesh>
  );
}

function ColumnMesh({
  layout,
  finish,
  selected,
  mood,
  onSelect,
}: {
  layout: ColumnLayout;
  finish: Finish;
  selected: boolean;
  mood: Mood;
  onSelect: () => void;
}) {
  const { column: c, x } = layout;
  const w = c.width;
  const tall = c.kind === "tall";
  const top = tall ? dims.tallTop : c.upper ? dims.wallTop : dims.baseTop + dims.worktop;

  return (
    <group>
      <Box x={x} y={0} z={0} w={w} h={dims.plinth} d={dims.baseDepth - 60} color={PLINTH} />
      <Box
        x={x}
        y={dims.plinth}
        z={0}
        w={w}
        h={(tall ? dims.tallTop : dims.baseTop) - dims.plinth}
        d={dims.baseDepth}
        color={CARCASS}
        onClick={onSelect}
      />
      {!tall && (
        <Box x={x} y={dims.baseTop} z={0} w={w} h={dims.worktop} d={dims.worktopDepth} color={WORKTOP} onClick={onSelect} />
      )}
      {c.upper && !tall && (
        <Box
          x={x}
          y={dims.wallBottom}
          z={0}
          w={w}
          h={dims.wallTop - dims.wallBottom}
          d={dims.wallDepth}
          color={CARCASS}
          onClick={onSelect}
        />
      )}
      {mood === "evening" && c.upper && !tall && (
        <>
          {/* LED-лента под навесным шкафом */}
          <mesh position={[x + w / 2, dims.wallBottom - 6, dims.wallDepth / 2 + 20]}>
            <boxGeometry args={[w - 40, 6, dims.wallDepth - 60]} />
            <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
          </mesh>
          <pointLight position={[x + w / 2, dims.wallBottom - 60, 260]} color="#ffcf8a" intensity={2.2} distance={1.6} decay={2} />
        </>
      )}
      {layout.pieces.map((p) => (
        <FacadeMesh key={p.key} piece={p} finish={finish} onSelect={onSelect} />
      ))}
      {selected && (
        <mesh position={[x + w / 2, top / 2, (dims.worktopDepth + 40) / 2]}>
          <boxGeometry args={[w + 8, top + 8, dims.worktopDepth + 40]} />
          <meshBasicMaterial visible={false} />
          <Edges color="#a98a6a" linewidth={2} />
        </mesh>
      )}
    </group>
  );
}

/** Камера подстраивается под длину стены */
function CameraRig({ wall }: { wall: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    const t = Math.tan((35 / 2) * (Math.PI / 180));
    // стена целиком по ширине и кухня целиком по высоте, плюс запас
    const dist = Math.max(wall / 1000 / 2 / (t * aspect), 2.6 / (2 * t)) * 1.12;
    camera.position.set(dist * 0.15, 1.5, dist);
    camera.lookAt(0, 1.0, 0.2);
    invalidate();
    // в режиме demand окружение и шейдеры догружаются после первого кадра: дорисовываем несколько раз
    const timers = [100, 400, 1200].map((ms) => setTimeout(invalidate, ms));
    return () => timers.forEach(clearTimeout);
  }, [wall, aspect, camera, invalidate]);
  return null;
}

function Studio({ mood }: { mood: Mood }) {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={mood === "day" ? 0.7 : 0.4}>
      <color attach="background" args={["#d9d2c6"]} />
      <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[12, 4, 1]} rotation-x={Math.PI / 2} />
      <Lightformer form="rect" intensity={2} position={[-6, 1, 3]} scale={[3, 8, 1]} rotation-y={Math.PI / 2} />
      <Lightformer form="rect" intensity={1.5} position={[6, 1, 3]} scale={[3, 8, 1]} rotation-y={-Math.PI / 2} />
    </Environment>
  );
}

export default function KitchenViewer({
  project,
  selectedId,
  mood,
  onSelect,
}: {
  project: Project;
  selectedId: string | null;
  mood: Mood;
  onSelect: (id: string | null) => void;
}) {
  const layouts = useMemo(() => layoutProject(project), [project]);

  return (
    <Canvas
      frameloop="demand"
      shadows
      dpr={[1, 2]}
      camera={{ fov: 35, near: 0.1, far: 50, position: [0.7, 1.55, 4.5] }}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => onSelect(null)}
      className="touch-pan-y"
    >
      <Studio mood={mood} />
      {/* солнце из окна слева-спереди: мягкие тени от шкафов на стене и полу */}
      <directionalLight
        castShadow
        position={[-2.2, 3.6, 3.8]}
        color={mood === "day" ? "#fff1dc" : "#ffc994"}
        intensity={mood === "day" ? 2.4 : 1.1}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={3.5}
        shadow-camera-bottom={-1}
        shadow-camera-near={0.5}
        shadow-camera-far={14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
      <hemisphereLight args={[mood === "day" ? "#ffffff" : "#6b5a4a", "#a8956f", mood === "day" ? 0.35 : 0.3]} />
      <CameraRig wall={project.wall} />
      {/* сцена в миллиметрах, масштаб в метры; стена по центру */}
      <group scale={0.001} position={[(-project.wall / 2) * 0.001, 0, 0]}>
        {/* задняя стена и пол */}
        <mesh receiveShadow position={[project.wall / 2, 1600, -2]}>
          <planeGeometry args={[14000, 3200]} />
          <meshStandardMaterial color="#d6c9b4" roughness={1} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[project.wall / 2, 0, 3000]}>
          <planeGeometry args={[14000, 7000]} />
          <meshStandardMaterial color="#a89477" roughness={0.9} />
        </mesh>
        {layouts.map((l) => (
          <ColumnMesh
            key={l.column.id}
            layout={l}
            finish={project.style.finish}
            selected={l.column.id === selectedId}
            mood={mood}
            onSelect={() => onSelect(l.column.id)}
          />
        ))}
      </group>
      <OrbitControls
        target={[0, 1.0, 0.2]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.52}
        minAzimuthAngle={-Math.PI * 0.4}
        maxAzimuthAngle={Math.PI * 0.4}
        enableDamping
      />
    </Canvas>
  );
}
