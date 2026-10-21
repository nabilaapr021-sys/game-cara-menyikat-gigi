import React, { useState } from 'react';
import { AppUser, UserRole } from '../types';
import {
  getUsers,
  saveUsers,
  getCurrentUser,
  setCurrentUser,
  addSecurityLog,
  getRoleBadgeStyle,
} from '../services/authAndDatabase';
import { sounds } from '../services/sound';
import { X, CheckCircle2, Shield, User, Mail, LogIn, Sparkles, RefreshCw } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [users, setUsers] = useState<AppUser[]>(getUsers());
  const currentUser = getCurrentUser();
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('pengguna');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Switch to one of the demo users
  const handleSelectUser = (user: AppUser) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setCurrentUser(user);
      addSecurityLog({
        type: 'login',
        severity: 'info',
        title: `Login Berhasil: ${user.name}`,
        description: `Pengguna masuk menggunakan akun Google (${user.email}) dengan peran ${user.role.toUpperCase()}.`,
        actorEmail: user.email,
        actorRole: user.role,
        device: 'Google Chrome / PWA',
      });
      sounds.playSparkle();
      setIsSubmitting(false);
      onLoginSuccess(user);
      onClose();
    }, 400);
  };

  // Sign in with custom Gmail address
  const handleCustomGoogleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const emailClean = customEmail.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === emailClean);

    if (existing) {
      handleSelectUser(existing);
      return;
    }

    // Auto assign super_admin if matches nabilaapr021@gmail.com
    const roleToAssign: UserRole = emailClean === 'nabilaapr021@gmail.com' ? 'super_admin' : selectedRole;

    const newUser: AppUser = {
      id: `user_${Date.now()}`,
      email: emailClean,
      name: customName.trim() || emailClean.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${emailClean}`,
      role: roleToAssign,
      posyanduArea: 'Posyandu Kota',
      joinedAt: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toLocaleString('id-ID'),
      isVerified: true,
      totalBrushSessions: 0,
      stars: 100,
      streak: 1,
      avgQuizScore: 0,
    };

    const updated = [newUser, ...users];
    setUsers(updated);
    saveUsers(updated);
    handleSelectUser(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border-4 border-sky-200 relative overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Login Akun Google (Gmail)</h3>
              <p className="text-xs text-slate-400">Pilih akun demo atau masukkan email Google Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active User Status */}
        <div className="my-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full border-2 border-white shadow-xs object-cover"
            />
            <div>
              <p className="text-xs font-black text-slate-800">{currentUser.name}</p>
              <p className="text-[11px] text-slate-500 font-mono">{currentUser.email}</p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                getRoleBadgeStyle(currentUser.role).bg
              } ${getRoleBadgeStyle(currentUser.role).text} ${
                getRoleBadgeStyle(currentUser.role).border
              }`}
            >
              {getRoleBadgeStyle(currentUser.role).label}
            </span>
          </div>
        </div>

        {/* Quick Account Switcher (Preconfigured Roles) */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Pilih Cepat Akun Berdasarkan Peran (RBAC):
          </label>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {users.map((u) => {
              const badge = getRoleBadgeStyle(u.role);
              const isCurrent = currentUser.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`p-2.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between hover:scale-[1.01] ${
                    isCurrent
                      ? 'bg-sky-50/70 border-sky-400 ring-2 ring-sky-100'
                      : 'bg-white border-slate-200 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}
                    >
                      {badge.label}
                    </span>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Gmail Input */}
        <form onSubmit={handleCustomGoogleLogin} className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-sky-500" />
            <span>Atau Masuk dengan Email Gmail Baru:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="email"
              required
              placeholder="nama@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              placeholder="Nama Panggilan"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span>Peran:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-700"
              >
                <option value="pengguna">Pengguna (Anak/Ortu)</option>
                <option value="kader">Kader Posyandu</option>
                <option value="admin">Admin Dinkes</option>
                <option value="super_admin">Super Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Sekarang</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
