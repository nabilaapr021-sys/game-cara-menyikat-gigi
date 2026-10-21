import React, { useState } from 'react';
import {
  getSecurityLogs,
  getCurrentUser,
  generateHealthRecommendations,
} from '../services/authAndDatabase';
import { getStreakData, getTodayString } from '../services/storage';
import { sounds } from '../services/sound';
import {
  ShieldAlert,
  Sparkles,
  Lightbulb,
  Bell,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  ArrowRight,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface SecurityAndRecommendationsProps {
  onNavigateToTab?: (tab: string) => void;
}

export const SecurityAndRecommendationsSection: React.FC<SecurityAndRecommendationsProps> = ({
  onNavigateToTab,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'security_logs'>('recommendations');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const currentUser = getCurrentUser();
  const streakData = getStreakData();
  const today = getTodayString();
  const todayLog = streakData.history[today] || {};

  const recommendations = generateHealthRecommendations(
    currentUser,
    streakData.currentStreak,
    !!todayLog.morning,
    !!todayLog.night
  );

  const securityLogs = getSecurityLogs();

  const filteredLogs = securityLogs.filter((log) => {
    if (severityFilter === 'all') return true;
    return log.severity === severityFilter;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Tab Switcher */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 shadow-sm border border-sky-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-100 p-1.5 rounded-2xl text-xs md:text-sm font-bold">
          <button
            onClick={() => {
              setActiveTab('recommendations');
              sounds.playButton();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'recommendations'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-yellow-300" />
            <span>Fitur Rekomendasi Pintar ({recommendations.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('security_logs');
              sounds.playButton();
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition cursor-pointer ${
              activeTab === 'security_logs'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Notifikasi & Audit Keamanan ({securityLogs.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Status Sistem:</span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Terlindungi (RBAC Aktif)</span>
          </span>
        </div>
      </div>

      {/* TAB 1: SMART CLINICAL RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4 animate-fade-in">
          <div className="text-left">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span>Rekomendasi Personalisasi Kesehatan Gigi Anak</span>
            </h3>
            <p className="text-xs text-slate-500">
              Dihasilkan otomatis berdasarkan analisis streak, kepatuhan sikat gigi pagi & malam, serta rekam nilai kuis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const isHigh = rec.priority === 'tinggi';
              const isMedium = rec.priority === 'sedang';

              return (
                <div
                  key={rec.id}
                  className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs ${
                    isHigh
                      ? 'bg-gradient-to-b from-rose-50/70 to-white border-rose-200 ring-2 ring-rose-100'
                      : isMedium
                      ? 'bg-gradient-to-b from-amber-50/70 to-white border-amber-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          isHigh
                            ? 'bg-rose-500 text-white'
                            : isMedium
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Prioritas {rec.priority.toUpperCase()}
                      </span>

                      {rec.status === 'selesai' && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tercapai</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-800">{rec.title}</h4>
                    <p className="text-xs text-slate-700 mt-2 font-medium leading-relaxed">
                      {rec.recommendation}
                    </p>

                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600">
                      <strong className="text-sky-700">Dasar Klinis Kedokteran Gigi:</strong> {rec.clinicalReason}
                    </div>
                  </div>

                  {rec.actionButtonLabel && onNavigateToTab && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          sounds.playButton();
                          if (rec.id === 'rec_night_brush') onNavigateToTab('game');
                          else if (rec.id === 'rec_streak_boost') onNavigateToTab('reminders');
                          else if (rec.id === 'rec_posyandu_checkup') onNavigateToTab('analytics');
                          else onNavigateToTab('game');
                        }}
                        className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{rec.actionButtonLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY NOTIFICATIONS & AUDIT LOGS */}
      {activeTab === 'security_logs' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-sky-100 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Log Notifikasi & Audit Keamanan Sistem</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mencatat seluruh peristiwa autentikasi, perubahan peran, dan perlindungan akses data
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white"
              >
                <option value="all">Semua Notifikasi ({securityLogs.length})</option>
                <option value="info">Info / Keberhasilan</option>
                <option value="warning">Peringatan (Perubahan)</option>
                <option value="danger">Pencegahan Akses Ilegal</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isDanger = log.severity === 'danger';
              const isWarning = log.severity === 'warning';

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDanger
                      ? 'bg-rose-50/80 border-rose-200'
                      : isWarning
                      ? 'bg-amber-50/80 border-amber-200'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isDanger
                          ? 'bg-rose-500 text-white'
                          : isWarning
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-sky-500 text-white'
                      }`}
                    >
                      {isDanger ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : isWarning ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs md:text-sm font-black text-slate-800">{log.title}</h4>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.2 rounded-md ${
                            isDanger
                              ? 'bg-rose-200 text-rose-900'
                              : isWarning
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-sky-200 text-sky-900'
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{log.description}</p>

                      <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono flex-wrap">
                        <span>Aktor: {log.actorEmail} ({log.actorRole})</span>
                        {log.ipAddress && <span>• IP: {log.ipAddress}</span>}
                        {log.device && <span>• {log.device}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
