/**
 * Procedural 3D anatomical human brain engine (Three.js) for the Adam
 * simulator. Ported from the original single-file simulator: cortical gyri
 * sculpting, limbic & brainstem organs, axonal tracts with traveling pulses,
 * projected HTML organ labels, raycast picking, dissection modes (explode,
 * sagittal cut, x-ray) and the main animation loop. Fully disposable so React
 * StrictMode double-mounts never duplicate canvases or listeners.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ORGANS_META, TRACT_DEFS } from './organs';

export interface BrainEngineCallbacks {
  onSelect: (organId: string, source: 'label' | 'canvas') => void;
  onResize?: () => void;
}

interface OrganPart {
  organId: string;
  mesh: THREE.Mesh;
  wireMesh: THREE.Mesh | null;
  side: 'L' | 'R' | 'C';
  isCortex: boolean;
  basePos: THREE.Vector3;
  explodeVec: THREE.Vector3;
  baseOpacity: number;
  geomCenter: THREE.Vector3;
  pulse: number;
}

interface ActivePulse {
  fromId: string;
  toId: string;
  group: THREE.Group;
  startTime: number;
  durationMs: number;
  onArrive: (() => void) | null;
  mats: THREE.Material[];
}

interface TractLine {
  fromId: string;
  toId: string;
  line: THREE.Line;
}

const DEFAULT_CAM_POS = new THREE.Vector3(4.3, 1.55, 4.4);
const DEFAULT_CAM_TARGET = new THREE.Vector3(0, -0.1, 0.05);

// --- Procedural Cortical Gyri/Sulci Folding Function ---
function corticalGyriField(x: number, y: number, z: number, scale = 5.4): number {
  const px = x * scale;
  const py = y * scale;
  const pz = z * scale;

  const wx = px + 0.72 * Math.sin(py * 0.9 + pz * 0.7);
  const wy = py + 0.72 * Math.cos(pz * 0.85 - px * 0.65);
  const wz = pz + 0.72 * Math.sin(px * 0.8 + py * 0.75);

  const n1 = Math.sin(wx) * Math.cos(wy) + Math.sin(wy) * Math.cos(wz) + Math.sin(wz) * Math.cos(wx);
  const n2 = Math.sin(wx * 1.85 + 1.3) * Math.cos(wz * 1.75 - 0.8) + Math.cos(wy * 1.9 + wx * 0.9);
  const ridge1 = 1.0 - Math.abs(n1 / 2.2);
  const ridge2 = 1.0 - Math.abs(n2 / 2.1);
  return ridge1 * 0.68 + ridge2 * 0.32;
}

type ShapeFn = (v: THREE.Vector3) => void;

function sculptCorticalLobeGeometry(
  baseGeo: THREE.BufferGeometry,
  shapeFn: ShapeFn,
  baseColorHex: string,
  foldAmp = 0.075,
  foldScale = 5.2,
  isCerebellum = false,
): THREE.BufferGeometry {
  const pos = baseGeo.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const baseColor = new THREE.Color(baseColorHex);
  const sulcusColor = baseColor.clone().multiplyScalar(0.32);
  const gyrusColor = baseColor.clone().lerp(new THREE.Color(0xe0f2fe), 0.24);
  const v = new THREE.Vector3();
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    shapeFn(v);

    let ridge = 0.5;
    if (isCerebellum) {
      const folia = Math.sin(v.y * 42.0 + Math.sin(v.x * 7.5) * 1.4 + Math.cos(v.z * 6.0) * 0.8);
      ridge = 1.0 - Math.abs(folia) * 0.65;
      const nDir = v.clone().normalize();
      v.addScaledVector(nDir, (ridge - 0.5) * foldAmp);
    } else {
      ridge = corticalGyriField(v.x, v.y, v.z, foldScale);
      const medialDamp = THREE.MathUtils.smoothstep(Math.abs(v.x), 0.04, 0.24);
      const nDir = v.clone().normalize();
      const disp = (Math.pow(ridge, 1.35) - 0.42) * foldAmp * (0.35 + 0.65 * medialDamp);
      v.addScaledVector(nDir, disp);
    }

    pos.setXYZ(i, v.x, v.y, v.z);

    const t = THREE.MathUtils.clamp(ridge, 0, 1);
    tmpColor.copy(sulcusColor).lerp(gyrusColor, Math.pow(t, 1.15));
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  baseGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  baseGeo.computeVertexNormals();
  return baseGeo;
}

interface MaterialOptions {
  useVertexColors?: boolean;
  baseEmissive?: number;
  roughness?: number;
  metalness?: number;
  clearcoat?: number;
  opacity?: number;
}

function createOrganMaterial(colorHex: string, options: MaterialOptions = {}): THREE.MeshPhysicalMaterial {
  const col = new THREE.Color(colorHex);
  return new THREE.MeshPhysicalMaterial({
    color: options.useVertexColors ? 0xffffff : col,
    vertexColors: !!options.useVertexColors,
    emissive: col.clone().multiplyScalar(options.baseEmissive ?? 0.14),
    emissiveIntensity: 1.0,
    roughness: options.roughness ?? 0.34,
    metalness: options.metalness ?? 0.08,
    clearcoat: options.clearcoat ?? 0.58,
    clearcoatRoughness: 0.24,
    transparent: true,
    opacity: options.opacity ?? 0.96,
    side: THREE.FrontSide,
  });
}

export class BrainEngine {
  private canvas: HTMLCanvasElement;
  private viewportEl: HTMLElement;
  private labelsLayer: HTMLElement;
  private cb: BrainEngineCallbacks;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private brainRoot = new THREE.Group();
  private starField: THREE.Points;
  private keyLight: THREE.DirectionalLight;
  private rimCyan: THREE.DirectionalLight;
  private innerCoreLight: THREE.PointLight;

  private organParts: OrganPart[] = [];
  private clickableMeshes: THREE.Mesh[] = [];
  private organCenters: Record<string, THREE.Vector3> = {};
  private tractLines: TractLine[] = [];
  private activePulses: ActivePulse[] = [];
  private labelElements: Record<string, HTMLDivElement> = {};
  private pulseSphereGeo = new THREE.SphereGeometry(0.068, 16, 16);
  private pulseHaloGeo = new THREE.SphereGeometry(0.13, 12, 12);

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private pointerDownPos = { x: 0, y: 0 };
  private projVec = new THREE.Vector3();

  private rafId = 0;
  private clockStart = performance.now();
  private resizeObserver: ResizeObserver | null = null;
  private disposed = false;

  // Dissection / view state (mirrors the original module state)
  selectedOrgan = 'frontal';
  private explodeTarget = 0;
  private explodeCurrent = 0;
  private sagittalCut = false;
  private sagittalCurrent = 0;
  private xrayMode = false;
  private showLabels = true;
  private sleepTwilight = 0;
  private sleepTarget = 0;

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDownPos = { x: e.clientX, y: e.clientY };
  };

  private onPointerUp = (e: PointerEvent) => {
    const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
    if (dist > 6) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const validTargets = this.clickableMeshes.filter((m) => {
      const mat = m.material as THREE.Material & { opacity: number };
      return m.visible && mat.opacity > 0.12;
    });
    const hits = this.raycaster.intersectObjects(validTargets, false);
    if (hits.length > 0) {
      const hitOrgan = hits[0].object.userData.organId as string | undefined;
      if (hitOrgan) this.cb.onSelect(hitOrgan, 'canvas');
    }
  };

  private onWindowResize = () => this.handleResize();

  constructor(
    canvas: HTMLCanvasElement,
    viewportEl: HTMLElement,
    labelsLayer: HTMLElement,
    cb: BrainEngineCallbacks,
  ) {
    this.canvas = canvas;
    this.viewportEl = viewportEl;
    this.labelsLayer = labelsLayer;
    this.cb = cb;

    this.scene.fog = new THREE.FogExp2(0x050a14, 0.048);

    this.camera = new THREE.PerspectiveCamera(
      42,
      Math.max(1, viewportEl.clientWidth) / Math.max(1, viewportEl.clientHeight),
      0.1,
      100,
    );
    this.camera.position.copy(DEFAULT_CAM_POS);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(viewportEl.clientWidth, viewportEl.clientHeight);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 12.5;
    this.controls.target.copy(DEFAULT_CAM_TARGET);
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.65;

    // Cinematic Scientific Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.85);
    this.scene.add(hemiLight);

    this.keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
    this.keyLight.position.set(5, 7, 5);
    this.scene.add(this.keyLight);

    this.rimCyan = new THREE.DirectionalLight(0x38bdf8, 1.45);
    this.rimCyan.position.set(-6, 3, -4);
    this.scene.add(this.rimCyan);

    const fillViolet = new THREE.PointLight(0xa78bfa, 1.1, 16);
    fillViolet.position.set(0, -4, 4);
    this.scene.add(fillViolet);

    this.innerCoreLight = new THREE.PointLight(0xf59e0b, 0.9, 6);
    this.innerCoreLight.position.set(0, 0, 0);
    this.scene.add(this.innerCoreLight);

    // Ambient Floating Neural Dust Particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 320;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = 4.5 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.038, transparent: true, opacity: 0.45 });
    this.starField = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starField);

    this.scene.add(this.brainRoot);

    this.buildOrgans();
    this.buildTracts();
    this.buildLabels();

    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('resize', this.onWindowResize);
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(viewportEl);

    this.clockStart = performance.now();
    const loop = (now: number) => {
      if (this.disposed) return;
      this.rafId = requestAnimationFrame(loop);
      this.animate(now);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  // -------------------------------------------------------------------------
  // Construction helpers
  // -------------------------------------------------------------------------

  private registerOrganPart(args: {
    organId: string;
    geometry: THREE.BufferGeometry;
    material: THREE.MeshPhysicalMaterial;
    basePos: THREE.Vector3;
    explodeVec: THREE.Vector3;
    side?: 'L' | 'R' | 'C';
    isCortex?: boolean;
    addWireframe?: boolean;
  }): OrganPart {
    const { organId, geometry, material, basePos, explodeVec } = args;
    const side = args.side ?? 'C';
    const isCortex = args.isCortex ?? false;
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(basePos);
    mesh.userData = { organId, side, isCortex };
    this.brainRoot.add(mesh);

    let wireMesh: THREE.Mesh | null = null;
    if (args.addWireframe) {
      const wireMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(ORGANS_META[organId].colorHex),
        wireframe: true,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
      });
      wireMesh = new THREE.Mesh(geometry, wireMat);
      mesh.add(wireMesh);
    }

    geometry.computeBoundingBox();
    const geomCenter = new THREE.Vector3();
    geometry.boundingBox?.getCenter(geomCenter);

    const part: OrganPart = {
      organId,
      mesh,
      wireMesh,
      side,
      isCortex,
      basePos: basePos.clone(),
      explodeVec: explodeVec.clone(),
      baseOpacity: material.opacity,
      geomCenter,
      pulse: 0,
    };
    this.organParts.push(part);
    this.clickableMeshes.push(mesh);
    return part;
  }

  private buildOrgans() {
    // ---------- CORTICAL HEMISPHERES (LEFT & RIGHT) ----------
    // 1. LOBUS FRONTAL
    ([-1, 1] as const).forEach((s) => {
      const sideLabel = s === -1 ? 'L' : 'R';
      const geo = new THREE.SphereGeometry(1, 56, 44);
      sculptCorticalLobeGeometry(
        geo,
        (v) => {
          v.x = v.x * 0.58 + s * 0.54;
          if (s * v.x < 0.07) v.x = s * (0.07 + Math.abs(v.x - s * 0.07) * 0.14);
          v.y = v.y * 0.66 + 0.36;
          if (v.y < -0.14) v.y = -0.14 + (v.y + 0.14) * 0.25;
          v.z = v.z * 0.78 + 0.8;
          const frontTaper = 1.0 - THREE.MathUtils.smoothstep(v.z, 0.9, 1.65) * 0.32;
          v.x *= frontTaper;
          v.y = (v.y - 0.15) * (0.78 + 0.22 * frontTaper) + 0.15;
        },
        '#38bdf8',
        0.085,
        5.1,
        false,
      );
      this.registerOrganPart({
        organId: 'frontal',
        geometry: geo,
        material: createOrganMaterial('#38bdf8', { useVertexColors: true, baseEmissive: 0.12 }),
        basePos: new THREE.Vector3(0, 0, 0),
        explodeVec: new THREE.Vector3(s * 0.85, 0.38, 0.95),
        side: sideLabel,
        isCortex: true,
        addWireframe: true,
      });
    });

    // 2. LOBUS PARIETAL
    ([-1, 1] as const).forEach((s) => {
      const sideLabel = s === -1 ? 'L' : 'R';
      const geo = new THREE.SphereGeometry(1, 56, 44);
      sculptCorticalLobeGeometry(
        geo,
        (v) => {
          v.x = v.x * 0.6 + s * 0.54;
          if (s * v.x < 0.07) v.x = s * (0.07 + Math.abs(v.x - s * 0.07) * 0.14);
          v.y = v.y * 0.66 + 0.44;
          v.z = v.z * 0.86 - 0.68;
          const backTaper = 1.0 - THREE.MathUtils.smoothstep(-v.z, 0.85, 1.6) * 0.34;
          v.x *= backTaper;
          if (v.y < -0.05 && v.z < -0.5) v.y = -0.05 + (v.y + 0.05) * 0.35;
        },
        '#14b8a6',
        0.085,
        5.2,
        false,
      );
      this.registerOrganPart({
        organId: 'parietal',
        geometry: geo,
        material: createOrganMaterial('#14b8a6', { useVertexColors: true, baseEmissive: 0.12 }),
        basePos: new THREE.Vector3(0, 0, 0),
        explodeVec: new THREE.Vector3(s * 0.9, 0.72, -0.82),
        side: sideLabel,
        isCortex: true,
        addWireframe: true,
      });
    });

    // 3. LOBUS TEMPORAL
    ([-1, 1] as const).forEach((s) => {
      const sideLabel = s === -1 ? 'L' : 'R';
      const geo = new THREE.SphereGeometry(1, 48, 36);
      sculptCorticalLobeGeometry(
        geo,
        (v) => {
          v.x = v.x * 0.34 + s * 0.86;
          v.y = v.y * 0.36 - 0.2 + v.z * -0.1;
          v.z = v.z * 0.78 - 0.1;
          if (s * v.x < 0.56) v.x = s * (0.56 + (s * v.x - 0.56) * 0.25);
        },
        '#818cf8',
        0.068,
        5.8,
        false,
      );
      this.registerOrganPart({
        organId: 'temporal',
        geometry: geo,
        material: createOrganMaterial('#818cf8', { useVertexColors: true, baseEmissive: 0.14 }),
        basePos: new THREE.Vector3(0, 0, 0),
        explodeVec: new THREE.Vector3(s * 1.35, -0.25, 0.05),
        side: sideLabel,
        isCortex: true,
        addWireframe: true,
      });
    });

    // ---------- DEEP INTERIOR LIMBIC SYSTEM ----------
    // 4. THALAMUS
    ([-1, 1] as const).forEach((s) => {
      const geo = new THREE.SphereGeometry(1, 32, 24);
      geo.scale(0.19, 0.23, 0.34);
      this.registerOrganPart({
        organId: 'thalamus',
        geometry: geo,
        material: createOrganMaterial('#f59e0b', { baseEmissive: 0.32, roughness: 0.22 }),
        basePos: new THREE.Vector3(s * 0.2, 0.12, -0.06),
        explodeVec: new THREE.Vector3(s * 0.32, 0.24, 0.0),
        side: s === -1 ? 'L' : 'R',
        isCortex: false,
      });
    });

    // 5. HIPPOCAMPUS
    ([-1, 1] as const).forEach((s) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.09, 0.16, 0.26),
        new THREE.Vector3(s * 0.16, 0.42, 0.02),
        new THREE.Vector3(s * 0.34, 0.28, -0.38),
        new THREE.Vector3(s * 0.48, -0.08, -0.42),
        new THREE.Vector3(s * 0.49, -0.32, -0.05),
        new THREE.Vector3(s * 0.44, -0.33, 0.26),
      ]);
      const geo = new THREE.TubeGeometry(curve, 44, 0.095, 16, false);
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const ripple = 1 + 0.04 * Math.sin(v.z * 20 + v.y * 15);
        v.multiplyScalar(ripple);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      geo.computeVertexNormals();

      this.registerOrganPart({
        organId: 'hippocampus',
        geometry: geo,
        material: createOrganMaterial('#10b981', { baseEmissive: 0.28, roughness: 0.25 }),
        basePos: new THREE.Vector3(0, 0, 0),
        explodeVec: new THREE.Vector3(s * 0.52, 0.18, -0.18),
        side: s === -1 ? 'L' : 'R',
        isCortex: false,
      });
    });

    // 6. AMYGDALA
    ([-1, 1] as const).forEach((s) => {
      const geo = new THREE.SphereGeometry(1, 28, 20);
      geo.scale(0.13, 0.11, 0.16);
      this.registerOrganPart({
        organId: 'amygdala',
        geometry: geo,
        material: createOrganMaterial('#f43f5e', { baseEmissive: 0.36, roughness: 0.2 }),
        basePos: new THREE.Vector3(s * 0.44, -0.32, 0.34),
        explodeVec: new THREE.Vector3(s * 0.65, -0.15, 0.45),
        side: s === -1 ? 'L' : 'R',
        isCortex: false,
      });
    });

    // 7. HYPOTHALAMUS
    {
      const geo = new THREE.SphereGeometry(1, 28, 20);
      geo.scale(0.18, 0.15, 0.21);
      this.registerOrganPart({
        organId: 'hypothalamus',
        geometry: geo,
        material: createOrganMaterial('#fb923c', { baseEmissive: 0.34, roughness: 0.22 }),
        basePos: new THREE.Vector3(0, -0.19, 0.18),
        explodeVec: new THREE.Vector3(0, -0.12, 0.56),
        side: 'C',
        isCortex: false,
      });
    }

    // ---------- HINDBRAIN ----------
    // 8. CEREBELLUM
    ([-1, 1] as const).forEach((s) => {
      const geo = new THREE.SphereGeometry(1, 48, 36);
      sculptCorticalLobeGeometry(
        geo,
        (v) => {
          v.x = v.x * 0.46 + s * 0.42;
          v.y = v.y * 0.37 - 0.66;
          v.z = v.z * 0.45 - 0.88;
        },
        '#c084fc',
        0.042,
        1.0,
        true,
      );
      this.registerOrganPart({
        organId: 'cerebellum',
        geometry: geo,
        material: createOrganMaterial('#c084fc', { useVertexColors: true, baseEmissive: 0.16 }),
        basePos: new THREE.Vector3(0, 0, 0),
        explodeVec: new THREE.Vector3(s * 0.48, -0.62, -0.88),
        side: s === -1 ? 'L' : 'R',
        isCortex: false,
      });
    });

    // 9A. MIDBRAIN
    {
      const geo = new THREE.CylinderGeometry(0.24, 0.22, 0.34, 28, 8);
      geo.rotateX(0.18);
      this.registerOrganPart({
        organId: 'midbrain',
        geometry: geo,
        material: createOrganMaterial('#eab308', { baseEmissive: 0.3, roughness: 0.26 }),
        basePos: new THREE.Vector3(0, -0.34, -0.18),
        explodeVec: new THREE.Vector3(0, -0.45, -0.05),
        side: 'C',
        isCortex: false,
      });
    }

    // 9B. PONS
    {
      const geo = new THREE.SphereGeometry(1, 32, 24);
      geo.scale(0.32, 0.25, 0.3);
      this.registerOrganPart({
        organId: 'pons',
        geometry: geo,
        material: createOrganMaterial('#0ea5e9', { baseEmissive: 0.28, roughness: 0.26 }),
        basePos: new THREE.Vector3(0, -0.67, -0.18),
        explodeVec: new THREE.Vector3(0, -0.82, 0.04),
        side: 'C',
        isCortex: false,
      });
    }

    // 9C. MEDULLA OBLONGATA
    {
      const geo = new THREE.CylinderGeometry(0.21, 0.14, 0.58, 28, 10);
      geo.rotateX(-0.08);
      this.registerOrganPart({
        organId: 'medulla',
        geometry: geo,
        material: createOrganMaterial('#fb7185', { baseEmissive: 0.26, roughness: 0.28 }),
        basePos: new THREE.Vector3(0, -1.16, -0.28),
        explodeVec: new THREE.Vector3(0, -1.25, -0.05),
        side: 'C',
        isCortex: false,
      });
    }
  }

  private buildTracts() {
    const tractMatBase = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.24 });
    TRACT_DEFS.forEach(([fromId, toId]) => {
      const geo = new THREE.BufferGeometry();
      const pts = new Float32Array(21 * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const line = new THREE.Line(geo, tractMatBase.clone());
      this.scene.add(line);
      this.tractLines.push({ fromId, toId, line });
    });
  }

  private buildLabels() {
    Object.values(ORGANS_META).forEach((meta) => {
      const el = document.createElement('div');
      el.className = 'organ-label-3d';
      el.innerHTML = `<span style="width:7px;height:7px;border-radius:50%;background:${meta.colorHex};display:inline-block;box-shadow:0 0 6px ${meta.colorHex}"></span><span>${meta.shortLabel}</span>`;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.cb.onSelect(meta.id, 'label');
      });
      this.labelsLayer.appendChild(el);
      this.labelElements[meta.id] = el;
    });
  }

  // -------------------------------------------------------------------------
  // Public control API
  // -------------------------------------------------------------------------

  setSelected(organId: string) {
    this.selectedOrgan = organId;
    Object.entries(this.labelElements).forEach(([id, el]) => {
      el.classList.toggle('active', id === organId);
    });
  }

  setExplode(v: number) {
    this.explodeTarget = v;
  }

  setSagittal(on: boolean) {
    this.sagittalCut = on;
    if (on) {
      this.controls.autoRotate = false;
      this.camera.position.set(5.1, 0.85, 0.65);
      this.controls.target.set(0, -0.1, 0);
    }
  }

  setXray(on: boolean) {
    this.xrayMode = on;
  }

  setLabelsVisible(on: boolean) {
    this.showLabels = on;
    this.labelsLayer.style.display = on ? 'block' : 'none';
  }

  setAutoRotate(on: boolean) {
    this.controls.autoRotate = on;
  }

  get autoRotate(): boolean {
    return this.controls.autoRotate;
  }

  setSleepTarget(v: number) {
    this.sleepTarget = v;
  }

  resetCamera() {
    this.camera.position.copy(DEFAULT_CAM_POS);
    this.controls.target.copy(DEFAULT_CAM_TARGET);
    this.explodeTarget = 0;
    this.sagittalCut = false;
  }

  flashOrgan(organId: string, intensity = 1.6) {
    this.organParts.forEach((p) => {
      if (p.organId === organId) p.pulse = Math.max(p.pulse, intensity);
    });
  }

  spawnPulse(fromId: string, toId: string, colorHex: string, durationMs = 700, onArrive: (() => void) | null = null) {
    const col = new THREE.Color(colorHex);
    const group = new THREE.Group();
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const haloMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55 });
    const core = new THREE.Mesh(this.pulseSphereGeo, coreMat);
    const halo = new THREE.Mesh(this.pulseHaloGeo, haloMat);
    group.add(core);
    group.add(halo);
    this.scene.add(group);
    this.activePulses.push({
      fromId,
      toId,
      group,
      startTime: performance.now(),
      durationMs,
      onArrive,
      mats: [coreMat, haloMat],
    });
  }

  handleResize() {
    const w = this.viewportEl.clientWidth;
    const h = this.viewportEl.clientHeight;
    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
    this.cb.onResize?.();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.controls.dispose();

    Object.values(this.labelElements).forEach((el) => el.remove());
    this.labelElements = {};

    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else if (mat) mat.dispose();
    });
    this.pulseSphereGeo.dispose();
    this.pulseHaloGeo.dispose();
    this.renderer.dispose();
  }

  // -------------------------------------------------------------------------
  // Per-frame work
  // -------------------------------------------------------------------------

  private updateOrganCenters() {
    const accum: Record<string, { sum: THREE.Vector3; count: number }> = {};
    for (const id of Object.keys(ORGANS_META)) {
      accum[id] = { sum: new THREE.Vector3(), count: 0 };
    }
    const worldCenter = new THREE.Vector3();
    for (const p of this.organParts) {
      if (this.sagittalCut && p.isCortex && p.side === 'R') continue;
      worldCenter.copy(p.geomCenter).applyMatrix4(p.mesh.matrixWorld);
      accum[p.organId].sum.add(worldCenter);
      accum[p.organId].count++;
    }
    for (const [id, entry] of Object.entries(accum)) {
      if (entry.count > 0) {
        this.organCenters[id] = entry.sum.divideScalar(entry.count);
      } else {
        this.organCenters[id] = new THREE.Vector3();
      }
    }
  }

  private updateTractGeometries() {
    const mid = new THREE.Vector3();
    for (const t of this.tractLines) {
      const p0 = this.organCenters[t.fromId];
      const p2 = this.organCenters[t.toId];
      if (!p0 || !p2) continue;
      mid.addVectors(p0, p2).multiplyScalar(0.5);
      const archDir = mid.clone().normalize().multiplyScalar(0.18);
      mid.add(archDir);
      const curve = new THREE.QuadraticBezierCurve3(p0.clone(), mid.clone(), p2.clone());
      const sampled = curve.getPoints(20);
      const attr = t.line.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < sampled.length; i++) {
        attr.setXYZ(i, sampled[i].x, sampled[i].y, sampled[i].z);
      }
      attr.needsUpdate = true;
    }
  }

  private animate(now: number) {
    const t = (now - this.clockStart) * 0.001;

    this.explodeCurrent = THREE.MathUtils.lerp(this.explodeCurrent, this.explodeTarget, 0.1);
    this.sagittalCurrent = THREE.MathUtils.lerp(this.sagittalCurrent, this.sagittalCut ? 1 : 0, 0.1);
    this.sleepTwilight = THREE.MathUtils.lerp(this.sleepTwilight, this.sleepTarget, 0.05);

    this.keyLight.intensity = THREE.MathUtils.lerp(1.85, 0.65, this.sleepTwilight);
    this.rimCyan.intensity = THREE.MathUtils.lerp(1.45, 2.1, this.sleepTwilight);
    this.innerCoreLight.intensity = 0.85 + Math.sin(t * 2.1) * 0.25;

    this.brainRoot.position.y = Math.sin(t * 1.15) * 0.04;
    this.starField.rotation.y = t * 0.015;

    for (const p of this.organParts) {
      const isSelected = p.organId === this.selectedOrgan;
      p.pulse = Math.max(0, p.pulse - 0.025);

      p.mesh.position.copy(p.basePos).addScaledVector(p.explodeVec, this.explodeCurrent);
      if (p.isCortex && p.side === 'R') {
        p.mesh.position.x += this.sagittalCurrent * 2.25;
      }

      const mat = p.mesh.material as THREE.MeshPhysicalMaterial;
      let targetOpacity = p.baseOpacity;
      if (p.isCortex && this.xrayMode) {
        targetOpacity = 0.17;
      }
      if (p.isCortex && p.side === 'R' && this.sagittalCut) {
        targetOpacity = 0.04;
      }
      mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.12);
      mat.depthWrite = mat.opacity > 0.55;
      p.mesh.visible = mat.opacity > 0.05;

      if (p.wireMesh) {
        const wireMat = p.wireMesh.material as THREE.MeshBasicMaterial;
        const targetWire = this.xrayMode && !(p.side === 'R' && this.sagittalCut) ? 0.28 : 0.0;
        wireMat.opacity = THREE.MathUtils.lerp(wireMat.opacity, targetWire, 0.12);
        p.wireMesh.visible = wireMat.opacity > 0.01;
      }

      const idleBreath = 0.88 + Math.sin(t * 2.4 + p.basePos.y * 3) * 0.14;
      const boost = (isSelected ? 0.55 : 0) + p.pulse * 1.35;
      mat.emissiveIntensity = idleBreath + boost;
    }

    this.brainRoot.updateMatrixWorld(true);
    this.updateOrganCenters();
    this.updateTractGeometries();

    for (let i = this.activePulses.length - 1; i >= 0; i--) {
      const pulse = this.activePulses[i];
      const progress = (now - pulse.startTime) / pulse.durationMs;
      if (progress >= 1) {
        this.scene.remove(pulse.group);
        pulse.mats.forEach((m) => m.dispose());
        this.activePulses.splice(i, 1);
        if (pulse.onArrive) pulse.onArrive();
      } else {
        const p0 = this.organCenters[pulse.fromId];
        const p2 = this.organCenters[pulse.toId];
        if (p0 && p2) {
          const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
          mid.add(mid.clone().normalize().multiplyScalar(0.18));
          const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          const inv = 1 - ease;
          pulse.group.position.set(
            inv * inv * p0.x + 2 * inv * ease * mid.x + ease * ease * p2.x,
            inv * inv * p0.y + 2 * inv * ease * mid.y + ease * ease * p2.y,
            inv * inv * p0.z + 2 * inv * ease * mid.z + ease * ease * p2.z,
          );
          const s = 0.85 + Math.sin(progress * Math.PI) * 0.55;
          pulse.group.scale.setScalar(s);
        }
      }
    }

    if (this.showLabels) {
      const w = this.viewportEl.clientWidth;
      const h = this.viewportEl.clientHeight;
      Object.keys(ORGANS_META).forEach((id) => {
        const el = this.labelElements[id];
        const center = this.organCenters[id];
        if (!el || !center) return;
        this.projVec.copy(center).project(this.camera);
        const behind = this.projVec.z > 1;
        if (behind) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        } else {
          const x = (this.projVec.x * 0.5 + 0.5) * w;
          const y = (-this.projVec.y * 0.5 + 0.5) * h;
          el.style.left = `${x}px`;
          el.style.top = `${y}px`;
          el.style.opacity =
            id === this.selectedOrgan || this.explodeCurrent > 0.15 || this.xrayMode || this.sagittalCut
              ? '0.96'
              : '0.72';
          el.style.pointerEvents = 'auto';
        }
      });
    }

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
