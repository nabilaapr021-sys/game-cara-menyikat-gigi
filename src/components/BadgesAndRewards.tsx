import React, { useState } from 'react';
import { ToothbrushSkin, Badge, StreakData } from '../types';
import {
  getSkins,
  saveSkins,
  getActiveSkinId,
  setActiveSkinId,
  getBadges,
  getStreakData,
  saveStreakData,
} from '../services/storage';
import { sounds } from '../services/sound';
import { Sparkles, Check, Lock, Star, Award, ShieldCheck, Flame } from 'lucide-react';

export const BadgesAndRewards: React.FC = () => {
  const [skins, setSkins] = useState<ToothbrushSkin[]>(getSkins());
  const [activeSkinId, setActiveSkin] = useState<string>(getActiveSkinId());
  const [badges, setBadges] = useState<Badge[]>(getBadges());
  const [streakData, setStreakData] = useState<StreakData>(getStreakData());
  const [activeTab, setActiveTab] = useState<'skins' | 'badges'>('skins');

  // Equip a skin
  const handleEquip = (skinId: string) => {
    setActiveSkin(skinId);
    setActiveSkinId(skinId);
    sounds.playSparkle();
  };

  // Buy a skin with stars
  const handleBuyWithStars = (skin: ToothbrushSkin) => {
    if (!skin.costStars) return;
    if (streakData.stars < skin.costStars) {
      alert(`⭐ Bintangmu belum cukup! Kamu butuh ${skin.costStars} Bintang. Selesaikan sesi sikat gigi lagi untuk dapat bintang!`);
      return;
    }

    sounds.playStreakLevelUp();
    const updatedStars = streakData.stars - skin.costStars;
    const updatedStreak = { ...streakData, stars: updatedStars };
    setStreakData(updatedStreak);
    saveStreakData(updatedStreak);

    const updatedSkins = skins.map((s) => (s.id === skin.id ? { ...s, unlocked: true } : s));
    setSkins(updatedSkins);
    saveSkins(updatedSkins);
    handleEquip(skin.id);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Tab Switcher & Stars Balance */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-sky-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs md:text-sm font-bold">
          <button
            onClick={() => {
              setActiveTab('skins');
              sounds.playButton();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'skins'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🪥</span>
            <span>Koleksi Sikat Gigi ({skins.filter((s) => s.unlocked).length}/{skins.length})</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('badges');
              sounds.playButton();
            }}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'badges'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🏆</span>
            <span>Stiker & Medali ({badges.filter((b) => b.unlocked).length}/{badges.length})</span>
          </button>
        </div>

        {/* User Balance */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-100/80 px-3.5 py-1.5 rounded-full text-amber-900 text-xs font-black border border-amber-200">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streakData.stars} Bintang</span>
          </div>
          <div className="flex items-center gap-1.5 bg-orange-100/80 px-3.5 py-1.5 rounded-full text-orange-900 text-xs font-black border border-orange-200">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>Streak {streakData.currentStreak} Hari</span>
          </div>
        </div>
      </div>

      {/* SKINS TAB */}
      {activeTab === 'skins' && (
        <div className="space-y-4">
          <div className="text-left">
            <h3 className="text-lg font-black text-slate-800">Pilih Karakter Sikat Gigimu</h3>
            <p className="text-xs text-slate-500">
              Sikat gigi yang kamu pilih di sini akan langsung tampil dan digunakan di dalam game!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {skins.map((skin) => {
              const isEquipped = activeSkinId === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-gradient-to-b from-sky-50 to-white border-sky-400 ring-4 ring-sky-100 shadow-md'
                      : skin.unlocked
                      ? 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-80'
                  }`}
                >
                  <div>
                    {/* Visual Preview of Brush */}
                    <div className="h-28 rounded-2xl bg-gradient-to-b from-slate-100 to-slate-200/60 p-4 flex items-center justify-center relative overflow-hidden mb-4">
                      {/* Glow effect */}
                      <div
                        style={{ backgroundColor: skin.glowColor }}
                        className="absolute w-20 h-20 rounded-full blur-xl opacity-60"
                      />

                      {/* Toothbrush Mockup */}
                      <div className="relative flex items-center rotate-[-15deg] transition-transform duration-200 hover:scale-110">
                        {/* Head & Bristles */}
                        <div
                          style={{ backgroundColor: skin.neckColor }}
                          className="w-14 h-6 rounded-r-xl border border-white/60 flex items-center pl-1 relative shadow-sm"
                        >
                          <div
                            style={{ backgroundColor: skin.bristleColor }}
                            className="w-8 h-3.5 rounded-xs border-b border-slate-300"
                          />
                          <div
                            style={{ backgroundColor: skin.pasteColor }}
                            className="absolute -top-2 left-2 w-5 h-2.5 rounded-full border border-white"
                          />
                        </div>
                        {/* Handle */}
                        <div
                          style={{ backgroundColor: skin.handleColor }}
                          className="w-20 h-4 rounded-l-full border border-white/60 shadow-xs"
                        />
                      </div>

                      {/* Locked Overlay */}
                      {!skin.unlocked && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-slate-800">{skin.name}</h4>
                      {isEquipped && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                          <Check className="w-3 h-3" /> Digunakan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{skin.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    {skin.unlocked ? (
                      <button
                        onClick={() => handleEquip(skin.id)}
                        disabled={isEquipped}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isEquipped
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-sky-500 hover:bg-sky-600 text-white shadow-xs'
                        }`}
                      >
                        {isEquipped ? 'Sedang Dipakai' : 'Gunakan Sikat Ini'}
                      </button>
                    ) : skin.costStars ? (
                      <button
                        onClick={() => handleBuyWithStars(skin)}
                        className="w-full py-2.5 rounded-xl font-black text-xs bg-amber-400 hover:bg-amber-500 text-amber-950 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                        <span>Buka ({skin.costStars} Bintang)</span>
                      </button>
                    ) : (
                      <div className="text-center py-2 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl">
                        🔒 {skin.unlockCondition}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BADGES TAB */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="text-left">
            <h3 className="text-lg font-black text-slate-800">Lemari Stiker & Medali Keberhasilan</h3>
            <p className="text-xs text-slate-500">
              Sikat gigi secara teratur pagi dan malam untuk mengumpulkan semua piala pahlawan gigi!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const pct = Math.min(100, Math.round((badge.progress / badge.maxProgress) * 100));

              return (
                <div
                  key={badge.id}
                  className={`rounded-3xl p-5 border-2 text-center flex flex-col items-center justify-between transition-all ${
                    badge.unlocked
                      ? 'bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 border-amber-300 shadow-md ring-2 ring-amber-100'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div>
                    {/* Badge Icon Medallion */}
                    <div
                      className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-md relative mb-3 ${
                        badge.unlocked
                          ? 'bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border-2 border-white'
                          : 'bg-slate-200 text-slate-400 border border-slate-300'
                      }`}
                    >
                      <span>{badge.icon}</span>
                      {badge.unlocked && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-800">{badge.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{badge.description}</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                      <span>Progres</span>
                      <span>{badge.progress} / {badge.maxProgress}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          badge.unlocked
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                            : 'bg-sky-400'
                        }`}
                      />
                    </div>
                    {badge.unlocked && badge.unlockedAt && (
                      <p className="text-[10px] font-bold text-emerald-600 mt-1.5">
                        Terbuka: {badge.unlockedAt}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
