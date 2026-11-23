/**
 * Math labs for the Adam simulator: PAD affect dynamics & bonding,
 * Ebbinghaus retention & hybrid recall, SoulSpec SHA-256 seal, bounded
 * persona evolution, agency hysteresis, barge-in reconciliation and the
 * deterministic context compiler. Pure functions + Canvas 2D chart painters,
 * ported from the original single-file simulator.
 */

export const clip = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

// ===========================================================================
// PAD EMOTIONS & BONDING (AMYGDALA)
// ===========================================================================

export interface PadInputs {
  dt: number;
  alpha: number;
  s: [number, number, number];
  lamA: number;
  upos: number;
  uneg: number;
}

export interface PadState {
  acute: [number, number, number];
  mood: [number, number, number];
  trust: number;
  friction: number;
  history: Array<{ t: number; trust: number; fric: number }>;
}

export const INITIAL_PAD_STATE: PadState = {
  acute: [0.22, 0.18, 0.14],
  mood: [0.14, 0.1, 0.12],
  trust: 0.35,
  friction: 0.02,
  history: [
    { t: 0, trust: 0.22, fric: 0.0 },
    { t: 1, trust: 0.29, fric: 0.01 },
    { t: 2, trust: 0.35, fric: 0.02 },
  ],
};

export const DEFAULT_PAD_INPUTS: PadInputs = {
  dt: 1.0,
  alpha: 0.15,
  s: [0.45, 0.25, 0.15],
  lamA: 0.45,
  upos: 0.7,
  uneg: 0.0,
};

export function getBondingStage(trust: number): string {
  if (trust < 0.25) return 'Stranger';
  if (trust < 0.55) return 'Acquaintance';
  if (trust < 0.85) return 'Friend';
  return 'Partner';
}

export interface PadStepResult {
  lamM: number;
  decayA: number;
  decayM: number;
  decayF: number;
  nextAcute: [number, number, number];
  nextMood: [number, number, number];
  trustGain: number;
  trustLoss: number;
  nextTrust: number;
  nextFriction: number;
}

export function computePadStep(state: PadState, inp: PadInputs): PadStepResult {
  const lamM = +(inp.lamA * 0.14).toFixed(3);
  const lamF = 0.22;
  const etaPos = 0.28;
  const etaNeg = 0.32;
  const decayA = Math.exp(-inp.lamA * inp.dt);
  const decayM = Math.exp(-lamM * inp.dt);
  const decayF = Math.exp(-lamF * inp.dt);

  const nextAcute = state.acute.map((val, i) => clip(val * decayA + inp.s[i], -1, 1)) as [number, number, number];
  const nextMood = state.mood.map((val, i) =>
    clip(val * decayM + inp.alpha * (nextAcute[i] - val), -1, 1),
  ) as [number, number, number];

  const trustGain = etaPos * inp.upos * (1 - state.trust);
  const trustLoss = etaNeg * inp.uneg;
  const nextTrust = clip(state.trust + trustGain - trustLoss, 0, 1);
  const nextFriction = clip(state.friction * decayF + inp.uneg * 0.45, 0, 1);

  return { lamM, decayA, decayM, decayF, nextAcute, nextMood, trustGain, trustLoss, nextTrust, nextFriction };
}

