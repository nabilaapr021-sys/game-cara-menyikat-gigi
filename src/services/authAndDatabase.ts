import {
  AppUser,
  UserRole,
  LearningStage,
  UserQuizAttempt,
  SecurityNotificationLog,
  HealthRecommendation,
  BrushSession,
} from '../types';
import { sounds } from './sound';

const USERS_DB_KEY = 'sikat_gigi_db_users_v2';
const CURRENT_USER_KEY = 'sikat_gigi_current_user_v2';
const STAGES_DB_KEY = 'sikat_gigi_db_stages_v2';
const QUIZ_ATTEMPTS_KEY = 'sikat_gigi_db_quiz_attempts_v2';
const SESSIONS_DB_KEY = 'sikat_gigi_db_sessions_v2';
const SECURITY_LOGS_KEY = 'sikat_gigi_db_security_logs_v2';

// Initial preloaded users with different roles
export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user_super_admin',
    email: 'nabilaapr021@gmail.com',
    name: 'Nabila Aprilia (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'super_admin',
    posyanduArea: 'Pusat Kota (Semua Wilayah)',
    joinedAt: '2026-01-10',
    lastLogin: '2026-10-21 10:00',
    isVerified: true,
    totalBrushSessions: 42,
    stars: 850,
    streak: 14,
    avgQuizScore: 95,
  },
  {
    id: 'user_admin_drg',
    email: 'drg.ahmad@gmail.com',
    name: 'drg. Ahmad Fauzi (Admin Dinkes)',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    posyanduArea: 'Dinas Kesehatan Kota',
    joinedAt: '2026-02-15',
    lastLogin: '2026-10-20 16:30',
    isVerified: true,
    totalBrushSessions: 28,
    stars: 620,
    streak: 7,
    avgQuizScore: 90,
  },
  {
    id: 'user_kader_siti',
    email: 'kader.siti@gmail.com',
    name: 'Ibu Siti Aminah (Kader Posyandu Melati)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'kader',
    posyanduArea: 'Posyandu Melati 03, Kel. Sukamaju',
    joinedAt: '2026-03-01',
    lastLogin: '2026-10-21 08:15',
    isVerified: true,
    totalBrushSessions: 35,
    stars: 710,
    streak: 10,
    avgQuizScore: 88,
  },
  {
    id: 'user_anak_budi',
    email: 'keluarga.budi@gmail.com',
    name: 'Budi Santoso (Pengguna Cilik)',
    avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    role: 'pengguna',
    posyanduArea: 'Posyandu Melati 03',
    joinedAt: '2026-04-12',
    lastLogin: '2026-10-21 07:00',
    isVerified: true,
    totalBrushSessions: 18,
    stars: 340,
    streak: 5,
    avgQuizScore: 75,
  },
  {
    id: 'user_viewer_tamu',
    email: 'tamu.pengamat@gmail.com',
    name: 'Pengamat Tamu (Viewer)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'viewer',
    posyanduArea: 'Umum',
    joinedAt: '2026-05-01',
    lastLogin: '2026-10-21 09:30',
    isVerified: false,
    totalBrushSessions: 4,
    stars: 80,
    streak: 1,
    avgQuizScore: 60,
  },
];

