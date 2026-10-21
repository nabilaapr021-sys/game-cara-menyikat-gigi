import React, { useState } from 'react';
import { AppUser } from '../types';
import {
  getUsers,
  getCurrentUser,
  canExportData,
  canViewAnalytics,
  addSecurityLog,
} from '../services/authAndDatabase';
import { sounds } from '../services/sound';
import {
  BarChart3,
  Download,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  Flame,
  FileSpreadsheet,
  FileText,
  Activity,
  Award,
} from 'lucide-react';

export const AnalyticsAndRekapitulasi: React.FC = () => {
  const users = getUsers();
  const currentUser = getCurrentUser();
  const hasExportRights = canExportData(currentUser.role);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  // Filtered dataset
  const filteredUsers = users.filter((u) => {
    if (selectedArea === 'all') return true;
    return u.posyanduArea?.includes(selectedArea);
  });

  // KPI calculations
  const totalUsers = users.length;
  const totalSessions = users.reduce((acc, u) => acc + (u.totalBrushSessions || 0), 0);
  const totalStars = users.reduce((acc, u) => acc + (u.stars || 0), 0);
  const avgQuiz = Math.round(
    users.reduce((acc, u) => acc + (u.avgQuizScore || 0), 0) / Math.max(1, users.length)
  );

  // Export to CSV Function
  const handleExportCSV = () => {
    if (!hasExportRights) {
      alert('Hanya Super Admin dan Admin Dinkes yang memiliki hak akses mengunduh rekapitulasi data.');
      return;
    }

    sounds.playSparkle();

    const headers = [
      'ID Pengguna',
      'Nama Lengkap',
      'Email Google',
      'Peran (Role)',
      'Wilayah Posyandu',
      'Total Sesi Sikat',
      'Bintang Diperoleh',
      'Streak Hari',
      'Rata-rata Kuis (%)',
      'Tanggal Bergabung',
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.role.toUpperCase()}"`,
      `"${u.posyanduArea || '-'}"`,
      u.totalBrushSessions || 0,
      u.stars || 0,
      u.streak || 0,
      u.avgQuizScore || 0,
      `"${u.joinedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekapitulasi_sikat_gigi_posyandu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addSecurityLog({
      type: 'data_export',
      severity: 'warning',
      title: 'Export Rekapitulasi Data Pengguna',
      description: `Pengguna ${currentUser.name} (${currentUser.email}) mengunduh berkas rekapitulasi CSV (${filteredUsers.length} data pengguna).`,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Analisis & Rekapitulasi Data Kesehatan Gigi</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Laporan berkala pemantauan kebiasaan sikat gigi 2x sehari dan evaluasi kuis anak posyandu.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasExportRights ? (
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition cursor-pointer flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV / Excel</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl font-semibold">
              Export terkunci untuk {currentUser.role}
            </span>
          )}
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pengguna</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1 font-mono">{totalUsers}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5">Terdaftar Aktif</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Sesi Sikat</p>
            <p className="text-2xl sm:text-3xl font-black text-teal-600 mt-1 font-mono">{totalSessions}</p>
            <p className="text-[11px] text-teal-600 font-bold mt-0.5">2 Menit Bersih</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Morning & Night Adherence */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kepatuhan Sikat</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">88%</span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">76%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">☀️ Pagi / 🌙 Malam</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Avg Quiz Score */}
        <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rata-rata Kuis</p>
            <p className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1 font-mono">{avgQuiz}%</p>
            <p className="text-[11px] text-indigo-600 font-bold mt-0.5">Tingkat Pemahaman</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* POSYANDU BREAKDOWN & HEALTH RISK CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Compliance Progress Bars */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>Tingkat Kepatuhan Sikat Gigi Anak Berdasarkan Waktu</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>☀️ Sikat Gigi Pagi (Setelah Sarapan)</span>
                <span className="text-amber-600 font-black">88.4%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[88.4%] h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>🌙 Sikat Gigi Malam (Sebelum Tidur)</span>
                <span className="text-indigo-600 font-black">76.2%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[76.2%] h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                *Target program Dinkes & Kader Posyandu: Kepatuhan malam hari minimal 90%.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>🪥 Durasi Penuh 2 Menit (4 Kuadran)</span>
                <span className="text-teal-600 font-black">82.0%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[82%] h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Dental Risk Category Distribution */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <span>Kategori Risiko Karies Gigi Anak (Surveilans)</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-950">Risiko Rendah (Gigi Prima)</span>
              </div>
              <span className="text-xs font-black text-emerald-800">62% Anak</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-950">Risiko Sedang (Sering Bolong Malam)</span>
              </div>
              <span className="text-xs font-black text-amber-800">26% Anak</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <span className="text-xs font-bold text-rose-950">Risiko Tinggi (Perlu Kunjungan Posyandu)</span>
              </div>
              <span className="text-xs font-black text-rose-800">12% Anak</span>
            </div>
          </div>
        </div>

      </div>

      {/* FULL REKAPITULASI TABLE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-800">Tabel Rekapitulasi Peserta & Nilai</h3>
            <p className="text-xs text-slate-500">Rekapitulasi riwayat sikat gigi dan nilai kuis per anak</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Wilayah:</span>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Semua Wilayah Posyandu</option>
              <option value="Melati">Posyandu Melati</option>
              <option value="Dinas Kesehatan">Dinas Kesehatan</option>
              <option value="Pusat Kota">Pusat Kota</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Nama & Email</th>
                <th className="py-3 px-3">Wilayah Posyandu</th>
                <th className="py-3 px-3 text-center">Sesi Sikat</th>
                <th className="py-3 px-3 text-center">Streak</th>
                <th className="py-3 px-3 text-center">Rata-rata Kuis</th>
                <th className="py-3 px-3">Status Karies</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isGood = (u.streak || 0) >= 5 && (u.avgQuizScore || 0) >= 75;
                const isWarning = (u.streak || 0) < 3;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {u.posyanduArea || 'Posyandu Umum'}
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono text-teal-600">
                      {u.totalBrushSessions || 0}x
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono text-orange-600">
                      🔥 {u.streak || 0} hari
                    </td>

                    <td className="py-3 px-3 text-center font-bold font-mono text-indigo-600">
                      {u.avgQuizScore ? `${u.avgQuizScore}%` : '-'}
                    </td>

                    <td className="py-3 px-3">
                      {isGood ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                          Gigi Prima
                        </span>
                      ) : isWarning ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                          Perlu Didampingi
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          Cukup Baik
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
