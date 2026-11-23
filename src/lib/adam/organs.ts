/**
 * Anatomical & Rust architecture metadata for the Adam simulator.
 * Ported verbatim from the original single-file simulator design.
 */

export type MathTabId = 'pad' | 'memory' | 'soul' | 'bargein';

export interface OrganMeta {
  id: string;
  name: string;
  shortLabel: string;
  crate: string;
  analogy: string;
  sla: string;
  colorHex: string;
  tab: MathTabId;
  desc: string;
  subOrgans: string[];
}

export const ORGANS_META: Record<string, OrganMeta> = {
  frontal: {
    id: 'frontal',
    name: 'Lobus Frontal',
    shortLabel: 'Lobus Frontal',
    crate: 'adam-cerebrum',
    analogy: 'Eksekutif, Identitas & Agensi',
    sla: '< 10 ms',
    colorHex: '#38bdf8',
    tab: 'soul',
    desc: 'Pusat kendali eksekutif dan kepribadian Adam. Mengunci nilai moral inti melalui segel SHA-256 (SoulSpec), mengatur evolusi trait terbatas (PersonaProfile), menyimpan opini mandiri (OpinionLedger), dan menjalankan histeresis agensi.',
    subOrgans: ['SoulSpec SHA-256', 'PersonaProfile', 'OpinionLedger', 'ExecutiveAgency'],
  },
  parietal: {
    id: 'parietal',
    name: 'Lobus Parietal',
    shortLabel: 'Lobus Parietal',
    crate: 'adam-cerebrum',
    analogy: 'Ruang Kerja & Kesadaran Tubuh',
    sla: '< 1000 ms',
    colorHex: '#14b8a6',
    tab: 'bargein',
    desc: 'Mengelola GlobalWorkspace lintas permukaan (desktop HUD, ponsel, avatar 3D, robot). Memantau heartbeat node kapabilitas, konteks visual aktif, pekerjaan asinkron, serta failover otomatis dalam < 1000 ms.',
    subOrgans: ['GlobalWorkspace', 'Multi-Surface Mesh', 'Failover <1s', 'VisualHeadline'],
  },
  temporal: {
    id: 'temporal',
    name: 'Lobus Temporal',
    shortLabel: 'Lobus Temporal',
    crate: 'adam-cerebrum',
    analogy: 'Memori Jangka Panjang & Recall',
    sla: '< 30 ms',
    colorHex: '#818cf8',
    tab: 'memory',
    desc: 'Menyimpan Tier 2 (Episodic) dan Tier 3 (SemanticFact) pada SQLiteStorageDriver bermode WAL dengan migrasi skema atomik (v1 → v2), serta menjalankan Hybrid Retrieval (Cosine Vector + FTS5 BM25 + retensi biologis).',
    subOrgans: ['SQLite WAL', 'Hybrid Retrieval', 'FTS5 BM25', 'Tier 3 Semantic'],
  },
  thalamus: {
    id: 'thalamus',
    name: 'Thalamus',
    shortLabel: 'Thalamus',
    crate: 'adam-limbic',
    analogy: 'Gerbang Sensorik & Debouncing',
    sla: '< 1 ms',
    colorHex: '#f59e0b',
    tab: 'pad',
    desc: 'Resepsionis otak yang menyaring aliran EventEnvelope berfrekuensi tinggi. Menahan sinyal duplikat via dedup_key (Debounced) dan menyerap telemetri pasif bersaliensi rendah tanpa membangunkan LLM.',
    subOrgans: ['Sensory Gating', 'Dedup Window', 'Salience Filter', '0-Token Gate'],
  },
  amygdala: {
    id: 'amygdala',
    name: 'Amygdala',
    shortLabel: 'Amygdala',
    crate: 'adam-limbic',
    analogy: 'Emosi PAD 2-Skala & Bonding',
    sla: '< 1 ms',
    colorHex: '#f43f5e',
    tab: 'pad',
    desc: 'Mesin afektif (DefaultAffectiveEngine) yang memisahkan emosi sesaat (acute_pad) dari suasana hati lambat (mood_pad), serta memodelkan kurva kelekatan relasional (trust, warmth, familiarity, friction).',
    subOrgans: ['Acute PAD', 'Mood Integrator', 'Bonding Curve', 'Friction Decay'],
  },
  hippocampus: {
    id: 'hippocampus',
    name: 'Hippocampus',
    shortLabel: 'Hippocampus',
    crate: 'adam-limbic',
    analogy: 'Working Memory & Kurva Lupa',
    sla: '< 5 ms',
    colorHex: '#10b981',
    tab: 'memory',
    desc: 'Menjaga buffer Working Memory (memproteksi InterruptedTurnNote & PendingIntention) serta menghitung stabilitas retensi Ebbinghaus termodulasi emosi untuk pemangkasan saat fase tidur.',
    subOrgans: ['Working Memory', 'Ebbinghaus R(Δt)', 'Sleep Pruning', 'Protected Notes'],
  },
  hypothalamus: {
    id: 'hypothalamus',
    name: 'Hypothalamus',
    shortLabel: 'Hypothalamus',
    crate: 'adam-limbic',
    analogy: 'Dorongan Homeostatik Internal',
    sla: '< 1 ms',
    colorHex: '#fb923c',
    tab: 'soul',
    desc: 'Memodelkan dorongan biologis internal seperti rasa ingin tahu (curiosity) dan kelelahan (fatigue) yang menjadi masukan bagi kurva histeresis dua ambang di ExecutiveAgency.',
    subOrgans: ['Curiosity Drive', 'Fatigue Level', 'Homeostasis', 'Hysteresis Input'],
  },
  cerebellum: {
    id: 'cerebellum',
    name: 'Cerebellum (Otak Kecil)',
    shortLabel: 'Cerebellum',
    crate: 'adam-cerebellum',
    analogy: 'Koordinasi Motorik, Barge-in & Tool',
    sla: '< 50 ms',
    colorHex: '#c084fc',
    tab: 'bargein',
    desc: 'Mengatur presisi giliran bicara (Turn FSM), memutus stream dan merekonsiliasi teks terdengar saat interupsi (Barge-in < 50 ms), Prosodic Chunker, Procedural Memory (ASK/TURBO, MCP), dan AST Security Verifier.',
    subOrgans: ['Turn FSM', 'Barge-in <50ms', 'Prosodic Chunker', 'AST Verifier'],
  },
  midbrain: {
    id: 'midbrain',
    name: 'Midbrain (Otak Tengah)',
    shortLabel: 'Midbrain',
    crate: 'adam-brainstem',
    analogy: 'Busur Refleks Kilat (System-0)',
    sla: '< 5 ms',
    colorHex: '#eab308',
    tab: 'pad',
    desc: 'Menangani stimulus ringan yang butuh reaksi kehadiran spontan seperti tatapan atau ekspresi non-verbal (NonVerbalPresence) dalam < 5 ms (terukur 0.15 ms) dengan biaya 0 token LLM.',
    subOrgans: ['Fast Reflex Arc', 'NonVerbalPresence', '0 LLM Tokens', '0.15ms p99'],
  },
  pons: {
    id: 'pons',
    name: 'Pons',
    shortLabel: 'Pons',
    crate: 'adam-brainstem',
    analogy: 'Jam Sirkadian & Penjadwal Tidur',
    sla: 'Event-Driven',
    colorHex: '#0ea5e9',
    tab: 'memory',
    desc: 'Mengelola ritme siang-malam (sirkadian), memicu siklus konsolidasi tidur atomik, dan menerbitkan WakeupTicket proaktif yang terkendali oleh kedalaman penjadwalan maksimum.',
    subOrgans: ['Circadian Clock', 'WakeupTicket', 'Sleep Trigger', 'SimulatedClock'],
  },
  medulla: {
    id: 'medulla',
    name: 'Medulla Oblongata',
    shortLabel: 'Medulla',
    crate: 'adam-brainstem',
    analogy: 'Otonom, CircuitBreaker & CostCap',
    sla: 'Always-On',
    colorHex: '#fb7185',
    tab: 'soul',
    desc: 'Penjaga kelangsungan hidup runtime. Menjalankan CircuitBreaker untuk memutus retry storm pada SelfReparation/Canary, membatasi biaya proaktif via HardCostCap (min 300 dtk, maks 4/jam), dan memantau kesehatan modul.',
    subOrgans: ['CircuitBreaker', 'HardCostCap', 'ModuleHealth', 'Canary Rollback'],
  },
};

