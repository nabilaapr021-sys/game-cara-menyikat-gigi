import React, { useState, useEffect } from 'react';
import { ReminderSettings } from '../types';
import { getReminderSettings, saveReminderSettings } from '../services/storage';
import {
  requestNotificationPermission,
  getNotificationPermission,
  triggerTestNotification,
  isNotificationSupported,
} from '../services/notifications';
import { sounds } from '../services/sound';
import { Bell, Sun, Moon, Clock, CheckCircle2, AlertCircle, Sparkles, Send, User } from 'lucide-react';

export const ReminderSection: React.FC = () => {
  const [settings, setSettings] = useState<ReminderSettings>(getReminderSettings());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleSave = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    saveReminderSettings(newSettings);
    sounds.playButton();
  };

  const handleRequestPermission = async () => {
    sounds.playButton();
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      sounds.playSparkle();
      triggerTestNotification();
      setTestStatus('Izin berhasil diberikan! Tes notifikasi telah dikirim.');
    }
  };

  const handleTestNotification = async () => {
    sounds.playButton();
    if (permission !== 'granted') {
      const res = await requestNotificationPermission();
      setPermission(res);
      if (res !== 'granted') {
        alert(
          'Silakan izinkan notifikasi pada peramban/browser kamu agar pengingat sikat gigi bisa muncul otomatis.'
        );
        return;
      }
    }

    setTestStatus('Mengirim notifikasi...');
    const ok = await triggerTestNotification();
    if (ok) {
      setTestStatus('Notifikasi tes berhasil dikirimkan ke perangkatmu!');
      sounds.playSparkle();
    } else {
      setTestStatus('Notifikasi lokal dipicu.');
    }

    setTimeout(() => setTestStatus(null), 5000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Title & Introduction */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Bell className="w-6 h-6 animate-swing" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Sistem Pengingat Sikat Gigi 2x Sehari
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Pengingat bekerja secara offline di HP/Desktop menggunakan Local Web Notifications.
            </p>
          </div>
        </div>

        {/* Permission Status Pill */}
        <div className="flex items-center gap-2">
          {permission === 'granted' ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Notifikasi Aktif</span>
            </div>
          ) : (
            <button
              onClick={handleRequestPermission}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Aktifkan Izin Notifikasi</span>
            </button>
          )}
        </div>
      </div>

      {/* User Nickname config */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Nama Panggilan di Notifikasi
            </label>
            <p className="text-xs text-slate-400">Pengingat akan menyapa dengan nama ini</p>
          </div>
        </div>
        <input
          type="text"
          value={settings.customName}
          onChange={(e) => handleSave({ ...settings, customName: e.target.value })}
          placeholder="Contoh: Budi / Siti"
          className="w-full sm:w-60 px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Morning & Night Reminders Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* SIKAT GIGI PAGI */}
        <div className={`bg-gradient-to-b from-amber-50 to-white rounded-3xl p-6 border-2 shadow-sm transition-all ${
          settings.morningEnabled ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200 opacity-75'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-md">
                <Sun className="w-6 h-6 text-amber-950" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Sikat Gigi Pagi</h3>
                <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                  Setelah Sarapan
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.morningEnabled}
                onChange={(e) => handleSave({ ...settings, morningEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Pilih Jam Pengingat Pagi:</span>
              </label>
              <input
                type="time"
                value={settings.morningTime}
                onChange={(e) => handleSave({ ...settings, morningTime: e.target.value })}
                disabled={!settings.morningEnabled}
                className="w-full text-2xl font-black text-slate-800 font-mono bg-white border-2 border-amber-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-2">Preset Cepat Pagi:</p>
              <div className="flex flex-wrap gap-2">
                {['06:00', '06:30', '07:00', '07:30'].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSave({ ...settings, morningTime: time })}
                    disabled={!settings.morningEnabled}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.morningTime === time
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : 'bg-white border border-amber-200 text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-amber-800/80 bg-amber-100/50 p-3 rounded-xl border border-amber-200/50">
              💡 <strong>Mengapa setelah sarapan?</strong> Makanan pagi meninggalkan lapisan karbohidrat & gula yang disukai kuman. Menyikat gigi 15-30 menit setelah sarapan menjaga nafas segar ke sekolah/tempat kerja!
            </p>
          </div>
        </div>

        {/* SIKAT GIGI MALAM */}
        <div className={`bg-gradient-to-b from-indigo-50 to-white rounded-3xl p-6 border-2 shadow-sm transition-all ${
          settings.nightEnabled ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-slate-200 opacity-75'
        }`}>
          <div className="flex items-center justify-between pb-4 border-b border-indigo-200/60">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl shadow-md">
                <Moon className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Sikat Gigi Malam</h3>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  Sebelum Tidur
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.nightEnabled}
                onChange={(e) => handleSave({ ...settings, nightEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Pilih Jam Pengingat Malam:</span>
              </label>
              <input
                type="time"
                value={settings.nightTime}
                onChange={(e) => handleSave({ ...settings, nightTime: e.target.value })}
                disabled={!settings.nightEnabled}
                className="w-full text-2xl font-black text-slate-800 font-mono bg-white border-2 border-indigo-200 rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 mb-2">Preset Cepat Malam:</p>
              <div className="flex flex-wrap gap-2">
                {['19:30', '20:00', '20:30', '21:00'].map((time) => (
                  <button
                    key={time}
                    onClick={() => handleSave({ ...settings, nightTime: time })}
                    disabled={!settings.nightEnabled}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      settings.nightTime === time
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-indigo-200 text-slate-600 hover:bg-indigo-50'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-indigo-900/80 bg-indigo-100/50 p-3 rounded-xl border border-indigo-200/50">
              ⭐ <strong>Sangat Krusial!</strong> Saat kita tidur, produksi air liur berkurang hingga 80%. Tanpa sikat gigi, bakteri berkembang biak bebas dan menghasilkan asam penyebab gigi berlubang.
            </p>
          </div>
        </div>

      </div>

      {/* Test Notification Card & Offline Notice */}
      <div className="bg-gradient-to-r from-teal-500 via-sky-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-black flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span>Tes Notifikasi Offline Sekarang</span>
          </h3>
          <p className="text-xs md:text-sm text-sky-100 max-w-lg">
            Tekan tombol untuk menguji apakah notifikasi lokal dapat berbunyi dan muncul di perangkatmu saat offline.
          </p>
          {testStatus && (
            <p className="text-xs font-bold text-yellow-200 bg-white/20 px-3 py-1 rounded-lg inline-block mt-2">
              {testStatus}
            </p>
          )}
        </div>

        <button
          onClick={handleTestNotification}
          className="px-6 py-3.5 rounded-2xl bg-white text-slate-800 hover:bg-sky-50 font-black text-sm shadow-lg flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4 text-sky-600" />
          <span>Kirim Notifikasi Tes</span>
        </button>
      </div>
    </div>
  );
};
