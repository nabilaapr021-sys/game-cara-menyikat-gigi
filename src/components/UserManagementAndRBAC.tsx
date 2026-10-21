import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import {
  getUsers,
  saveUsers,
  getCurrentUser,
  canManageRoles,
  getRoleBadgeStyle,
  addSecurityLog,
} from '../services/authAndDatabase';
import { sounds } from '../services/sound';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Lock,
  Check,
  X,
  AlertTriangle,
  UserPlus,
} from 'lucide-react';

export const UserManagementAndRBAC: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>(getUsers());
  const currentUser = getCurrentUser();
  const isSuperAdmin = canManageRoles(currentUser.role);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('pengguna');
  const [newPosyandu, setNewPosyandu] = useState('Posyandu Melati 03');

  // Change a user's role
  const handleRoleChange = (userId: string, newRoleValue: UserRole) => {
    if (!isSuperAdmin) {
      sounds.playGermPop();
      addSecurityLog({
        type: 'unauthorized_attempt',
        severity: 'danger',
        title: 'Pelanggaran Izin RBAC Dicegah',
        description: `Pengguna ${currentUser.name} (${currentUser.email}) dengan peran ${currentUser.role} mencoba mengubah peran pengguna lain tanpa hak Super Admin. Tindakan diblokir.`,
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
      });
      alert(`⛔ Akses Ditolak!\n\nHanya Super Admin yang berwenang mengubah peran pengguna. Percobaan ini telah dicatat dalam Audit Keamanan.`);
      return;
    }

    sounds.playButton();
    const targetUser = users.find((u) => u.id === userId);
    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, role: newRoleValue } : u));
    setUsers(updatedUsers);
    saveUsers(updatedUsers);

    addSecurityLog({
      type: 'role_change',
      severity: 'warning',
      title: 'Perubahan Peran Pengguna',
      description: `Super Admin ${currentUser.email} mengubah peran ${targetUser?.name} (${targetUser?.email}) menjadi ${newRoleValue.toUpperCase()}.`,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      targetUserEmail: targetUser?.email,
    });
  };

  // Add new user
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang berhak menambahkan pengguna baru.');
      return;
    }

    const emailTrim = newEmail.trim().toLowerCase();
    if (!emailTrim) return;

    if (users.some((u) => u.email.toLowerCase() === emailTrim)) {
      alert('Email ini sudah terdaftar di sistem.');
      return;
    }

    const created: AppUser = {
      id: `user_${Date.now()}`,
      email: emailTrim,
      name: newName.trim() || emailTrim.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${emailTrim}`,
      role: newRole,
      posyanduArea: newPosyandu,
      joinedAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Baru Dibuat',
      isVerified: true,
      totalBrushSessions: 0,
      stars: 50,
      streak: 1,
      avgQuizScore: 0,
    };

    const updated = [created, ...users];
    setUsers(updated);
    saveUsers(updated);

    addSecurityLog({
      type: 'role_change',
      severity: 'info',
      title: 'Pendaftaran Pengguna Baru Berhasil',
      description: `Super Admin mendaftarkan ${created.name} (${created.email}) dengan peran ${created.role.toUpperCase()} di ${newPosyandu}.`,
      actorEmail: currentUser.email,
      actorRole: currentUser.role,
      targetUserEmail: created.email,
    });

    sounds.playSparkle();
    setShowAddModal(false);
    setNewEmail('');
    setNewName('');
  };

  // Delete user
  const handleDeleteUser = (userId: string, email: string) => {
    if (!isSuperAdmin) {
      alert('Hanya Super Admin yang dapat menghapus data pengguna.');
      return;
    }
    if (email === currentUser.email) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${email}?`)) {
      const updated = users.filter((u) => u.id !== userId);
      setUsers(updated);
      saveUsers(updated);
      sounds.playButton();

      addSecurityLog({
        type: 'role_change',
        severity: 'warning',
        title: 'Penghapusan Akun Pengguna',
        description: `Super Admin menghapus akun ${email} dari basis data.`,
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
        targetUserEmail: email,
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.posyanduArea && u.posyanduArea.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchQuery && matchRole;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Pengaturan Peran & Hak Akses (RBAC)</span>
              {isSuperAdmin ? (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                  Mode Super Admin Aktif
                </span>
              ) : (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-300">
                  Mode Terbatas ({currentUser.role.toUpperCase()})
                </span>
              )}
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Pengelolaan 5 tingkatan peran: Super Admin, Admin Dinkes, Kader Posyandu, Pengguna Cilik, dan Viewer.
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* RBAC MATRIX CARD */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Matriks Hak Akses Sistem (Security Hierarchy)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Tingkat Peran</th>
                <th className="py-2.5 px-3">Main Game Sikat</th>
                <th className="py-2.5 px-3">Kuis Bertahap</th>
                <th className="py-2.5 px-3">Pantau Posyandu</th>
                <th className="py-2.5 px-3">Analitik & Export</th>
                <th className="py-2.5 px-3">Kelola Peran User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              <tr className="hover:bg-rose-50/40">
                <td className="py-2.5 px-3 font-black text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Super Admin</span>
                </td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Semua</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Bebas / Kunci</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Semua Wilayah</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Penuh (CSV/PDF)</td>
                <td className="py-2.5 px-3 text-emerald-600 font-black">✓ Hak Eksklusif</td>
              </tr>
              <tr className="hover:bg-purple-50/40">
                <td className="py-2.5 px-3 font-bold text-purple-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Admin Dinkes</span>
                </td>
                <td className="py-2.5 px-3 text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Seluruh Kota</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Penuh</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Tidak Ada</td>
              </tr>
              <tr className="hover:bg-teal-50/40">
                <td className="py-2.5 px-3 font-bold text-teal-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Kader Posyandu</span>
                </td>
                <td className="py-2.5 px-3 text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Wilayah Binaan</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Lihat Rekap</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Tidak Ada</td>
              </tr>
              <tr className="hover:bg-sky-50/40">
                <td className="py-2.5 px-3 font-bold text-sky-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  <span>Pengguna (Anak/Ortu)</span>
                </td>
                <td className="py-2.5 px-3 text-emerald-600">✓</td>
                <td className="py-2.5 px-3 text-emerald-600">✓ Sesuai Progres</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Viewer (Tamu)</span>
                </td>
                <td className="py-2.5 px-3 text-slate-400">✗ Lihat Saja</td>
                <td className="py-2.5 px-3 text-slate-400">✗ Terkunci</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
                <td className="py-2.5 px-3 text-slate-400">✗</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DATABASE TABLE */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, email, posyandu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400">Filter Peran:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
            >
              <option value="all">Semua Peran ({users.length})</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin Dinkes</option>
              <option value="kader">Kader Posyandu</option>
              <option value="pengguna">Pengguna Cilik</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-3">Pengguna</th>
                <th className="py-3 px-3">Email Google</th>
                <th className="py-3 px-3">Peran Saat Ini</th>
                <th className="py-3 px-3">Wilayah Posyandu</th>
                <th className="py-3 px-3 text-center">Streak / Bintang</th>
                <th className="py-3 px-3 text-right">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const badge = getRoleBadgeStyle(user.role);
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <span>{user.name}</span>
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-100 text-sky-700 font-bold">
                                (Anda)
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">Gabung: {user.joinedAt}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {user.email}
                    </td>

                    <td className="py-3 px-3">
                      {isSuperAdmin ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                          className={`font-black text-[10px] px-2 py-1 rounded-lg border cursor-pointer ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <option value="super_admin">SUPER ADMIN</option>
                          <option value="admin">ADMIN DINKES</option>
                          <option value="kader">KADER POSYANDU</option>
                          <option value="pengguna">PENGGUNA</option>
                          <option value="viewer">VIEWER</option>
                        </select>
                      ) : (
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          {badge.label}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {user.posyanduArea || '-'}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="font-bold text-orange-600">🔥 {user.streak}d</span>
                      <span className="text-slate-300 mx-1">•</span>
                      <span className="font-bold text-amber-600">⭐ {user.stars}</span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isSuperAdmin && !isSelf ? (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border-4 border-emerald-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Tambah Pengguna & Tetapkan Peran</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Email Google / Gmail:</label>
                <input
                  type="email"
                  required
                  placeholder="contoh@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Pengguna / Kader"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Pilih Peran:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800"
                  >
                    <option value="pengguna">Pengguna Cilik</option>
                    <option value="kader">Kader Posyandu</option>
                    <option value="admin">Admin Dinkes</option>
                    <option value="viewer">Viewer</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Wilayah Binaan:</label>
                  <input
                    type="text"
                    value={newPosyandu}
                    onChange={(e) => setNewPosyandu(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
