export type SessionType = 'morning' | 'night';

export type UserRole = 'super_admin' | 'admin' | 'kader' | 'pengguna' | 'viewer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: UserRole;
  posyanduArea?: string;
  joinedAt: string;
  lastLogin: string;
  isVerified: boolean;
  totalBrushSessions: number;
  stars: number;
  streak: number;
  avgQuizScore: number;
}

export interface BrushSession {
  id: string;
  userId: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  type: SessionType;
  durationSeconds: number;
  germsCleared: number;
  starsEarned: number;
}

export interface DayLog {
  morning?: boolean;
  night?: boolean;
  morningTime?: string;
  nightTime?: string;
  germsCleared?: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  totalSessions: number;
  totalGermsCleared: number;
  stars: number;
  lastCompletedDate: string; // YYYY-MM-DD
  history: Record<string, DayLog>; // Key is YYYY-MM-DD
}

export interface ReminderSettings {
  morningEnabled: boolean;
  morningTime: string; // e.g. "06:30"
  nightEnabled: boolean;
  nightTime: string; // e.g. "20:30"
  soundEnabled: boolean;
  customName: string;
}

export interface ToothbrushSkin {
  id: string;
  name: string;
  description: string;
  handleColor: string;
  neckColor: string;
  bristleColor: string;
  glowColor: string;
  pasteColor: string;
  unlockCondition: string;
  unlocked: boolean;
  costStars?: number;
  requiredStreak?: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'session' | 'germs' | 'special';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export type QuadrantId = 1 | 2 | 3 | 4 | 5;

export interface QuadrantInfo {
  id: QuadrantId;
  name: string;
  subtitle: string;
  hint: string;
  durationSeconds: number;
}

export interface Germ {
  id: string;
  x: number;
  y: number;
  quadrant: QuadrantId;
  type: 'sugar' | 'plaque' | 'acid' | 'odor';
  name: string;
  health: number;
  maxHealth: number;
  size: number;
  color: string;
  isDefeated: boolean;
  wobble: number;
}

export interface FoamParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
  vx: number;
  vy: number;
}

export interface SparkleItem {
  id: number;
  x: number;
  y: number;
  size: number;
}

// ---------------- NEW HEALTH & ENTERPRISE RBAC TYPES ----------------

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface LearningStage {
  id: string;
  level: number;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  icon: string;
  isLocked: boolean;
  isCompleted: boolean;
  minScoreToUnlockNext: number; // e.g. 70
  bestScore?: number;
  summaryPoints: string[];
  fullMaterialHtml: string;
  questions: QuizQuestion[];
}

export interface UserQuizAttempt {
  id: string;
  stageId: string;
  userId: string;
  userName: string;
  score: number;
  passed: boolean;
  timestamp: number;
  dateStr: string;
  timeSpentSeconds: number;
}

export interface SecurityNotificationLog {
  id: string;
  timestamp: number;
  type: 'login' | 'role_change' | 'unauthorized_attempt' | 'data_export' | 'quiz_passed' | 'system_alert';
  severity: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
  actorEmail: string;
  actorRole: UserRole;
  targetUserEmail?: string;
  ipAddress?: string;
  device?: string;
}

export interface HealthRecommendation {
  id: string;
  title: string;
  category: 'brushing_habit' | 'plaque_risk' | 'nutrition' | 'fluoride' | 'posyandu';
  priority: 'tinggi' | 'sedang' | 'rendah';
  status: 'aktif' | 'selesai';
  recommendation: string;
  clinicalReason: string;
  actionButtonLabel?: string;
}
