import { StreakData, ReminderSettings, ToothbrushSkin, Badge, SessionType } from '../types';

const STREAK_KEY = 'sikat_gigi_streak_v1';
const REMINDERS_KEY = 'sikat_gigi_reminders_v1';
const SKINS_KEY = 'sikat_gigi_skins_v1';
const ACTIVE_SKIN_KEY = 'sikat_gigi_active_skin_v1';
const BADGES_KEY = 'sikat_gigi_badges_v1';

export const DEFAULT_SKINS: ToothbrushSkin[] = [
  {
    id: 'classic-blue',
    name: 'Biru Samudra',
    description: 'Sikat gigi pahlawan andalan dengan pegangan ergonomis!',
    handleColor: '#0ea5e9',
    neckColor: '#38bdf8',
    bristleColor: '#ffffff',
    glowColor: '#7dd3fc',
    pasteColor: '#34d399',
    unlockCondition: 'Sedia Sejak Awal',
    unlocked: true,
  },
  {
    id: 'rainbow-pop',
    name: 'Pelangi Ceria',
    description: 'Warna-warni magis pembasmi kuman yang penuh semangat!',
    handleColor: '#f43f5e',
    neckColor: '#fbbf24',
    bristleColor: '#a855f7',
    glowColor: '#f472b6',
    pasteColor: '#ec4899',
    unlockCondition: 'Streak 3 Hari Berturut-turut',
    unlocked: false,
    requiredStreak: 3,
  },
  {
    id: 'fairy-wand',
    name: 'Tongkat Peri Gigi',
    description: 'Diberkati oleh Peri Gigi, bersinar lembut di malam hari!',
    handleColor: '#d946ef',
    neckColor: '#e879f9',
    bristleColor: '#fef08a',
    glowColor: '#f0abfc',
    pasteColor: '#38bdf8',
    unlockCondition: 'Streak 7 Hari Berturut-turut',
    unlocked: false,
    requiredStreak: 7,
  },
  {
    id: 'dino-green',
    name: 'Dino T-Rex Perkasa',
    description: 'Kuat mengikis plak gigi dengan kekuatan dinosaurus!',
    handleColor: '#10b981',
    neckColor: '#34d399',
    bristleColor: '#f59e0b',
    glowColor: '#6ee7b7',
    pasteColor: '#10b981',
    unlockCondition: 'Tukar dengan 150 Bintang',
    unlocked: false,
    costStars: 150,
  },
  {
    id: 'cyber-bot',
    name: 'Robot Cyber 3000',
    description: 'Teknologi sikat gigi masa depan dengan getaran sonik mikro!',
    handleColor: '#6366f1',
    neckColor: '#818cf8',
    bristleColor: '#22d3ee',
    glowColor: '#a5b4fc',
    pasteColor: '#06b6d4',
    unlockCondition: 'Streak 14 Hari Berturut-turut',
    unlocked: false,
    requiredStreak: 14,
  },
  {
    id: 'golden-crown',
    name: 'Mahkota Emas Juara',
    description: 'Gelar kehormatan untuk anak yang rajin sikat gigi selama sebulan!',
    handleColor: '#eab308',
    neckColor: '#facc15',
    bristleColor: '#ffffff',
    glowColor: '#fef08a',
    pasteColor: '#f59e0b',
    unlockCondition: 'Streak 30 Hari (Master Gigi)',
    unlocked: false,
    requiredStreak: 30,
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_brush',
    title: 'Gigi Pertama Berkilau',
    description: 'Selesaikan sesi sikat gigi pertamamu!',
    icon: '🦷',
    category: 'session',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
  },
  {
    id: 'streak_3',
    title: 'Pahlawan 3 Hari',
    description: 'Pertahankan streak sikat gigi selama 3 hari berturut-turut.',
    icon: '🔥',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    title: 'Ksatria 1 Minggu',
    description: 'Mencapai streak 7 hari tanpa henti!',
    icon: '👑',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 7,
  },
  {
    id: 'streak_30',
    title: 'Bintang 1 Bulan Penuh',
    description: 'Disiplin sikat gigi sebulan penuh tanpa bolong!',
    icon: '🏆',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 30,
  },
  {
    id: 'morning_champion',
    title: 'Pemberantas Kuman Pagi',
    description: 'Lakukan sikat gigi pagi sebanyak 5 kali.',
    icon: '☀️',
    category: 'session',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'night_guardian',
    title: 'Penjaga Mimpi Malam',
    description: 'Sikat gigi sebelum tidur sebanyak 5 kali.',
    icon: '🌙',
    category: 'session',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'germ_hunter_50',
    title: 'Pembasmi Kuman Handal',
    description: 'Bersihkan 50 kuman dari gigi.',
    icon: '🦠',
    category: 'germs',
    unlocked: false,
    progress: 0,
    maxProgress: 50,
  },
  {
    id: 'foam_master',
    title: 'Ahli Busa 2 Menit',
    description: 'Selesaikan 3 kali sesi sikat gigi 2 menit penuh.',
    icon: '🫧',
    category: 'special',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
  },
];

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStreakData(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  return {
    currentStreak: 1,
    maxStreak: 1,
    totalSessions: 0,
    totalGermsCleared: 0,
    stars: 50, // Welcome gift 50 stars!
    lastCompletedDate: '',
    history: {},
  };
}

