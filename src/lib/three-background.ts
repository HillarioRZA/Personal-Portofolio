/**
 * Global fixed Three.js neural core + morphing multi-agent graph.
 * Ported from the approved preview (module 6) and adapted to npm three:
 * imports instead of the global THREE, dispose + visibility pause added.
 */
import * as THREE from 'three';

export interface SceneControl {
  targetGraphState: number;
  isLight: boolean;
}

export function initThreeBackground(canvas: HTMLCanvasElement, sceneControl: SceneControl): () => void {
  if (!canvas) return () => {};

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('Background WebGL unavailable:', err);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 16);

  const handleResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const capDpr = w < 768 ? 1.5 : 1.75;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, capDpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  handleResize();
  window.addEventListener('resize', handleResize, { passive: true });

  // Procedural Soft Glow Sprite Texture
  function createGlowSpriteTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.28, 'rgba(186,230,253,0.85)');
    grad.addColorStop(0.6, 'rgba(56,189,248,0.28)');
    grad.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  const glowTexture = createGlowSpriteTexture();

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const isMobile = window.innerWidth < 768;

  // LAYER 1: CRYSTALLINE MULTI-AGENT CORE + ORBITAL RINGS
  const coreGroup = new THREE.Group();
  coreGroup.position.set(isMobile ? 0 : -5.4, 0.8, -5.2);
  worldGroup.add(coreGroup);

  const coreOuterMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  });
  const coreOuter = new THREE.Mesh(new THREE.IcosahedronGeometry(2.35, 1), coreOuterMat);
  coreGroup.add(coreOuter);

  const coreInnerMat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    wireframe: true,
    transparent: true,
    opacity: 0.34,
  });
  const coreInner = new THREE.Mesh(new THREE.OctahedronGeometry(1.25, 0), coreInnerMat);
  coreGroup.add(coreInner);

  const orbitRing1Mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.22,
  });
  const orbitRing1 = new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.015, 8, 96), orbitRing1Mat);
  orbitRing1.rotation.x = Math.PI * 0.38;
  coreGroup.add(orbitRing1);

  const orbitRing2Mat = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    transparent: true,
    opacity: 0.16,
  });
  const orbitRing2 = new THREE.Mesh(new THREE.TorusGeometry(4.15, 0.012, 8, 96), orbitRing2Mat);
  orbitRing2.rotation.y = Math.PI * 0.42;
  orbitRing2.rotation.x = -Math.PI * 0.24;
  coreGroup.add(orbitRing2);

  // LAYER 2: 3D MULTI-AGENT NEURAL GRAPH (6 MORPHING FORMATIONS)
  const NODE_COUNT = isMobile ? 42 : 68;
  const formations = Array.from({ length: 6 }, () => new Float32Array(NODE_COUNT * 3));

  for (let i = 0; i < NODE_COUNT; i++) {
    const i3 = i * 3;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / NODE_COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;

    // State 0 (Hero & Identity): Wide constellation framing the 3D workstation
    const ang0 = (i / NODE_COUNT) * Math.PI * 2;
    const rad0 = 7.4 + (i % 4) * 1.25;
    formations[0][i3] = Math.cos(ang0) * rad0;
    formations[0][i3 + 1] = Math.sin(ang0) * (rad0 * 0.56);
    formations[0][i3 + 2] = ((i % 7) - 3) * 1.15 - 3.6;

    // State 1 (Approach - Light): Architectural tilted lattice
    const cols = Math.ceil(Math.sqrt(NODE_COUNT));
    const gx = (i % cols) - cols / 2;
    const gy = Math.floor(i / cols) - cols / 2;
    formations[1][i3] = gx * 2.15;
    formations[1][i3 + 1] = gy * 1.75;
    formations[1][i3 + 2] = Math.sin(gx * 0.6 + gy * 0.6) * 1.4 - 3.0;

    // State 2 (AstraeaADK): Multi-agent hub-and-spoke cluster
    const cluster = i % 5;
    const cAngle = (cluster / 5) * Math.PI * 2;
    const cx = Math.cos(cAngle) * 4.8 + 1.4;
    const cy = Math.sin(cAngle) * 3.1;
    const localR = 1.4 + (i % 3) * 0.55;
    formations[2][i3] = cx + Math.cos(theta) * localR;
    formations[2][i3 + 1] = cy + Math.sin(theta) * localR;
    formations[2][i3 + 2] = Math.cos(phi) * 2.0 - 1.5;

    // State 3 (Systems): Deep diagonal ribbon streams
    const t3 = (i / NODE_COUNT) * 2 - 1;
    formations[3][i3] = t3 * 11.5;
    formations[3][i3 + 1] = Math.sin(t3 * 4.5 + (i % 3)) * 3.6;
    formations[3][i3 + 2] = Math.cos(t3 * 3.8) * 2.6 - 2.4;

    // State 4 (Capabilities - Light): Twin opposing orbital cylinders
    const side4 = i % 2 === 0 ? -1 : 1;
    const a4 = (i / NODE_COUNT) * Math.PI * 4;
    formations[4][i3] = side4 * 5.6 + Math.cos(a4) * 2.2;
    formations[4][i3 + 1] = ((i / NODE_COUNT) - 0.5) * 9.5;
    formations[4][i3 + 2] = Math.sin(a4) * 2.2 - 3.0;

    // State 5 (Contact): Converging central neural singularity
    const r5 = 2.8 + (i % 5) * 0.72;
    formations[5][i3] = r5 * Math.sin(phi) * Math.cos(theta);
    formations[5][i3 + 1] = r5 * Math.sin(phi) * Math.sin(theta);
    formations[5][i3 + 2] = r5 * Math.cos(phi) - 1.2;
  }

  const currentPos = new Float32Array(formations[0]);
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(currentPos, 3));

  const nodeMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    map: glowTexture,
    size: isMobile ? 0.52 : 0.62,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nodePoints = new THREE.Points(nodeGeo, nodeMat);
  worldGroup.add(nodePoints);

  // Pre-connected Graph Edges
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    edges.push([i, (i + 1) % NODE_COUNT]);
    edges.push([i, (i + 3) % NODE_COUNT]);
    if (i % 2 === 0) edges.push([i, (i + 7) % NODE_COUNT]);
  }

  const edgePositions = new Float32Array(edges.length * 6);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePositions, 3));
  const edgeMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.17,
  });
  const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
  worldGroup.add(edgeLines);

  // LAYER 3: LIVE SIGNAL PULSES TRAVELING ALONG EDGES
  const PULSE_COUNT = isMobile ? 16 : 28;
  const pulsePositions = new Float32Array(PULSE_COUNT * 3);
  const pulses = Array.from({ length: PULSE_COUNT }, (_, idx) => ({
    edgeIdx: (idx * 5) % edges.length,
    t: Math.random(),
    speed: 0.25 + Math.random() * 0.45,
  }));
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
  const pulseMat = new THREE.PointsMaterial({
    color: 0x10b981,
    map: glowTexture,
    size: 0.44,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
  worldGroup.add(pulsePoints);

  // LAYER 4: LATENT SPACE BACKGROUND DUST
  const DUST_COUNT = isMobile ? 70 : 140;
  const dustPos = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 34;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 24;
    dustPos[i * 3 + 2] = -6 - Math.random() * 14;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x94a3b8,
    size: 0.08,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const dustPoints = new THREE.Points(dustGeo, dustMat);
  scene.add(dustPoints);

  // Mouse Parallax Tracking
  let pointerX = 0;
  let pointerY = 0;
  window.addEventListener('mousemove', (e) => {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // Core Anchor Positions per Section State
  const CORE_ANCHORS = [
    new THREE.Vector3(isMobile ? 0 : -5.4, 0.8, -5.2),
    new THREE.Vector3(isMobile ? 0 : -4.8, 0.4, -4.5),
    new THREE.Vector3(isMobile ? 0 : 3.8, -0.3, -2.2),
    new THREE.Vector3(isMobile ? 0 : -4.2, 0.5, -3.5),
    new THREE.Vector3(isMobile ? 0 : 4.6, 0.2, -4.5),
    new THREE.Vector3(0, 0.1, -1.8),
  ];

  const colDarkCyan = new THREE.Color(0x38bdf8);
  const colLightBlue = new THREE.Color(0x0284c7);
  const colDarkIndigo = new THREE.Color(0x818cf8);
  const colLightIndigo = new THREE.Color(0x4f46e5);

  const bgClock = new THREE.Clock();

  let rafId = 0;
  let disposed = false;
  function animateBg() {
    if (disposed) return;
    rafId = requestAnimationFrame(animateBg);
    if (document.hidden) return;
    const dt = Math.min(bgClock.getDelta(), 0.05);
    const t = bgClock.getElapsedTime();

    const stateIdx = Math.max(0, Math.min(5, sceneControl.targetGraphState));
    const targetArr = formations[stateIdx];

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      const driftX = Math.sin(t * 0.55 + i * 0.7) * 0.16;
      const driftY = Math.cos(t * 0.48 + i * 0.9) * 0.16;
      currentPos[i3] += (targetArr[i3] + driftX - currentPos[i3]) * 0.045;
      currentPos[i3 + 1] += (targetArr[i3 + 1] + driftY - currentPos[i3 + 1]) * 0.045;
      currentPos[i3 + 2] += (targetArr[i3 + 2] - currentPos[i3 + 2]) * 0.045;
    }
    nodeGeo.attributes.position.needsUpdate = true;

    for (let e = 0; e < edges.length; e++) {
      const [a, b] = edges[e];
      const e6 = e * 6;
      edgePositions[e6] = currentPos[a * 3];
      edgePositions[e6 + 1] = currentPos[a * 3 + 1];
      edgePositions[e6 + 2] = currentPos[a * 3 + 2];
      edgePositions[e6 + 3] = currentPos[b * 3];
      edgePositions[e6 + 4] = currentPos[b * 3 + 1];
      edgePositions[e6 + 5] = currentPos[b * 3 + 2];
    }
    edgeGeo.attributes.position.needsUpdate = true;

    for (let p = 0; p < PULSE_COUNT; p++) {
      const pulse = pulses[p];
      pulse.t += dt * pulse.speed;
      if (pulse.t >= 1) {
        pulse.t = 0;
        pulse.edgeIdx = Math.floor(Math.random() * edges.length);
      }
      const [a, b] = edges[pulse.edgeIdx];
      const p3 = p * 3;
      pulsePositions[p3] = currentPos[a * 3] + (currentPos[b * 3] - currentPos[a * 3]) * pulse.t;
      pulsePositions[p3 + 1] = currentPos[a * 3 + 1] + (currentPos[b * 3 + 1] - currentPos[a * 3 + 1]) * pulse.t;
      pulsePositions[p3 + 2] = currentPos[a * 3 + 2] + (currentPos[b * 3 + 2] - currentPos[a * 3 + 2]) * pulse.t;
    }
    pulseGeo.attributes.position.needsUpdate = true;

    coreGroup.position.lerp(CORE_ANCHORS[stateIdx], 0.045);
    coreOuter.rotation.y = t * 0.18;
    coreOuter.rotation.x = t * 0.11;
    coreInner.rotation.y = -t * 0.34;
    coreInner.rotation.z = t * 0.22;
    orbitRing1.rotation.z = t * 0.24;
    orbitRing2.rotation.z = -t * 0.19;

    worldGroup.rotation.y += (pointerX * 0.16 + Math.sin(t * 0.15) * 0.06 - worldGroup.rotation.y) * 0.04;
    worldGroup.rotation.x += (pointerY * 0.1 - worldGroup.rotation.x) * 0.04;
    dustPoints.rotation.y = t * 0.018;

    const targetPrimary = sceneControl.isLight ? colLightBlue : colDarkCyan;
    const targetSecondary = sceneControl.isLight ? colLightIndigo : colDarkIndigo;
    nodeMat.color.lerp(targetPrimary, 0.06);
    edgeMat.color.lerp(targetPrimary, 0.06);
    coreOuterMat.color.lerp(targetPrimary, 0.06);
    coreInnerMat.color.lerp(targetSecondary, 0.06);
    orbitRing1Mat.color.lerp(targetPrimary, 0.06);
    orbitRing2Mat.color.lerp(targetSecondary, 0.06);

    const targetBlending = sceneControl.isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    if (nodeMat.blending !== targetBlending) {
      nodeMat.blending = targetBlending;
      pulseMat.blending = targetBlending;
      nodeMat.needsUpdate = true;
      pulseMat.needsUpdate = true;
    }

    edgeMat.opacity += ((sceneControl.isLight ? 0.11 : 0.17) - edgeMat.opacity) * 0.06;
    nodeMat.opacity += ((sceneControl.isLight ? 0.55 : 0.9) - nodeMat.opacity) * 0.06;
    coreOuterMat.opacity += ((sceneControl.isLight ? 0.14 : 0.22) - coreOuterMat.opacity) * 0.06;

    renderer.render(scene, camera);
  }

  animateBg();

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', handleResize);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => { const mm = m as THREE.MeshBasicMaterial; if (mm.map) mm.map.dispose(); m.dispose(); });
      else if (mat) { const mm = mat as THREE.MeshBasicMaterial; if (mm.map) mm.map.dispose(); mat.dispose(); }
    });
    glowTexture.dispose();
    renderer.dispose();
  };
}
