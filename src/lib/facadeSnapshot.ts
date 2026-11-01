import {
  ACESFilmicToneMapping,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PerspectiveCamera,
  SRGBColorSpace,
  Scene,
  WebGLRenderer,
  type CanvasTexture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { buildFacadeGeometry } from "./facadeGeometry";
import { createGrainTexture } from "./grainTexture";
import { profiles, type ProfileId } from "./profiles";
import type { Finish, Swatch } from "./palette";

/**
 * Снимки 3D-фасадов для миниатюр. Один невидимый WebGL-рендерер на всю страницу:
 * браузер ограничивает число WebGL-контекстов (около 16), поэтому холст на каждую карточку не подходит.
 */

const W = 320;
const H = 400;
/** Размер фасада в кадре: как в интерактивном просмотре (FacadeViewer) */
const STAGE_SIZE = 1.2;

type Ctx = { renderer: WebGLRenderer; scene: Scene; camera: PerspectiveCamera; holder: Group };
let ctx: Ctx | null | undefined;
const grain = new Map<string, CanvasTexture>();

function init(): Ctx | null {
  if (ctx !== undefined) return ctx;
  try {
    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;

    const scene = new Scene();
    const pmrem = new PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.85;
    const key = new DirectionalLight("#ffffff", 1.4);
    key.position.set(-1.5, 2.5, 3);
    scene.add(key);

    const camera = new PerspectiveCamera(30, W / H, 0.1, 20);
    camera.position.set(0.8, 0.28, 3.05);
    camera.lookAt(0, 0, 0);

    const holder = new Group();
    holder.rotation.y = -0.35;
    scene.add(holder);
    ctx = { renderer, scene, camera, holder };
  } catch {
    // WebGL недоступен: миниатюры просто не показываем
    ctx = null;
  }
  return ctx;
}

export type SnapshotInput = {
  profile: ProfileId;
  /** мм */
  width: number;
  height: number;
  thickness: number;
  swatch: Swatch;
  finish: Finish;
};

/** PNG data URL со снимком фасада или null, если WebGL недоступен */
export function snapshotFacade({ profile, width, height, thickness, swatch, finish }: SnapshotInput): string | null {
  const c = init();
  if (!c) return null;

  const geometry = buildFacadeGeometry(profiles[profile], width, height, thickness);
  let map: CanvasTexture | null = null;
  if (swatch.grain) {
    map = grain.get(swatch.hex) ?? createGrainTexture(swatch.hex);
    grain.set(swatch.hex, map);
  }
  const glossy = finish === "gloss";
  const material = new MeshPhysicalMaterial({
    color: map ? "#ffffff" : swatch.hex,
    map,
    roughness: glossy ? 0.12 : 0.62,
    clearcoat: glossy ? 1 : 0,
    clearcoatRoughness: 0.04,
    metalness: 0,
  });
  const mesh = new Mesh(geometry, material);
  mesh.scale.setScalar(STAGE_SIZE / Math.max(width, height));
  c.holder.add(mesh);

  c.renderer.setClearColor(0x000000, 0);
  c.renderer.render(c.scene, c.camera);
  const url = c.renderer.domElement.toDataURL("image/png");

  c.holder.remove(mesh);
  geometry.dispose();
  material.dispose();
  return url;
}