// Initial 6-stage progressive learning curriculum with Quiz locking
export const INITIAL_STAGES: LearningStage[] = [
  {
    id: 'stage-1',
    level: 1,
    title: 'Tahap 1: Kenali Gigimu & Pahlawan Sikat Gigi',
    category: 'Dasar Anatomi Gigi',
    description: 'Mengenal bagian mahkota gigi, gusi sehat, dan pentingnya sikat gigi sejak usia dini.',
    durationMinutes: 4,
    icon: '🦷',
    isLocked: false, // First stage is open
    isCompleted: true,
    minScoreToUnlockNext: 70,
    bestScore: 100,
    summaryPoints: [
      'Gigi manusia memiliki lapisan pelindung terkuat bernama email gigi.',
      'Gusi yang sehat berwarna merah muda merona dan tidak mudah berdarah saat disikat.',
      'Bulu sikat gigi anak harus lembut (soft) dengan kepala sikat kecil sesuai ukuran mulut.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p><strong>Apa itu Gigi?</strong> Gigi adalah bagian penting dalam mulut kita yang berfungsi untuk mengunyah makanan, membantu kita berbicara dengan jelas, dan membuat senyuman kita tampak menawan!</p>
        <p>Lapisan paling luar gigi disebut <strong>Email (Enamel)</strong>. Email ini sangat keras, bahkan lebih keras daripada tulang manusia! Namun, email gigi tidak memiliki sel hidup, jadi jika rusak akibat lubang, gigi tidak dapat memperbaiki dirinya sendiri tanpa bantuan dokter gigi.</p>
        <div class="bg-sky-50 p-3 rounded-xl border border-sky-200">
          <strong>Tips Dokter Gigi Cilik:</strong> Pilih selalu sikat gigi dengan bulu berujung membulat dan lembut (soft/ultra soft) agar gusi tidak lecet!
        </div>
      </div>
    `,
    questions: [
      {
        id: 'q1-1',
        question: 'Apa nama lapisan terluar gigi yang paling keras?',
        options: ['Email gigi (Enamel)', 'Gusi', 'Lidah', 'Bibir'],
        correctOptionIndex: 0,
        explanation: 'Email gigi adalah lapisan pelindung terluar yang paling keras di tubuh manusia.',
      },
      {
        id: 'q1-2',
        question: 'Bagaimana ciri gusi yang sehat menurut dokter gigi?',
        options: ['Merah tua bengkak', 'Merah muda segar dan tidak berdarah', 'Berwarna hitam', 'Kuning kecokelatan'],
        correctOptionIndex: 1,
        explanation: 'Gusi sehat berwarna merah muda (pink) cerah, kencang, dan tidak mudah berdarah saat disikat.',
      },
      {
        id: 'q1-3',
        question: 'Jenis bulu sikat gigi apa yang paling aman untuk anak-anak?',
        options: ['Bulu kawat kasar', 'Bulu sikat lembut (soft) berujung halus', 'Bulu ijuk keras', 'Tidak perlu berbulu'],
        correctOptionIndex: 1,
        explanation: 'Bulu sikat lembut membersihkan plak dengan efektif tanpa melukai gusi anak yang masih sensitif.',
      },
    ],
  },
  {
    id: 'stage-2',
    level: 2,
    title: 'Tahap 2: Kuman Gula & Bahaya Plak Gigi',
    category: 'Mikrobiologi Mulut',
    description: 'Pelajari bagaimana sisa makanan manis diubah kuman menjadi asam perusak gigi.',
    durationMinutes: 5,
    icon: '🦠',
    isLocked: false, // Unlocked
    isCompleted: true,
    minScoreToUnlockNext: 70,
    bestScore: 90,
    summaryPoints: [
      'Bakteri Streptococcus mutans sangat menyukai sisa gula dan permen manis.',
      'Kuman memfermentasi gula menjadi zat asam yang melarutkan mineral email gigi.',
      'Plak gigi adalah lapisan lengket tak kasat mata yang penuh koloni jutaan kuman.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Setiap kali kita makan permen, cokelat, atau biskuit, sisa gula akan menempel di sela-sela gigi. Jika tidak segera dibersihkan, kuman bernama <em>Streptococcus mutans</em> akan berpesta pora memakan gula tersebut!</p>
        <p>Setelah memakan gula, kuman mengeluarkan kotoran berupa <strong>Zat Asam</strong>. Asam inilah yang bekerja seperti cairan korosif, melarutkan mineral kalsium dan fosfat pada email gigi sehingga terbentuk lubang kecil yang lama-kelamaan membesar dan menyebabkan sakit gigi.</p>
        <div class="bg-amber-50 p-3 rounded-xl border border-amber-200">
          <strong>Ingat Rumus Karies Gigi:</strong> Gigi Sehat + Gula Sisa + Kuman Plak + Waktu Dibiarkan = Gigi Berlubang!
        </div>
      </div>
    `,
    questions: [
      {
        id: 'q2-1',
        question: 'Zat apa yang dihasilkan kuman setelah mereka memakan sisa gula di gigi?',
        options: ['Vitamin C', 'Madu manis', 'Zat Asam perusak gigi', 'Oksigen segar'],
        correctOptionIndex: 2,
        explanation: 'Kuman memfermentasi sisa gula menjadi zat asam yang mengikis mineral gigi.',
      },
      {
        id: 'q2-2',
        question: 'Apa yang dimaksud dengan Plak Gigi?',
        options: [
          'Hiasan gigi berkilau',
          'Lapisan tipis lengket berisi koloni jutaan kuman',
          'Pasta gigi rasa stroberi',
          'Tulang rahang bawah'
        ],
        correctOptionIndex: 1,
        explanation: 'Plak adalah biofilm lengket transparan yang menjadi sarang berkumpulnya jutaan mikroorganisme.',
      },
      {
        id: 'q2-3',
        question: 'Kapan waktu tercepat kuman mulai memproduksi asam setelah kita makan makanan manis?',
        options: ['Setelah 3 hari', 'Hanya dalam 5-20 menit pertama', 'Setelah 1 bulan', 'Tidak pernah memproduksi asam'],
        correctOptionIndex: 1,
        explanation: 'Produksi asam oleh bakteri terjadi sangat cepat dalam hitungan menit setelah makanan manis dikonsumsi.',
      },
    ],
  },
  {
    id: 'stage-3',
    level: 3,
    title: 'Tahap 3: Teknik Sikat 45° & 4 Kuadran Sempurna',
    category: 'Keterampilan Klinis Sikat Gigi',
    description: 'Panduan membagi mulut menjadi 4 kuadran dan teknik menyikat 2 menit tanpa ada sisi terlewat.',
    durationMinutes: 6,
    icon: '🪥',
    isLocked: false,
    isCompleted: false, // In progress
    minScoreToUnlockNext: 70,
    summaryPoints: [
      'Gigi dibagi 4 kuadran: Kanan Atas, Kiri Atas, Kiri Bawah, Kanan Bawah (@ 30 detik).',
      'Sudut sikat 45 derajat memutar di perbatasan gusi mengangkat kuman dengan maksimal.',
      'Sikat juga bagian lidah untuk menghilangkan kuman penyebab bau mulut.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Menyikat gigi bukan sekadar menggosok maju-mundur secara keras! Dokter gigi merekomendasikan <strong>Teknik Modifikasi Bass</strong>:</p>
        <ol class="list-decimal list-inside space-y-2">
          <li><strong>Kemiringan 45 Derajat:</strong> Tempelkan bulu sikat miring 45° menghadap gusi.</li>
          <li><strong>Gerakan Memutar:</strong> Putar perlahan membentuk lingkaran kecil dari arah merah (gusi) ke arah putih (ujung gigi).</li>
          <li><strong>Bagi 4 Kuadran:</strong> Sikat 30 detik untuk masing-masing kuadran, sehingga totalnya pas 2 menit!</li>
          <li><strong>Sentuhan Terakhir:</strong> Sikat permukaan kunyah dan jangan lupa sikat lidah dengan lembut.</li>
        </ol>
      </div>
    `,
    questions: [
      {
        id: 'q3-1',
        question: 'Berapa durasi total menyikat gigi yang direkomendasikan dokter gigi di seluruh dunia?',
        options: ['30 detik', '2 menit penuh (120 detik)', '10 menit', '15 detik saja'],
        correctOptionIndex: 1,
        explanation: 'Durasi ideal rekomendasi FDI dan PDGI adalah 2 menit agar seluruh kuadran bersih menyeluruh.',
      },
      {
        id: 'q3-2',
        question: 'Berapa derajat kemiringan bulu sikat yang dianjurkan saat menyikat batas gusi dan gigi?',
        options: ['10 derajat', '45 derajat', '90 derajat tegak lurus', '180 derajat'],
        correctOptionIndex: 1,
        explanation: 'Kemiringan 45 derajat memungkinkan bulu sikat masuk ke saku gusi tanpa melukainya.',
      },
      {
        id: 'q3-3',
        question: 'Mengapa kita juga perlu menyikat permukaan lidah secara lembut?',
        options: [
          'Agar lidah berubah warna',
          'Untuk membersihkan kuman penyebab bau mulut',
          'Agar lidah menjadi lebih panjang',
          'Tidak ada manfaatnya'
        ],
        correctOptionIndex: 1,
        explanation: 'Permukaan lidah berpori dan merupakan tempat favorit berkumpulnya bakteri volatil penyebab bau mulut.',
      },
    ],
  },
  {
    id: 'stage-4',
    level: 4,
    title: 'Tahap 4: Waktu Sakti (Pagi Setelah Sarapan & Malam Sebelum Tidur)',
    category: 'Disiplin Waktu & Ritme Biologis',
    description: 'Rahasia mengapa sikat gigi malam adalah pelindung nomor 1 dari karies gigi.',
    durationMinutes: 5,
    icon: '🌙',
    isLocked: true, // LOCKED: requires passing Stage 3 with >= 70%
    isCompleted: false,
    minScoreToUnlockNext: 70,
    summaryPoints: [
      'Sikat gigi wajib dilakukan 2 kali sehari secara konsisten.',
      'Sikat pagi dilakukan 15-30 menit setelah sarapan untuk membersihkan sisa makanan.',
      'Sikat malam sebelum tidur paling krusial karena air liur berkurang 80% saat tidur.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Banyak anak menyikat gigi saat mandi pagi dan mandi sore. Namun, dokter gigi menegaskan waktu yang <strong>PALING TEPAT</strong> adalah:</p>
        <p>1. <strong>Pagi Hari Setelah Sarapan:</strong> Menyikat gigi sebelum sarapan akan kembali kotor saat kita makan nasi/roti. Sikatlah setelah sarapan selesai agar gigi bersih saat ke sekolah!</p>
        <p>2. <strong>Malam Hari Tepat Sebelum Tidur:</strong> Ini adalah waktu paling berbahaya! Saat tidur, tubuh tidak memproduksi banyak air liur (saliva). Padahal saliva adalah pembersih alami mulut. Tanpa saliva, kuman berpesta semalaman menggerogoti gigi jika kita tidur tanpa sikat gigi lebih dulu.</p>
      </div>
    `,
    questions: [
      {
        id: 'q4-1',
        question: 'Kapan waktu terbaik sikat gigi di pagi hari?',
        options: ['Sebelum bangun tidur', '15-30 menit setelah makan sarapan pagi', 'Saat jam istirahat siang', 'Tidak perlu sikat gigi pagi'],
        correctOptionIndex: 1,
        explanation: 'Menyikat gigi setelah sarapan membersihkan sisa karbohidrat makanan sehingga nafas segar dan gigi terlindungi seharian.',
      },
      {
        id: 'q4-2',
        question: 'Apa yang terjadi pada produksi air liur (saliva) di mulut kita saat kita sedang tidur?',
        options: ['Produksi air liur berkurang drastis hingga 80%', 'Produksi air liur bertambah 10 kali lipat', 'Air liur menguap menjadi es', 'Tidak ada perubahan sama sekali'],
        correctOptionIndex: 0,
        explanation: 'Saat tidur, kelenjar ludah beristirahat sehingga perlindungan alami berkurang drastis, membuat sikat gigi sebelum tidur sangat wajib!',
      },
      {
        id: 'q4-3',
        question: 'Bolehkah makan camilan manis atau minum susu manis setelah menyikat gigi di malam hari?',
        options: ['Boleh sebanyak mungkin', 'Tidak boleh, jika lapar/haus minumlah air putih saja', 'Boleh asal permen kenyal', 'Boleh asal cepat tidur'],
        correctOptionIndex: 1,
        explanation: 'Setelah sikat gigi malam, hanya air putih yang diperbolehkan agar gigi tetap bersih saat tidur.',
      },
    ],
  },
  {
    id: 'stage-5',
    level: 5,
    title: 'Tahap 5: Sahabat Makanan Gigi Kuat & Fluoride Ajaib',
    category: 'Nutrisi Gigi & Pelindung Fluoride',
    description: 'Ketahui makanan bergizi penutrisi email dan kekuatan pasta gigi berfluoride.',
    durationMinutes: 5,
    icon: '🥛',
    isLocked: true, // LOCKED: requires passing Stage 4
    isCompleted: false,
    minScoreToUnlockNext: 70,
    summaryPoints: [
      'Kalsium pada susu dan keju membantu proses remineralisasi email gigi.',
      'Buah renyah seperti apel merangsang aliran saliva pembersih alami.',
      'Pasta gigi berfluoride memperkuat struktur mineral gigi agar kebal terhadap asam kuman.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Gigi kita membutuhkan asupan nutrisi kalsium, fosfat, dan vitamin D untuk menjaga kekuatannya. Makanan seperti susu murni, keju, yoghurt, ikan, sayuran hijau, dan buah-buahan berserat adalah sahabat sejati gigi!</p>
        <p><strong>Keajaiban Fluoride:</strong> Fluoride adalah mineral alami yang dapat bergabung dengan hidroksiapatit di email gigi membentuk <em>Fluorapatit</em>, yang membuat gigi 10x lebih tahan terhadap serangan asam!</p>
      </div>
    `,
    questions: [
      {
        id: 'q5-1',
        question: 'Mineral penting apa dalam pasta gigi yang bertugas membentengi email gigi dari asam?',
        options: ['Zat Besi', 'Fluoride', 'Minyak Goreng', 'Garam dapur'],
        correctOptionIndex: 1,
        explanation: 'Fluoride terbukti secara klinis mampu memperkuat email dan mencegah karies gigi.',
      },
      {
        id: 'q5-2',
        question: 'Manakah di bawah ini kelompok makanan yang sangat baik untuk kekuatan gigi anak?',
        options: ['Permen gulali dan soda asam', 'Susu, keju, apel, dan air putih', 'Keripik pedas dan es lilin manis', 'Cokelat lengket dan minuman boba'],
        correctOptionIndex: 1,
        explanation: 'Susu dan keju kaya kalsium serta apel berserat tinggi merangsang produksi saliva alami.',
      },
    ],
  },
  {
    id: 'stage-6',
    level: 6,
    title: 'Tahap 6: Master Senyum Sehat & Perawatan Rutin Posyandu',
    category: 'Pemantauan Kesehatan Komunitas',
    description: 'Menjadi teladan pahlawan senyum sehat keluarga dan jadwal rutin periksa ke dokter gigi.',
    durationMinutes: 5,
    icon: '👑',
    isLocked: true, // LOCKED: requires passing Stage 5
    isCompleted: false,
    minScoreToUnlockNext: 75,
    summaryPoints: [
      'Pemeriksaan rutin ke dokter gigi / posyandu dianjurkan minimal setiap 6 bulan sekali.',
      'Sikat gigi harus diganti baru setiap 3 bulan atau jika bulu sikat sudah mekar.',
      'Kader posyandu berperan penting mendata kesehatan gigi anak di lingkungan warga.',
    ],
    fullMaterialHtml: `
      <div class="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>Selamat telah mencapai tahap tertinggi dalam kurikulum Sikat Gigi Hero! Di tahap ini, kamu belajar menjaga senyum sehat untuk seumur hidup.</p>
        <p>Dokter gigi bukanlah sosok yang menakutkan. Mengunjungi dokter gigi atau posyandu setiap 6 bulan sekali membantu mendeteksi bercak putih (awal mula lubang gigi) sebelum menjadi sakit dan berlubang besar.</p>
      </div>
    `,
    questions: [
      {
        id: 'q6-1',
        question: 'Berapa bulan sekali kita sebaiknya memeriksakan kesehatan gigi ke dokter gigi atau posyandu?',
        options: ['10 tahun sekali', 'Setiap 6 bulan sekali', 'Hanya jika gigi sudah copot', 'Tidak perlu sama sekali'],
        correctOptionIndex: 1,
        explanation: 'Pemeriksaan rutin tiap 6 bulan mencegah masalah gigi sebelum berkembang parah.',
      },
      {
        id: 'q6-2',
        question: 'Kapan sikat gigi sebaiknya diganti dengan yang baru?',
        options: ['Setiap 3 bulan sekali atau jika bulunya sudah mulai mekar', '5 tahun sekali', 'Jika tangkainya patah saja', 'Tidak perlu diganti'],
        correctOptionIndex: 0,
        explanation: 'Bulu sikat yang sudah mekar tidak lagi mampu membersihkan plak dan menjadi sarang bakteri.',
      },
    ],
  },
];

// Initial Security Notification Logs
export const INITIAL_SECURITY_LOGS: SecurityNotificationLog[] = [
  {
    id: 'log_01',
    timestamp: Date.now() - 3600000 * 2,
    type: 'login',
    severity: 'info',
    title: 'Login Berhasil via Google Akun',
    description: 'Pengguna Nabila Aprilia (Super Admin) berhasil masuk melalui otentikasi Google.',
    actorEmail: 'nabilaapr021@gmail.com',
    actorRole: 'super_admin',
    ipAddress: '180.252.12.84',
    device: 'Chrome / Windows 11 (PWA Standalone)',
  },
  {
    id: 'log_02',
    timestamp: Date.now() - 3600000 * 5,
    type: 'role_change',
    severity: 'warning',
    title: 'Pemberian Hak Akses Kader Posyandu',
    description: 'Super Admin menetapkan peran Ibu Siti Aminah sebagai "Kader Posyandu Wilayah Melati 03".',
    actorEmail: 'nabilaapr021@gmail.com',
    actorRole: 'super_admin',
    targetUserEmail: 'kader.siti@gmail.com',
    ipAddress: '180.252.12.84',
  },
  {
    id: 'log_03',
    timestamp: Date.now() - 3600000 * 18,
    type: 'quiz_passed',
    severity: 'info',
    title: 'Kelulusan Kuis Pembelajaran Tahap 2',
    description: 'Pengguna Budi Santoso berhasil lulus kuis Tahap 2 dengan skor 90%. Kuis Tahap 3 kini terbuka.',
    actorEmail: 'keluarga.budi@gmail.com',
    actorRole: 'pengguna',
  },
  {
    id: 'log_04',
    timestamp: Date.now() - 3600000 * 24,
    type: 'unauthorized_attempt',
    severity: 'danger',
    title: 'Percobaan Akses Menu Terkunci Dicegah',
    description: 'Pengguna dengan peran "Viewer" mencoba memodifikasi hak akses pengguna lain. Tindakan diblokir oleh sistem RBAC.',
    actorEmail: 'tamu.pengamat@gmail.com',
    actorRole: 'viewer',
    ipAddress: '114.124.201.12',
    device: 'Safari / Mobile iOS',
  },
];

// ----------------- DATABASE HELPERS -----------------

export function getUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_USERS;
}

export function saveUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {
    // fallback
  }
}

export function getCurrentUser(): AppUser {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Default to Super Admin (nabilaapr021@gmail.com)
  return INITIAL_USERS[0];
}

export function setCurrentUser(user: AppUser): void {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch {
    // fallback
  }
}

export function getStages(): LearningStage[] {
  try {
    const raw = localStorage.getItem(STAGES_DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_STAGES;
}

export function saveStages(stages: LearningStage[]): void {
  try {
    localStorage.setItem(STAGES_DB_KEY, JSON.stringify(stages));
  } catch {
    // fallback
  }
}

export function getQuizAttempts(): UserQuizAttempt[] {
  try {
    const raw = localStorage.getItem(QUIZ_ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveQuizAttempts(attempts: UserQuizAttempt[]): void {
  try {
    localStorage.setItem(QUIZ_ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch {
    // fallback
  }
}

export function getSecurityLogs(): SecurityNotificationLog[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_SECURITY_LOGS;
}

export function addSecurityLog(log: Omit<SecurityNotificationLog, 'id' | 'timestamp'>): void {
  try {
    const current = getSecurityLogs();
    const newLog: SecurityNotificationLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };
    const updated = [newLog, ...current.slice(0, 49)]; // keep latest 50
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // fallback
  }
}

// ----------------- RBAC PERMISSION HELPERS -----------------

export function canManageRoles(role: UserRole): boolean {
  return role === 'super_admin';
}

export function canEditCurriculum(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canViewAnalytics(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'kader';
}

export function canExportData(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManagePosyandu(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin' || role === 'kader';
}

export function canTakeQuiz(role: UserRole): boolean {
  return role !== 'viewer';
}

export function getRoleBadgeStyle(role: UserRole): { label: string; bg: string; text: string; border: string } {
  switch (role) {
    case 'super_admin':
      return { label: 'SUPER ADMIN', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' };
    case 'admin':
      return { label: 'ADMIN DINKES', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
    case 'kader':
      return { label: 'KADER POSYANDU', bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' };
    case 'pengguna':
      return { label: 'PENGGUNA / ANAK', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' };
    case 'viewer':
      return { label: 'VIEWER (TAMU)', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
  }
}

// ----------------- CLINICAL RECOMMENDATIONS ENGINE -----------------

export function generateHealthRecommendations(user: AppUser, streak: number, morningDone: boolean, nightDone: boolean): HealthRecommendation[] {
  const recommendations: HealthRecommendation[] = [];

  // Recommendation 1: Night brushing check
  if (!nightDone) {
    recommendations.push({
      id: 'rec_night_brush',
      title: 'Perhatian Khusus: Sikat Gigi Sebelum Tidur',
      category: 'brushing_habit',
      priority: 'tinggi',
      status: 'aktif',
      recommendation: 'Sikat gigimu malam ini tepat sebelum naik ke tempat tidur selama 2 menit penuh.',
      clinicalReason: 'Saat tidur, produksi air liur berkurang hingga 80%. Kuman berkembang biak bebas memakan sisa makanan jika tidak disikat sebelum tidur.',
      actionButtonLabel: 'Buka Game Sikat Malam Sekarang',
    });
  }

  // Recommendation 2: Streak encouragement
  if (streak < 3) {
    recommendations.push({
      id: 'rec_streak_boost',
      title: 'Tingkatkan Konsistensi Menuju Streak 3 Hari',
      category: 'brushing_habit',
      priority: 'sedang',
      status: 'aktif',
      recommendation: 'Jadikan sikat gigi pagi & malam sebagai rutinitas harian yang menyenangkan.',
      clinicalReason: 'Konsistensi 3 hari berturut-turut terbukti secara psikologis menanamkan kebiasaan higienitas gigi permanen pada anak.',
      actionButtonLabel: 'Lihat Jadwal Pengingat',
    });
  } else {
    recommendations.push({
      id: 'rec_streak_legend',
      title: 'Luar Biasa! Pertahankan Kebiasaan Juara',
      category: 'brushing_habit',
      priority: 'rendah',
      status: 'selesai',
      recommendation: `Streak ${streak} harimu sangat mengagumkan! Ajak teman-teman dan keluarga untuk ikut sikat gigi 2x sehari.`,
      clinicalReason: 'Kepatuhan tinggi menurunkan risiko karies gigi hingga lebih dari 65%.',
    });
  }

  // Recommendation 3: Fluoride and Nutrition
  recommendations.push({
    id: 'rec_fluoride',
    title: 'Gunakan Pasta Gigi Berfluoride Sebutir Jagung',
    category: 'fluoride',
    priority: 'sedang',
    status: 'aktif',
    recommendation: 'Pastikan pasta gigi yang digunakan mengandung fluoride aman anak seukuran biji jagung atau kacang polong.',
    clinicalReason: 'Fluoride mengikat mineral email gigi dan menjadikannya tahan terhadap serangan asam bakteri.',
  });

  // Recommendation 4: Routine Dental Checkup
  recommendations.push({
    id: 'rec_posyandu_checkup',
    title: 'Jadwalkan Kunjungan Posyandu / Dokter Gigi 6 Bulan',
    category: 'posyandu',
    priority: 'sedang',
    status: 'aktif',
    recommendation: 'Catatkan kesehatan gigi pada buku KIA di Posyandu atau kunjungi klinik gigi terdekat.',
    clinicalReason: 'Deteksi dini bercak karies mikro (white spot) mencegah gigi terasa linu atau berlubang besar.',
    actionButtonLabel: 'Unduh Rekap Laporan Posyandu',
  });

  return recommendations;
}