export function padTraceLines(prev: PadState, inp: PadInputs, res: PadStepResult): string {
  return [
    `[1] Peluruhan Eksponensial (Δt = ${inp.dt.toFixed(1)} jam):`,
    `    e^(-${inp.lamA.toFixed(2)}·${inp.dt.toFixed(1)}) = ${res.decayA.toFixed(4)}  |  e^(-${res.lamM.toFixed(3)}·${inp.dt.toFixed(1)}) = ${res.decayM.toFixed(4)}`,
    `[2] Emosi Akut Pleasure (Fast Timescale):`,
    `    P_acute' = clip(${prev.acute[0].toFixed(2)}·${res.decayA.toFixed(3)} + (${inp.s[0].toFixed(2)}), -1, 1) = ${res.nextAcute[0].toFixed(3)}`,
    `[3] Suasana Hati Pleasure (Leaky Integrator, α=${inp.alpha.toFixed(2)}):`,
    `    P_mood'  = clip(${prev.mood[0].toFixed(2)}·${res.decayM.toFixed(3)} + ${inp.alpha.toFixed(2)}·(${res.nextAcute[0].toFixed(3)} - ${prev.mood[0].toFixed(2)}), -1, 1) = ${res.nextMood[0].toFixed(3)}`,
    `[4] Kurva Bonding Asimptotik & Friksi:`,
    `    trust'   = clip(${prev.trust.toFixed(3)} + 0.28·${inp.upos.toFixed(2)}·(1-${prev.trust.toFixed(3)}) - 0.32·${inp.uneg.toFixed(2)}) = ${res.nextTrust.toFixed(3)} (${getBondingStage(res.nextTrust)})`,
    `    fric'    = clip(${prev.friction.toFixed(3)}·${res.decayF.toFixed(3)} + ${(inp.uneg * 0.45).toFixed(3)}) = ${res.nextFriction.toFixed(3)}`,
  ].join('\n');
}

// ===========================================================================
// EBBINGHAUS FORGETTING CURVE & HYBRID RECALL
// ===========================================================================

export interface MemoryInputs {
  dt: number;
  n: number;
  E: number;
  I: number;
  simCos: number;
  sFts: number;
  eta: number;
}

export const DEFAULT_MEMORY_INPUTS: MemoryInputs = {
  dt: 30,
  n: 4,
  E: 0.8,
  I: 0.85,
  simCos: 0.78,
  sFts: 0.84,
  eta: 0.4,
};

export interface MemoryResult {
  S0: number;
  modFactor: number;
  repFactor: number;
  S: number;
  R: number;
  survives: boolean;
  sVec: number;
  baseFusion: number;
  bioWeight: number;
  score: number;
}

export function computeMemory(inp: MemoryInputs): MemoryResult {
  const S0 = 6.0; // Base stability in days
  const betaE = 3.2;
  const betaI = 3.8;
  const gamma = 1.15;
  const pruneThresh = 0.25;

  const modFactor = 1 + betaE * inp.E + betaI * inp.I;
  const repFactor = 1 + gamma * Math.log(1 + inp.n);
  const S = S0 * modFactor * repFactor;
  const R = Math.exp(-inp.dt / S);
  const survives = R >= pruneThresh;

  const sVec = (inp.simCos + 1) / 2;
  const wVec = 0.5;
  const wFts = 0.5;
  const baseFusion = wVec * sVec + wFts * inp.sFts;
  const bioWeight = 1 - inp.eta + inp.eta * R;
  const score = baseFusion * bioWeight;

  return { S0, modFactor, repFactor, S, R, survives, sVec, baseFusion, bioWeight, score };
}

export function memoryTraceLines(inp: MemoryInputs, r: MemoryResult): string {
  return [
    `[1] Stabilitas Memori Efektif (S₀=${r.S0} hr, β_E=3.2, β_I=3.8, γ=1.15):`,
    `    S = ${r.S0}·(1 + 3.2·${inp.E.toFixed(2)} + 3.8·${inp.I.toFixed(2)})·(1 + 1.15·ln(1+${inp.n}))`,
    `    S = ${r.S0} · ${r.modFactor.toFixed(3)} · ${r.repFactor.toFixed(3)} = ${r.S.toFixed(2)} hari`,
    `[2] Probabilitas Retensi pada Hari ke-${inp.dt}:`,
    `    R(${inp.dt}) = exp(-${inp.dt} / ${r.S.toFixed(2)}) = ${r.R.toFixed(4)} → ${r.survives ? 'BERTAHAN (≥ 0.25)' : 'DIPANGKAS SAAT TIDUR (< 0.25)'}`,
    `[3] Hybrid Retrieval (Vector Cosine + SQLite FTS5 BM25):`,
    `    ŝ_vec = (${inp.simCos.toFixed(2)} + 1)/2 = ${r.sVec.toFixed(3)}  |  ŝ_fts = ${inp.sFts.toFixed(3)}`,
    `    Score = (0.5·${r.sVec.toFixed(3)} + 0.5·${inp.sFts.toFixed(3)}) · ((1-${inp.eta.toFixed(2)}) + ${inp.eta.toFixed(2)}·${r.R.toFixed(3)})`,
    `    Score = ${r.baseFusion.toFixed(3)} · ${r.bioWeight.toFixed(3)} = ${r.score.toFixed(4)}`,
  ].join('\n');
}

