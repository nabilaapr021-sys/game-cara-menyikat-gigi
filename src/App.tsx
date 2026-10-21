import React, { useState, useEffect } from 'react';
import { BrushGame } from './components/BrushGame';
import { ReminderSection } from './components/ReminderSection';
import { StreakTracker } from './components/StreakTracker';
import { BadgesAndRewards } from './components/BadgesAndRewards';
import { LearningAndQuizSection } from './components/LearningAndQuizSection';
import { UserManagementAndRBAC } from './components/UserManagementAndRBAC';
import { AnalyticsAndRekapitulasi } from './components/AnalyticsAndRekapitulasi';
import { SecurityAndRecommendationsSection } from './components/SecurityAndRecommendationsSection';
import { LoginModal } from './components/LoginModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

import { getStreakData } from './services/storage';
import { startNotificationTicker, stopNotificationTicker } from './services/notifications';
import { sounds } from './services/sound';
import {
  getCurrentUser,
  getRoleBadgeStyle,
  canViewAnalytics,
  canManageRoles,
} from './services/authAndDatabase';
import { StreakData, SessionType, AppUser } from './types';
import {
  Sparkles,
  Flame,
  Star,
  Bell,
  Calendar,
  Award,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  X,
  Shield,
  BarChart3,
  Lightbulb,
  LogIn,
  ChevronDown,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('game');
  const [currentUser, setCurrentUser] = useState<AppUser>(getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [streakData, setStreakData] = useState<StreakData>(getStreakData());
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());
  const [preferredSession, setPreferredSession] = useState<SessionType>('morning');

  // In-app alert popup when alarm strikes
  const [inAppReminder, setInAppReminder] = useState<{
    show: boolean;
    type: 'morning' | 'night';
  }>({ show: false, type: 'morning' });

  // Start background ticker for notification reminders
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 4) {
      setPreferredSession('night');
    } else {
      setPreferredSession('morning');
    }

    startNotificationTicker((type) => {
      setInAppReminder({ show: true, type });
    });

    return () => {
      stopNotificationTicker();
    };
  }, []);

  const handleSoundToggle = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  const refreshStreak = () => {
    setStreakData(getStreakData());
  };

  const roleStyle = getRoleBadgeStyle(currentUser.role);
  const isSuperAdmin = canManageRoles(currentUser.role);
  const canSeeAnalytics = canViewAnalytics(currentUser.role);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white text-slate-800 flex flex-col justify-between selection:bg-sky-200">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* Logo Brand */}
          <div
            onClick={() => {
              setActiveTab('game');
              sounds.playButton();
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-teal-400 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-sky-400/20 group-hover:scale-105 transition-transform">
              <span className="text-xl">🦷</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
                <span>Sikat Gigi Hero</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-sky-500 text-white font-bold uppercase">
                  PWA
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 hidden sm:block">
                Edukasi, Kuis Bertahap & RBAC
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('game');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'game' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Game 2 Mnt</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('learning');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'learning' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kuis Bertahap 🔒</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('reminders');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'reminders' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Pengingat (2x)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('streak');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'streak' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Streak</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('rewards');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'rewards' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Hadiah</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('rbac');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'rbac' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Peran & RBAC</span>
            </button>

            {canSeeAnalytics && (
              <button
                onClick={() => {
                  setActiveTab('analytics');
                  sounds.playButton();
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  activeTab === 'analytics' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analisis & Rekap</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('security');
                sounds.playButton();
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'security' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
              <span>Rekomendasi</span>
            </button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2">
            
            {/* Google User Profile Chip (Login Trigger) */}
            <div
              onClick={() => {
                setIsLoginModalOpen(true);
                sounds.playButton();
              }}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 p-1.5 pr-3 rounded-2xl border border-slate-200 cursor-pointer transition shadow-xs"
              title="Ganti Akun Google / Login Gmail"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full border border-white shadow-xs object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-[11px] font-black text-slate-800 leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </p>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-md border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                >
                  {roleStyle.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </div>

            {/* Streak Counter */}
            <div
              onClick={() => setActiveTab('streak')}
              className="hidden sm:flex items-center gap-1 bg-orange-100/90 text-orange-950 px-2.5 py-1.5 rounded-xl text-xs font-black border border-orange-200 cursor-pointer shadow-xs hover:bg-orange-200 transition"
              title="Streak Harianmu"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streakData.currentStreak}d</span>
            </div>

            {/* In-App PWA Install Button */}
            <PWAInstallButton />

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition cursor-pointer"
              title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          </div>

        </div>
      </header>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-28 md:pb-12">
        {activeTab === 'game' && (
          <BrushGame
            preferredSessionType={preferredSession}
            onSessionDone={() => {
              refreshStreak();
            }}
          />
        )}

        {activeTab === 'learning' && <LearningAndQuizSection />}

        {activeTab === 'reminders' && <ReminderSection />}

        {activeTab === 'streak' && (
          <StreakTracker
            onStreakUpdate={(data) => {
              setStreakData(data);
            }}
          />
        )}

        {activeTab === 'rewards' && <BadgesAndRewards />}

        {activeTab === 'rbac' && <UserManagementAndRBAC />}

        {activeTab === 'analytics' && <AnalyticsAndRekapitulasi />}

        {activeTab === 'security' && (
          <SecurityAndRecommendationsSection
            onNavigateToTab={(tab) => {
              setActiveTab(tab);
            }}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly with extra menus) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-sky-100 px-1 py-1.5 z-40 flex justify-around items-center shadow-lg text-[9px] font-bold">
        <button
          onClick={() => {
            setActiveTab('game');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'game' ? 'text-sky-600 font-black' : 'text-slate-400'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Game</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('learning');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'learning' ? 'text-sky-600 font-black' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kuis 🔒</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reminders');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'reminders' ? 'text-sky-600 font-black' : 'text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Pengingat</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('rbac');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'rbac' ? 'text-rose-600 font-black' : 'text-slate-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>RBAC</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'analytics' ? 'text-teal-600 font-black' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Rekap</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            sounds.playButton();
          }}
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition ${
            activeTab === 'security' ? 'text-indigo-600 font-black' : 'text-slate-400'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Saran</span>
        </button>
      </div>

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* OFFLINE INDICATOR TOAST */}
      <OfflineIndicator />

      {/* IN-APP REAL-TIME REMINDER NOTIFICATION BANNER */}
      {inAppReminder.show && (
        <div className="fixed top-20 inset-x-4 max-w-md mx-auto z-50 bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-4 rounded-3xl shadow-2xl border-2 border-white flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {inAppReminder.type === 'morning' ? '☀️' : '🌙'}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-yellow-300">
                Waktunya Sikat Gigi {inAppReminder.type === 'morning' ? 'Pagi' : 'Malam'}!
              </p>
              <p className="text-xs text-sky-100">
                Ayo basmi kuman gigi selama 2 menit sekarang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPreferredSession(inAppReminder.type);
                setActiveTab('game');
                setInAppReminder({ show: false, type: 'morning' });
                sounds.playButton();
              }}
              className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-xl text-xs font-black shadow-xs cursor-pointer"
            >
              Mulai!
            </button>
            <button
              onClick={() => setInAppReminder({ show: false, type: 'morning' })}
              className="p-1 rounded-full text-sky-200 hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="w-full bg-white/60 border-t border-sky-100 py-3 text-center text-[11px] text-slate-400">
        <p className="flex items-center justify-center gap-1.5 flex-wrap">
          <span>Sikat Gigi Hero Enterprise PWA</span>
          <span>•</span>
          <span>Peran: <strong className="text-slate-600">{roleStyle.label}</strong></span>
          <span>•</span>
          <span>User: <strong className="text-slate-600">{currentUser.email}</strong></span>
          <span>•</span>
          <span className="text-emerald-600 font-bold">100% Siap Offline</span>
        </p>
      </footer>
    </div>
  );
}
