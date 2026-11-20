/**
 * Frameless 3D neural architect typing at a laptop (hero centerpiece).
 * Ported from the approved preview (module 7) and adapted to npm three:
 * imports instead of the global THREE, dispose + visibility pause added.
 * Composition: holographic floor rings, ergonomic chair, glass desk with
 * steaming mug, backlit laptop with live AstraeaRuntime code screen,
 * auto-facing 7-node holographic architecture graph, seated humanoid with
 * AR visor, headphones and procedural typing animation.
 */
import * as THREE from 'three';

export function initIdentity3DArchitect(stage: HTMLElement, canvas: HTMLCanvasElement): () => void {
  if (!stage || !canvas) return () => {};

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.warn('Identity 3D WebGL unavailable:', err);
    return () => {};
  }

  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40);

  const updateStageSize = () => {
    const rect = stage.getBoundingClientRect();
    const w = Math.max(240, Math.floor(rect.width));
    const h = Math.max(280, Math.floor(rect.height));
    const aspect = w / h;
    const capDpr = w < 640 ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, capDpr));
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    // Adapt framing gracefully for narrow portrait mobile screens
    if (aspect < 1.15) {
      camera.fov = 42;
      camera.position.set(2.9, 1.98, 2.02);
    } else {
      camera.fov = 35;
      camera.position.set(2.58, 1.86, 1.72);
    }
    camera.lookAt(0, 1.04, 0.08);
    camera.updateProjectionMatrix();
  };
  updateStageSize();
  window.addEventListener('resize', updateStageSize, { passive: true });

  // STUDIO + CYBER-HOLOGRAM LIGHTING
  scene.add(new THREE.AmbientLight(0x94a3b8, 0.78));

  const keyLight = new THREE.DirectionalLight(0xe0f2fe, 1.3);
  keyLight.position.set(3.2, 4.8, 3.0);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x818cf8, 1.65);
  rimLight.position.set(-3.4, 3.2, -2.8);
  scene.add(rimLight);

  const screenGlowLight = new THREE.PointLight(0x38bdf8, 2.35, 4.8);
  screenGlowLight.position.set(0, 1.15, 0.34);
  scene.add(screenGlowLight);

  const accentLight = new THREE.PointLight(0x10b981, 0.8, 4.2);
  accentLight.position.set(-0.85, 1.55, 0.65);
  scene.add(accentLight);

  // SLEEK MATERIALS
  const suitMat = new THREE.MeshStandardMaterial({
    color: 0x131b2e,
    roughness: 0.44,
    metalness: 0.52,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x0d1322,
    roughness: 0.58,
    metalness: 0.35,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd8e2f0,
    roughness: 0.36,
    metalness: 0.16,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.55,
    metalness: 0.28,
  });
  const metalDarkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.32,
    metalness: 0.78,
  });
  const laptopBodyMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.26,
    metalness: 0.84,
  });
  const deskGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0c1426,
    roughness: 0.18,
    metalness: 0.75,
    transparent: true,
    opacity: 0.84,
  });
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 1.35,
    roughness: 0.2,
    metalness: 0.2,
  });
  const indigoGlowMat = new THREE.MeshStandardMaterial({
    color: 0x818cf8,
    emissive: 0x6366f1,
    emissiveIntensity: 1.1,
    roughness: 0.25,
    metalness: 0.3,
  });

  const stageGroup = new THREE.Group();
  stageGroup.position.set(0, -0.06, 0);
  scene.add(stageGroup);

  // Helper: Smooth Capsule Limb (Three.js r128 compatible)
  function createCapsuleLimb(radiusTop: number, radiusBottom: number, length: number, mat: THREE.Material) {
    const g = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 16), mat);
    g.add(cyl);
    const capTop = new THREE.Mesh(new THREE.SphereGeometry(radiusTop, 14, 12), mat);
    capTop.position.y = length * 0.5;
    g.add(capTop);
    const capBot = new THREE.Mesh(new THREE.SphereGeometry(radiusBottom, 14, 12), mat);
    capBot.position.y = -length * 0.5;
    g.add(capBot);
    return g;
  }

  const UP_AXIS = new THREE.Vector3(0, 1, 0);
  const _dir = new THREE.Vector3();
  const _mid = new THREE.Vector3();
  function alignLimbBetween(limbGroup: THREE.Group, pA: THREE.Vector3, pB: THREE.Vector3) {
    _dir.subVectors(pB, pA);
    const dist = _dir.length();
    _mid.addVectors(pA, pB).multiplyScalar(0.5);
    limbGroup.position.copy(_mid);
    if (dist > 0.0001) {
      limbGroup.quaternion.setFromUnitVectors(UP_AXIS, _dir.normalize());
    }
  }

  // 1. FLOATING HOLOGRAPHIC FLOOR PLATFORM
  const floorOuterRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.26, 0.008, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
  );
  floorOuterRing.rotation.x = Math.PI * 0.5;
  floorOuterRing.position.y = 0.01;
  stageGroup.add(floorOuterRing);

  const floorInnerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.86, 0.006, 8, 72),
    new THREE.MeshBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.32 })
  );
  floorInnerRing.rotation.x = Math.PI * 0.5;
  floorInnerRing.position.y = 0.012;
  stageGroup.add(floorInnerRing);

  const floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.24, 64),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.045 })
  );
  floorDisc.rotation.x = -Math.PI * 0.5;
  floorDisc.position.y = 0.005;
  stageGroup.add(floorDisc);

  // 2. ERGONOMIC FUTURISTIC CHAIR
  const chairGroup = new THREE.Group();
  chairGroup.position.set(0, 0, -0.46);
  stageGroup.add(chairGroup);

  const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.042, 0.48, 14), metalDarkMat);
  chairStem.position.y = 0.28;
  chairGroup.add(chairStem);

  for (let s = 0; s < 5; s++) {
    const ang = (s / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.026, 0.34), metalDarkMat);
    spoke.position.set(Math.sin(ang) * 0.17, 0.06, Math.cos(ang) * 0.17);
    spoke.rotation.y = ang;
    chairGroup.add(spoke);

    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), metalDarkMat);
    caster.position.set(Math.sin(ang) * 0.32, 0.03, Math.cos(ang) * 0.32);
    chairGroup.add(caster);
  }

  const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.07, 0.52), metalDarkMat);
  seatMesh.position.set(0, 0.53, 0.02);
  chairGroup.add(seatMesh);

  const backSpine = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.72, 0.045), metalDarkMat);
  backSpine.position.set(0, 0.90, -0.27);
  backSpine.rotation.x = -0.10;
  chairGroup.add(backSpine);

  const backCushion = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.055), suitMat);
  backCushion.position.set(0, 0.94, -0.235);
  backCushion.rotation.x = -0.10;
  chairGroup.add(backCushion);

  const chairAccentLine = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.50, 0.015), cyanGlowMat);
  chairAccentLine.position.set(0, 0.94, -0.295);
  chairAccentLine.rotation.x = -0.10;
  chairGroup.add(chairAccentLine);

  // 3. SLEEK MINIMALIST FLOATING TECH DESK
  const deskGroup = new THREE.Group();
  stageGroup.add(deskGroup);

  const tabletopGeo = new THREE.BoxGeometry(1.56, 0.04, 0.78);
  const tabletop = new THREE.Mesh(tabletopGeo, deskGlassMat);
  tabletop.position.set(0, 0.86, 0.42);
  deskGroup.add(tabletop);

  const deskEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(tabletopGeo),
    new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.48 })
  );
  deskEdges.position.copy(tabletop.position);
  deskGroup.add(deskEdges);

  [-0.68, 0.68].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.84, 0.045), metalDarkMat);
    leg.position.set(lx, 0.43, 0.56);
    deskGroup.add(leg);

    const footBar = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.028, 0.56), metalDarkMat);
    footBar.position.set(lx, 0.02, 0.44);
    deskGroup.add(footBar);
  });

  // Coffee Mug + Rising Steam Wisps
  const mugGroup = new THREE.Group();
  mugGroup.position.set(-0.54, 0.925, 0.34);
  deskGroup.add(mugGroup);

  mugGroup.add(new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.09, 16), metalDarkMat));
  const mugRim = new THREE.Mesh(new THREE.TorusGeometry(0.041, 0.004, 8, 20), cyanGlowMat);
  mugRim.rotation.x = Math.PI * 0.5;
  mugRim.position.y = 0.044;
  mugGroup.add(mugRim);
  const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 8, 16, Math.PI), metalDarkMat);
  mugHandle.position.set(-0.042, 0, 0);
  mugHandle.rotation.z = Math.PI * 0.5;
  mugGroup.add(mugHandle);

  const steamParticles: THREE.Mesh[] = [];
  for (let st = 0; st < 4; st++) {
    const wisp = new THREE.Mesh(
      new THREE.SphereGeometry(0.014, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.35 })
    );
    wisp.userData = { phase: st * 1.55 };
    mugGroup.add(wisp);
    steamParticles.push(wisp);
  }

  // 4. DETAILED 3D LAPTOP + LIVE CODE SCREEN
  const laptopGroup = new THREE.Group();
  laptopGroup.position.set(0, 0.885, 0.34);
  stageGroup.add(laptopGroup);

  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.022, 0.40), laptopBodyMat);
  laptopBase.position.y = 0.011;
  laptopGroup.add(laptopBase);

  // Glowing Backlit Keyboard Matrix
  const keyMeshes: THREE.Mesh[] = [];
  const kbRows = 4;
  const kbCols = 11;
  for (let r = 0; r < kbRows; r++) {
    for (let c = 0; c < kbCols; c++) {
      const keyMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.22,
        roughness: 0.4,
      });
      const key = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.006, 0.032), keyMat);
      key.position.set(
        (c - (kbCols - 1) / 2) * 0.047,
        0.024,
        (r - (kbRows - 1) / 2) * 0.044 - 0.015
      );
      laptopGroup.add(key);
      keyMeshes.push(key);
    }
  }

  const trackpad = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.085),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.16 })
  );
  trackpad.rotation.x = -Math.PI * 0.5;
  trackpad.position.set(0, 0.0235, -0.14);
  laptopGroup.add(trackpad);

  // Animated Code Screen CanvasTexture
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256;
  screenCanvas.height = 160;
  const sCtx = screenCanvas.getContext('2d')!;
  const screenTexture = new THREE.CanvasTexture(screenCanvas);
  const CODE_LINES = [
    { col: '#38BDF8', txt: 'class AstraeaRuntime:' },
    { col: '#94A3B8', txt: '  def turn_loop(self, moa):' },
    { col: '#818CF8', txt: '    ctx = verify_budget(moa)' },
    { col: '#10B981', txt: '    if cov_guard.audit(ctx):' },
    { col: '#38BDF8', txt: '      commit_md_graph(ctx)' },
    { col: '#E2E8F0', txt: '    return DeterministicOK' },
    { col: '#10B981', txt: '>>> AUDIT PASS [0.42ms]' },
  ];

  function drawLaptopScreen(t: number, isTyping: boolean) {
    sCtx.fillStyle = '#040814';
    sCtx.fillRect(0, 0, 256, 160);

    sCtx.fillStyle = '#0c162d';
    sCtx.fillRect(0, 0, 256, 18);
    sCtx.fillStyle = '#38BDF8';
    sCtx.font = 'bold 9px monospace';
    sCtx.fillText('ASTRAEA_CORE // NATIVE RUNTIME', 10, 12);

    sCtx.font = '10px monospace';
    const cycle = Math.floor(t * 2.4);
    for (let i = 0; i < CODE_LINES.length; i++) {
      const line = CODE_LINES[(i + Math.floor(cycle / 18)) % CODE_LINES.length];
      const y = 36 + i * 17;
      sCtx.fillStyle = line.col;
      if (i === CODE_LINES.length - 1) {
        const chars = Math.max(1, Math.floor((t * 14) % (line.txt.length + 4)));
        const visibleTxt = line.txt.slice(0, chars);
        const cursor = isTyping && Math.floor(t * 5) % 2 === 0 ? '_' : '';
        sCtx.fillText(visibleTxt + cursor, 10, y);
      } else {
        sCtx.fillText(line.txt, 10, y);
      }
    }
    screenTexture.needsUpdate = true;
  }
  drawLaptopScreen(0, true);

  const laptopLidPivot = new THREE.Group();
  laptopLidPivot.position.set(0, 0.022, 0.195);
  laptopLidPivot.rotation.x = 0.24;
  laptopGroup.add(laptopLidPivot);

  const lidFrame = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.39, 0.016), laptopBodyMat);
  lidFrame.position.set(0, 0.195, 0);
  laptopLidPivot.add(lidFrame);

  const screenDisplay = new THREE.Mesh(
    new THREE.PlaneGeometry(0.57, 0.345),
    new THREE.MeshBasicMaterial({ map: screenTexture })
  );
  screenDisplay.position.set(0, 0.195, -0.009);
  screenDisplay.rotation.y = Math.PI;
  laptopLidPivot.add(screenDisplay);

  const lidLogo = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), cyanGlowMat);
  lidLogo.scale.set(1, 1, 0.25);
  lidLogo.position.set(0, 0.20, 0.012);
  laptopLidPivot.add(lidLogo);

  // 5. FLOATING HOLOGRAPHIC SYSTEM ARCHITECTURE GRAPH ABOVE LAPTOP
  const holoCanvas = document.createElement('canvas');
  holoCanvas.width = 512;
  holoCanvas.height = 280;
  const hCtx = holoCanvas.getContext('2d')!;
  const holoTexture = new THREE.CanvasTexture(holoCanvas);

  const GRAPH_NODES = [
    { x: 256, y: 146, label: 'MULTI-AGENT', color: '#38BDF8', r: 10 },
    { x: 108, y: 74, label: 'PYTHON · JS', color: '#818CF8', r: 7 },
    { x: 404, y: 74, label: 'PG · MONGO · MYSQL', color: '#10B981', r: 7 },
    { x: 84, y: 158, label: 'ZERO-WRAPPER', color: '#38BDF8', r: 7 },
    { x: 428, y: 158, label: 'MCP · BYOK', color: '#38BDF8', r: 7 },
    { x: 142, y: 230, label: 'GOVERNANCE', color: '#818CF8', r: 7 },
    { x: 370, y: 230, label: 'MANUAL AUDIT', color: '#10B981', r: 7 },
  ];

  const GRAPH_LINKS = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 3], [2, 4], [3, 5], [4, 6], [1, 2], [5, 6],
  ];

  function drawHoloGraph(t: number) {
    hCtx.clearRect(0, 0, 512, 280);

    // Translucent Holographic Glass Plate
    hCtx.fillStyle = 'rgba(5, 11, 24, 0.80)';
    hCtx.fillRect(4, 4, 504, 272);
    hCtx.strokeStyle = 'rgba(56, 189, 248, 0.62)';
    hCtx.lineWidth = 2;
    hCtx.strokeRect(4, 4, 504, 272);

    // Top Telemetry Header Bar
    hCtx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    hCtx.fillRect(5, 5, 502, 28);
    hCtx.fillStyle = '#38BDF8';
    hCtx.font = 'bold 12px monospace';
    hCtx.textAlign = 'left';
    hCtx.fillText('SYSTEM ARCHITECTURE GRAPH // NATIVE CORE', 16, 23);

    // Live Status Dot
    hCtx.fillStyle = '#10B981';
    hCtx.beginPath();
    hCtx.arc(488, 19, 4.5, 0, Math.PI * 2);
    hCtx.fill();

    // Draw Connecting Graph Edges + Live Traveling Signal Pulses
    GRAPH_LINKS.forEach(([aIdx, bIdx], linkIdx) => {
      const a = GRAPH_NODES[aIdx];
      const b = GRAPH_NODES[bIdx];

      hCtx.strokeStyle = aIdx === 0 ? 'rgba(56, 189, 248, 0.42)' : 'rgba(129, 140, 248, 0.22)';
      hCtx.lineWidth = aIdx === 0 ? 1.8 : 1.1;
      hCtx.beginPath();
      hCtx.moveTo(a.x, a.y);
      hCtx.lineTo(b.x, b.y);
      hCtx.stroke();

      // Traveling Pulse Particle Along Primary Spokes
      if (aIdx === 0 || linkIdx % 2 === 0) {
        const prog = (t * 0.65 + linkIdx * 0.23) % 1;
        const px = a.x + (b.x - a.x) * prog;
        const py = a.y + (b.y - a.y) * prog;
        hCtx.fillStyle = b.color;
        hCtx.beginPath();
        hCtx.arc(px, py, 3.2, 0, Math.PI * 2);
        hCtx.fill();
      }
    });

    // Draw Glowing Nodes & Crisp Labels
    GRAPH_NODES.forEach((n, idx) => {
      const pulse = 1 + Math.sin(t * 3.2 + idx * 1.1) * 0.18;

      // Outer Halo
      hCtx.fillStyle = n.color + '33';
      hCtx.beginPath();
      hCtx.arc(n.x, n.y, n.r * 2.1 * pulse, 0, Math.PI * 2);
      hCtx.fill();

      // Core Node
      hCtx.fillStyle = n.color;
      hCtx.beginPath();
      hCtx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      hCtx.fill();

      // Crisp Pill Label Below/Above Node
      hCtx.font = idx === 0 ? 'bold 12px monospace' : 'bold 11px monospace';
      const textW = hCtx.measureText(n.label).width;
      const ly = idx === 0 ? n.y + 24 : (n.y < 100 ? n.y - 16 : n.y + 22);

      hCtx.fillStyle = 'rgba(4, 8, 18, 0.90)';
      hCtx.fillRect(n.x - textW / 2 - 7, ly - 11, textW + 14, 17);
      hCtx.strokeStyle = n.color + '88';
      hCtx.lineWidth = 1;
      hCtx.strokeRect(n.x - textW / 2 - 7, ly - 11, textW + 14, 17);

      hCtx.fillStyle = '#F4F4F7';
      hCtx.textAlign = 'center';
      hCtx.fillText(n.label, n.x, ly + 1);
    });

    holoTexture.needsUpdate = true;
  }
  drawHoloGraph(0);

  const holoPanelMain = new THREE.Mesh(
    new THREE.PlaneGeometry(0.98, 0.54),
    new THREE.MeshBasicMaterial({
      map: holoTexture,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
    })
  );
  holoPanelMain.position.set(0.02, 1.56, 0.44);
  stageGroup.add(holoPanelMain);

  // Subtle Holographic Projection Beam From Laptop To Floating Graph
  const projBeam = new THREE.Mesh(
    new THREE.ConeGeometry(0.46, 0.50, 4, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.045,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  projBeam.position.set(0.02, 1.24, 0.40);
  projBeam.rotation.x = Math.PI;
  projBeam.rotation.y = Math.PI * 0.25;
  stageGroup.add(projBeam);

  // 6. SEATED 3D AI ENGINEER FIGURE (HUMANOID + AR VISOR + ANIMATED TYPING ARMS)
  const charGroup = new THREE.Group();
  charGroup.position.set(0, 0, -0.40);
  stageGroup.add(charGroup);

  // Pelvis / Hips Seated on Chair
  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.24), pantsMat);
  pelvis.position.set(0, 0.62, 0.02);
  charGroup.add(pelvis);

  // Seated Legs (Thighs Forward + Calves Down + Sleek Shoes)
  [-0.105, 0.105].forEach((sideX) => {
    const hipPos = new THREE.Vector3(sideX, 0.61, 0.06);
    const kneePos = new THREE.Vector3(sideX * 1.15, 0.57, 0.46);
    const anklePos = new THREE.Vector3(sideX * 1.12, 0.10, 0.48);

    const thigh = createCapsuleLimb(0.068, 0.056, hipPos.distanceTo(kneePos), pantsMat);
    alignLimbBetween(thigh, hipPos, kneePos);
    charGroup.add(thigh);

    const calf = createCapsuleLimb(0.054, 0.042, kneePos.distanceTo(anklePos), pantsMat);
    alignLimbBetween(calf, kneePos, anklePos);
    charGroup.add(calf);

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.065, 0.21), metalDarkMat);
    shoe.position.set(anklePos.x, 0.055, anklePos.z + 0.05);
    charGroup.add(shoe);

    const shoeStripe = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.012, 0.19), cyanGlowMat);
    shoeStripe.position.set(anklePos.x, 0.032, anklePos.z + 0.05);
    charGroup.add(shoeStripe);
  });

  // Torso Pivot (Leans Slightly Forward + Subtle Breathing)
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.68, 0.0);
  torsoPivot.rotation.x = 0.13;
  charGroup.add(torsoPivot);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.155, 0.46, 18), suitMat);
  chest.scale.set(1.12, 1, 0.72);
  chest.position.y = 0.24;
  torsoPivot.add(chest);

  // Collar & Luminous Tech Seam Down Jacket Front
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.026, 10, 24), suitMat);
  collar.rotation.x = Math.PI * 0.5;
  collar.position.set(0, 0.46, 0.01);
  torsoPivot.add(collar);

  const jacketStripe = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.40, 0.014), cyanGlowMat);
  jacketStripe.position.set(0, 0.24, 0.138);
  torsoPivot.add(jacketStripe);

  // Shoulder Caps
  [-0.22, 0.22].forEach((sx) => {
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.068, 14, 14), suitMat);
    shoulder.position.set(sx, 0.42, 0.01);
    torsoPivot.add(shoulder);
  });

  // Neck & Head Group (Gentle Focus Nods & Screen Scanning)
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.48, 0.02);
  torsoPivot.add(headPivot);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.058, 0.09, 14), skinMat);
  neck.position.y = 0.04;
  headPivot.add(neck);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.142, 24, 20), skinMat);
  headMesh.scale.set(0.92, 1.06, 0.96);
  headMesh.position.y = 0.185;
  headPivot.add(headMesh);

  // Styled Modern Hair Cap
  const hairMain = new THREE.Mesh(
    new THREE.SphereGeometry(0.148, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairMain.scale.set(0.94, 1.06, 1.0);
  hairMain.position.set(0, 0.198, -0.012);
  hairMain.rotation.x = -0.18;
  headPivot.add(hairMain);

  // Sleek Futuristic AR Visor / Glasses
  const visorBand = new THREE.Mesh(new THREE.BoxGeometry(0.225, 0.054, 0.06), metalDarkMat);
  visorBand.position.set(0, 0.195, 0.118);
  headPivot.add(visorBand);

  const visorGlow = new THREE.Mesh(new THREE.BoxGeometry(0.205, 0.022, 0.014), cyanGlowMat);
  visorGlow.position.set(0, 0.195, 0.146);
  headPivot.add(visorGlow);

  // Studio Headphones
  const hpBand = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.015, 10, 28, Math.PI), metalDarkMat);
  hpBand.position.set(0, 0.21, -0.005);
  headPivot.add(hpBand);

  [-0.148, 0.148].forEach((hx) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.036, 16), metalDarkMat);
    cup.rotation.z = Math.PI * 0.5;
    cup.position.set(hx, 0.19, 0.0);
    headPivot.add(cup);

    const cupRing = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.006, 8, 20), indigoGlowMat);
    cupRing.rotation.y = Math.PI * 0.5;
    cupRing.position.set(hx + (hx > 0 ? 0.019 : -0.019), 0.19, 0.0);
    headPivot.add(cupRing);
  });

  // DYNAMIC ARTICULATED TYPING ARMS & HANDS
  const armRig: Record<string, any> = {
    left: {
      shoulder: new THREE.Vector3(-0.22, 1.09, -0.34),
      elbow: new THREE.Vector3(-0.28, 0.94, 0.0),
      wrist: new THREE.Vector3(-0.11, 0.935, 0.28),
      upperMesh: null,
      lowerMesh: null,
      handGroup: null,
      fingers: [],
    },
    right: {
      shoulder: new THREE.Vector3(0.22, 1.09, -0.34),
      elbow: new THREE.Vector3(0.28, 0.94, 0.0),
      wrist: new THREE.Vector3(0.11, 0.935, 0.28),
      upperMesh: null,
      lowerMesh: null,
      handGroup: null,
      fingers: [],
    },
  };

  ['left', 'right'].forEach((side) => {
    const rig = armRig[side];
    const upperLen = rig.shoulder.distanceTo(rig.elbow);
    const lowerLen = rig.elbow.distanceTo(rig.wrist);

    rig.upperMesh = createCapsuleLimb(0.052, 0.044, upperLen, suitMat);
    rig.lowerMesh = createCapsuleLimb(0.042, 0.033, lowerLen, suitMat);
    stageGroup.add(rig.upperMesh);
    stageGroup.add(rig.lowerMesh);

    const handGroup = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.022, 0.072), skinMat);
    handGroup.add(palm);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.011, 0.038), skinMat);
      finger.position.set((f - 1.5) * 0.016, -0.004, 0.045);
      handGroup.add(finger);
      rig.fingers.push(finger);
    }

    rig.handGroup = handGroup;
    stageGroup.add(handGroup);
  });

  // Subtle Ambient Floating Code Motes Around Workstation
  const MOTE_COUNT = 26;
  const motePos = new Float32Array(MOTE_COUNT * 3);
  for (let m = 0; m < MOTE_COUNT; m++) {
    const ang = (m / MOTE_COUNT) * Math.PI * 2;
    const r = 0.65 + (m % 4) * 0.22;
    motePos[m * 3] = Math.cos(ang) * r;
    motePos[m * 3 + 1] = 0.35 + (m % 6) * 0.26;
    motePos[m * 3 + 2] = Math.sin(ang) * r;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
  const motePoints = new THREE.Points(
    moteGeo,
    new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.032, transparent: true, opacity: 0.65 })
  );
  stageGroup.add(motePoints);

  // INTERACTIVE 360° DRAG / TOUCH ORBIT
  let isDragging = false;
  let lastX = 0;
  let targetRotY = -0.22;
  let currentRotY = -0.22;
  let hoverTiltX = 0;

  stage.addEventListener('pointerdown', (e) => {
    isDragging = true;
    lastX = e.clientX;
  });

  window.addEventListener('pointermove', (e) => {
    if (isDragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetRotY += dx * 0.0085;
    } else {
      const rect = stage.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const normY = (e.clientY - rect.top) / rect.height - 0.5;
        hoverTiltX = normY * 0.14;
      }
    }
  }, { passive: true });

  window.addEventListener('pointerup', () => { isDragging = false; });
  window.addEventListener('pointercancel', () => { isDragging = false; });

  // ANIMATION LOOP: REALISTIC TYPING CADENCE + LIVING HOLOGRAMS
  const clock = new THREE.Clock();
  let lastCanvasUpdate = 0;
  let lastKeyFlash = 0;
  let activeKeyIdx = 0;

  let rafId = 0;
  let disposed = false;
  function animateArchitect() {
    if (disposed) return;
    rafId = requestAnimationFrame(animateArchitect);
    if (document.hidden) return;
    const t = clock.getElapsedTime();

    // Natural Typing Burst vs Brief Thinking Pause Cycle
    const cyclePhase = t % 6.2;
    const isTyping = cyclePhase < 4.7;
    const typeAmp = isTyping ? 1.0 : 0.14;

    // Subtle Breathing & Focused Head Micro-Movements
    const breath = Math.sin(t * 2.1) * 0.012;
    torsoPivot.position.y = 0.68 + breath;
    torsoPivot.rotation.x = 0.13 + (isTyping ? 0.035 : -0.015) + Math.sin(t * 1.4) * 0.012;

    headPivot.rotation.x = 0.14 + (isTyping ? Math.sin(t * 2.8) * 0.028 : -0.05);
    headPivot.rotation.y = Math.sin(t * 0.95) * 0.11;
    headPivot.rotation.z = Math.cos(t * 0.7) * 0.03;

    // Update Left & Right Articulated Typing Hands & Limbs
    const leftStrike = Math.sin(t * 16.5) * 0.5 + 0.5;
    const rightStrike = Math.sin(t * 16.5 + 2.35) * 0.5 + 0.5;

    const lWrist = armRig.left.wrist;
    lWrist.set(
      -0.115 + Math.sin(t * 3.1) * 0.055 * typeAmp,
      0.928 + leftStrike * 0.022 * typeAmp,
      0.295 + Math.cos(t * 2.6) * 0.028 * typeAmp
    );

    const rWrist = armRig.right.wrist;
    rWrist.set(
      0.115 + Math.cos(t * 3.4) * 0.055 * typeAmp,
      0.928 + rightStrike * 0.022 * typeAmp,
      0.295 + Math.sin(t * 2.9) * 0.028 * typeAmp
    );

    armRig.left.shoulder.set(-0.22, 1.09 + breath, -0.34);
    armRig.right.shoulder.set(0.22, 1.09 + breath, -0.34);

    armRig.left.elbow.set(-0.29, 0.95 + leftStrike * 0.008 * typeAmp, 0.01);
    armRig.right.elbow.set(0.29, 0.95 + rightStrike * 0.008 * typeAmp, 0.01);

    ['left', 'right'].forEach((side, sIdx) => {
      const rig = armRig[side];
      alignLimbBetween(rig.upperMesh, rig.shoulder, rig.elbow);
      alignLimbBetween(rig.lowerMesh, rig.elbow, rig.wrist);

      rig.handGroup.position.copy(rig.wrist);
      rig.handGroup.rotation.x = 0.22 + (sIdx === 0 ? leftStrike : rightStrike) * 0.16 * typeAmp;

      rig.fingers.forEach((finger: THREE.Mesh, fIdx: number) => {
        const fWave = Math.sin(t * 21.0 + fIdx * 1.45 + sIdx * 2.5);
        finger.rotation.x = 0.35 + Math.max(0, fWave) * 0.42 * typeAmp;
      });
    });

    // Sync Backlit Keyboard Key Flashes With Typing Cadence
    if (isTyping && t - lastKeyFlash > 0.085) {
      lastKeyFlash = t;
      if (keyMeshes[activeKeyIdx]) {
        (keyMeshes[activeKeyIdx].material as THREE.MeshStandardMaterial).emissiveIntensity = 0.22;
        keyMeshes[activeKeyIdx].position.y = 0.024;
      }
      activeKeyIdx = Math.floor(Math.random() * keyMeshes.length);
      if (keyMeshes[activeKeyIdx]) {
        (keyMeshes[activeKeyIdx].material as THREE.MeshStandardMaterial).emissiveIntensity = 2.4;
        keyMeshes[activeKeyIdx].position.y = 0.021;
      }
    }

    // Dynamic Screen Glow Pulse
    screenGlowLight.intensity = 2.15 + Math.sin(t * 5.2) * 0.28 + (isTyping ? 0.25 : 0);

    // Update Live Code Screen & Floating Graph Canvas (~15 FPS)
    if (t - lastCanvasUpdate > 0.068) {
      lastCanvasUpdate = t;
      drawLaptopScreen(t, isTyping);
      drawHoloGraph(t);
    }

    // Gentle Holographic Panel Levitation & Camera-Facing Orientation
    holoPanelMain.position.y = 1.56 + Math.sin(t * 1.8) * 0.032;
    const camAngle = Math.atan2(camera.position.x, camera.position.z);
    holoPanelMain.rotation.y = camAngle - currentRotY;

    // Rising Coffee Steam Wisps
    steamParticles.forEach((wisp) => {
      const p = (t * 0.55 + wisp.userData.phase) % 1;
      wisp.position.set(
        Math.sin(t * 2.4 + wisp.userData.phase) * 0.016,
        0.055 + p * 0.16,
        Math.cos(t * 2.1 + wisp.userData.phase) * 0.014
      );
      const scale = 0.7 + p * 1.1;
      wisp.scale.set(scale, scale, scale);
      (wisp.material as THREE.MeshBasicMaterial).opacity = Math.sin(p * Math.PI) * 0.34;
    });

    // Floor Ring & Mote Drift
    floorOuterRing.rotation.z = t * 0.14;
    floorInnerRing.rotation.z = -t * 0.22;
    motePoints.rotation.y = t * 0.12;

    // Smooth Orbit Interpolation + Gentle Idle Sway
    if (!isDragging) {
      targetRotY += Math.sin(t * 0.45) * 0.00055;
    }
    currentRotY += (targetRotY - currentRotY) * 0.075;
    stageGroup.rotation.y = currentRotY;
    stageGroup.rotation.x += (hoverTiltX - stageGroup.rotation.x) * 0.06;

    renderer.render(scene, camera);
  }

  animateArchitect();

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', updateStageSize);
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      const mat = (mesh as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((m) => { const mm = m as THREE.MeshBasicMaterial; if (mm.map) mm.map.dispose(); m.dispose(); });
      else if (mat) { const mm = mat as THREE.MeshBasicMaterial; if (mm.map) mm.map.dispose(); mat.dispose(); }
    });
    screenTexture.dispose();
    holoTexture.dispose();
    renderer.dispose();
  };
}
