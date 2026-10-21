import React, { useState } from 'react';
import { StreakData } from '../types';
import { getStreakData, saveStreakData, getTodayString } from '../services/storage';
import { sounds } from '../services/sound';
import { Flame, Star, Trophy, Calendar, CheckCircle, Circle, Sun, Moon, Sparkles } from 'lucide-react';

interface StreakTrackerProps {
  onStreakUpdate?: (data: StreakData) => void;
}

export const StreakTracker: React.FC<StreakTrackerProps> = ({ onStreakUpdate }) => {
  const [streakData, setStreakData] = useState<StreakData>(getStreakData());
  const today = getTodayString();
  const todayLog = streakData.history[today] || {};

  // Generate 7 days of current week
  const getWeekDays = () => {
    const days = [];
    const curr = new Date();
    // Monday as start of week
    const dayOfWeek = curr.getDay() || 7;
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek + 1);

    const indonesianDays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;

      days.push({
        name: indonesianDays[i],
        date: dateStr,
        dayNumber: d.getDate(),
        isToday: dateStr === today,
        log: streakData.history[dateStr] || {},
      });
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Manual toggle for children brushing with physical toothbrush
  const handleToggleManual = (type: 'morning' | 'night') => {
    sounds.playButton();
    const updatedHistory = { ...streakData.history };
    const currDay = updatedHistory[today] || {};

    let currentStreak = streakData.currentStreak;
    let stars = streakData.stars;

    if (type === 'morning') {
      const newVal = !currDay.morning;
      currDay.morning = newVal;
      if (newVal) {
        currDay.morningTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        stars += 25;
        sounds.playSparkle();
      }
    } else {
      const newVal = !currDay.night;
      currDay.night = newVal;
      if (newVal) {
        currDay.nightTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        stars += 25;
        sounds.playSparkle();
      }
    }

    updatedHistory[today] = currDay;

    // Check if at least one session completed today to preserve/increment streak
    if (currDay.morning || currDay.night) {
      if (streakData.lastCompletedDate !== today) {
        currentStreak += 1;
      }
    }

    const updated: StreakData = {
      ...streakData,
      currentStreak,
      maxStreak: Math.max(streakData.maxStreak, currentStreak),
      stars,
      lastCompletedDate: (currDay.morning || currDay.night) ? today : streakData.lastCompletedDate,
      history: updatedHistory,
    };

    setStreakData(updated);
    saveStreakData(updated);
    if (onStreakUpdate) onStreakUpdate(updated);
  };

  // Next streak milestone calculation
  const getNextMilestone = () => {
    const s = streakData.currentStreak;
    if (s < 3) return { target: 3, reward: 'Sikat Pelangi Ceria 🌈', remaining: 3 - s };
    if (s < 7) return { target: 7, reward: 'Tongkat Peri Gigi 🪄', remaining: 7 - s };
    if (s < 14) return { target: 14, reward: 'Robot Sikat Cyber 🤖', remaining: 14 - s };
    if (s < 30) return { target: 30, reward: 'Mahkota Emas Juara 👑', remaining: 30 - s };
    return { target: s + 10, reward: 'Gelar Legenda Gigi Sehat 🌟', remaining: 10 };
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Top Hero Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        {/* Streak Flame */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-100">Streak Harian</span>
            <Flame className="w-6 h-6 text-yellow-200 fill-yellow-200 animate-bounce" />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black font-mono tabular-nums">{streakData.currentStreak}</p>
            <p className="text-xs text-orange-100 font-medium">Hari Berturut-turut!</p>
          </div>
        </div>

        {/* Stars Balance */}
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-3xl p-5 text-amber-950 shadow-lg shadow-yellow-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Bintang Gigi</span>
            <Star className="w-6 h-6 text-amber-900 fill-amber-900" />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black font-mono tabular-nums">{streakData.stars}</p>
            <p className="text-xs text-amber-900/80 font-medium">Poin Hadiah</p>
          </div>
        </div>

        {/* Total Sessions */}
        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-3xl p-5 text-white shadow-lg shadow-teal-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-100">Total Sikat</span>
            <Trophy className="w-6 h-6 text-teal-200" />
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black font-mono tabular-nums">{streakData.totalSessions}</p>
            <p className="text-xs text-teal-100 font-medium">Sesi Diselesaikan</p>
          </div>
        </div>

        {/* Total Germs Cleared */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-5 text-white shadow-lg shadow-rose-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">Kuman Dibasmi</span>
            <span className="text-2xl">🦠</span>
          </div>
          <div className="mt-2">
            <p className="text-3xl sm:text-4xl font-black font-mono tabular-nums">{streakData.totalGermsCleared}</p>
            <p className="text-xs text-rose-100 font-medium">Total Seluruh Waktu</p>
          </div>
        </div>

      </div>

      {/* Today's 2x Daily Checklist (Morning & Night) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-500" />
              <span>Target Sikat Gigi Hari Ini (2x Sehari)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Otomatis tercentang setelah main game 2 menit atau centang manual di sini.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-700">
            {today}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Morning Slot */}
          <div
            onClick={() => handleToggleManual('morning')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              todayLog.morning
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-100'
                : 'bg-slate-50 border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                todayLog.morning ? 'bg-amber-400 text-amber-950' : 'bg-slate-200 text-slate-500'
              }`}>
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Sikat Gigi Pagi</h4>
                <p className="text-xs text-slate-500">
                  {todayLog.morning ? `Tercatat pkl ${todayLog.morningTime || 'Pagi'}` : 'Belum dilakukan'}
                </p>
              </div>
            </div>

            <div>
              {todayLog.morning ? (
                <CheckCircle className="w-7 h-7 text-amber-500 fill-amber-100" />
              ) : (
                <Circle className="w-7 h-7 text-slate-300" />
              )}
            </div>
          </div>

          {/* Night Slot */}
          <div
            onClick={() => handleToggleManual('night')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
              todayLog.night
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100'
                : 'bg-slate-50 border-slate-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-xs ${
                todayLog.night ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Sikat Gigi Malam</h4>
                <p className="text-xs text-slate-500">
                  {todayLog.night ? `Tercatat pkl ${todayLog.nightTime || 'Malam'}` : 'Belum dilakukan'}
                </p>
              </div>
            </div>

            <div>
              {todayLog.night ? (
                <CheckCircle className="w-7 h-7 text-indigo-600 fill-indigo-100" />
              ) : (
                <Circle className="w-7 h-7 text-slate-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Interactive Calendar View */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100">
        <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4 flex items-center gap-2">
          <span>Kalender Sikat Gigi Minggu Ini</span>
          <span className="text-xs font-semibold text-slate-400">Senin - Minggu</span>
        </h3>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const hasMorning = day.log.morning;
            const hasNight = day.log.night;
            const bothDone = hasMorning && hasNight;

            return (
              <div
                key={day.date}
                className={`p-2.5 sm:p-3 rounded-2xl text-center border-2 transition-all flex flex-col items-center justify-between min-h-[110px] ${
                  day.isToday
                    ? 'border-sky-400 bg-sky-50/80 shadow-md ring-2 ring-sky-200'
                    : 'border-slate-100 bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-[11px] font-bold text-slate-400">{day.name}</p>
                  <p className="text-sm sm:text-base font-black text-slate-800">{day.dayNumber}</p>
                </div>

                <div className="space-y-1 w-full my-1">
                  {/* Morning pill */}
                  <div
                    className={`w-full py-0.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                      hasMorning
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-slate-200/80 text-slate-400'
                    }`}
                    title="Pagi"
                  >
                    <span>☀️</span>
                  </div>

                  {/* Night pill */}
                  <div
                    className={`w-full py-0.5 rounded-md text-[10px] font-bold flex items-center justify-center gap-0.5 ${
                      hasNight
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/80 text-slate-400'
                    }`}
                    title="Malam"
                  >
                    <span>🌙</span>
                  </div>
                </div>

                <div>
                  {bothDone ? (
                    <span className="text-xs">⭐</span>
                  ) : hasMorning || hasNight ? (
                    <span className="text-[10px] text-emerald-600 font-bold">1/2</span>
                  ) : (
                    <span className="text-[10px] text-slate-300">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span>☀️ Pagi Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600" />
            <span>🌙 Malam Selesai</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>⭐ Sempurna 2x Sehari</span>
          </div>
        </div>
      </div>

      {/* Next Milestone Tracker */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-xs font-bold text-purple-200 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Target Hadiah Berikutnya</span>
          </span>
          <h4 className="text-lg font-black">{nextMilestone.reward}</h4>
          <p className="text-xs text-purple-100">
            Pertahankan streak {nextMilestone.remaining} hari lagi untuk membuka item ini!
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-2xl border border-white/20">
          <Flame className="w-8 h-8 text-yellow-300 fill-yellow-300" />
          <div className="text-right">
            <p className="text-2xl font-black font-mono">{streakData.currentStreak} / {nextMilestone.target}</p>
            <p className="text-[10px] uppercase font-bold text-purple-200">Hari Menuju Target</p>
          </div>
        </div>
      </div>

    </div>
  );
};