export function saveStreakData(data: StreakData): void {
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getReminderSettings(): ReminderSettings {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  return {
    morningEnabled: true,
    morningTime: '06:30',
    nightEnabled: true,
    nightTime: '20:30',
    soundEnabled: true,
    customName: 'Sahabat Cilik',
  };
}

export function saveReminderSettings(settings: ReminderSettings): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function getSkins(): ToothbrushSkin[] {
  try {
    const raw = localStorage.getItem(SKINS_KEY);
    if (raw) {
      const stored: ToothbrushSkin[] = JSON.parse(raw);
      // Merge with defaults if new skins added
      return DEFAULT_SKINS.map((def) => {
        const found = stored.find((s) => s.id === def.id);
        return found ? { ...def, unlocked: found.unlocked } : def;
      });
    }
  } catch {
    // ignore
  }
  return DEFAULT_SKINS;
}

export function saveSkins(skins: ToothbrushSkin[]): void {
  try {
    localStorage.setItem(SKINS_KEY, JSON.stringify(skins));
  } catch {
    // ignore
  }
}

export function getActiveSkinId(): string {
  try {
    return localStorage.getItem(ACTIVE_SKIN_KEY) || 'classic-blue';
  } catch {
    return 'classic-blue';
  }
}

export function setActiveSkinId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SKIN_KEY, id);
  } catch {
    // ignore
  }
}

export function getBadges(): Badge[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw) {
      const stored: Badge[] = JSON.parse(raw);
      return INITIAL_BADGES.map((b) => {
        const found = stored.find((item) => item.id === b.id);
        return found ? { ...b, ...found } : b;
      });
    }
  } catch {
    // ignore
  }
  return INITIAL_BADGES;
}

export function saveBadges(badges: Badge[]): void {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
  } catch {
    // ignore
  }
}

// Record a session and calculate streak, stars, unlocks
export function recordSessionComplete(
  type: SessionType,
  durationSeconds: number,
  germsCleared: number
): { streakData: StreakData; unlockedBadges: Badge[]; unlockedSkins: ToothbrushSkin[]; starsAwarded: number } {
  const streakData = getStreakData();
  const today = getTodayString();
  const currentHistory = { ...streakData.history };
  const todayLog = currentHistory[today] || {};

  const wasCompletedToday = !!(todayLog.morning || todayLog.night);

  if (type === 'morning') {
    todayLog.morning = true;
    todayLog.morningTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  } else {
    todayLog.night = true;
    todayLog.nightTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  todayLog.germsCleared = (todayLog.germsCleared || 0) + germsCleared;
  currentHistory[today] = todayLog;

  let currentStreak = streakData.currentStreak;
  if (!wasCompletedToday) {
    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    
    if (streakData.lastCompletedDate === yStr) {
      currentStreak += 1;
    } else if (streakData.lastCompletedDate === today) {
      // already recorded today
    } else if (!streakData.lastCompletedDate) {
      currentStreak = 1;
    } else {
      // Streak broken, reset to 1
      currentStreak = 1;
    }
  }

  const maxStreak = Math.max(streakData.maxStreak, currentStreak);
  const starsAwarded = 25 + Math.floor(germsCleared * 1.5) + (durationSeconds >= 110 ? 25 : 10);
  const totalStars = streakData.stars + starsAwarded;
  const totalSessions = streakData.totalSessions + 1;
  const totalGerms = streakData.totalGermsCleared + germsCleared;

  const updatedStreakData: StreakData = {
    currentStreak,
    maxStreak,
    totalSessions,
    totalGermsCleared: totalGerms,
    stars: totalStars,
    lastCompletedDate: today,
    history: currentHistory,
  };
  saveStreakData(updatedStreakData);

  // Check Badges
  const badges = getBadges();
  const newlyUnlockedBadges: Badge[] = [];

  // Count morning & night sessions
  let morningCount = 0;
  let nightCount = 0;
  Object.values(currentHistory).forEach((log) => {
    if (log.morning) morningCount++;
    if (log.night) nightCount++;
  });

  const updatedBadges = badges.map((badge) => {
    let progress = badge.progress;
    let unlocked = badge.unlocked;

    if (badge.id === 'first_brush') {
      progress = Math.min(1, totalSessions);
    } else if (badge.id === 'streak_3') {
      progress = Math.min(3, currentStreak);
    } else if (badge.id === 'streak_7') {
      progress = Math.min(7, currentStreak);
    } else if (badge.id === 'streak_30') {
      progress = Math.min(30, currentStreak);
    } else if (badge.id === 'morning_champion') {
      progress = Math.min(5, morningCount);
    } else if (badge.id === 'night_guardian') {
      progress = Math.min(5, nightCount);
    } else if (badge.id === 'germ_hunter_50') {
      progress = Math.min(50, totalGerms);
    } else if (badge.id === 'foam_master') {
      if (durationSeconds >= 115) {
        progress = Math.min(3, badge.progress + 1);
      }
    }

    if (!unlocked && progress >= badge.maxProgress) {
      unlocked = true;
      const bObj = { ...badge, unlocked: true, progress, unlockedAt: today };
      newlyUnlockedBadges.push(bObj);
      return bObj;
    }
    return { ...badge, progress, unlocked };
  });
  saveBadges(updatedBadges);

  // Check automatic skins unlock based on streak
  const skins = getSkins();
  const newlyUnlockedSkins: ToothbrushSkin[] = [];
  const updatedSkins = skins.map((skin) => {
    if (!skin.unlocked && skin.requiredStreak && currentStreak >= skin.requiredStreak) {
      const sObj = { ...skin, unlocked: true };
      newlyUnlockedSkins.push(sObj);
      return sObj;
    }
    return skin;
  });
  saveSkins(updatedSkins);

  return {
    streakData: updatedStreakData,
    unlockedBadges: newlyUnlockedBadges,
    unlockedSkins: newlyUnlockedSkins,
    starsAwarded,
  };
}
