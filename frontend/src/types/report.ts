/**
 * 报告结构化元数据类型定义
 * 用于前端组件渲染
 */

// ── 基础类型 ──────────────────────────────────────────────────────────────

export interface ConflictBalanceLeft {
  tag: string;
  weight: number;
}

export interface ConflictBalanceRight {
  tag: string;
  weight: number;
}

export interface ConflictBalance {
  left: ConflictBalanceLeft;
  right: ConflictBalanceRight;
  conflictPoint: string;
}

export interface ActionCommand {
  period: string;
  command: string;
}

export interface EnergyBar {
  label: string;
  value: number;
  status: string;
  statusType: 'normal' | 'warning' | 'critical';
}

export interface InteractionMirror {
  behaviorPattern: string;
  painReflection: string;
}

export interface RadarAxis {
  value: number;
  label: string;
  riskLevel?: string;
}

export interface RadarChart {
  physicalHardware: RadarAxis;
  mentalSoftware: RadarAxis;
  conclusion: string;
}

export interface CreativeFilter {
  mechanism: string;
}

// ── 维度类型 ──────────────────────────────────────────────────────────────

export interface WealthDimension {
  score: number;
  label: string;
  conflictBalance: ConflictBalance;
  negativeTags: string[];
  positiveTags: string[];
  actionCommands: ActionCommand[];
}

export interface RelationshipDimension {
  score: number;
  label: string;
  energyBars: EnergyBar[];
  interactionMirror: InteractionMirror;
  resolution: string;
}

export interface CareerDimension {
  score: number;
  label: string;
  conflictBalance: ConflictBalance;
  negativeTags: string[];
  positiveTags: string[];
  actionCommands: ActionCommand[];
}

export interface HealthDimension {
  score: number;
  label: string;
  radarChart: RadarChart;
}

export interface SpiritualDimension {
  score: number;
  label: string;
  creativeFilter: CreativeFilter;
  resetActions: string[];
}

export interface Dimensions {
  wealth: WealthDimension;
  relationship: RelationshipDimension;
  career: CareerDimension;
  health: HealthDimension;
  spiritual: SpiritualDimension;
}

// ── 完整报告类型 ──────────────────────────────────────────────────────────

export interface StructuredReport {
  summary: string;
  dimensions: Dimensions;
  key_findings: string[];
  weakness_tags: string[];
  strength_tags: string[];
  boost_elements: string[];
  conflict_warnings: string[];
}

// ── 组件 Props 类型 ──────────────────────────────────────────────────────

export interface ConflictBalanceProps {
  data: ConflictBalance;
  color?: string;
}

export interface TagMatrixProps {
  negativeTags: string[];
  positiveTags: string[];
}

export interface ActionCommandProps {
  commands: ActionCommand[];
}

export interface EnergyBarProps {
  bars: EnergyBar[];
}

export interface InteractionMirrorProps {
  data: InteractionMirror;
}

export interface DimensionRadarProps {
  data: RadarChart;
}

export interface CreativeFilterProps {
  data: CreativeFilter;
}

export interface ResetActionProps {
  actions: string[];
}

export interface DimensionCardProps {
  title: string;
  icon: string;
  score: number;
  color: string;
  children: React.ReactNode;
}