export interface CrateGroup {
  crate: string;
  label: string;
  organs: string[];
}

export const CRATE_GROUPS: CrateGroup[] = [
  { crate: 'adam-cerebrum', label: 'Otak Besar', organs: ['frontal', 'parietal', 'temporal'] },
  { crate: 'adam-limbic', label: 'Sistem Limbik', organs: ['thalamus', 'amygdala', 'hippocampus', 'hypothalamus'] },
  { crate: 'adam-cerebellum', label: 'Otak Kecil', organs: ['cerebellum'] },
  { crate: 'adam-brainstem', label: 'Batang Otak', organs: ['midbrain', 'pons', 'medulla'] },
];

/** Axonal pathways drawn between organ centroids in the 3D scene. */
export const TRACT_DEFS: Array<[string, string]> = [
  ['medulla', 'pons'],
  ['pons', 'midbrain'],
  ['midbrain', 'thalamus'],
  ['thalamus', 'midbrain'],
  ['thalamus', 'amygdala'],
  ['thalamus', 'hippocampus'],
  ['amygdala', 'hippocampus'],
  ['hippocampus', 'temporal'],
  ['temporal', 'frontal'],
  ['amygdala', 'frontal'],
  ['hypothalamus', 'frontal'],
  ['pons', 'hypothalamus'],
  ['frontal', 'parietal'],
  ['frontal', 'cerebellum'],
  ['cerebellum', 'hippocampus'],
];

export type ScenarioId = 'debounced' | 'reflex' | 'warm_dialog' | 'hijack_conflict' | 'barge_in' | 'sleep';