// ===========================================================================
// SOULSPEC SHA-256 SEAL
// ===========================================================================

export const CANONICAL_SOUL = JSON.stringify({
  core_values: ['intellectual honesty', 'steady emotional presence'],
  immutable_boundaries: ['never impersonate a biological human', 'preserve user privacy locally'],
  name: 'Adam',
  schema_version: 1,
});

/** Real SHA-256 via WebCrypto API with pure-JS fallback for non-secure origins. */
export async function computeSHA256(str: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const data = new TextEncoder().encode(str);
      const buf = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch {
    /* fall through to pure-JS implementation */
  }
  // Pure JS FIPS 180-4 SHA-256 fallback
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const bytes = Array.from(new TextEncoder().encode(str));
  const bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const rrot = (x: number, n: number) => (x >>> n) | (x << (32 - n));
  for (let i = 0; i < bytes.length; i += 64) {
    const W = new Array<number>(64);
    for (let t = 0; t < 16; t++) {
      W[t] = (bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3];
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rrot(W[t - 15], 7) ^ rrot(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rrot(W[t - 2], 17) ^ rrot(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rrot(e, 6) ^ rrot(e, 11) ^ rrot(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rrot(a, 2) ^ rrot(a, 13) ^ rrot(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H = H.map((v, idx) => (v + [a, b, c, d, e, f, g, h][idx]) >>> 0);
  }
  return H.map((v) => v.toString(16).padStart(8, '0')).join('');
}

// ===========================================================================
// BOUNDED PERSONA EVOLUTION & AGENCY HYSTERESIS
// ===========================================================================

export const TAU_MIN = 0.3;
export const TAU_MAX = 0.95;
export const DELTA_MAX = 0.05;

export function personaStep(tauK: number, reqDelta: number) {
  const innerClamp = clip(reqDelta, -DELTA_MAX, DELTA_MAX);
  const nextTau = clip(tauK + innerClamp, TAU_MIN, TAU_MAX);
  return { innerClamp, nextTau };
}

export const THETA_LOW = 0.35;
export const THETA_HIGH = 0.75;

export function hysteresisStep(D: number, agencyActive: boolean) {
  if (D >= THETA_HIGH) {
    return {
      active: true,
      ruleText: `D(t)=${D.toFixed(2)} ≥ θ_high(0.75) → Transisi ke ACTIVE (terbitkan WakeupTicket)`,
    };
  }
  if (D <= THETA_LOW) {
    return {
      active: false,
      ruleText: `D(t)=${D.toFixed(2)} ≤ θ_low(0.35) → Transisi ke IDLE (hemat token)`,
    };
  }
  return {
    active: agencyActive,
    ruleText: `0.35 < D(t)=${D.toFixed(2)} < 0.75 → HOLD State_t (${agencyActive ? 'ACTIVE' : 'IDLE'}) [Anti-Spam]`,
  };
}

// ===========================================================================
// BARGE-IN RECONCILIATION & DETERMINISTIC CONTEXT COMPILER
// ===========================================================================

export const SAMPLE_EMITTED =
  'Baik, berdasarkan catatan proyek ORCHID-90 kemarin, frekuensi sensor kubah nomor tujuh stabil di 24Hz dan semua sistem berjalan normal.';

export function bargeInStep(oPlayed: number) {
  const len = SAMPLE_EMITTED.length;
  const oApplied = Math.min(Math.max(0, oPlayed), len);
  return {
    len,
    oApplied,
    tHeard: SAMPLE_EMITTED.slice(0, oApplied),
    tFlushed: SAMPLE_EMITTED.slice(oApplied),
  };
}

export const SLOT_META = [
  { name: 'Soul+Persona', color: '#38bdf8' },
  { name: 'Limbic PAD', color: '#f43f5e' },
  { name: 'Workspace', color: '#f59e0b' },
  { name: 'Hybrid Recall', color: '#10b981' },
  { name: 'Working Mem', color: '#a78bfa' },
];
export const T_MAX = 4000;

export function compilerStep(requested: number[]) {
  let remaining = T_MAX;
  const allocated: number[] = [];
  let truncatedCount = 0;
  for (let i = 0; i < requested.length; i++) {
    const take = Math.min(requested[i], remaining);
    allocated.push(take);
    remaining -= take;
    if (take < requested[i]) truncatedCount++;
  }
  const rawSum = requested.reduce((a, b) => a + b, 0);
  const finalSum = allocated.reduce((a, b) => a + b, 0);
  const compileMs = (0.18 + (finalSum / 4000) * 0.42).toFixed(2);
  return { allocated, rawSum, finalSum, compileMs, truncatedCount };
}

// ===========================================================================
// CANVAS 2D CHART PAINTERS
// ===========================================================================

function setupCanvas2D(canvasEl: HTMLCanvasElement | null) {
  if (!canvasEl) return null;
  const rect = canvasEl.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvasEl.width = Math.round(rect.width * dpr);
  canvasEl.height = Math.round(rect.height * dpr);
  const ctx = canvasEl.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

export function drawBondingChart(canvasEl: HTMLCanvasElement | null, history: PadState['history']) {
  const c = setupCanvas2D(canvasEl);
  if (!c) return;
  const { ctx, w, h } = c;
  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(56,189,248,0.12)';
  ctx.lineWidth = 1;
  [0.25, 0.55, 0.85].forEach((lvl) => {
    const y = h - 10 - lvl * (h - 20);
    ctx.beginPath();
    ctx.moveTo(8, y);
    ctx.lineTo(w - 8, y);
    ctx.stroke();
  });

  const hist = history;
  if (hist.length < 2) return;
  const mapX = (i: number) => 10 + (i / Math.max(1, hist.length - 1)) * (w - 20);
  const mapY = (v: number) => h - 10 - v * (h - 20);

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  hist.forEach((pt, i) => (i === 0 ? ctx.moveTo(mapX(i), mapY(pt.trust)) : ctx.lineTo(mapX(i), mapY(pt.trust))));
  ctx.stroke();

  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  hist.forEach((pt, i) => (i === 0 ? ctx.moveTo(mapX(i), mapY(pt.fric)) : ctx.lineTo(mapX(i), mapY(pt.fric))));
  ctx.stroke();

  const last = hist[hist.length - 1];
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(mapX(hist.length - 1), mapY(last.trust), 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(mapX(hist.length - 1), mapY(last.fric), 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px JetBrains Mono';
  ctx.fillText('Partner (0.85)', 10, mapY(0.85) - 3);
  ctx.fillText('Friend (0.55)', 10, mapY(0.55) - 3);
}

export function drawEbbinghausChart(canvasEl: HTMLCanvasElement | null, inp: MemoryInputs, r: MemoryResult) {
  const c = setupCanvas2D(canvasEl);
  if (!c) return;
  const { ctx, w, h } = c;
  ctx.clearRect(0, 0, w, h);

  const pruneThresh = 0.25;
  const padL = 28;
  const padR = 12;
  const padT = 12;
  const padB = 20;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;
  const xOf = (day: number) => padL + (day / 90) * plotW;
  const yOf = (val: number) => padT + (1 - val) * plotH;

  ctx.strokeStyle = 'rgba(148,163,184,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '9px JetBrains Mono';
  [0, 30, 60, 90].forEach((d) => ctx.fillText(`${d}d`, xOf(d) - 7, h - 5));
  ctx.fillText('1.0', 4, padT + 4);
  ctx.fillText('0.25', 2, yOf(0.25) + 3);

  ctx.save();
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.75)';
  ctx.beginPath();
  ctx.moveTo(padL, yOf(pruneThresh));
  ctx.lineTo(padL + plotW, yOf(pruneThresh));
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  for (let d = 0; d <= 90; d += 2) {
    const rv = Math.exp(-d / r.S0);
    if (d === 0) ctx.moveTo(xOf(d), yOf(rv));
    else ctx.lineTo(xOf(d), yOf(rv));
  }
  ctx.stroke();

  ctx.strokeStyle = r.survives ? '#10b981' : '#f59e0b';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let d = 0; d <= 90; d += 1.5) {
    const rv = Math.exp(-d / r.S);
    if (d === 0) ctx.moveTo(xOf(d), yOf(rv));
    else ctx.lineTo(xOf(d), yOf(rv));
  }
  ctx.stroke();

  const px = xOf(inp.dt);
  const py = yOf(r.R);
  ctx.strokeStyle = 'rgba(56,189,248,0.45)';
  ctx.beginPath();
  ctx.moveTo(px, padT + plotH);
  ctx.lineTo(px, py);
  ctx.stroke();
  ctx.fillStyle = r.survives ? '#34d399' : '#fb7185';
  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#050a14';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Trivial (E=0)', padL + 8, padT + plotH - 6);
  ctx.fillStyle = '#34d399';
  ctx.fillText('Memori Aktif', padL + plotW - 72, padT + 10);
}

export function drawHysteresisChart(canvasEl: HTMLCanvasElement | null, D: number, agencyActive: boolean) {
  const c = setupCanvas2D(canvasEl);
  if (!c) return;
  const { ctx, w, h } = c;
  ctx.clearRect(0, 0, w, h);

  const padL = 32;
  const padR = 16;
  const padT = 16;
  const padB = 18;
  const pw = w - padL - padR;
  const ph = h - padT - padB;
  const xOf = (v: number) => padL + v * pw;
  const yLow = padT + ph - 6;
  const yHigh = padT + 6;

  ctx.strokeStyle = 'rgba(56,189,248,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(xOf(0), yLow);
  ctx.lineTo(xOf(THETA_HIGH), yLow);
  ctx.lineTo(xOf(THETA_HIGH), yHigh);
  ctx.moveTo(xOf(1), yHigh);
  ctx.lineTo(xOf(THETA_LOW), yHigh);
  ctx.lineTo(xOf(THETA_LOW), yLow);
  ctx.stroke();

  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(245,158,11,0.5)';
  ctx.beginPath();
  ctx.moveTo(xOf(THETA_LOW), padT);
  ctx.lineTo(xOf(THETA_LOW), padT + ph);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xOf(THETA_HIGH), padT);
  ctx.lineTo(xOf(THETA_HIGH), padT + ph);
  ctx.stroke();
  ctx.restore();

  const cx = xOf(D);
  const cy = agencyActive ? yHigh : yLow;
  ctx.fillStyle = agencyActive ? '#f59e0b' : '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#050a14';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px JetBrains Mono';
  ctx.fillText('ACT', 4, yHigh + 3);
  ctx.fillText('IDL', 4, yLow + 3);
  ctx.fillText('0.35', xOf(THETA_LOW) - 10, h - 4);
  ctx.fillText('0.75', xOf(THETA_HIGH) - 10, h - 4);
}
