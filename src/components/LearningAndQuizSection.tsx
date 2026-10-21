import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { LearningStage, QuizQuestion, UserQuizAttempt } from '../types';
import {
  getStages,
  saveStages,
  getCurrentUser,
  getQuizAttempts,
  saveQuizAttempts,
  addSecurityLog,
  canTakeQuiz,
} from '../services/authAndDatabase';
import { sounds } from '../services/sound';
import {
  BookOpen,
  Lock,
  Unlock,
  CheckCircle,
  HelpCircle,
  Star,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  X,
} from 'lucide-react';

export const LearningAndQuizSection: React.FC = () => {
  const [stages, setStages] = useState<LearningStage[]>(getStages());
  const currentUser = getCurrentUser();
  const [activeStage, setActiveStage] = useState<LearningStage | null>(null);
  const [isReadingMode, setIsReadingMode] = useState<boolean>(false);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  // Quiz execution states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);

  const userCanAttempt = canTakeQuiz(currentUser.role);

  // Open a stage to read or quiz
  const handleOpenStage = (stage: LearningStage) => {
    if (stage.isLocked) {
      sounds.playButton();
      alert(`🔒 Tahap ${stage.level} masih terkunci!\n\nKamu harus menyelesaikan materi dan lulus kuis Tahap ${stage.level - 1} dengan skor minimal ${stage.minScoreToUnlockNext}% terlebih dahulu.`);
      return;
    }

    setActiveStage(stage);
    setIsReadingMode(true);
    setIsQuizMode(false);
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    sounds.playButton();
  };

  // Start the quiz
  const handleStartQuiz = () => {
    if (!userCanAttempt) {
      alert('Peran "Viewer" hanya memiliki hak melihat (read-only) dan tidak dapat mengerjakan kuis ujian.');
      return;
    }
    setIsReadingMode(false);
    setIsQuizMode(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    sounds.playButton();
  };

  // Submit quiz answer for a question
  const handleAnswerSelect = (optionIdx: number) => {
    sounds.playButton();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIdx,
    }));
  };

  // Finish and evaluate quiz
  const handleFinishQuiz = () => {
    if (!activeStage) return;

    let correctCount = 0;
    activeStage.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / activeStage.questions.length) * 100);
    setCalculatedScore(score);
    setQuizFinished(true);

    const isPassed = score >= activeStage.minScoreToUnlockNext;

    // Save attempt in database
    const newAttempt: UserQuizAttempt = {
      id: `attempt_${Date.now()}`,
      stageId: activeStage.id,
      userId: currentUser.id,
      userName: currentUser.name,
      score,
      passed: isPassed,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('id-ID'),
      timeSpentSeconds: 45,
    };

    const currentAttempts = getQuizAttempts();
    saveQuizAttempts([newAttempt, ...currentAttempts]);

    if (isPassed) {
      sounds.playCelebration();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#34d399', '#facc15', '#f43f5e'],
        });
      } catch {
        // ignore
      }

      // Unlock next stage & update current stage status
      const updatedStages = stages.map((st) => {
        if (st.id === activeStage.id) {
          return {
            ...st,
            isCompleted: true,
            bestScore: Math.max(st.bestScore || 0, score),
          };
        }
        // Unlock next stage if level is activeStage.level + 1
        if (st.level === activeStage.level + 1) {
          return {
            ...st,
            isLocked: false,
          };
        }
        return st;
      });

      setStages(updatedStages);
      saveStages(updatedStages);

      // Log security / achievement event
      addSecurityLog({
        type: 'quiz_passed',
        severity: 'info',
        title: `Lulus Kuis ${activeStage.title}`,
        description: `Pengguna ${currentUser.name} (${currentUser.email}) lulus kuis dengan skor ${score}%. Tahap ${activeStage.level + 1} berhasil dibuka.`,
        actorEmail: currentUser.email,
        actorRole: currentUser.role,
      });
    } else {
      sounds.playGermPop();
    }
  };

  const currentQ = activeStage?.questions[currentQuestionIndex];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Title & Introduction Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-sky-400/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>Kurikulum Pembelajaran Bertahap & Kuis Berjenjang</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Sistem Terkunci 🔒
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Selesaikan materi dan lulus kuis (nilai minimal 70%) untuk membuka tahap berikutnya secara otomatis.
            </p>
          </div>
        </div>

        {/* User Status Pill */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200 text-xs">
          <span className="font-bold text-slate-500">Pengguna Aktif:</span>
          <span className="font-black text-slate-800">{currentUser.name}</span>
        </div>
      </div>

      {/* Grid of 6 Progressive Learning Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stages.map((stage) => {
          return (
            <div
              key={stage.id}
              className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between relative overflow-hidden ${
                stage.isLocked
                  ? 'bg-slate-50/80 border-slate-200 opacity-80'
                  : stage.isCompleted
                  ? 'bg-gradient-to-b from-emerald-50/70 via-white to-emerald-50/40 border-emerald-300 shadow-md ring-2 ring-emerald-100'
                  : 'bg-white border-sky-300 shadow-md ring-2 ring-sky-100'
              }`}
            >
              {/* Top Meta info */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{stage.icon}</span>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700">
                      Level {stage.level}
                    </span>
                  </div>

                  {stage.isLocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span>Terkunci</span>
                    </span>
                  ) : stage.isCompleted ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Lulus ({stage.bestScore}%)</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full animate-pulse">
                      <Unlock className="w-3.5 h-3.5 text-sky-600" />
                      <span>Terbuka</span>
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">{stage.category}</p>
                <h3 className="text-base font-black text-slate-800 mt-1 leading-snug">{stage.title}</h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{stage.description}</p>
              </div>

              {/* Bottom Action */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                {stage.isLocked ? (
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 py-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Perlu Lulus Level {stage.level - 1} (≥ {stage.minScoreToUnlockNext}%)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleOpenStage(stage)}
                    className={`w-full py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                      stage.isCompleted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-sky-500 hover:bg-sky-600 text-white'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{stage.isCompleted ? 'Pelajari & Uji Ulang Kuis' : 'Mulai Belajar & Kuis'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: READING MATERIAL & QUIZ RUNNER */}
      {activeStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border-4 border-sky-300 relative my-8 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeStage.icon}</span>
                <div>
                  <h3 className="text-lg font-black text-slate-800">{activeStage.title}</h3>
                  <p className="text-xs text-sky-600 font-bold">{activeStage.category}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveStage(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* VIEW 1: READING MATERIAL */}
            {isReadingMode && (
              <div className="mt-4 space-y-4">
                <div
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200"
                  dangerouslySetInnerHTML={{ __html: activeStage.fullMaterialHtml }}
                />

                {/* Key Takeaways */}
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Poin Kunci Yang Diujikan:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-950">
                    {activeStage.summaryPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-black">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveStage(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition"
                  >
                    Tutup
                  </button>

                  <button
                    onClick={handleStartQuiz}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs md:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>Mulai Ujian Kuis ({activeStage.questions.length} Soal)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* VIEW 2: QUIZ RUNNER */}
            {isQuizMode && !quizFinished && currentQ && (
              <div className="mt-4 space-y-5">
                {/* Quiz Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                    <span>Soal {currentQuestionIndex + 1} dari {activeStage.questions.length}</span>
                    <span>Target Kelulusan: ≥ {activeStage.minScoreToUnlockNext}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${((currentQuestionIndex + 1) / activeStage.questions.length) * 100}%`,
                      }}
                      className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Question Text */}
                <div className="bg-sky-50/80 p-5 rounded-2xl border border-sky-100">
                  <h4 className="text-base font-black text-slate-800 leading-snug">
                    {currentQ.question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(optIdx)}
                        className={`w-full p-4 rounded-2xl text-left border-2 text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-500 text-white border-sky-600 shadow-md ring-2 ring-sky-200'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                              isSelected ? 'bg-white text-sky-600' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-3 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => {
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                      sounds.playButton();
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    Soal Sebelumnya
                  </button>

                  {currentQuestionIndex < activeStage.questions.length - 1 ? (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={() => {
                        setCurrentQuestionIndex((prev) => prev + 1);
                        sounds.playButton();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Soal Berikutnya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled={selectedAnswers[currentQuestionIndex] === undefined}
                      onClick={handleFinishQuiz}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Selesaikan & Kumpulkan Ujian</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: QUIZ RESULT SUMMARY */}
            {isQuizMode && quizFinished && (
              <div className="mt-4 text-center space-y-4 animate-fade-in">
                <div
                  className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl border-4 border-white ${
                    calculatedScore >= activeStage.minScoreToUnlockNext
                      ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white animate-bounce'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {calculatedScore >= activeStage.minScoreToUnlockNext ? '🏆' : '💪'}
                </div>

                <div>
                  <h4 className="text-xl font-black text-slate-800">
                    {calculatedScore >= activeStage.minScoreToUnlockNext
                      ? 'Selamat! Kamu Lulus Kuis!'
                      : 'Ayo Coba Lagi, Kamu Pasti Bisa!'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Nilai Ujianmu: <span className="text-base font-black text-slate-800">{calculatedScore} / 100</span> (Minimal kelulusan: {activeStage.minScoreToUnlockNext}%)
                  </p>
                </div>

                {calculatedScore >= activeStage.minScoreToUnlockNext ? (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Tahap berikutnya ({activeStage.level + 1}) kini terbuka! Hadiah +50 Bintang ditambahkan ke profilmu.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Nilaimu belum mencapai batas kelulusan. Pelajari kembali materi dan ulangi kuis.</span>
                  </div>
                )}

                {/* Question Review Accordion */}
                <div className="text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 max-h-56 overflow-y-auto">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">Pembahasan Jawaban:</h5>
                  {activeStage.questions.map((q, idx) => {
                    const userChoice = selectedAnswers[idx];
                    const isRight = userChoice === q.correctOptionIndex;

                    return (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <p className="font-bold text-slate-800 flex items-center justify-between">
                          <span>{idx + 1}. {q.question}</span>
                          <span className={isRight ? 'text-emerald-600' : 'text-rose-500'}>
                            {isRight ? 'Benar (+)' : 'Salah (x)'}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <strong>Jawaban tepat:</strong> {q.options[q.correctOptionIndex]}
                        </p>
                        <p className="text-[11px] text-sky-700 bg-sky-50 p-1.5 rounded-lg">
                          💡 <em>Penjelasan:</em> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={handleStartQuiz}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi Kuis</span>
                  </button>

                  <button
                    onClick={() => setActiveStage(null)}
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black text-xs shadow-md transition cursor-pointer"
                  >
                    Selesai & Tutup
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
