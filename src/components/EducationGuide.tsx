import React, { useState } from 'react';
import { BookOpen, WifiOff, Smartphone, Monitor, CheckCircle, HelpCircle, Heart, AlertTriangle, Sparkles } from 'lucide-react';

export const EducationGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'education' | 'offline_test' | 'file_structure'>('education');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Navigation Sub-Tabs */}
      <div className="flex bg-white/90 backdrop-blur-md p-1.5 rounded-3xl border border-sky-100 shadow-sm gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('education')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'education'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Edukasi Sikat Gigi Anak</span>
        </button>

        <button
          onClick={() => setActiveTab('offline_test')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'offline_test'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <WifiOff className="w-4 h-4" />
          <span>Panduan Uji Coba Offline (PWA)</span>
        </button>

        <button
          onClick={() => setActiveTab('file_structure')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === 'file_structure'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Struktur File & Teknologi</span>
        </button>
      </div>

      {/* TAB 1: EDUKASI SIKAT GIGI */}
      {activeTab === 'education' && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 Langkah Teknik Sikat Gigi */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 mb-4">
              <span>🦷 4 Langkah Sikat Gigi Yang Benar (Teknik Modifikasi Bass)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Posisi Sikat 45 Derajat</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Arahkan bulu sikat membentuk sudut 45° menghadap perbatasan antara gusi dan gigi agar plak yang bersembunyi di saku gusi terangkat bersih.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Gerakan Memutar Lembut</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Putar sikat membentuk lingkaran kecil. Jangan menggosok horizontal terlalu keras karena dapat mengikis lapisan email gigi dan melukai gusi.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Sikat Permukaan Kunyah</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Pada gigi geraham atas dan bawah, sikat dengan gerakan maju-mundur pendek untuk mengangkat sisa permen dan biskuit dari lekukan gigi.
                  </p>
                </div>
              </div>

              <div className="bg-sky-50/80 p-4 rounded-2xl border border-sky-100 flex items-start gap-3">
                <span className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-800">Bersihkan Lidah & Kumur</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Sikat punggung lidah secara lembut dari belakang ke depan untuk membuang bakteri bau mulut, lalu berkumur dengan air bersih secukupnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sahabat vs Musuh Gigi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sahabat */}
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-6 border-2 border-emerald-200 shadow-sm">
              <h4 className="text-base font-black text-emerald-900 flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-emerald-600 fill-emerald-500" />
                <span>Sahabat Gigi (Membuat Gigi Kuat)</span>
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span>🥛</span>
                  <span><strong>Susu & Keju:</strong> Mengandung kalsium dan fosfat pembangun email.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🍎</span>
                  <span><strong>Apel & Wortel:</strong> Sayuran renyah yang merangsang air liur pembersih alami.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>💧</span>
                  <span><strong>Air Putih:</strong> Membilas asam dan sisa makanan tanpa gula.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🐟</span>
                  <span><strong>Ikan & Telur:</strong> Kaya vitamin D untuk penyerapan kalsium.</span>
                </li>
              </ul>
            </div>

            {/* Musuh */}
            <div className="bg-gradient-to-b from-rose-50 to-white rounded-3xl p-6 border-2 border-rose-200 shadow-sm">
              <h4 className="text-base font-black text-rose-900 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Musuh Gigi (Waspadai Kuman!)</span>
              </h4>
              <ul className="space-y-2 text-xs md:text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span>🍬</span>
                  <span><strong>Permen & Karamel Lengket:</strong> Menempel lama di sela gigi.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🥤</span>
                  <span><strong>Minuman Bersoda & Boba:</strong> Tingkat keasaman tinggi perusak email.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🍪</span>
                  <span><strong>Camilan Manis Sebelum Tidur:</strong> Makanan favorit koloni bakteri malam hari.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>🍭</span>
                  <span><strong>Mengemut Lolipop Lama:</strong> Memperpanjang kontak asam pada gigi.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PANDUAN PENGUJIAN OFFLINE PWA */}
      {activeTab === 'offline_test' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-gradient-to-r from-teal-500 via-sky-600 to-indigo-600 text-white rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-black flex items-center gap-2">
              <WifiOff className="w-6 h-6 text-yellow-300" />
              <span>Cara Menguji Kemampuan Offline (PWA)</span>
            </h3>
            <p className="text-xs md:text-sm text-sky-100 mt-2 leading-relaxed">
              Aplikasi ini telah dilengkapi dengan <strong>Service Worker (Cache First)</strong>, <strong>Web App Manifest</strong>, dan penyimpanan data <strong>localStorage</strong>. Aplikasi akan tetap berjalan 100% mulus tanpa kuota internet sedikitpun!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Desktop Test */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800">Uji di Komputer / Laptop</h4>
                  <p className="text-xs text-slate-400">Chrome, Edge, atau Firefox</p>
                </div>
              </div>

              <ol className="space-y-3 text-xs md:text-sm text-slate-600 list-decimal list-inside">
                <li>
                  Buka aplikasi ini dan pastikan sudah terbuka minimal 1 kali.
                </li>
                <li>
                  <strong>Metode 1:</strong> Matikan koneksi Wi-Fi atau cabut kabel LAN di laptopmu.
                </li>
                <li>
                  <strong>Metode 2:</strong> Tekan tombol keyboard <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sky-600">F12</code> (Inspect) → Buka tab <strong>Network</strong> → Centang kotak <strong>Offline</strong>.
                </li>
                <li>
                  Segarkan (Refresh) halaman browser <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sky-600">Ctrl + R</code> atau <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sky-600">Cmd + R</code>.
                </li>
                <li>
                  <strong>Hasil:</strong> Banner oranye <em>"Mode Offline Aktif"</em> akan muncul. Game 2 menit, audio sintetis, streak, dan checklist tetap bekerja sempurna!
                </li>
              </ol>
            </div>

            {/* Mobile / Smartphone Test */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-800">Uji di HP Android & iOS</h4>
                  <p className="text-xs text-slate-400">Bisa dibuka dari Layar Utama</p>
                </div>
              </div>

              <ol className="space-y-3 text-xs md:text-sm text-slate-600 list-decimal list-inside">
                <li>
                  Klik tombol <strong>"Pasang Aplikasi (PWA)"</strong> di bagian atas layar untuk menginstall ke layar utama HP.
                </li>
                <li>
                  Tutup browser atau aktifkan <strong>Mode Pesawat (Airplane Mode)</strong> di HP.
                </li>
                <li>
                  Ketuk ikon aplikasi <strong>"SikatGigi"</strong> di layar utama ponselmu seperti membuka aplikasi native dari Play Store / App Store.
                </li>
                <li>
                  Aplikasi terbuka instan tanpa loading internet, layar penuh, dan anak bisa langsung sikat gigi dengan riang!
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STRUKTUR FILE & TEKNOLOGI */}
      {activeTab === 'file_structure' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4 animate-fade-in">
          <h3 className="text-lg font-black text-slate-800 tracking-tight">
            Struktur File PWA & Arsitektur Lengkap
          </h3>
          <p className="text-xs text-slate-500">
            Arsitektur modern berbasis Progressive Web App sesuai spesifikasi:
          </p>

          <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-5 rounded-2xl overflow-x-auto leading-relaxed shadow-inner">
            <pre>{`📁 sikat-gigi-hero/
├── 📄 index.html              -> Entry point HTML5 dengan meta tags PWA, iOS standalone
├── 📄 public/
│   ├── 📄 manifest.json       -> Web App Manifest (display: standalone, theme_color, ikon)
│   ├── 📄 service-worker.js   -> Cache-first caching strategy & Local Notification handler
│   ├── 📄 icon.svg            -> Vektor logo pahlawan gigi cemerlang
│   ├── 📄 pwa-192x192.png     -> Ikon PWA standar Android (192px)
│   ├── 📄 pwa-512x512.png     -> Ikon splash screen beresolusi tinggi (512px)
│   ├── 📄 pwa-maskable-512x512.png -> Ikon maskable dengan safe margin 15%
│   └── 📄 apple-touch-icon.png-> Ikon khusus iOS Safari Home Screen (180px PNG)
├── 📁 src/
│   ├── 📄 main.tsx            -> Mount React DOM
│   ├── 📄 App.tsx             -> Komponen utama dengan navigasi tab & in-app reminder
│   ├── 📄 index.css           -> Tailwind CSS konfigurasi cerah & ramah anak
│   ├── 📁 services/
│   │   ├── 📄 sound.ts        -> Web Audio API sintetis (100% offline tanpa file mp3)
│   │   ├── 📄 storage.ts      -> Penyimpanan localStorage streak, skin, bintang & badges
│   │   └── 📄 notifications.ts-> Local Notifications & background scheduler ticker
│   ├── 📁 hooks/
│   │   ├── 📄 usePWAInstall.ts -> Hook beforeinstallprompt & iOS guidance
│   │   └── 📄 useOnlineStatus.ts-> Deteksi online/offline real-time
│   └── 📁 components/
│       ├── 📄 BrushGame.tsx    -> Game sikat gigi 2 menit, 4 kuadran, kuman & partikel busa
│       ├── 📄 ReminderSection.tsx -> Pengingat pagi & malam 2x sehari dengan jam kustom
│       ├── 📄 StreakTracker.tsx-> Daily streak counter & kalender sikat gigi mingguan
│       ├── 📄 BadgesAndRewards.tsx -> Toko skin sikat gigi dan koleksi piala anak
│       ├── 📄 EducationGuide.tsx -> Modul edukasi kesehatan gigi dan uji coba offline
│       ├── 📄 PWAInstallButton.tsx -> Tombol pasang aplikasi in-app responsif
│       └── 📄 OfflineIndicator.tsx -> Banner notifikasi status offline
└── 📄 vite.config.ts          -> VitePWA builder & asset bundler`}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
