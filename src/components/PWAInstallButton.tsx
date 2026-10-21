import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, CheckCircle, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed and running standalone, show clean badge or nothing
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 text-xs font-semibold border border-emerald-300">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        <span>Aplikasi Terpasang (Offline Siap)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <>
        <button
          onClick={async () => {
            const ok = await install();
            if (ok) setInstallSuccess(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs md:text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all cursor-pointer"
          title="Pasang aplikasi di layar utama HP atau komputer"
        >
          <Download className="w-4 h-4 animate-bounce" />
          <span>Pasang Aplikasi (PWA)</span>
        </button>

        {installSuccess && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-200" />
            <div>
              <p className="font-bold text-sm">Berhasil Dipasang!</p>
              <p className="text-xs text-emerald-100">Ikon Sikat Gigi Hero kini ada di layar utamamu.</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border-2 border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 active:scale-95 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
          <span>Pasang di iPhone/iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-sky-200 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📱</span>
                  <h3 className="text-base font-bold text-slate-800">Pasang di iPhone / iPad</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs md:text-sm text-slate-600">
                <div className="flex items-start gap-3 bg-sky-50 p-3 rounded-2xl border border-sky-100">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    Tekan tombol <strong className="text-sky-700 flex items-center gap-1 inline-flex"><Share2 className="w-3.5 h-3.5" /> Bagikan (Share)</strong> di bilah bawah browser Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-sky-50 p-3 rounded-2xl border border-sky-100">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    Gulir ke bawah dan pilih <strong className="text-sky-700 flex items-center gap-1 inline-flex"><PlusSquare className="w-3.5 h-3.5" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-sky-50 p-3 rounded-2xl border border-sky-100">
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    Tekan <strong className="text-sky-700">Tambah (Add)</strong> di pojok kanan atas. Selesai! Web akan bisa dibuka offline tanpa internet.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-sky-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-700 transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Standalone desktop/browser fallback button for manual guidance
  return (
    <button
      onClick={() => {
        alert("💡 Tips Pasang PWA:\n\n• Di Google Chrome / Edge: Klik ikon pasang/komputer di ujung kanan kolom alamat browser (URL bar).\n• Di HP Android: Tekan tombol titik tiga (⋮) lalu pilih 'Instal Aplikasi' atau 'Tambahkan ke Layar Utama'.\n• Aplikasi akan tersimpan dan dapat dimainkan offline tanpa kuota!");
      }}
      className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 transition shadow-xs"
      title="Cara memasang aplikasi ini"
    >
      <Download className="w-3.5 h-3.5 text-sky-500" />
      <span>Panduan Pasang PWA</span>
    </button>
  );
};
